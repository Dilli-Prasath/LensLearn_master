# LensLearn — Developer Guide & Hackathon Roadmap

> "Point your lens. Learn anything."
>
> Last updated: April 4, 2026
> Author: Dilli Prasath S

---

## What is LensLearn?

LensLearn is an offline-first adaptive tutor for students. You photograph any textbook page (or upload a PDF/DOCX), and the app gives you a step-by-step explanation in your chosen language — powered entirely by Google's Gemma 4 AI running locally on your device through Ollama. No internet needed, no cloud servers, complete privacy.

We're building this for the **Gemma 4 Good Hackathon** on Kaggle (prize pool: $200,000).


---


## Tech Stack at a Glance

| Layer              | Technology         | Version    | What it does                                      |
|--------------------|--------------------|------------|---------------------------------------------------|
| UI Framework       | React              | 18.3.1     | Component-based frontend                          |
| Build Tool         | Vite               | 5.4.11     | Dev server + production bundler                   |
| Routing            | React Router DOM   | 6.28.0     | URL-based page navigation (SPA)                   |
| State Management   | Zustand            | 5.0.12     | Lightweight global stores, persisted to localStorage |
| AI Backend         | Ollama             | 0.6.3      | Runs Gemma 4 models locally (no cloud)            |
| AI Model           | Gemma 4 E4B        | —          | Google's 4B parameter multimodal model            |
| Markdown           | react-markdown     | 9.0.1      | Renders AI explanations as formatted text         |
| PDF Parsing        | pdfjs-dist         | 3.11.174   | Extracts text and images from PDFs                |
| DOCX Parsing       | mammoth            | 1.8.0      | Extracts text from Word documents                 |
| Icons              | lucide-react       | 0.462.0    | Icon library (consistent, tree-shakeable)         |
| PWA                | vite-plugin-pwa    | 0.21.1     | Service worker, offline caching, install prompt   |
| Service Worker     | Workbox            | 7.3.0      | Offline asset caching                             |


---


## Prerequisites (Install These First)

### 1. Node.js (v18 or higher)
Download from https://nodejs.org/ — pick the LTS version.
Verify: `node --version` should show v18+.

### 2. npm (comes with Node.js)
Verify: `npm --version`

### 3. Ollama (AI model runner)
Download from https://ollama.com/download — available for macOS, Linux, and Windows.
Verify: `ollama --version`

### 4. Gemma 4 E4B model (~9.6 GB download)
After installing Ollama, pull the model:
```bash
ollama pull gemma4:e4b
```
This takes 10-30 minutes depending on your internet speed. You need ~12 GB free disk space.

### 5. Git
For cloning and version control. Download from https://git-scm.com/

### 6. A code editor
VS Code recommended: https://code.visualstudio.com/


---


## Getting Started (Step by Step)

### Step 1: Clone the repository
```bash
git clone <repo-url>
cd lenslearn
```

### Step 2: Install dependencies
```bash
npm install
```
This installs all packages listed in package.json (~476 packages).

### Step 3: Start Ollama with CORS enabled
Open a terminal and run:
```bash
OLLAMA_HOST=0.0.0.0:11434 OLLAMA_ORIGINS="*" ollama serve
```
Keep this terminal open. Ollama must be running for the AI features to work.

If you're on Windows:
```powershell
$env:OLLAMA_HOST="0.0.0.0:11434"
$env:OLLAMA_ORIGINS="*"
ollama serve
```

### Step 4: Start the dev server
In a second terminal:
```bash
npm run dev
```
Open http://localhost:5173 in your browser.

### Step 5: Verify it works
- The header should show a green dot with "Gemma 4 E4B" (means Ollama is connected)
- Click the Scan tab, upload any textbook photo or PDF
- Click "Explain" — you should see a streaming AI explanation

### Step 6: Production build (when ready)
```bash
npm run build
npm run preview   # Preview the built version locally
```
The `dist/` folder is the production output.


---


## Project Structure

```
lenslearn/
├── index.html              ← HTML entry point
├── vite.config.js          ← Vite config (dev server proxy, PWA, code splitting)
├── package.json            ← Dependencies and scripts
│
├── src/
│   ├── main.jsx            ← React entry point (mounts RouterProvider)
│   ├── router.jsx          ← All route definitions (12 routes)
│   │
│   ├── layouts/
│   │   └── AppLayout.jsx   ← Root layout (Header + page + BottomNav)
│   │
│   ├── pages/              ← One file per route (lazy-loaded)
│   │   ├── HomePage.jsx         Dashboard with stats, tips, recent scans
│   │   ├── ScanPage.jsx         Camera + file upload interface
│   │   ├── ExplanationPage.jsx  AI explanation view
│   │   ├── QuizPage.jsx         Auto-generated quiz
│   │   ├── FlashcardsPage.jsx   Auto-generated flashcards
│   │   ├── SubjectsPage.jsx     Subject library + progress
│   │   ├── SubjectDetailPage.jsx  Per-subject detail (future)
│   │   ├── HistoryPage.jsx      Past scan sessions
│   │   ├── HistoryDetailPage.jsx  View a past session
│   │   ├── SettingsPage.jsx     User preferences
│   │   ├── AchievementsPage.jsx   Badges & gamification (future)
│   │   └── StudyPlanPage.jsx      AI study planner (future)
│   │
│   ├── components/         ← Reusable UI components
│   │   ├── Header.jsx           Top bar with connection status
│   │   ├── BottomNav.jsx        Tab navigation
│   │   ├── CameraCapture.jsx    Camera + upload UI
│   │   ├── ImageCropper.jsx     Crop captured images
│   │   ├── ExplanationView.jsx  Renders AI explanation + actions
│   │   ├── QuizView.jsx         Quiz UI with scoring
│   │   ├── FlashcardView.jsx    Swipeable flashcard UI
│   │   ├── SettingsPanel.jsx    Settings form
│   │   ├── Onboarding.jsx       First-time user flow
│   │   ├── InstallPrompt.jsx    PWA install prompt
│   │   ├── LoadingSpinner.jsx   Loading animation
│   │   └── ErrorState.jsx       Error display
│   │
│   ├── store/              ← Zustand state management (the "database")
│   │   ├── index.js             Barrel export for all stores
│   │   ├── settingsStore.js     User preferences (persisted)
│   │   ├── historyStore.js      Past sessions (persisted)
│   │   ├── scanStore.js         Current scan + AI state (ephemeral)
│   │   ├── connectionStore.js   Ollama connection status
│   │   └── migrate.js           One-time migration from old format
│   │
│   ├── services/           ← Business logic (singleton services)
│   │   ├── ollamaService.js     Ollama SDK integration (the brain)
│   │   ├── documentService.js   PDF/DOCX/image parsing
│   │   ├── historyService.js    Legacy session storage
│   │   ├── cacheService.js      Offline response cache
│   │   ├── exportService.js     Export notes to text files
│   │   └── speechService.js     Text-to-speech
│   │
│   ├── hooks/              ← Custom React hooks
│   │   ├── useCamera.js         Camera capture + file upload
│   │   └── useLocalStorage.js   localStorage persistence
│   │
│   ├── utils/              ← Utility functions
│   │   ├── themes.js            Theme system (4 themes, 10 accent colors)
│   │   └── performance.js       Device detection + adaptive settings
│   │
│   └── styles/
│       ├── index.css            Global CSS, design system, animations
│       └── InstallPrompt.css    PWA install styles
│
└── dist/                   ← Production build output (generated)
```


---


## How Routing Works

We use React Router v6 with `createBrowserRouter`. All routes are defined in `src/router.jsx`.

| URL Path              | Page Component        | What it shows                    |
|-----------------------|-----------------------|----------------------------------|
| `/`                   | HomePage              | Dashboard, stats, quick actions  |
| `/scan`               | ScanPage              | Camera capture + file upload     |
| `/explain`            | ExplanationPage       | AI-generated explanation         |
| `/quiz`               | QuizPage              | Quiz from the explanation        |
| `/flashcards`         | FlashcardsPage        | Flashcards from the explanation  |
| `/subjects`           | SubjectsPage          | All subjects + progress          |
| `/subjects/:subjectId`| SubjectDetailPage     | One subject deep-dive (future)   |
| `/history`            | HistoryPage           | All past sessions                |
| `/history/:sessionId` | HistoryDetailPage     | View one past session            |
| `/settings`           | SettingsPage          | User preferences                 |
| `/achievements`       | AchievementsPage      | Badges (future placeholder)      |
| `/study-plan`         | StudyPlanPage         | AI planner (future placeholder)  |

Every page is lazy-loaded (only downloaded when you visit it). The `AppLayout` component wraps all routes and provides the Header and BottomNav.

To navigate in code:
```jsx
import { useNavigate } from 'react-router-dom';

const navigate = useNavigate();
navigate('/scan');          // go to scan page
navigate('/history/12345'); // go to specific session
navigate(-1);              // go back
```


---


## How State Management Works (Zustand)

Instead of a database, we use **Zustand** — a tiny state management library that persists data to the browser's `localStorage`. Think of it as 4 mini-databases:

### Store 1: `useSettingsStore` (persisted)
User preferences — theme, language, grade level, layout, accessibility.

```jsx
import { useSettingsStore } from '../store';

// Read a setting
const language = useSettingsStore((s) => s.language);

// Update a setting
const setSetting = useSettingsStore((s) => s.setSetting);
setSetting('language', 'Tamil');
```

### Store 2: `useHistoryStore` (persisted)
All past scan sessions — images, explanations, quizzes, bookmarks.

```jsx
import { useHistoryStore } from '../store';

// Read all sessions (reactive — re-renders when sessions change)
const sessions = useHistoryStore((s) => s.sessions);

// Save a new session
const saveSession = useHistoryStore((s) => s.saveSession);
saveSession({ image, explanation, subject: 'Math', language: 'English', quiz });

// Get stats
const getStats = useHistoryStore((s) => s.getStats);
const stats = getStats(); // { totalScans, studyStreak, avgQuizScore, ... }
```

### Store 3: `useScanStore` (not persisted — resets on page refresh)
Current scan session — the image you just captured, the AI explanation being streamed, quiz/flashcard data.

```jsx
import { useScanStore } from '../store';

// Read explanation (updates in real-time during streaming)
const explanation = useScanStore((s) => s.explanation);
const isStreaming = useScanStore((s) => s.isStreaming);

// Trigger AI explain
const explain = useScanStore((s) => s.explain);
await explain({ language: 'English', gradeLevel: 'high school' });

// Generate quiz
const generateQuiz = useScanStore((s) => s.generateQuiz);
const success = await generateQuiz('English');
```

### Store 4: `useConnectionStore` (not persisted)
Ollama connection status — polls every 30 seconds.

```jsx
import { useConnectionStore } from '../store';

const status = useConnectionStore((s) => s.status);
// status = { connected: true, model: 'gemma4:e4b', models: [...] }
```

### Key Rule
Always import stores from `'../store'` (the barrel export), not from individual files.


---


## How the AI Works

The flow: User captures image → `ollamaService.explain()` → Ollama processes locally → streams response back.

Ollama runs the Gemma 4 model on the user's own computer. No internet needed. The Vite dev server proxies `/api/ollama` to `http://127.0.0.1:11434` to avoid CORS issues.

### Model priority (auto-detected)
1. `gemma4:e4b` (4B params, multimodal — preferred)
2. `gemma4:e2b` (2B params, lighter)
3. `gemma4:26b` (26B params, needs powerful GPU)
4. `gemma4:31b` (31B params, highest quality)
5. `gemma3:4b` (fallback if no Gemma 4 available)

### Thinking mode
Gemma 4 models support `think: true` which enables chain-of-thought reasoning for better explanations. This is automatically enabled for Gemma 4 and disabled for Gemma 3.

### Device-adaptive limits
The app detects device capabilities (RAM, CPU cores) and adjusts:
- Low-end (≤2GB RAM): 2048 max tokens, lower image quality
- Medium (≤4GB RAM): 3072 max tokens
- High-end (>4GB RAM): 4096 max tokens, full quality


---


## No Database Needed

All data lives in `localStorage` via Zustand stores. Here's why this works:

- **History**: Up to 50 sessions stored as JSON. Each session includes the base64 image, explanation text, quiz data, and metadata. Zustand's `persist` middleware handles serialization automatically.

- **Settings**: Theme, language, accessibility preferences — all key-value pairs in localStorage.

- **Cache**: Explanation cache (up to 20 items) prevents re-processing the same image. Uses a DJB2 hash of the image as the key.

- **No user accounts**: Everything is local. No sign-up, no cloud sync, no server.

This is a feature, not a limitation — it means the app works offline, respects privacy, and has zero infrastructure cost.


---


## Important Files to Know

If you're fixing a bug or adding a feature, here's where to look:

| What you want to change          | File                                |
|----------------------------------|-------------------------------------|
| Add a new page/route             | `src/router.jsx`                    |
| Change what the AI says/does     | `src/services/ollamaService.js`     |
| Change how state works           | `src/store/*.js`                    |
| Change the theme/colors          | `src/utils/themes.js`               |
| Change the global CSS            | `src/styles/index.css`              |
| Change the header                | `src/components/Header.jsx`         |
| Change the bottom navigation     | `src/components/BottomNav.jsx`      |
| Change the camera/upload flow    | `src/components/CameraCapture.jsx`  |
| Change the explanation display   | `src/components/ExplanationView.jsx`|
| Change the quiz UI               | `src/components/QuizView.jsx`       |
| Change settings options          | `src/components/SettingsPanel.jsx`  |
| Change PWA config                | `vite.config.js`                    |
| Change the home dashboard        | `src/pages/HomePage.jsx`            |


---


## HACKATHON ROADMAP (What Remains)

**Competition**: Gemma 4 Good Hackathon
**Deadline**: May 18, 2026, 11:59 PM UTC (~6.5 weeks from now)
**Prize Pool**: $200,000
**Tracks we're targeting**: Main ($50K) + Education ($10K) + Digital Equity ($10K) + Ollama ($10K) + Unsloth ($10K)

### Judging Criteria
- Impact & Vision — 40% (Does it solve a real problem? How many people benefit?)
- Video Pitch & Storytelling — 30% (Is the 3-min video compelling?)
- Technical Depth — 30% (Creative use of Gemma 4, code quality, innovation)

---

### Phase 1: Core Polish (April 5–13) — Week 1

- [ ] **Fix Ollama gemma4:e4b pull issue** — Some systems fail on the rename step. Test with `OLLAMA_TMPDIR` set to same volume as models directory
- [ ] **Test every feature end-to-end** — Scan (camera + upload), explain, quiz, flashcards, history, settings, export
- [ ] **Fix any broken routes** — Verify all 12 routes work with direct URL access and back/forward navigation
- [ ] **Mobile responsiveness** — Test on actual phones (Android Chrome, iOS Safari). Fix any overflow/sizing issues
- [ ] **Add error boundaries** — Wrap pages in React error boundaries so one crash doesn't kill the whole app
- [ ] **Performance audit** — Run Lighthouse, fix any PWA issues, ensure offline mode works

### Phase 2: Differentiating Features (April 14–27) — Weeks 2–3

- [ ] **Multi-language support (live demo)** — Test with Tamil, Hindi, Spanish, French. Show language switching in the demo video
- [ ] **Unsloth fine-tuning** — Fine-tune Gemma 4 E4B on educational content (textbook Q&A pairs) using Unsloth. This is required for the Unsloth track ($10K). Document the process in a Kaggle notebook
- [ ] **Implement Achievements page** — Gamification: badges for streaks, quiz scores, subjects explored. Makes the demo more engaging
- [ ] **Implement Study Plan page** — AI-generated study schedule based on scan history. Uses `ollamaService.generateStudyPlan()`
- [ ] **Subject Detail page** — Show mastery level, weak areas, session history per subject
- [ ] **Accessibility polish** — Screen reader testing, keyboard navigation, high contrast mode verification
- [ ] **Solve Step-by-Step feature** — For math/science: show solution steps one at a time (already in ollamaService, needs UI)

### Phase 3: Demo & Storytelling (April 28 – May 10) — Weeks 4–5

- [ ] **Record 3-minute YouTube video** — This is 30% of the score. Plan the script:
  1. (0:00–0:30) Hook: "700 million students lack access to quality education. Meet LensLearn."
  2. (0:30–1:30) Live demo: scan a Tamil textbook page, get explanation in Tamil, switch to English, generate quiz
  3. (1:30–2:15) Technical depth: show Gemma 4 running locally, Unsloth fine-tuning, PWA offline mode
  4. (2:15–2:45) Impact: show how a rural student in Tiruvannamalai uses it (personal story)
  5. (2:45–3:00) Vision: roadmap, scale, why Gemma 4 makes this possible
- [ ] **Create cover image** — 1280x720 or similar. Show the app on a phone with a textbook page
- [ ] **Practice the video** — Record 3-4 takes. Pick the best. Add subtitles if possible

### Phase 4: Submission (May 11–18) — Final Week

- [ ] **Write Kaggle Writeup** — Max 1,500 words. Structure:
  1. Problem statement (education inequality, language barriers)
  2. Solution overview (LensLearn = offline tutor)
  3. Technical approach (Gemma 4 + Ollama + Unsloth + PWA)
  4. Impact (who benefits, how many, real-world scenario)
  5. Future vision (scale to more subjects, languages, devices)
- [ ] **Push public code repo** — Clean up code, add README, license (Apache 2.0), remove any secrets
- [ ] **Deploy live demo** — Options: Vercel/Netlify for frontend (Ollama can't be cloud-deployed easily, so the demo should show a video of it working OR use a Kaggle notebook for the AI part)
- [ ] **Test submission checklist**:
  - [ ] Kaggle Writeup (≤1,500 words) — submitted
  - [ ] YouTube video (≤3 min, public/unlisted) — linked
  - [ ] Public code repository — linked
  - [ ] Live demo URL — linked
  - [ ] Cover image — uploaded
  - [ ] Team members listed (max 5)
  - [ ] Winner license: CC-BY 4.0 acknowledged
- [ ] **Submit before May 18, 11:59 PM UTC** — Don't wait until the last hour

---

### Winning Strategy

1. **Storytelling is 70% of the score** (Impact 40% + Video 30%). The tech only needs to be "good enough" — the story needs to be great. Dilli's personal background (from Tiruvannamalai, a rural area in Tamil Nadu) is the strongest asset. Use it.

2. **Target multiple tracks** — A single project can win Main + Special Technology. We should submit to: Main, Future of Education, Digital Equity, Ollama, and Unsloth.

3. **The Unsloth track** requires fine-tuning with Unsloth. Create a Kaggle notebook showing the fine-tuning process. Even a small fine-tune (educational Q&A dataset) qualifies.

4. **The Ollama track** requires integration with Ollama. We already use it — just make sure it's prominent in the writeup and video.

5. **Show, don't tell** — The video should show the app working with a real textbook in a real language. Not slides, not mockups.


---


## Common Issues & Fixes

### "Ollama not connected" in the header
Ollama isn't running. Start it with:
```bash
OLLAMA_HOST=0.0.0.0:11434 OLLAMA_ORIGINS="*" ollama serve
```

### "gemma4:e4b does not exist" or model not found
Pull the model:
```bash
ollama pull gemma4:e4b
```

### "rename: no such file or directory" when pulling model
Set the temp directory to the same volume:
```bash
OLLAMA_TMPDIR=/path/to/.ollama/models/blobs ollama pull gemma4:e4b
```

### "gemma3:4b does not support thinking"
The app auto-disables thinking mode for non-Gemma-4 models. If you see this error, the fix is already in place — just make sure you're on the latest code.

### White/blank page after refresh on a route like /history
The PWA service worker needs `navigateFallback`. Already configured in `vite.config.js`. If deploying, make sure your hosting platform serves `index.html` for all routes (SPA fallback).

### Build fails
```bash
rm -rf node_modules
npm install
npm run build
```

### Port 5173 already in use
```bash
npx vite --port 3000
```


---


## Quick Reference Commands

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Start Ollama (macOS/Linux)
OLLAMA_HOST=0.0.0.0:11434 OLLAMA_ORIGINS="*" ollama serve

# Pull AI model
ollama pull gemma4:e4b

# Check which models are installed
ollama list

# Run a quick test in terminal
ollama run gemma4:e4b "Explain photosynthesis in simple terms"
```


---


## Contact

Built by **Dilli Prasath S** — Frontend Engineer at Zoho Corporation, Chennai.
For questions about the codebase, reach out directly.
