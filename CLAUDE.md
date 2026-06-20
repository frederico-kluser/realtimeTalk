# CLAUDE.md — Project Guide for AI Assistants

## Build & Run

```bash
npm install --legacy-peer-deps   # Install dependencies (required due to peer dep conflicts)
npm run dev                      # Dev server with HMR (localhost:5173)
npm run build                    # Production build (tsc -b && vite build)
npm run preview                  # Preview production build
npx tsc --noEmit                 # Type-check without building
```

## Architecture

### Atomic Design Component Hierarchy

Components live in `src/components/` and follow Atomic Design:

- **atoms/** — Smallest reusable UI primitives (Button, Input, Select, Badge, StatusDot, IconButton, Label, etc.). No business logic, no hooks except basic refs.
- **molecules/** — Combinations of atoms (TagInput, AudioVisualizer, CostTokenDisplay, LevelBadge, StreakCounter, PointsDisplay, ContextModal). May have local state for UI behavior only.
- **organisms/** — Complex sections composed of molecules/atoms (SessionControls, TranscriptPanel, AppHeader, PersonalityForm, TeacherHeader, ChallengePanel, QuickActionsBar, WelcomeScreen, TutorialOverlay, TeacherSettingsDrawer). May receive callbacks but don't own business state.
- **templates/** — Layout wrappers (PageLayout, ContentLayout). Define page structure, no logic.
- **pages/** — Full page components with Controller/View separation.

### Controller/View Pattern

Every page in `src/components/pages/` has 3 files:

```
PageName/
├── index.tsx                    # Glue: const ctrl = useController(); return <View {...ctrl} />
├── use[PageName]Controller.ts   # All useState, useEffect, useCallback, business logic
└── [PageName]View.tsx           # Pure render component — receives all data as props, NO useState
```

The View file's props type is always `ReturnType<typeof useController>`.

### Key Rules

1. **No state in view files** — All `useState`, `useEffect`, `useCallback` live in controller hooks. View files are pure render.
2. **Max 400 lines per file** — If a file exceeds 400 lines, split it.
3. **DRY** — Reuse atoms/molecules across pages. Don't duplicate UI patterns.
4. **Barrel exports** — Each atomic level has an `index.ts` barrel export.

### Path Aliases

`@/` maps to `src/` (configured in vite.config.ts and tsconfig.app.json).

```typescript
import { Button } from '@/components/atoms';
import { useRealtimeSession } from '@/hooks/useRealtimeSession';
```

## Key Directories

| Directory | Purpose |
|---|---|
| `src/components/` | Atomic Design UI components |
| `src/hooks/` | Shared React hooks (session, audio, actions, memory, personality, context) |
| `src/core/` | Infrastructure: types, WebRTC, events, context window |
| `src/actions/` | Action registry + 50+ built-in action handlers (Zod-validated) |
| `src/actions/data/` | Quiz data: vocabulary bank (600+ words, 6 topics) + grammar quiz questions |
| `src/personality/` | Personality system (types, compiler, presets, roleplay scenarios) |
| `src/storage/` | Local persistence (IndexedDB via idb with 7 stores, encrypted key manager, export/import) |
| `src/utils/` | Utilities (cost estimator, SRS/SM-2, text similarity, exercise detector) |
| `src/i18n/` | Internationalization (English + Portuguese) |

## Important Files

- `src/hooks/useRealtimeSession.ts` — Core WebRTC engine. Manages RTCPeerConnection, data channel, reconnection.
- `src/components/pages/TeacherPage/useTeacherController.ts` — Main page orchestrator. Sofia language tutor with exercise-aware VAD, quiz detection, gamification.
- `src/components/pages/ConversationPage/useConversationController.ts` — General conversation orchestrator. Coordinates all hooks with personality voice sync.
- `src/core/types/realtime.ts` — OpenAI Realtime API type definitions.
- `src/actions/registry.ts` — Zod-based action registry with automatic JSON Schema conversion.
- `src/actions/appActions.ts` — 50+ action implementations (quizzes, roleplay, flashcards, grammar, gamification).
- `src/personality/presets.ts` — 3 personality presets (Default Assistant, Tech Support, Language Tutor/Sofia).
- `src/personality/compiler.ts` — Converts PersonalityConfig to optimized system prompt.
- `src/personality/scenarios.ts` — 8 roleplay scenarios with vocabulary and key phrases.
- `src/storage/keyManager.ts` — AES-256-GCM encryption for API keys.
- `src/storage/idb.ts` — IndexedDB schema with 7 stores (sessions, memories, student_profile, vocabulary, corrections, flashcards, gamification).
- `src/utils/exerciseDetector.ts` — Detects active exercises from transcript for VAD adjustment.
- `src/utils/srs.ts` — SM-2 spaced repetition algorithm for flashcard scheduling.
- `src/utils/costEstimator.ts` — Token-to-cost calculation for all realtime models.

## Pages

| Page | Route | Purpose |
|---|---|---|
| `TeacherPage` | `/` | Sofia English Tutor — main interface with welcome screen, activities, quizzes, gamification |
| `SettingsPage` | `/settings` | API key management and app settings |
| `HistoryPage` | `/history` | Session history, tutor reports, export/import |
| `FaqPage` | `/faq` | Frequently asked questions |
| `ConversationPage` | (not routed) | General-purpose conversation interface (available for custom routing) |

## Key Patterns

### Voice Per Personality
Each `PersonalityConfig` has `voice.model_voice`. When `applyPersonality()` is called, both the system prompt and voice are updated via `session.update`. In ConversationPage, switching personality auto-syncs the voice state.

### Exercise-Aware VAD
The TeacherPage uses `detectExerciseActive()` (from `src/utils/exerciseDetector.ts`) to detect when a quiz, pronunciation drill, or dictation is active based on recent transcript messages. During exercises:
- VAD eagerness is forced to `'low'`
- `interrupt_response` is set to `false` to prevent false-positive interruptions
- A visual indicator shows "Exercise mode" in the settings drawer

### Action Flow
```
AI response.done → extract function_call items → registry.execute() → send function_call_output → response.create
```

Actions are either `conversational` (result shown to user) or `background` (logged silently).

## Tech Stack

- React 19 + TypeScript (strict) + Vite 8
- Tailwind CSS 4 (utility-first, dark mode)
- React Router DOM 7
- Zod 4 (action parameter validation)
- Motion 12 (animations, formerly Framer Motion)
- idb (typed IndexedDB wrapper)
- PWA via vite-plugin-pwa

## No Test Framework

There are currently no tests. No test runner is installed.
