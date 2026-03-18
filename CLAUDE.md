# CLAUDE.md — Project Guide for AI Assistants

## Build & Run

```bash
npm install --legacy-peer-deps   # Install dependencies (required due to peer dep conflicts)
npm run dev                      # Dev server with HMR (localhost:5173)
npm run build                    # Production build (tsc -b && vite build)
npm run preview                  # Preview production build
npx tsc --noEmit                 # Type-check without building
```

## What This Project Is

**Financial Sheets** is a voice-powered financial spreadsheet management tool. Users interact with a full-featured spreadsheet (powered by Univer Sheets) through real-time voice commands via OpenAI's Realtime API over WebRTC. The AI assistant can create tables, set formulas, format cells, import XLSX files, and perform financial analysis — all through natural voice conversation.

## Architecture

### Atomic Design Component Hierarchy

Components live in `src/components/` and follow Atomic Design:

- **atoms/** — Smallest reusable UI primitives (Button, Input, Select, IconButton, StatusDot, LanguageSelector, icons). No business logic.
- **molecules/** — Combinations of atoms (AudioVisualizer, VoiceControlBar). May have local state for UI behavior only.
- **organisms/** — Complex UI sections (SpreadsheetEditor, AppToolbar, TranscriptPanel). May receive callbacks but don't own business state.
- **templates/** — Layout wrappers (PageLayout). Define page structure, no logic.
- **pages/** — Full page components with Controller/View separation.

### Controller/View Pattern

The single page in `src/components/pages/SpreadsheetPage/` has 3 files:

```
SpreadsheetPage/
├── index.tsx                         # Glue: const ctrl = useController(); return <View {...ctrl} />
├── useSpreadsheetController.ts       # All useState, useEffect, useCallback, business logic
└── SpreadsheetPageView.tsx           # Pure render component — receives all data as props, NO useState
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
| `src/hooks/` | Shared React hooks (session, audio, actions, spreadsheet) |
| `src/core/` | Infrastructure: types, WebRTC, events |
| `src/actions/` | Action registry + spreadsheet action handlers (Zod-validated) |
| `src/storage/` | API key encryption (keyManager) |

## Important Files

- `src/hooks/useRealtimeSession.ts` — Core WebRTC engine. Manages RTCPeerConnection, data channel, reconnection.
- `src/hooks/useSpreadsheet.ts` — Univer Sheets integration. Wraps the Univer API with methods for cell manipulation, formatting, formulas.
- `src/hooks/useActionRegistry.ts` — Handles function call execution from AI responses.
- `src/actions/spreadsheetActions.ts` — All voice-triggered spreadsheet actions (set_cell_value, set_range_values, set_cell_formula, format_cells, etc.).
- `src/components/pages/SpreadsheetPage/useSpreadsheetController.ts` — Main page orchestrator. Coordinates voice session + spreadsheet.
- `src/core/types/realtime.ts` — OpenAI Realtime API type definitions.
- `src/storage/keyManager.ts` — AES-256-GCM encryption for API keys.

## Tech Stack

- React 19 + TypeScript (strict) + Vite 8
- Tailwind CSS 4 (utility-first, dark mode)
- Univer Sheets (Canvas-based spreadsheet engine)
- Motion (Framer Motion) for animations
- Zod 4 (action parameter validation)
- RxJS (Univer peer dependency)
- PWA via vite-plugin-pwa

## No Test Framework

There are currently no tests. No test runner is installed.
