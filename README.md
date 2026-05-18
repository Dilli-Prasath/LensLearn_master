<p align="center">
  <img src="public/favicon.svg" width="80" alt="LensLearn Logo" />
</p>

<h1 align="center">LensLearn</h1>

<p align="center">
  <strong>Point your lens. Learn anything.</strong><br/>
  An offline-first AI tutor powered by Google's Gemma 4 — scan any textbook page, get step-by-step explanations in 60+ languages.
</p>

<p align="center">
  <a href="https://lens-learn-master.vercel.app" target="_blank"><strong>Live Demo</strong></a> •
  <a href="#features">Features</a> •
  <a href="#quick-start">Quick Start</a> •
  <a href="#architecture">Architecture</a> •
  <a href="#hackathon">Hackathon</a> •
  <a href="#license">License</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Gemma_4-Powered-4285F4?style=flat-square&logo=google&logoColor=white" alt="Gemma 4" />
  <img src="https://img.shields.io/badge/Ollama-Local_AI-000000?style=flat-square" alt="Ollama" />
  <img src="https://img.shields.io/badge/React-18.3-61DAFB?style=flat-square&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/PWA-Offline_First-5A0FC8?style=flat-square" alt="PWA" />
  <img src="https://img.shields.io/badge/License-Apache_2.0-D22128?style=flat-square" alt="License" />
  <img src="https://img.shields.io/badge/Languages-60+-10B981?style=flat-square" alt="Languages" />
</p>

---

## The Problem

Over **250 million** school-age children worldwide fail to achieve basic proficiency in reading and math. In much of South Asia, Sub-Saharan Africa, and Southeast Asia, students study from textbooks written in a language that isn't their mother tongue. Private tutoring fills the gap for those who can afford it. For the rest, there is nothing.

## The Solution

LensLearn turns any smartphone into a personal AI tutor:

1. **Snap** — Point your camera at any textbook page, equation, diagram, or handwritten problem
2. **Learn** — Get clear, step-by-step explanations in your chosen language
3. **Quiz** — Test comprehension with auto-generated multiple-choice questions
4. **Review** — Create flashcards for spaced repetition
5. **Ask** — Follow up with questions, like chatting with a real tutor

**Runs locally on your device** with Ollama, or instantly via cloud — no cost, no data collection.

---

## Features

| Feature | Description |
|---------|-------------|
| **Multimodal AI** | Gemma 4 processes text, equations, diagrams, charts, and handwriting from camera or uploaded files |
| **60+ Languages** | 10 core + 26 Indian languages (Tamil, Telugu, Kannada, Malayalam, Bengali, Marathi, Gujarati, Punjabi, Odia, Tulu, Santali, and more) + 24 world languages |
| **3-Tier AI Fallback** | Local Ollama → Ollama Cloud → Google AI (Gemini) — always works, on any device |
| **Adaptive Difficulty** | Elementary to university level based on student preference |
| **Auto-Generated Quizzes** | Multiple-choice questions with answer normalization and streak tracking |
| **Flashcards** | Flip cards with shuffle, progress tracking, and keyboard shortcuts |
| **Follow-up Chat** | Ask clarifying questions with suggested follow-ups |
| **Deep Dive & Simplify** | Toggle between beginner-friendly and academic-level explanations |
| **Key Terms Extraction** | Auto-identify and define vocabulary from any content |
| **Text-to-Speech** | Reads explanations aloud via Web Speech API |
| **Document Upload** | PDF, DOCX, and TXT file support with page-by-page analysis |
| **Image Cropping** | Focus on specific problems within a textbook page |
| **Offline PWA** | Installs from browser, works without internet |
| **Privacy-First** | Local processing by default — zero data transmitted |
| **Accessible** | Screen reader, high contrast, color-blind filters, voice control, keyboard navigation |
| **10 AI Models** | Gemma 4 family (E2B, E4B, 12B, 27B, 31B), Gemma 3, Gemini Flash — auto-selects best for your hardware |
| **12 Subjects** | Math, Science, Physics, Chemistry, Biology, History, English, Geography, CS, Economics, Medicine, Languages |
| **5 Themes** | Dark, Light, OLED, High Contrast, Sepia + 10 accent colors |
| **Favorites & History** | Bookmark subjects, auto-save sessions, search and filter past scans |

---

## How It Works

```
Student's Phone / Browser
        │
        ├── Camera API or File Upload (PDF, DOCX, TXT, image)
        ├── Image Cropper (focus on specific problems)
        │
        ▼
React PWA (Offline-Capable)
        │
        ├── Zustand Stores (settings, history, scan, connection, accessibility)
        ├── Service Worker (Workbox — asset caching)
        ├── Explanation Cache (DJB2 content hashing)
        │
        ▼
AI Adapter (auto-detects best backend)
        │
        ├── 1. Ollama Local — fastest, private, offline
        ├── 2. Ollama Cloud — Gemma 4 via Vercel proxy
        ├── 3. Google AI (Gemini 2.0 Flash) — runtime fallback
        │
        ▼
Output Pipeline
        │
        ├── Streaming Explanation → Markdown rendering
        ├── Quiz Generation → Answer normalization → Score tracking
        ├── Flashcard Generation → Spaced repetition
        ├── Follow-up Chat → Contextual Q&A
        ├── Key Terms → Vocabulary extraction
        ├── Text-to-Speech → Web Speech API
        ├── Export → Text file download
        └── History → localStorage persistence
```

---

## Quick Start

### Option 1: Try the Live Demo (No Setup)

Visit **[lens-learn-master.vercel.app](https://lens-learn-master.vercel.app)** — it connects to cloud AI automatically.

### Option 2: Run Locally with Ollama

| Tool | Version | Purpose |
|------|---------|---------|
| [Node.js](https://nodejs.org/) | 18+ | JavaScript runtime |
| [Ollama](https://ollama.ai/) | Latest | Local AI model server |

```bash
# Clone and install
git clone https://github.com/Dilli-Prasath/LensLearn.git
cd lenslearn
npm install

# Pull the recommended Gemma 4 model
ollama pull gemma4:e4b

# Start Ollama with CORS enabled
OLLAMA_HOST=0.0.0.0:11434 OLLAMA_ORIGINS="*" ollama serve

# In a new terminal — start LensLearn
npm run dev
```

Open **http://localhost:5173**. The green dot in the header confirms Ollama is connected.

### Alternative Models

```bash
ollama pull gemma4:e2b    # Lightweight (< 8GB RAM)
ollama pull gemma4:12b    # High quality (16GB+ RAM)
ollama pull gemma4:27b    # Best quality (32GB+ RAM)
```

### Environment Variables (for Cloud Deployment)

```bash
cp .env.example .env
# Edit .env with your API keys:
# VITE_OLLAMA_API_KEY=your-ollama-cloud-key
# VITE_GOOGLE_AI_KEY=your-google-ai-key
```

### Build for Production

```bash
npm run build      # Outputs to dist/
npm run preview    # Preview locally
```

### Deploy to Vercel

```bash
npm i -g vercel
vercel --prod
```

The `vercel.json` and `api/ollama-proxy.js` are already configured for serverless deployment with Ollama Cloud proxying.

---

## Architecture

### Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 18.3 + Vite 5.4 | Component-based PWA |
| **Routing** | React Router 6 | 14 routes, lazy-loaded |
| **State** | Zustand 5.0 | 7 stores, localStorage persistence |
| **AI Runtime** | Ollama + Gemma 4 | Local multimodal inference |
| **AI Fallback** | Google AI (Gemini) | Cloud fallback with runtime switching |
| **AI Proxy** | Vercel Edge Functions | CORS-free Ollama Cloud access |
| **Markdown** | react-markdown 9.0 | AI explanation rendering |
| **Documents** | pdfjs-dist + mammoth | PDF and DOCX parsing |
| **Icons** | lucide-react | Tree-shakeable icon library |
| **PWA** | vite-plugin-pwa + Workbox | Offline caching, install prompt |
| **Speech** | Web Speech API | Text-to-speech (no dependencies) |

### Project Structure

```
src/
├── config/          # Model registry (10 models), Language registry (60+), Subject registry (12)
├── pages/           # 13 page components (Home, Scan, Explain, Quiz, Flashcards, etc.)
├── components/      # 12 app-specific components + accessibility module (4 components)
├── store/           # 7 Zustand stores (settings, history, scan, connection, accessibility, + index, migrate)
├── services/        # 8 services (AI adapter, Ollama, Gemini, documents, cache, export, speech, history)
├── hooks/           # Camera, localStorage hooks
├── lib/             # Publishable component library (@lenslearn/ui)
│   ├── components/  # 19 reusable UI components
│   ├── hooks/       # 19 custom hooks
│   ├── tokens/      # Design token system
│   ├── animations/  # 20+ animation primitives
│   ├── utils/       # 16 utility functions
│   ├── hoc/         # 6 higher-order components
│   └── providers/   # Theme + Accessibility providers
├── utils/           # Themes (5), performance detection
└── styles/          # Global CSS
api/
└── ollama-proxy.js  # Vercel Edge Function — Ollama Cloud CORS proxy
```

### AI Service Architecture

```
aiAdapter.js (single entry point for the app)
    │
    ├── _detectBackend()        → Auto-detect: Local → Cloud → Google AI
    ├── _withFallback()         → Runtime retry: if primary fails, switch to fallback
    ├── _initGoogleAiFallback() → Warm up Gemini in background
    │
    ├── ollamaService.js
    │   ├── switchToLocal()     → http://localhost:11434 (via Vite proxy)
    │   └── switchToCloud()     → /api/ollama-cloud (via Vercel Edge proxy)
    │
    └── geminiService.js        → Google AI SDK (@google/generative-ai)
```

### Component Library (`@lenslearn/ui`)

The UI layer is designed as a standalone, publishable npm package with 19 components, 19 hooks, 6 HOCs, a design token system, 5 themes, and 10 accent colors.

---

<a name="hackathon"></a>
## Gemma 4 Good Hackathon

This project is built for the [Gemma 4 Good Hackathon](https://www.kaggle.com/competitions/gemma-4-good-hackathon) by Google DeepMind and Kaggle.

### Tracks

| Track | Fit | Why |
|-------|-----|-----|
| **Main Track** | Core submission | Complete, production-quality educational AI app with live demo |
| **Future of Education** | Perfect fit | AI-powered adaptive tutoring for underserved students |
| **Digital Equity & Inclusivity** | Perfect fit | Offline-first, 60+ languages incl. 26 Indian languages, free, privacy-preserving |
| **Ollama** | Integrated | Ollama is the primary AI runtime — deeply integrated with local + cloud modes |

### Judging Criteria

- **Impact & Vision (40%):** 250M students lack quality education — LensLearn bridges the gap with local AI that speaks their language
- **Video Pitch & Storytelling (30%):** Personal story from rural Tamil Nadu, live demo of multilingual tutoring
- **Technical Depth (30%):** Full component library, 3-tier AI fallback chain, model registry, adaptive hardware detection, PWA offline, 60+ language support, accessibility

---

## Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

Areas where help is especially welcome: adding languages, curriculum-aligned datasets for fine-tuning, testing on low-end Android devices, accessibility improvements, UI translations.

---

## License

[Apache 2.0](LICENSE) — Free to use, modify, and distribute.

---

## Author

**Dilli Prasath S**
Frontend Software Engineer · Zoho Corporation · Chennai, India
Built with purpose for the Gemma 4 Good Hackathon 2026.

*"The students who succeed aren't always the smartest — they're the ones who can understand the textbook. LensLearn changes that equation."*
