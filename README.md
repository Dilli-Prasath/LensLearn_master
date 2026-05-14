<p align="center">
  <img src="public/favicon.svg" width="80" alt="LensLearn Logo" />
</p>

<h1 align="center">LensLearn</h1>

<p align="center">
  <strong>Point your lens. Learn anything.</strong><br/>
  An offline-first AI tutor powered by Google's Gemma 4 — scan any textbook page, get step-by-step explanations in 15+ languages.
</p>

<p align="center">
  <a href="#quick-start">Quick Start</a> •
  <a href="#features">Features</a> •
  <a href="#how-it-works">How It Works</a> •
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
  <img src="https://img.shields.io/badge/Languages-15+-10B981?style=flat-square" alt="Languages" />
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

**Everything runs locally on your device.** No internet required. No cloud servers. No data collection. No cost.

---

## Features

| Feature | Description |
|---------|-------------|
| **Multimodal AI** | Gemma 4 processes text, equations, diagrams, charts, and handwriting from camera or uploaded images |
| **15+ Languages** | Explanations in English, Tamil, Hindi, Spanish, Arabic, Chinese, French, German, Japanese, Korean, and more |
| **Adaptive Difficulty** | Adjusts from elementary to university level based on student preference |
| **Auto-Generated Quizzes** | Multiple-choice questions generated from the explained content |
| **Flashcards** | Spaced repetition cards for effective review |
| **Follow-up Chat** | Ask clarifying questions conversationally |
| **Text-to-Speech** | Reads explanations aloud via Web Speech API |
| **Document Support** | Upload PDF and DOCX files in addition to camera capture |
| **Offline PWA** | Installs from browser, works without internet |
| **Privacy-First** | All processing on-device — zero data transmitted |
| **Accessible** | Screen reader support, high contrast, color-blind filters, voice control, keyboard navigation |
| **Multi-Model** | Supports 6 models — auto-selects the best one for your hardware |
| **12 Subjects** | Math, Science, Physics, Chemistry, Biology, History, English, Geography, CS, Economics, Medicine, Languages |
| **5 Themes** | Dark, light, and accent color customization |

---

## How It Works

```
Student's Phone / Browser
        │
        ├── Camera API or File Upload (capture textbook page)
        ├── Image Cropper (focus on specific problems)
        │
        ▼
React PWA (Offline-Capable)
        │
        ├── Zustand Stores (settings, history, scan state)
        ├── Service Worker (Workbox — asset caching)
        ├── Explanation Cache (DJB2 content hashing)
        │
        ▼
Ollama (Local AI Server)
        │
        ├── Gemma 4 E4B (4B multimodal — recommended)
        ├── Gemma 4 E2B (2B — for low-end devices)
        ├── Chain-of-thought reasoning (thinking mode)
        │
        ▼
Output: Explanation → Quiz → Flashcards → Follow-up
        │
        ├── Text-to-Speech (Web Speech API)
        ├── Export (text file download)
        └── History (localStorage persistence)
```

---

## Quick Start

### Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| [Node.js](https://nodejs.org/) | 18+ | JavaScript runtime |
| [Ollama](https://ollama.ai/) | Latest | Local AI model server |
| Git | Any | Version control |

### Setup

```bash
# Clone the repository
git clone https://github.com/dilliprasath/lenslearn.git
cd lenslearn

# Install dependencies
npm install

# Pull the recommended Gemma 4 model (~9.6 GB)
ollama pull gemma4:e4b

# Start Ollama with CORS enabled (required for browser access)
OLLAMA_HOST=0.0.0.0:11434 OLLAMA_ORIGINS="*" ollama serve

# In a new terminal — start LensLearn
npm run dev
```

Open **http://localhost:5173** in your browser. The green dot in the header confirms Ollama is connected.

### Alternative Models

```bash
# Lightweight (for devices with <8GB RAM)
ollama pull gemma4:e2b

# Full power (for devices with 32GB+ RAM)
ollama pull gemma3:12b
```

### Build for Production

```bash
npm run build      # Outputs to dist/
npm run preview    # Preview the production build locally
```

---

## Architecture

### Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 18.3 + Vite 5.4 | Component-based PWA |
| **Routing** | React Router 6 | 14 routes, lazy-loaded |
| **State** | Zustand 5.0 | 5 stores, localStorage persistence |
| **AI Runtime** | Ollama + Gemma 4 | Local multimodal inference |
| **Markdown** | react-markdown 9.0 | AI explanation rendering |
| **Documents** | pdfjs-dist + mammoth | PDF and DOCX parsing |
| **Icons** | lucide-react | Tree-shakeable icon library |
| **PWA** | vite-plugin-pwa + Workbox | Offline caching, install prompt |
| **Speech** | Web Speech API | Text-to-speech (no dependencies) |

### Project Structure

```
src/
├── config/          # Model registry (6 models), Subject registry (12 subjects)
├── pages/           # 13 page components (Home, Scan, Explain, Quiz, Flashcards, etc.)
├── components/      # 12 app-specific components + accessibility module
├── store/           # 5 Zustand stores (settings, history, scan, connection, accessibility)
├── services/        # 6 services (AI, documents, cache, export, speech, history)
├── hooks/           # Camera, localStorage hooks
├── lib/             # Publishable component library
│   ├── components/  # 20 reusable UI components
│   ├── hooks/       # 19 custom hooks
│   ├── tokens/      # Design token system
│   ├── animations/  # 20+ animation primitives
│   ├── utils/       # 16 utility functions
│   ├── hoc/         # 6 higher-order components
│   └── providers/   # Theme + Accessibility providers
├── utils/           # Themes, performance detection
└── styles/          # Global CSS
```

### Component Library (`@lenslearn/ui`)

The UI layer is designed as a standalone, publishable npm package:

- **20 components:** Badge, Button, Card, ChatThread, Chip, Dropdown, EmptyState, IconButton, Input, LanguageSelector, Modal, ModelSelector, Progress, ProgressRing, ScoreRing, Skeleton, Toast, Toggle, Tooltip
- **19 hooks:** useDebounce, useThrottle, useMediaQuery, useIntersectionObserver, useLocalStorage, useClipboard, useTimer, and more
- **6 HOCs:** withLoading, withErrorBoundary, withAuth, withTheme, withAnimation, withAccessibility
- **Design tokens:** Colors, spacing, typography, shadows, breakpoints, z-index, border-radius — all as CSS custom properties
- **5 themes:** Default Dark, Light, OLED, High Contrast, Sepia
- **10 accent colors:** Indigo, Blue, Emerald, Rose, Amber, Violet, Cyan, Orange, Pink, Lime

---

<a name="hackathon"></a>
## Gemma 4 Good Hackathon

This project is built for the [Gemma 4 Good Hackathon](https://www.kaggle.com/competitions/gemma-4-good-hackathon) by Google DeepMind and Kaggle.

### Tracks

| Track | Fit | Why |
|-------|-----|-----|
| **Main Track** | Core submission | Complete, production-quality educational AI app |
| **Future of Education** | Perfect fit | AI-powered adaptive tutoring for underserved students |
| **Digital Equity & Inclusivity** | Perfect fit | Offline-first, multilingual, free, privacy-preserving |
| **Ollama** | Integrated | Ollama is the local AI runtime — deeply integrated |
| **Unsloth** | Planned | Fine-tuning Gemma 4 on educational Q&A data |

### Judging Criteria

- **Impact & Vision (40%):** 250M students lack quality education. LensLearn bridges the gap with local AI
- **Video Pitch & Storytelling (30%):** Personal story from rural Tamil Nadu, live demo of Tamil→English tutoring
- **Technical Depth (30%):** Full component library, model registry, adaptive hardware detection, PWA offline

---

## Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

Areas where help is especially welcome:
- Adding support for more languages
- Creating curriculum-aligned Q&A datasets for model fine-tuning
- Testing on low-end Android devices
- Accessibility improvements
- Translations of the UI itself

---

## License

[Apache 2.0](LICENSE) — Free to use, modify, and distribute.

---

## Author

**Dilli Prasath S**
Frontend Software Engineer · Chennai, India
Built with purpose for the Gemma 4 Good Hackathon 2026.

*"The students who succeed aren't always the smartest — they're the ones who can understand the textbook. LensLearn changes that equation."*
