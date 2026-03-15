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

- **atoms/** — Smallest reusable UI primitives (Button, Input, Select, Badge, etc.). No business logic, no hooks except basic refs.
- **molecules/** — Combinations of atoms (TagInput, AudioVisualizer, CostTokenDisplay). May have local state for UI behavior only.
- **organisms/** — Complex sections composed of molecules/atoms (SessionControls, TranscriptPanel, AppHeader, PersonalityForm). May receive callbacks but don't own business state.
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
| `src/personality/` | Personality system (types, compiler, presets) |
| `src/storage/` | Local persistence (IndexedDB via idb, encrypted key manager, export/import) |
| `src/utils/` | Utilities (cost estimator) |

## Important Files

- `src/hooks/useRealtimeSession.ts` — Core WebRTC engine. Manages RTCPeerConnection, data channel, reconnection.
- `src/components/pages/ConversationPage/useConversationController.ts` — Main page orchestrator. Coordinates all hooks.
- `src/core/types/realtime.ts` — OpenAI Realtime API type definitions.
- `src/actions/registry.ts` — Zod-based action registry with automatic JSON Schema conversion.
- `src/storage/keyManager.ts` — AES-256-GCM encryption for API keys.

## Tech Stack

- React 19 + TypeScript (strict) + Vite 8
- Tailwind CSS 4 (utility-first, dark mode)
- React Router DOM 7
- Zod 4 (action parameter validation)
- idb (typed IndexedDB wrapper)
- PWA via vite-plugin-pwa

## No Test Framework

There are currently no tests. No test runner is installed.
