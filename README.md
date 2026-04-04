# LensLearn

**Point your lens. Learn anything.**

LensLearn is an offline-first adaptive tutor powered by Google's Gemma 4 open model. Students photograph any textbook page and get step-by-step explanations in their own language - no internet required.

## The Problem

Over 250 million students in underserved regions study from textbooks they struggle to understand - whether due to language barriers, lack of tutoring access, or overcrowded classrooms with 40-60 students per teacher. The students who succeed aren't always the ones who understand the subject best - they're the ones who understand the textbook's language.

## The Solution

LensLearn turns any smartphone into a personal tutor:

1. **Snap** - Point your camera at any textbook page, homework problem, or diagram
2. **Learn** - Get clear, step-by-step explanations in your chosen language
3. **Quiz** - Test your understanding with auto-generated questions
4. **Ask** - Follow up with questions, just like having a real tutor

All powered by Gemma 4 running locally on your device. No cloud. No internet. No data sent anywhere.

## Features

- **Multimodal Understanding** - Processes text, math equations, diagrams, charts, and handwriting
- **15+ Languages** - Explains content in English, Spanish, Hindi, Tamil, Arabic, Chinese, and more
- **Adaptive Difficulty** - Adjusts explanations from elementary to university level
- **Auto-Generated Quizzes** - Tests comprehension with multiple-choice questions
- **Text-to-Speech** - Reads explanations aloud for accessibility
- **Offline-First PWA** - Works without internet after initial install
- **Privacy-First** - All processing happens on-device; no data leaves the phone

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Frontend | React + Vite (Progressive Web App) |
| AI Model | Gemma 4 E4B (4B params, multimodal, on-device) |
| Local Inference | Ollama |
| Fine-tuning | Unsloth (domain-adapted for educational content) |
| Speech | Web Speech API (built-in, no dependencies) |

## Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) 18+
- [Ollama](https://ollama.ai/) installed and running

### Setup

```bash
# 1. Clone the repo
git clone https://github.com/YOUR_USERNAME/lenslearn.git
cd lenslearn

# 2. Install dependencies
npm install

# 3. Pull Gemma 4 model
ollama pull gemma4:e4b

# 4. Start development server
npm run dev
```

Open `http://localhost:5173` in your browser (or scan the QR code on your phone if on the same network).

### Build for Production

```bash
npm run build
npm run preview
```

## Architecture

```
User's Phone/Browser
    |
    |-- Camera API (capture textbook page)
    |-- React PWA (offline-capable UI)
    |
    v
Ollama (local server)
    |
    |-- Gemma 4 E4B (multimodal inference)
    |-- Function Calling (quiz generation, progress tracking)
    |
    v
Explanation + Quiz + Follow-up
    |
    |-- Text-to-Speech (Web Speech API)
    |-- Local Storage (progress persistence)
```

## Hackathon Tracks

This project is submitted to the [Gemma 4 Good Hackathon](https://www.kaggle.com/competitions/gemma-4-good-hackathon):

- **Main Track** - Best overall project
- **Future of Education** - Adaptive, multi-tool learning agent
- **Digital Equity & Inclusivity** - Multilingual, offline-first for underserved communities
- **Ollama** - Local deployment via Ollama
- **Unsloth** - Fine-tuned with Unsloth for educational content

## License

Apache 2.0

## Author

Built by Dilli Prasath S for the Gemma 4 Good Hackathon 2026.
