/**
 * Subject Configuration — Central subject registry for LensLearn
 *
 * Each subject has:
 *  - Visual identity (icon, color, gradient, emoji)
 *  - Learning metadata (tips, example prompts, difficulty levels)
 *  - Auto-detection keywords
 */

// ── Icon imports (Lucide) ───────────────────────────────────
// Icons are referenced by name and resolved in components
export const SUBJECT_REGISTRY = {
  math: {
    id: 'math',
    name: 'Mathematics',
    shortName: 'Math',
    emoji: '📐',
    color: '#6366f1',
    gradient: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(99, 102, 241, 0.05))',
    iconName: 'Calculator',
    tip: 'Scan equations, graphs, or word problems',
    description: 'Algebra, Geometry, Calculus, Statistics & more',
    examplePrompts: [
      'Solve this equation step by step',
      'Explain this graph',
      'Break down this proof',
    ],
    keywords: ['equation', 'algebra', 'geometry', 'calculus', 'number', 'solve', 'formula', 'derivative', 'integral', 'matrix', 'trigonometry', 'statistics', 'probability', 'theorem', 'polynomial'],
    difficulty: ['basic', 'intermediate', 'advanced'],
    category: 'STEM',
  },
  science: {
    id: 'science',
    name: 'General Science',
    shortName: 'Science',
    emoji: '🔬',
    color: '#10b981',
    gradient: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(16, 185, 129, 0.05))',
    iconName: 'Microscope',
    tip: 'Scan diagrams, experiments, or theories',
    description: 'Scientific concepts, experiments & discoveries',
    examplePrompts: [
      'Explain this experiment',
      'What does this diagram show?',
      'Describe the scientific method here',
    ],
    keywords: ['atom', 'molecule', 'reaction', 'energy', 'force', 'experiment', 'hypothesis', 'theory', 'observation', 'scientific'],
    difficulty: ['basic', 'intermediate', 'advanced'],
    category: 'STEM',
  },
  physics: {
    id: 'physics',
    name: 'Physics',
    shortName: 'Physics',
    emoji: '⚡',
    color: '#8b5cf6',
    gradient: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(139, 92, 246, 0.05))',
    iconName: 'Zap',
    tip: 'Scan formulas, circuits, or motion diagrams',
    description: 'Mechanics, Electromagnetism, Thermodynamics & Quantum',
    examplePrompts: [
      'Derive this formula',
      'Explain this circuit diagram',
      'What forces act on this object?',
    ],
    keywords: ['physics', 'force', 'gravity', 'velocity', 'acceleration', 'momentum', 'circuit', 'wave', 'quantum', 'thermodynamics', 'electromagnetic', 'newton', 'joule'],
    difficulty: ['basic', 'intermediate', 'advanced'],
    category: 'STEM',
  },
  chemistry: {
    id: 'chemistry',
    name: 'Chemistry',
    shortName: 'Chemistry',
    emoji: '⚗️',
    color: '#f97316',
    gradient: 'linear-gradient(135deg, rgba(249, 115, 22, 0.15), rgba(249, 115, 22, 0.05))',
    iconName: 'Flame',
    tip: 'Scan periodic tables, reactions, or molecular structures',
    description: 'Organic, Inorganic, Physical & Analytical Chemistry',
    examplePrompts: [
      'Balance this chemical equation',
      'What type of bond is this?',
      'Explain this molecular structure',
    ],
    keywords: ['chemistry', 'element', 'compound', 'reaction', 'acid', 'base', 'oxidation', 'reduction', 'periodic', 'mole', 'bond', 'ion', 'covalent', 'organic'],
    difficulty: ['basic', 'intermediate', 'advanced'],
    category: 'STEM',
  },
  biology: {
    id: 'biology',
    name: 'Biology',
    shortName: 'Biology',
    emoji: '🧬',
    color: '#14b8a6',
    gradient: 'linear-gradient(135deg, rgba(20, 184, 166, 0.15), rgba(20, 184, 166, 0.05))',
    iconName: 'Dna',
    tip: 'Scan cell diagrams, anatomy, or ecosystems',
    description: 'Cells, Genetics, Ecology, Anatomy & Evolution',
    examplePrompts: [
      'Label this cell diagram',
      'Explain this genetic cross',
      'Describe this ecosystem',
    ],
    keywords: ['biology', 'cell', 'organism', 'dna', 'gene', 'evolution', 'photosynthesis', 'mitosis', 'ecosystem', 'anatomy', 'species', 'protein', 'enzyme'],
    difficulty: ['basic', 'intermediate', 'advanced'],
    category: 'STEM',
  },
  history: {
    id: 'history',
    name: 'History',
    shortName: 'History',
    emoji: '📖',
    color: '#f59e0b',
    gradient: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(245, 158, 11, 0.05))',
    iconName: 'Scroll',
    tip: 'Scan timelines, maps, or historical texts',
    description: 'World History, Civilizations, Wars & Movements',
    examplePrompts: [
      'Summarize this historical event',
      'Explain this timeline',
      'What caused this conflict?',
    ],
    keywords: ['war', 'period', 'revolution', 'century', 'empire', 'historical', 'ancient', 'medieval', 'modern', 'civilization', 'dynasty', 'treaty', 'colonial'],
    difficulty: ['basic', 'intermediate', 'advanced'],
    category: 'Humanities',
  },
  english: {
    id: 'english',
    name: 'English & Literature',
    shortName: 'English',
    emoji: '✍️',
    color: '#ef4444',
    gradient: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(239, 68, 68, 0.05))',
    iconName: 'BookMarked',
    tip: 'Scan poems, passages, or grammar exercises',
    description: 'Grammar, Literature Analysis, Writing & Vocabulary',
    examplePrompts: [
      'Analyze this poem',
      'Fix grammar in this passage',
      'Explain the literary devices used',
    ],
    keywords: ['literature', 'grammar', 'vocabulary', 'sentence', 'paragraph', 'write', 'author', 'poem', 'narrative', 'essay', 'metaphor', 'syntax', 'prose'],
    difficulty: ['basic', 'intermediate', 'advanced'],
    category: 'Humanities',
  },
  geography: {
    id: 'geography',
    name: 'Geography',
    shortName: 'Geography',
    emoji: '🌍',
    color: '#06b6d4',
    gradient: 'linear-gradient(135deg, rgba(6, 182, 212, 0.15), rgba(6, 182, 212, 0.05))',
    iconName: 'Globe',
    tip: 'Scan maps, climate data, or population charts',
    description: 'Physical Geography, Human Geography & Cartography',
    examplePrompts: [
      'Explain this map',
      'Describe the climate of this region',
      'What does this population chart show?',
    ],
    keywords: ['continent', 'ocean', 'climate', 'population', 'map', 'region', 'latitude', 'longitude', 'terrain', 'ecosystem', 'topography'],
    difficulty: ['basic', 'intermediate', 'advanced'],
    category: 'Humanities',
  },
  computer: {
    id: 'computer',
    name: 'Computer Science',
    shortName: 'CS',
    emoji: '💻',
    color: '#0ea5e9',
    gradient: 'linear-gradient(135deg, rgba(14, 165, 233, 0.15), rgba(14, 165, 233, 0.05))',
    iconName: 'Code',
    tip: 'Scan code snippets, algorithms, or architecture diagrams',
    description: 'Programming, Algorithms, Data Structures & Systems',
    examplePrompts: [
      'Explain this algorithm',
      'What does this code do?',
      'Describe this data structure',
    ],
    keywords: ['algorithm', 'programming', 'variable', 'function', 'data', 'software', 'hardware', 'binary', 'network', 'database', 'code', 'loop', 'array', 'class'],
    difficulty: ['basic', 'intermediate', 'advanced'],
    category: 'STEM',
  },
  economics: {
    id: 'economics',
    name: 'Economics',
    shortName: 'Economics',
    emoji: '📊',
    color: '#84cc16',
    gradient: 'linear-gradient(135deg, rgba(132, 204, 22, 0.15), rgba(132, 204, 22, 0.05))',
    iconName: 'BarChart3',
    tip: 'Scan supply-demand curves, market data, or economic models',
    description: 'Micro & Macro Economics, Finance & Trade',
    examplePrompts: [
      'Explain this supply-demand curve',
      'What economic model is shown?',
      'Describe this market trend',
    ],
    keywords: ['economics', 'supply', 'demand', 'market', 'inflation', 'gdp', 'trade', 'fiscal', 'monetary', 'micro', 'macro', 'capitalism'],
    difficulty: ['basic', 'intermediate', 'advanced'],
    category: 'Social Sciences',
  },
  medicine: {
    id: 'medicine',
    name: 'Medicine & Health',
    shortName: 'Medicine',
    emoji: '🏥',
    color: '#dc2626',
    gradient: 'linear-gradient(135deg, rgba(220, 38, 38, 0.15), rgba(220, 38, 38, 0.05))',
    iconName: 'Heart',
    tip: 'Scan anatomy diagrams, prescriptions, or medical texts',
    description: 'Anatomy, Physiology, Pharmacology & Clinical Medicine',
    examplePrompts: [
      'Explain this anatomical diagram',
      'What condition does this describe?',
      'Describe this physiological process',
    ],
    keywords: ['anatomy', 'diagnosis', 'treatment', 'symptom', 'disease', 'patient', 'organ', 'blood', 'surgery', 'medicine', 'health', 'clinical'],
    difficulty: ['basic', 'intermediate', 'advanced'],
    category: 'STEM',
  },
  language: {
    id: 'language',
    name: 'Foreign Languages',
    shortName: 'Languages',
    emoji: '🗣️',
    color: '#ec4899',
    gradient: 'linear-gradient(135deg, rgba(236, 72, 153, 0.15), rgba(236, 72, 153, 0.05))',
    iconName: 'Languages',
    tip: 'Scan text in any language for translation & learning',
    description: 'Translation, Grammar & Vocabulary in any language',
    examplePrompts: [
      'Translate this text',
      'Explain the grammar rules',
      'What does this phrase mean?',
    ],
    keywords: ['translate', 'translation', 'foreign', 'spanish', 'french', 'german', 'chinese', 'japanese', 'korean', 'arabic', 'hindi', 'tamil'],
    difficulty: ['basic', 'intermediate', 'advanced'],
    category: 'Humanities',
  },
};

// ── Ordered list for display ───────────────────────────────
export const SUBJECT_LIST = Object.values(SUBJECT_REGISTRY);

// ── Categories ─────────────────────────────────────────────
export const SUBJECT_CATEGORIES = {
  STEM: SUBJECT_LIST.filter(s => s.category === 'STEM'),
  Humanities: SUBJECT_LIST.filter(s => s.category === 'Humanities'),
  'Social Sciences': SUBJECT_LIST.filter(s => s.category === 'Social Sciences'),
};

// ── Default quick subjects for HomePage (6 items) ──────────
export const DEFAULT_QUICK_SUBJECTS = ['math', 'science', 'history', 'english', 'biology', 'chemistry'];

// ── Get subject by ID with fallback ────────────────────────
export function getSubject(id) {
  if (!id) return null;
  const lower = id.toLowerCase();
  return SUBJECT_REGISTRY[lower] || Object.values(SUBJECT_REGISTRY).find(s =>
    s.name.toLowerCase() === lower || s.shortName.toLowerCase() === lower
  ) || null;
}

// ── Auto-detect subject from text ──────────────────────────
export function detectSubjectFromText(text) {
  const lower = (text || '').toLowerCase();
  let bestMatch = null;
  let maxMatches = 0;

  for (const subject of SUBJECT_LIST) {
    const matches = subject.keywords.filter(k => lower.includes(k)).length;
    if (matches > maxMatches) {
      maxMatches = matches;
      bestMatch = subject;
    }
  }

  return bestMatch?.shortName || 'General';
}

// ── Normalize a subject string to canonical name ───────────
export function normalizeSubject(subject) {
  if (!subject) return 'General';
  const found = getSubject(subject);
  if (found) return found.shortName;

  const lower = subject.toLowerCase();
  for (const s of SUBJECT_LIST) {
    if (lower.includes(s.id) || lower.includes(s.shortName.toLowerCase())) {
      return s.shortName;
    }
  }
  return 'General';
}
