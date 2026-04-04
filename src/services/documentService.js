/**
 * LensLearn - Document Processing Service
 * Extracts text/images from PDFs, DOCX, and image files for AI analysis
 * Uses dynamic imports for heavy libraries (pdfjs-dist, mammoth) to keep initial bundle small
 */

const SUPPORTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/bmp', 'image/gif'];
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

// Lazy-loaded module references
let pdfjsLib = null;
let mammoth = null;

async function loadPdfJs() {
  if (!pdfjsLib) {
    pdfjsLib = await import('pdfjs-dist');
    pdfjsLib.GlobalWorkerOptions.workerSrc =
      `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;
  }
  return pdfjsLib;
}

async function loadMammoth() {
  if (!mammoth) {
    const mod = await import('mammoth');
    mammoth = mod.default || mod;
  }
  return mammoth;
}

class DocumentService {
  /**
   * Detect file type and extract content accordingly
   * Returns { type: 'image'|'text'|'mixed', text?: string, images?: string[], pageCount?: number, fileName: string }
   */
  async processFile(file) {
    if (file.size > MAX_FILE_SIZE) {
      throw new Error(`File too large. Maximum size is 50MB.`);
    }

    const fileName = file.name;
    const fileType = file.type || this._guessType(fileName);

    if (SUPPORTED_IMAGE_TYPES.includes(fileType)) {
      return this._processImage(file, fileName);
    }

    if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
      return this._processPDF(file, fileName);
    }

    if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || fileName.endsWith('.docx')) {
      return this._processDOCX(file, fileName);
    }

    // Try as plain text
    if (fileType.startsWith('text/') || fileName.endsWith('.txt') || fileName.endsWith('.md') || fileName.endsWith('.csv')) {
      return this._processText(file, fileName);
    }

    throw new Error(`Unsupported file type: ${fileType || fileName}. Supported: Images, PDF, DOCX, TXT`);
  }

  /**
   * Get supported file types as accept string for file inputs
   */
  getSupportedTypes() {
    return 'image/*,.pdf,.docx,.doc,.txt,.md,.csv';
  }

  /**
   * Check if a file type is supported
   */
  isSupported(file) {
    const type = file.type || this._guessType(file.name);
    return SUPPORTED_IMAGE_TYPES.includes(type) ||
      type === 'application/pdf' ||
      type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      type.startsWith('text/') ||
      /\.(pdf|docx|txt|md|csv)$/i.test(file.name);
  }

  // Process image file — convert to base64 for Ollama vision
  async _processImage(file, fileName) {
    const dataUrl = await this._fileToDataUrl(file);
    const base64 = dataUrl.split(',')[1];
    return {
      type: 'image',
      images: [base64],
      fileName,
      pageCount: 1,
      preview: dataUrl,
    };
  }

  // Process PDF — extract text from all pages, and render pages as images for vision
  async _processPDF(file, fileName) {
    const pdfjs = await loadPdfJs();
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
    const pageCount = pdf.numPages;

    let fullText = '';
    const pageImages = [];

    for (let i = 1; i <= pageCount; i++) {
      const page = await pdf.getPage(i);

      // Extract text
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map(item => item.str).join(' ');
      fullText += `--- Page ${i} ---\n${pageText}\n\n`;

      // Render page as image for vision model (for diagrams, charts, etc.)
      if (i <= 5) { // Only first 5 pages as images to avoid memory issues
        const viewport = page.getViewport({ scale: 1.5 });
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d');

        await page.render({ canvasContext: ctx, viewport }).promise;

        const imageDataUrl = canvas.toDataURL('image/jpeg', 0.7);
        pageImages.push(imageDataUrl.split(',')[1]);
      }
    }

    return {
      type: 'mixed', // has both text and images
      text: fullText.trim(),
      images: pageImages,
      fileName,
      pageCount,
      preview: pageImages.length > 0 ? `data:image/jpeg;base64,${pageImages[0]}` : null,
    };
  }

  // Process DOCX — extract text using mammoth
  async _processDOCX(file, fileName) {
    const mam = await loadMammoth();
    const arrayBuffer = await file.arrayBuffer();

    // Extract raw text
    const textResult = await mam.extractRawText({ arrayBuffer });
    const text = textResult.value;

    // Also try to extract HTML for better structure
    const htmlResult = await mam.convertToHtml({ arrayBuffer });

    return {
      type: 'text',
      text: text,
      html: htmlResult.value,
      fileName,
      pageCount: Math.ceil(text.length / 3000), // Rough page estimate
      preview: null,
    };
  }

  // Process plain text files
  async _processText(file, fileName) {
    const text = await file.text();
    return {
      type: 'text',
      text,
      fileName,
      pageCount: 1,
      preview: null,
    };
  }

  // Utility: File to data URL
  _fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // Utility: Guess MIME type from extension
  _guessType(fileName) {
    const ext = fileName.split('.').pop().toLowerCase();
    const map = {
      jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png',
      webp: 'image/webp', bmp: 'image/bmp', gif: 'image/gif',
      pdf: 'application/pdf',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      txt: 'text/plain', md: 'text/markdown', csv: 'text/csv',
    };
    return map[ext] || 'application/octet-stream';
  }
}

const documentService = new DocumentService();
export default documentService;
