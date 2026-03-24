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

- **atoms/** — Smallest reusable UI primitives (Button, Input, Select, Badge, StatusDot, IconButton, LanguageSelector, etc.). No business logic, no hooks except basic refs.
- **molecules/** — Combinations of atoms (TagInput, AudioVisualizer, CostTokenDisplay, ContextModal, LevelBadge, PointsDisplay, StreakCounter). May have local state for UI behavior only.
- **organisms/** — Complex sections composed of molecules/atoms (SessionControls, TranscriptPanel, AppHeader, PersonalityForm, TeacherHeader, ChallengePanel, QuickActionsBar, TeacherSettingsDrawer, TutorialOverlay, WelcomeScreen). May receive callbacks but don't own business state.
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
| `src/actions/` | Action registry + built-in action handlers (Zod-validated) |
| `src/actions/data/` | Quiz questions, vocabulary bank, debate topics, daily expressions |
| `src/personality/` | Personality system (types, compiler, presets, roleplay scenarios) |
| `src/storage/` | Local persistence (IndexedDB via idb, encrypted key manager, export/import) |
| `src/utils/` | Utilities (cost estimator, text similarity, SRS algorithm) |
| `src/i18n/` | Internationalization (en, pt) |

## Important Files

- `src/hooks/useRealtimeSession.ts` — Core WebRTC engine. Manages RTCPeerConnection, data channel, reconnection.
- `src/components/pages/TeacherPage/useTeacherController.ts` — Main page orchestrator for Sofia teacher interface. Coordinates all hooks.
- `src/components/pages/ConversationPage/useConversationController.ts` — General conversation page orchestrator.
- `src/core/types/realtime.ts` — OpenAI Realtime API type definitions.
- `src/actions/registry.ts` — Zod-based action registry with automatic JSON Schema conversion.
- `src/actions/appActions.ts` — All built-in action handlers (30+ actions for quizzes, roleplay, grammar, gamification, etc.).
- `src/actions/sessionContext.ts` — Session-scoped state (active exercise, correction mode, roleplay state, VAD control).
- `src/personality/presets.ts` — Three personality presets (Default Assistant, Tech Support, Language Tutor Sofia).
- `src/personality/compiler.ts` — Converts PersonalityConfig to system prompt with guardrails.
- `src/storage/idb.ts` — IndexedDB schema (sessions, memories, personalities, student_profile, vocabulary, corrections, flashcards, gamification).
- `src/storage/keyManager.ts` — AES-256-GCM encryption for API keys.

## Pages & Routes

| Route | Page | Description |
|---|---|---|
| `/` | `TeacherPage` | Sofia language tutor interface (main page) |
| `/settings` | `SettingsPage` | API key management |
| `/history` | `HistoryPage` | Session history, export/import |
| `/faq` | `FaqPage` | Frequently asked questions |

Note: `ConversationPage` and `PersonalityEditorPage` exist in the codebase but are not currently routed.

## Exercise-Aware VAD

During quizzes, dictation, and pronunciation exercises, the system automatically adjusts Voice Activity Detection to prevent false interruptions:

- `sessionContext.startExercise(type)` — Sets VAD to `eagerness: 'low'` and `interrupt_response: false`
- `sessionContext.endExercise()` — Restores original VAD settings
- Actions that start exercises: `placement_test`, `start_vocabulary_quiz`, `start_multiple_choice_quiz`, `pronunciation_exercise`, `start_dictation`
- Actions that end exercises: `save_student_level`, `evaluate_pronunciation`, `check_dictation`, `end_exercise`

## Voice Per Personality

Each `PersonalityConfig` includes `voice.model_voice`. When `usePersonality.applyPersonality()` is called, both `instructions` and `voice` are sent in the `session.update` event. Changing personality in the settings panel automatically syncs the voice dropdown.

## Tech Stack

- React 19 + TypeScript (strict) + Vite 8
- Tailwind CSS 4 (utility-first, dark mode)
- React Router DOM 7
- Zod 4 (action parameter validation)
- Motion 12 (UI animations)
- idb (typed IndexedDB wrapper)
- PWA via vite-plugin-pwa

## No Test Framework

There are currently no tests. No test runner is installed.
