# RealtimeTalk — Real-Time Voice Conversation with AI

<p align="center">
  <strong>A 100% client-side web application for real-time voice conversations with OpenAI AI models, connecting via WebRTC directly from the browser — no backend, no remote database, no server-side authentication.</strong>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#language-tutor">Language Tutor</a> •
  <a href="#quick-start">Quick Start</a> •
  <a href="#architecture">Architecture</a> •
  <a href="#internationalization">i18n</a> •
  <a href="#custom-actions">Custom Actions</a> •
  <a href="#contributing">Contributing</a> •
  <a href="#faq">FAQ</a>
</p>

---

## What It Does

**RealtimeTalk** is a web application that lets you have real-time voice conversations with OpenAI's AI models. Your microphone audio is transmitted directly to OpenAI via WebRTC, and the model's voice response is played back in the browser — all without intermediaries.

The app ships with a fully featured **Language Tutor (Sofia)** — an AI English teacher that adapts to your level, runs quizzes, roleplays, dictation, pronunciation drills, and tracks your progress with gamification.

## Features

### Core
- **Bidirectional real-time voice conversation** — speak and hear the AI respond instantly via peer-to-peer WebRTC
- **BYOK (Bring Your Own Key)** — insert your own OpenAI API key; the app generates an ephemeral token and establishes the WebRTC connection
- **Model selection** — support for `gpt-realtime`, `gpt-realtime-mini`, and `gpt-realtime-1.5`
- **10 available voices** — alloy, ash, ballad, coral, echo, sage, shimmer, verse, marin, and cedar
- **Voice per personality** — each personality defines its own voice; switching personalities automatically changes the AI voice
- **Configurable semantic VAD** — semantic end-of-speech detection with adjustable aggressiveness (low, medium, high, auto)
- **Exercise-aware VAD** — during quizzes, dictation, and pronunciation exercises, VAD automatically switches to careful mode (low eagerness, no interruption) to prevent silence from cutting off the AI mid-question
- **Real-time transcription** — bidirectional transcription (user and model) displayed during conversation

### Personality System
- **Complete personality system** — create, edit, and apply personalities with identity, rules, tone of voice, forbidden topics, and anti-jailbreak deflections
- **3 personality presets** — Default Assistant, Tech Support, Language Tutor (Sofia)
- **Personality compiler** — converts `PersonalityConfig` to an optimized system prompt with guardrails
- **Voice binding** — each personality has its own `model_voice` that is applied on `session.update`
- **Mid-session personality switch** — change personality during an active session via `session.update`

### Language Tutor (Sofia)
- **CEFR Placement Test** — automated assessment (A1–C2) with vocabulary, grammar, comprehension, and fluency scoring
- **Vocabulary Quizzes** — topic-based quizzes with spaced repetition of previously missed words
- **Multiple-Choice Quizzes** — grammar, idioms, prepositions, and tenses with explanations
- **Pronunciation Exercises** — phrase repetition with text similarity scoring and difficulty levels
- **Dictation Mode** — listen-and-type exercises with detailed accuracy feedback
- **Roleplay Scenarios** — 8 real-world scenarios (restaurant, airport, hotel, job interview, doctor, shopping, phone call, meeting)
- **Flashcard System** — SM-2 spaced repetition algorithm for vocabulary review
- **Immersion Mode** — AI speaks only in the target language
- **Grammar Correction** — immediate or deferred correction modes with detailed logging
- **Debate & Discussion** — structured debates on curated topics
- **Daily Expression** — one idiom/expression per day with usage tracking
- **Gamification** — points, streaks, achievements, and level badges
- **Student Profile** — persistent CEFR level, progress metrics, and session history
- **Interactive Challenges** — on-screen answer buttons during quizzes (tap or voice)
- **Guided Tutorial** — step-by-step onboarding for new users

### Actions & Function Calling
- **Typed Action Registry with Zod** — TypeScript action registry with parameter validation, automatic Zod → JSON Schema conversion for OpenAI tools
- **30+ built-in actions** — placement tests, quizzes, roleplay, pronunciation, dictation, flashcards, grammar correction, gamification, student profile, immersion mode, and more
- **Complete function calling** — model calls tool → handler executes → result returns → model continues speaking
- **Background actions** — actions that execute without injecting results into the conversation (e.g., analytics, gamification tracking)

### Memory & Context
- **Persistent conversational memory** — automatic fact extraction via GPT-4o-mini at session end, injection of last 20 facts in the next session
- **Dynamic context injection** — system and user context injection mid-session via `conversation.item.create`
- **Template engine** — `{{variable}}` resolution in prompts
- **File context** — attach reference files to personalities for additional AI context
- **Session resumption** — continue previous conversations with full transcript context

### Data & Security
- **Session history** — list of past sessions with transcription, duration, metadata, and tutor reports
- **Export/Import** — complete data export (sessions, memories, personalities, student data) as JSON; import to restore
- **API key encryption** — AES-256-GCM with PBKDF2 (100K iterations), random salt and IV, optional localStorage storage
- **Cost estimation** — per-session cost calculation based on text and audio tokens

### UI & Experience
- **Teacher-first interface** — dedicated Sofia teacher page with welcome screen, activity picker, and gamification display
- **Internationalization (i18n)** — English and Brazilian Portuguese, with automatic system language detection and manual language selector
- **Fluid animations** — Motion (formerly Framer Motion) animations throughout the interface for a polished experience
- **Audio visualizer** — canvas with real-time frequency analysis (bars or waveform) via Web Audio API
- **State indicator** — animated visual for all states (idle, connecting, connected, listening, thinking, speaking, disconnected, error)
- **FAQ page** — built-in frequently asked questions
- **PWA** — Progressive Web App with service worker, manifest, and offline support
- **Dark mode** — via Tailwind CSS
- **Automatic reconnection** — up to 3 attempts with exponential backoff
- **Static deploy** — GitHub Pages via GitHub Actions

---

## Language Tutor

The main interface is the **Teacher Page** featuring Sofia, an AI English tutor. Here's how to use it:

1. **Set up your API key** via the settings drawer (gear icon)
2. **Choose an activity** from the welcome screen: Free Talk, Vocabulary Quiz, Roleplay, Pronunciation, Dictation, Flashcards, or Debate
3. **Talk naturally** — Sofia adapts to your level and guides the conversation
4. **Interactive quizzes** — during exercises, answer buttons appear on screen; answer by tap or voice
5. **Track progress** — your level (A1–C2), points, and streak are displayed in the header and persist between sessions

Sofia automatically:
- Runs a placement test on first use to determine your CEFR level
- Presents a daily expression at the start of each session
- Suggests vocabulary quizzes after 10+ minutes of conversation
- Logs grammar corrections and tracks fluency metrics silently
- Awards points and maintains your daily streak

---

## What It Does NOT Do

- **No backend** — everything runs in the browser; no server, intermediary API, or proxy
- **No user authentication** — no login, signup, user sessions, or access control
- **No remote database** — all persistence is local (IndexedDB + localStorage)
- **No automated tests** — no unit tests, integration tests, or E2E tests
- **No SSR/SSG** — pure SPA without server-side rendering
- **No rate limiting or spending control** — cost is estimated but no configurable limits
- **No simultaneous conversations** — one active WebRTC session at a time
- **No session sharing** — sessions are local and cannot be shared
- **No audio recording** — audio is transmitted in real time but not saved; only transcription is persisted

---

## Quick Start

### Prerequisites

- **Node.js 20+**
- **OpenAI API key** with Realtime API access
- **Browser** with WebRTC and getUserMedia support (Chrome, Edge, Firefox, Safari 15+)
- **HTTPS** in production (required for `getUserMedia` and Web Crypto API)

### Installation

```bash
# Clone the repository
git clone https://github.com/frederico-kluser/realtimeTalk.git
cd realtimeTalk

# Install dependencies
npm install --legacy-peer-deps

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`.

### Usage

1. Open the app in your browser
2. Click the **Settings** icon (gear) in the top-right corner
3. Enter your **OpenAI API key** (starts with `sk-`)
4. Click **Save** to store it in memory
5. (Optional) Enter a passphrase and click **Encrypt & Save** for persistent encrypted storage
6. Choose an activity from the welcome screen or click **Start Conversation**
7. Allow microphone access when prompted
8. Start speaking — Sofia will respond in real time!

### Build for Production

```bash
# Type-check and build
npm run build

# Preview the build locally
npm run preview
```

---

## Technologies

### Core

| Technology | Version | Purpose | Cost |
|---|---|---|---|
| **React** | 19.2.4 | UI framework with hooks | Free |
| **TypeScript** | 5.9.3 | Static typing, strict mode | Free |
| **Vite** | 8.0.0 | Bundler and dev server with HMR | Free |
| **Tailwind CSS** | 4.2.1 | Utility-first styling with dark mode | Free |
| **Motion** | 12.x | Fluid UI animations (formerly Framer Motion) | Free |
| **React Router DOM** | 7.13.1 | Client-side SPA routing | Free |
| **Zod** | 4.3.6 | Runtime schema validation | Free |
| **zod-to-json-schema** | 3.25.1 | Zod → JSON Schema conversion for OpenAI tools | Free |
| **idb** | 8.0.3 | Typed IndexedDB wrapper | Free |
| **vite-plugin-pwa** | 1.2.0 | Service worker and PWA support | Free |

### Browser APIs

| API | Purpose |
|---|---|
| **WebRTC** (`RTCPeerConnection`) | Peer-to-peer connection with OpenAI Realtime API |
| **MediaDevices** (`getUserMedia`) | Microphone audio capture |
| **Web Audio API** (`AnalyserNode`) | Frequency analysis for visualization |
| **Web Crypto API** (`AES-GCM`, `PBKDF2`) | API key encryption |
| **IndexedDB** | Structured persistence (sessions, memories, personalities, student data, flashcards, gamification) |
| **localStorage** | Simple persistence (encrypted API keys, personalities, reminders, pronunciation tracking) |
| **Notification API** | Reminder notifications |

### External APIs

| API | Purpose | Cost |
|---|---|---|
| **OpenAI Realtime API** (WebRTC) | Real-time voice conversation | Paid by user (BYOK) |
| **OpenAI Chat API** (`gpt-4o-mini`) | Fact extraction for memory | Paid by user |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                          BROWSER (React SPA)                        │
│                                                                     │
│  ┌──────────┐  ┌──────────────┐  ┌──────────────┐  ┌────────────┐ │
│  │ API Key  │  │ Personality  │  │   Action     │  │  Context   │ │
│  │ Manager  │  │  Compiler    │  │  Registry    │  │  Injector  │ │
│  └────┬─────┘  └──────┬───────┘  └──────┬───────┘  └─────┬──────┘ │
│       │               │                 │                 │        │
│       ▼               ▼                 ▼                 ▼        │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │           useRealtimeSession() — Core WebRTC Engine         │   │
│  │  RTCPeerConnection (audio) ◄──► RTCDataChannel (events)     │   │
│  └──────────────────────────┬──────────────────────────────────┘   │
│                              │                                      │
│  ┌───────────────────────────┴──────────────────────────────────┐   │
│  │              IndexedDB + localStorage                         │   │
│  │   Sessions │ Memories │ Personalities │ Student Profile       │   │
│  │   Vocabulary │ Corrections │ Flashcards │ Gamification        │   │
│  └──────────────────────────────────────────────────────────────┘   │
└──────────────────────────┬──────────────────────────────────────────┘
                           │
          ┌────────────────┴────────────────┐
          │                                 │
          ▼                                 ▼
┌──────────────────┐            ┌───────────────────────┐
│ OpenAI REST API  │            │  OpenAI Realtime API   │
│ POST /client_    │──token──►  │  WebRTC P2P Connection │
│      secrets     │            │  Audio ◄────► Audio    │
│ POST /chat/      │            │  DataChannel ◄► Events │
│   completions    │            │                        │
└──────────────────┘            └───────────────────────┘
```

### Routes

| Route | Component | Description |
|---|---|---|
| `/` | `TeacherPage` | Sofia language tutor interface (main page) |
| `/settings` | `SettingsPage` | API key management and settings |
| `/history` | `HistoryPage` | Session history and export/import |
| `/faq` | `FaqPage` | Frequently asked questions |

---

## Project Structure

The application follows **Atomic Design** for UI components and **Controller/View pattern** for logic/presentation separation in pages.

```
src/
├── i18n/                          # Internationalization
│   ├── en.ts                     # English translations
│   ├── pt.ts                     # Portuguese translations
│   ├── I18nContext.tsx           # React context + provider + hooks
│   └── index.ts                  # Barrel export
├── components/                    # Atomic Design component hierarchy
│   ├── atoms/                    # Smallest UI primitives (no business logic)
│   ├── molecules/                # Combinations of atoms + gamification displays
│   ├── organisms/                # Complex UI sections (teacher header, challenges, settings)
│   ├── templates/                # Page layout wrappers
│   └── pages/                    # Page components (Controller + View)
│       ├── TeacherPage/          # Main Sofia teacher interface
│       ├── ConversationPage/     # General-purpose conversation interface
│       ├── HistoryPage/
│       ├── SettingsPage/
│       ├── PersonalityEditorPage/
│       └── FaqPage/
├── hooks/                         # Shared React hooks
├── core/                          # Engine and infrastructure
├── actions/                       # Action Registry + handlers + quiz/vocab data
│   └── data/                     # Quiz questions, vocabulary bank, debate topics, expressions
├── personality/                   # Personality system (types, compiler, presets, scenarios)
├── storage/                       # Local persistence (IndexedDB, key manager, export/import)
├── utils/                         # Utilities (cost estimator, text similarity, SRS)
├── App.tsx                        # React Router + I18nProvider
├── main.tsx                       # Entry point
└── index.css                      # Tailwind CSS
```

### Architectural Patterns

#### Controller/View Pattern (Pages)

Each page is split into 3 files:
- **`index.tsx`** — connects controller to view (5-6 lines)
- **`use[Page]Controller.ts`** — all state logic and side effects (hooks, callbacks)
- **`[Page]View.tsx`** — pure render, receives props from controller, no `useState`

#### Key Rules

1. **No state in view files** — All `useState`, `useEffect`, `useCallback` live in controller hooks
2. **Max 400 lines per file** — Split if exceeded
3. **DRY** — Reuse atoms/molecules across pages
4. **Barrel exports** — Each atomic level has an `index.ts` barrel export
5. **Path aliases** — `@/` maps to `src/`

---

## Internationalization

RealtimeTalk supports **English** and **Brazilian Portuguese**.

- **Automatic detection**: The app detects the browser's system language. If it's Portuguese (`pt-*`), the UI loads in Portuguese; otherwise, English is used
- **Manual selection**: A language selector is available in the teacher page header and settings page
- **Persistent preference**: Once you manually select a language, the choice is saved in localStorage

Translation files are located in `src/i18n/`:
- `en.ts` — English translations
- `pt.ts` — Portuguese translations

---

## Custom Actions

RealtimeTalk supports custom TypeScript actions that the AI can trigger during voice conversations. See the full guide:

- **English**: [ACTION_TRIGGERS.md](./docs/ACTION_TRIGGERS.md)
- **Português**: [ACTION_TRIGGERS_PT.md](./docs/ACTION_TRIGGERS_PT.md)

---

## FAQ

### What is RealtimeTalk?
A 100% client-side web app for real-time voice conversations with OpenAI's AI models via WebRTC, featuring a built-in AI language tutor (Sofia).

### Is my API key safe?
Yes. Your API key never leaves your browser. It's stored only in memory during the session, with optional AES-256-GCM encrypted local storage.

### What does BYOK mean?
"Bring Your Own Key" — you use your own OpenAI API key and pay OpenAI directly.

### Which browsers are supported?
Chrome, Edge, Firefox, and Safari 15+ with WebRTC and getUserMedia support.

### Can I use this offline?
The PWA can be installed, but voice conversations require internet for the OpenAI Realtime API.

### Why does the AI sometimes get interrupted during quizzes?
RealtimeTalk uses exercise-aware VAD. During quizzes, dictation, and pronunciation exercises, the system automatically lowers speech detection sensitivity and disables interruption to prevent false triggers from background noise. If you still experience issues, try lowering the VAD eagerness in settings.

---

## Contributing

Contributions are welcome! Here's how to get started:

### Development Setup

```bash
# Clone and install
git clone https://github.com/frederico-kluser/realtimeTalk.git
cd realtimeTalk
npm install --legacy-peer-deps

# Start dev server
npm run dev

# Type-check
npx tsc --noEmit

# Build
npm run build
```

### Guidelines

1. **Follow the existing architecture** — Atomic Design for components, Controller/View for pages
2. **Keep files under 400 lines** — Split large files into smaller modules
3. **Use path aliases** — Import with `@/` instead of relative paths
4. **Use i18n** — All user-facing strings should go through the translation system
5. **Add Motion animations** — New components should use Motion for transitions and interactions
6. **No state in view files** — All business logic goes in controller hooks
7. **TypeScript strict mode** — All code must pass `tsc --noEmit`

### Pull Request Process

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes following the guidelines above
4. Ensure the build passes (`npm run build`)
5. Commit with a descriptive message
6. Push to your fork and open a Pull Request

---

## License

This project is open source. See the repository for license details.
