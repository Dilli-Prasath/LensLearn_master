# LensLearn — Developer Guide & Hackathon Roadmap

> "Point your lens. Learn anything."
>
> Last updated: April 5, 2026
> Author: Dilli Prasath S

---

## Table of Contents

1. [What is LensLearn?](#what-is-lenslearn)
2. [Tech Stack at a Glance](#tech-stack-at-a-glance)
3. [Prerequisites](#prerequisites-install-these-first)
4. [Getting Started](#getting-started-step-by-step)
5. [Project Structure](#project-structure)
6. [How Routing Works](#how-routing-works)
7. [How State Management Works](#how-state-management-works-zustand)
8. [How the AI Works](#how-the-ai-works)
9. [No Database Needed](#no-database-needed)
10. [Important Files to Know](#important-files-to-know)
11. [Component Library](#component-library)
12. [Components Reference](#components-reference)
13. [Custom Hooks](#custom-hooks)
14. [Design Tokens & Theming](#design-tokens--theming)
15. [Animation System](#animation-system)
16. [Utility Functions](#utility-functions)
17. [Higher-Order Components](#higher-order-components)
18. [Providers](#providers)
19. [AI Model System](#ai-model-system)
20. [Build & Publish](#build--publish)
21. [Architecture Patterns](#architecture-patterns)
22. [Adding New Features](#adding-new-features)
23. [HACKATHON ROADMAP](#hackathon-roadmap-what-remains)
24. [Common Issues & Fixes](#common-issues--fixes)
25. [Quick Reference Commands](#quick-reference-commands)
26. [Contact](#contact)

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
│   ├── config/
│   │   └── models.js       ← AI model registry (single source of truth)
│   │
│   ├── layouts/
│   │   └── AppLayout.jsx   ← Root layout (Header + page + BottomNav)
│   │
│   ├── lib/                ← Publishable component library (~5,300 lines)
│   │   ├── index.js        ← Main barrel export
│   │   ├── components/     ← 19 UI components
│   │   │   ├── Button.jsx
│   │   │   ├── Card.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── ModelSelector.jsx
│   │   │   └── [more components...]
│   │   ├── hooks/          ← 19 custom React hooks
│   │   ├── tokens/         ← Design tokens (colors, spacing, typography)
│   │   ├── animations/     ← 20+ keyframe animations
│   │   ├── utils/          ← 16 utility functions
│   │   ├── hoc/            ← 6 Higher-Order Components
│   │   └── providers/      ← Theme & Accessibility providers
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
Ollama connection status — polls every 30 seconds. Supports model switching via `switchModel`.

```jsx
import { useConnectionStore } from '../store';

const status = useConnectionStore((s) => s.status);
// status = { connected: true, model: 'gemma4:e4b', models: [...] }

const switchModel = useConnectionStore((s) => s.switchModel);
switchModel('gemma4:27b');
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
| AI model registry                | `src/config/models.js`              |
| Component library & model picker | `src/lib/components/ModelSelector.jsx` |


---


## Component Library

The library lives in `src/lib/` and is designed to be published as `@lenslearn/ui`. Every component uses `forwardRef` + `memo` for optimal performance and ref forwarding.

### Import Patterns

```jsx
// Import from barrel (recommended)
import { Button, Card, Badge, Modal } from '../lib/components';

// Import individual component
import Button from '../lib/components/Button';

// Import hooks
import { useDebounce, useToggle, useBreakpoint } from '../lib/hooks';

// Import tokens
import { createTheme, colorPrimitives, shadows } from '../lib/tokens';

// Import animations
import { animate, stagger, preloadAnimations } from '../lib/animations';

// Import utilities
import { cn, mergeStyles, copyToClipboard } from '../lib/utils';

// Import HOCs
import { withErrorBoundary, withLazyLoad } from '../lib/hoc';
```

### Icon Handling

All library components that accept an `icon` prop support both JSX elements and component references. This means both patterns work:

```jsx
// JSX element (explicit)
<Button icon={<Camera size={18} />}>Scan</Button>

// Component reference (auto-rendered with default size)
<Button icon={Camera}>Scan</Button>
```

This is handled internally by a `renderIcon()` helper in each component that detects whether the prop is already a React element or a component reference.


---


## Components Reference

### Button

Polymorphic, accessible button with 7 variants and 5 sizes.

```jsx
<Button variant="primary" size="lg" icon={Camera}>Scan</Button>
<Button as="a" href="/about" variant="ghost">About</Button>
<Button variant="outline" loading>Processing...</Button>
<Button variant="glass" pill fullWidth>Full Width Pill</Button>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `as` | `string \| Component` | `'button'` | Render as different element |
| `variant` | `'primary' \| 'secondary' \| 'ghost' \| 'outline' \| 'danger' \| 'success' \| 'glass'` | `'primary'` | Visual style |
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'` | Size preset |
| `icon` | `ReactNode \| Component` | — | Left icon |
| `iconRight` | `ReactNode \| Component` | — | Right icon |
| `loading` | `boolean` | `false` | Show spinner |
| `disabled` | `boolean` | `false` | Disabled state |
| `fullWidth` | `boolean` | `false` | Full container width |
| `pill` | `boolean` | `false` | Pill-shaped border radius |

### Card

Composable card with compound sub-components.

```jsx
<Card variant="glass" hoverable onClick={handleClick}>
  <Card.Header title="Quiz Results" icon={<Trophy />} action={<Badge>New</Badge>} />
  <Card.Body>Content here</Card.Body>
  <Card.Footer>
    <Button>Continue</Button>
  </Card.Footer>
</Card>

<Card.Stat icon={TrendingUp} label="Scans" value={42} color="#6366f1" />
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `as` | `string \| Component` | `'div'` | Polymorphic root element |
| `variant` | `'default' \| 'elevated' \| 'glass' \| 'outline' \| 'gradient' \| 'interactive'` | `'default'` | Visual style |
| `hoverable` | `boolean` | `false` | Lift on hover |
| `padding` | `'none' \| 'sm' \| 'md' \| 'lg'` | `'md'` | Inner padding |

**Sub-components:** `Card.Header` (title, subtitle, icon, action), `Card.Body`, `Card.Footer`, `Card.Stat` (label, value, icon, trend, color).

### IconButton

Circular icon-only button with optional badge.

```jsx
<IconButton icon={Settings} label="Settings" onClick={handleClick} />
<IconButton icon={Bell} badge={3} variant="filled" />
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `icon` | `ReactNode \| Component` | — | Icon to display |
| `label` | `string` | — | Accessible label (aria-label + title) |
| `variant` | `'ghost' \| 'filled' \| 'primary' \| 'glass'` | `'ghost'` | Visual style |
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'` | Size preset |
| `badge` | `number \| string` | — | Badge count overlay |
| `active` | `boolean` | `false` | Active/selected state |

### Badge

Status and label badges.

```jsx
<Badge variant="success">Connected</Badge>
<Badge variant="warning" dot pulse>Pending</Badge>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'default' \| 'primary' \| 'success' \| 'warning' \| 'error' \| 'info'` | `'default'` | Color variant |
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg'` | `'sm'` | Size preset |
| `dot` | `boolean` | `false` | Show status dot |
| `pulse` | `boolean` | `false` | Animate dot |
| `pill` | `boolean` | `true` | Pill shape |
| `icon` | `ReactNode \| Component` | — | Leading icon |

### Chip

Selectable tag/filter chips.

```jsx
<Chip selected onSelect={toggle} icon={<BookOpen />}>Science</Chip>
<Chip onRemove={handleRemove}>Tag</Chip>
```

### Input

Accessible form input with icon and label support.

```jsx
<Input label="Email" type="email" placeholder="you@example.com" />
<Input as="textarea" label="Notes" rows={4} />
<Input icon={Search} placeholder="Search..." />
```

### Toggle

Accessible toggle switch.

```jsx
<Toggle label="Dark Mode" description="Enable dark theme" value={enabled} onChange={setEnabled} />
```

### Modal

Dialog with backdrop, focus trap, and escape-to-close.

```jsx
<Modal open={isOpen} onClose={close} title="Confirm" size="sm">
  <p>Are you sure?</p>
  <Modal.Actions>
    <Button variant="ghost" onClick={close}>Cancel</Button>
    <Button variant="danger" onClick={confirm}>Delete</Button>
  </Modal.Actions>
</Modal>
```

### Progress

Linear progress bar with label.

```jsx
<Progress value={75} max={100} label="75% Complete" variant="primary" />
```

### ProgressRing / ScoreRing

SVG circular progress indicators.

```jsx
<ProgressRing value={75} max={100} size={64} strokeWidth={4} />
<ScoreRing score={85} size={80} />  {/* Shows letter grade */}
```

### EmptyState

Placeholder for empty screens.

```jsx
<EmptyState
  icon={Inbox}
  title="No messages"
  description="You're all caught up!"
  action={<Button>Create Message</Button>}
  size="md"
/>
```

### Toast

Toast notification system with provider and hook.

```jsx
// Wrap app with ToastProvider
<ToastProvider>
  <App />
</ToastProvider>

// Use in any component
const { addToast } = useToast();
addToast({ type: 'success', message: 'Saved!' });
addToast({ type: 'error', message: 'Failed', duration: 5000 });
```

### ModelSelector

AI model picker with two display modes.

```jsx
// Compact — inline dropdown (for headers, hero sections)
<ModelSelector
  variant="compact"
  models={['gemma4:e4b', 'gemma3:4b']}
  activeModel="gemma4:e4b"
  preferredModel="gemma4:e4b"
  connected={true}
  onSelect={(id) => switchModel(id)}
/>

// Full — card list (for settings pages)
<ModelSelector
  variant="full"
  models={connectionStatus.models}
  activeModel={connectionStatus.model}
  preferredModel={settings.preferredModel}
  connected={connectionStatus.connected}
  onSelect={(id) => switchModel(id)}
/>
```

### Other Components

**ChatThread** — Renders a conversation thread with message bubbles, timestamps, and typing indicators. **LanguageSelector** — Dropdown picker for 15+ languages. **Dropdown** — Generic dropdown with keyboard navigation, search, and multi-select. **Skeleton** — Loading placeholder with shimmer animation. **Tooltip** — Lightweight hover tooltip.


---


## Custom Hooks

Import from `'../lib/hooks'`.

### Performance & Timing

| Hook | Signature | Returns |
|------|-----------|---------|
| `useDebounce` | `(value, delay = 300)` | Debounced value |
| `useDebouncedCallback` | `(callback, delay = 300)` | Debounced function |
| `useThrottle` | `(value, interval = 200)` | Throttled value |
| `useThrottledCallback` | `(callback, interval = 200)` | Throttled function |
| `useCountdown` | `(targetDate)` | `{ days, hours, minutes, seconds, expired }` |

### Responsive & Layout

| Hook | Signature | Returns |
|------|-----------|---------|
| `useMediaQuery` | `(query: string)` | `boolean` |
| `useBreakpoint` | `()` | `{ isMobile, isTablet, isDesktop, isLarge, breakpoint }` |

### DOM & Events

| Hook | Signature | Returns |
|------|-----------|---------|
| `useClickOutside` | `(ref, handler)` | `void` |
| `useKeyboard` | `(keyMap, options?)` | `void` |
| `useIntersectionObserver` | `(options?)` | `[ref, entry]` |
| `useEventListener` | `(eventName, handler, element?)` | `void` |
| `useScrollPosition` | `()` | `{ x, y }` |

### State Management

| Hook | Signature | Returns |
|------|-----------|---------|
| `useLocalStorage` | `(key, initialValue)` | `[value, setValue, removeValue]` |
| `useToggle` | `(initial = false)` | `[value, toggle, setTrue, setFalse]` |
| `usePrevious` | `(value)` | Previous value |
| `useMounted` | `()` | `ref` with `.current` boolean |
| `useAsync` | `(asyncFn, immediate?)` | `{ execute, value, error, loading, reset }` |

### Gesture & Interaction

| Hook | Signature | Returns |
|------|-----------|---------|
| `useLongPress` | `(callback, options?)` | `{ onMouseDown, onMouseUp, onMouseLeave, onTouchStart, onTouchEnd }` |
| `useSwipe` | `(ref, handlers)` | `void` (calls `onSwipeLeft`, `onSwipeRight`, `onSwipeUp`, `onSwipeDown`) |

### Usage Examples

```jsx
// Debounce a search input
const [query, setQuery] = useState('');
const debouncedQuery = useDebounce(query, 300);

// Toggle with named on/off
const [isOpen, toggleOpen, openMenu, closeMenu] = useToggle(false);

// Responsive layout
const { isMobile, isTablet } = useBreakpoint();

// Click outside to close
const menuRef = useRef();
useClickOutside(menuRef, closeMenu);

// Keyboard shortcuts
useKeyboard({
  'Escape': closeModal,
  'ctrl+s': saveDocument,
  'ctrl+shift+p': openCommandPalette,
});
```


---


## Design Tokens & Theming

Import from `'../lib/tokens'`.

### Color System

**Color Primitives** — 12 full palettes (50–950 shades): `slate`, `indigo`, `emerald`, `amber`, `red`, `blue`, `purple`, `cyan`, `pink`, `orange`, `green`, `lime`.

**Semantic Colors** — `primary`, `secondary`, `success`, `warning`, `error`, `info` (each with base, light, dark variants).

**10 Accent Profiles** — `indigo`, `blue`, `purple`, `pink`, `orange`, `green`, `red`, `cyan`, `lime`, `amber`. Each provides `main`, `light`, `dark`, `glow` values.

**5 Theme Presets** — `dark`, `midnight`, `amoled`, `light`, `sepia`. Each defines `bg-primary`, `bg-secondary`, `bg-tertiary`, `text-primary`, `text-secondary`, `text-tertiary`, `border` tokens.

### Spacing Scale

Base unit: 4px. Tokens: `0`, `px` (1px), `0.5` (2px), `1` (4px), `2` (8px), `3` (12px), `4` (16px), `5` (20px), `6` (24px), `8` (32px), `10` (40px), `12` (48px), `16` (64px), `20` (80px), `24` (96px), `32` (128px).

### Typography

Families: `sans` (Inter), `mono` (JetBrains Mono). Sizes: `xs` (12px) to `5xl` (48px). Weights: `light` (300) to `extrabold` (800). Line heights: `none` (1) to `loose` (2).

### Shadows

`none`, `xs`, `sm`, `md`, `lg`, `xl`, `2xl`, `inner`, `glow(color)`, `glass`.

### Creating & Applying Themes

```js
import { createTheme, applyThemeToDOM } from '../lib/tokens';

// Create a custom theme
const theme = createTheme('midnight', 'purple', {
  '--custom-var': '#ff0000',
});

// Apply to DOM (sets CSS custom properties on :root)
applyThemeToDOM(theme);
```

### `sx` Style Helpers

```js
import { sx } from '../lib/tokens';

// Pre-built style objects
sx.flexCenter    // { display: 'flex', alignItems: 'center', justifyContent: 'center' }
sx.flexBetween   // { display: 'flex', alignItems: 'center', justifyContent: 'space-between' }
sx.glass         // backdrop-filter blur effect
sx.truncate      // single-line text truncation
sx.absoluteFill  // position: absolute, inset: 0
sx.transition()  // transition helper
sx.gradient()    // linear gradient helper
```


---


## Animation System

Import from `'../lib/animations'`.

### Available Animations

`fadeIn`, `slideUp`, `slideInLeft`, `slideInRight`, `bounceIn`, `popIn`, `scaleIn`, `pulse`, `spin`, `shimmer`, `breathe`, `dotBounce`, `confettiFall`, `headShake`, `ripplePulse`, `float`, `glow`, `morphBlob`, `orbitSpin`, `gradientShift`, `scanLine`.

### Usage

```jsx
import { animate, stagger, preloadAnimations } from '../lib/animations';

// Call once on app mount
preloadAnimations();

// Apply to elements
<div style={animate('fadeIn', '0.3s', 'ease-out')}>Fading in</div>
<div style={animate('slideUp', '0.4s', 'spring')}>Sliding up</div>

// Stagger children
{items.map((item, i) => (
  <div key={item.id} style={{ ...animate('popIn'), ...stagger(i) }}>
    {item.name}
  </div>
))}
```

### Animation Factories

```jsx
import {
  createPulseAnimation,
  createSpinAnimation,
  createFloatAnimation,
  createShimmerAnimation,
} from '../lib/animations';

<div style={createPulseAnimation(2)}>Pulsing</div>
<div style={createSpinAnimation(1, 'reverse')}>Spinning</div>
<div style={createFloatAnimation(4, 10)}>Floating</div>
<div style={createShimmerAnimation(2)}>Loading...</div>
```


---


## Utility Functions

Import from `'../lib/utils'`.

| Function | Signature | Description |
|----------|-----------|-------------|
| `cn` | `(...classNames)` | Merge class names (like `clsx`) |
| `mergeStyles` | `(...styles)` | Deep merge style objects |
| `clamp` | `(value, min, max)` | Clamp a number to range |
| `formatNumber` | `(num, decimals?)` | Format to 1.2K, 3.5M, etc. |
| `pluralize` | `(count, singular, plural?)` | `"5 items"`, `"1 item"` |
| `truncateText` | `(text, maxLength, suffix?)` | Truncate with `...` |
| `generateId` | `(prefix?)` | Unique ID string |
| `copyToClipboard` | `(text)` | Async copy with fallback |
| `shareContent` | `(data)` | Web Share API with fallback |
| `isReducedMotion` | `()` | Check `prefers-reduced-motion` |
| `supportsHover` | `()` | Check hover capability |
| `isTouchDevice` | `()` | Detect touch device |
| `sleep` | `(ms)` | Promise-based delay |
| `noop` | `()` | No-operation function |
| `createEventEmitter` | `()` | Pub/sub emitter with `on`, `off`, `emit` |
| `debounce` | `(func, wait)` | Debounce a function |
| `throttle` | `(func, limit)` | Throttle a function |


---


## Higher-Order Components

Import from `'../lib/hoc'`.

| HOC | Usage | Description |
|-----|-------|-------------|
| `withErrorBoundary` | `withErrorBoundary(MyComponent, FallbackUI)` | Wraps in error boundary with fallback |
| `withAccessibility` | `withAccessibility(MyComponent, options)` | Adds ARIA attributes, keyboard handlers, focus management |
| `withAnalytics` | `withAnalytics(MyComponent, 'event_name')` | Tracks render/click events via event emitter |
| `withLazyLoad` | `withLazyLoad(() => import('./Heavy'), Spinner)` | Dynamic import with Suspense |
| `withTheme` | `withTheme(MyComponent, defaultTheme)` | Injects theme context + `toggleTheme` prop |
| `withData` | `withData(MyComponent, fetchFn)` | Data fetching with loading/error states |

```jsx
// Example: Lazy load a heavy component with error boundary
const LazyChart = withErrorBoundary(
  withLazyLoad(() => import('./Chart'), <Skeleton />),
  <ErrorState message="Failed to load chart" />
);
```


---


## Providers

### ThemeProvider

```jsx
import { ThemeProvider, useTheme } from '../lib/providers';

// Wrap app
<ThemeProvider defaultTheme="dark" defaultAccent="indigo">
  <App />
</ThemeProvider>

// Use in components
const { theme, accent, setTheme, setAccent, toggleTheme } = useTheme();
```

### AccessibilityProvider

```jsx
import { AccessibilityProvider, useA11y } from '../lib/providers';

<AccessibilityProvider>
  <App />
</AccessibilityProvider>

const { announce, prefersReducedMotion } = useA11y();
announce('Page loaded');
```


---


## AI Model System

### Model Registry (`src/config/models.js`)

The single source of truth for all supported AI models. To add a new model, add an entry to `MODEL_REGISTRY` — the UI, auto-selection, and service pick it up automatically.

```js
// MODEL_REGISTRY entry structure
{
  id: 'gemma4:e4b',           // Ollama model tag
  name: 'Gemma 4 E4B',        // Display name
  family: 'gemma4',           // For grouping/styling
  params: '4B',               // Parameter count
  description: 'Best balance of speed and quality.',
  tags: ['balanced', 'on-device', 'multimodal', 'recommended'],
  context: 128_000,           // Max context window
  multimodal: true,           // Supports image input
  thinking: true,             // Supports thinking/reasoning mode
  tier: 'low',                // Device tier: 'low' | 'medium' | 'high'
  priority: 1,                // Auto-selection priority (lower = preferred)
}
```

**Currently registered models:**

| Model | Params | Multimodal | Thinking | Context | Tier |
|-------|--------|-----------|----------|---------|------|
| `gemma4:e2b` | 2B | Yes | Yes | 128K | Low |
| `gemma4:e4b` | 4B | Yes | Yes | 128K | Low (Recommended) |
| `gemma4:27b` | 27B MoE | Yes | Yes | 256K | Medium |
| `gemma4:12b` | 12B | Yes | Yes | 256K | Medium |
| `gemma3:4b` | 4B | Yes | No | 32K | Low (Legacy) |
| `gemma3:12b` | 12B | Yes | No | 32K | Medium (Legacy) |

**Supported model families:** `gemma4`, `gemma3`, `llama`, `mistral`, `phi`, `qwen`, `custom`.

### Adding a New Model

```js
// In src/config/models.js, add to MODEL_REGISTRY:
{
  id: 'llama4:8b',
  name: 'Llama 4 8B',
  family: 'llama',
  params: '8B',
  description: 'Fast and capable general-purpose model.',
  tags: ['fast', 'general'],
  context: 128_000,
  multimodal: false,
  thinking: false,
  tier: 'low',
  priority: 5,
}

// If it's a new family, also add to MODEL_FAMILIES:
// llama: { label: 'Llama', color: '#f59e0b', badge: null },
```

That's it. The ModelSelector UI, auto-selection logic, and Ollama service will all recognize it automatically. Custom models pulled by users that aren't in the registry also appear under "Other" with a generic config.

### Exported Functions

| Function | Signature | Description |
|----------|-----------|-------------|
| `getModelById` | `(id: string)` | Get model config (with fallback for unknown models) |
| `detectFamily` | `(modelId: string)` | Infer family from model ID string |
| `formatModelName` | `(modelId: string)` | Human-friendly display name |
| `selectBestModel` | `(available[], preferredId?)` | Pick best model with priority logic |
| `buildModelList` | `(available[])` | `{ available[], unavailable[] }` for UI |

### Model Switching Flow

```
User selects model in UI (HomePage or Settings)
    ↓
ModelSelector calls onSelect(modelId)
    ↓
connectionStore.switchModel(modelId)
    ↓
├── ollamaService.setModel(modelId)    ← updates active model in service
├── settingsStore.setSetting(...)      ← persists preference to localStorage
└── connectionStore status updated     ← re-renders all subscribers
```


---


## Build & Publish

### App Build

```bash
npm run build           # Production build → dist/
npm run preview         # Preview production build
```

Output: Vite-optimized chunks with code splitting, PWA service worker (Workbox), tree-shaking.

### Library Build

```bash
npm run build:lib       # Library build → dist-lib/
```

Uses `vite.lib.config.js` with 8 entry points:

| Entry | Path |
|-------|------|
| `index` | `src/lib/index.js` |
| `components` | `src/lib/components/index.js` |
| `hooks` | `src/lib/hooks/index.js` |
| `tokens` | `src/lib/tokens/index.js` |
| `animations` | `src/lib/animations/index.js` |
| `utils` | `src/lib/utils/index.js` |
| `hoc` | `src/lib/hoc/index.jsx` |
| `providers` | `src/lib/providers/index.js` |

**External dependencies** (not bundled): `react`, `react-dom`, `react-markdown`, `lucide-react`.

### Publishing to npm

The `package.json` is configured for publishing as `@lenslearn/ui`:

```json
{
  "name": "@lenslearn/ui",
  "exports": {
    ".": "./dist-lib/index.js",
    "./components": "./dist-lib/components.js",
    "./hooks": "./dist-lib/hooks.js",
    "./tokens": "./dist-lib/tokens.js",
    "./animations": "./dist-lib/animations.js",
    "./utils": "./dist-lib/utils.js",
    "./hoc": "./dist-lib/hoc.js",
    "./providers": "./dist-lib/providers.js"
  },
  "peerDependencies": {
    "react": ">=18",
    "react-dom": ">=18"
  }
}
```

```bash
npm run build:lib
npm publish --access public
```


---


## Architecture Patterns

### Compound Components

Card, Modal, and ChatThread use the compound component pattern with dot-notation sub-components attached to the parent.

```jsx
Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;
Card.Stat = CardStat;
```

### Polymorphic Components

Button and Card accept an `as` prop for rendering as different elements (e.g., `<Button as="a" href="/about">`).

### forwardRef + memo

All library components use `forwardRef` for ref forwarding and `memo` for render optimization.

### CSS-in-JS with Design Tokens

The entire app uses inline styles powered by the design token system. No CSS files, no CSS-in-JS libraries. Styles are plain JavaScript objects that reference CSS custom properties set by the theme system.

### Zustand for State

Global state is managed with Zustand stores (not React Context) for better performance and simpler APIs. Stores are composed via barrel exports and can be used outside React components.

### Service Layer

Business logic lives in singleton services (`ollamaService`, `cacheService`, etc.) that are consumed by Zustand stores and React components. This keeps the AI integration, caching, and data persistence cleanly separated from the UI.


---


## Adding New Features

### Adding a New Component to the Library

1. Create `src/lib/components/MyComponent.jsx` with `forwardRef` + `memo`
2. Export from `src/lib/components/index.js`
3. If it accepts an `icon` prop, add the `renderIcon()` helper
4. Add entry to `vite.lib.config.js` if it needs a separate chunk

### Adding a New Hook

1. Add the hook function to `src/lib/hooks/index.js`
2. Follow naming convention: `use[Name]`
3. Return stable references (use `useCallback`, `useMemo`)

### Adding a New AI Model

1. Add entry to `MODEL_REGISTRY` in `src/config/models.js`
2. If new family, add to `MODEL_FAMILIES`
3. That's it — UI, selection, and service handle it automatically

### Adding a New Page

1. Create `src/pages/MyPage.jsx`
2. Add route in `src/App.jsx`
3. Add nav entry in `src/components/BottomNav.jsx` if needed

### Adding a New Store

1. Create `src/store/myStore.js` with `create()` from Zustand
2. Add `persist()` middleware if it needs localStorage
3. Export from `src/store/index.js`


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

---

*Component library: 28 files, ~5,300 lines. 19 components, 19 hooks, 6 HOCs, 16 utilities, 20+ animations.*
