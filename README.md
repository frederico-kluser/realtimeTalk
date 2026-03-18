# Financial Sheets — Voice-Powered Spreadsheet Management

<p align="center">
  <strong>A 100% client-side web application for managing financial spreadsheets through real-time voice commands with OpenAI AI models, connecting via WebRTC directly from the browser — no backend, no remote database, no server-side authentication.</strong>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#quick-start">Quick Start</a> •
  <a href="#architecture">Architecture</a> •
  <a href="#voice-actions">Voice Actions</a> •
  <a href="#contributing">Contributing</a>
</p>

---

## What It Does

**Financial Sheets** combines a full-featured spreadsheet engine (Univer Sheets) with AI voice control. Speak naturally to create budgets, manage expenses, build financial tables, set formulas, format cells, and analyze data — all without touching the keyboard.

## Features

### Spreadsheet Engine
- **Univer Sheets** — Canvas-based spreadsheet with 500+ formulas, cell formatting, number formats, frozen panes, merge, and more
- **XLSX Import** — Import existing Excel files directly into the spreadsheet
- **Full formatting** — Bold, italic, colors, fonts, number formats (currency, percentage, dates)
- **Formula support** — SUM, AVERAGE, COUNT, IF, VLOOKUP, and all standard Excel formulas

### Voice Control
- **Bidirectional real-time voice** — speak and hear the AI respond instantly via WebRTC
- **BYOK (Bring Your Own Key)** — use your own OpenAI API key
- **Fixed model: GPT Realtime 1.5** — latest generation for best spreadsheet understanding
- **10 available voices** — alloy, ash, ballad, coral, echo, sage, shimmer, verse, marin, cedar
- **Configurable VAD** — semantic end-of-speech detection (low, medium, high, auto)
- **Real-time transcription** — see what you and the AI are saying in a side panel

### Voice-Driven Spreadsheet Actions
- **Set cell values** — "Put 'Revenue' in A1"
- **Fill ranges** — "Create a table with months in column A and revenue in column B"
- **Create formulas** — "Add a SUM formula in B10 that totals B2 through B9"
- **Format cells** — "Make the header row bold with a blue background"
- **Number formatting** — "Format column B as currency"
- **Insert/delete rows & columns** — "Add 3 rows after row 5"
- **Read data** — "What's in cell C4?" or "Summarize the spreadsheet"
- **Clear ranges** — "Clear everything from A1 to Z200"

### UI & Experience
- **Spreadsheet-first layout** — the spreadsheet fills the entire viewport
- **Floating voice bar** — compact controls at the bottom for start/stop, mute, transcript toggle
- **Collapsible settings** — API key, voice selection, VAD in a dropdown toolbar
- **Internationalization** — English and Brazilian Portuguese
- **Dark mode** — via Tailwind CSS
- **Motion animations** — fluid UI transitions throughout
- **PWA** — installable with service worker and offline support

### Data & Security
- **API key encryption** — AES-256-GCM with PBKDF2 (100K iterations)
- **100% client-side** — no backend, no data stored on servers
- **BYOK** — you pay OpenAI directly

---

## What It Does NOT Do

- **No backend** — everything runs in the browser
- **No user authentication** — no login/signup
- **No cloud storage** — spreadsheet data lives in the browser only
- **No XLSX export** — import only (export requires Univer Pro)
- **No automated tests** — no test runner installed
- **No collaborative editing** — single user

---

## Quick Start

### Prerequisites

- **Node.js 20+**
- **OpenAI API key** with Realtime API access
- **Browser** with WebRTC support (Chrome, Edge, Firefox, Safari 15+)

### Installation

```bash
git clone https://github.com/frederico-kluser/realtimeTalk.git
cd realtimeTalk
npm install --legacy-peer-deps
npm run dev
```

The app will be available at `http://localhost:5173`.

### Usage

1. Open the app in your browser
2. Click the **Settings** gear icon in the toolbar
3. Enter your **OpenAI API key** (starts with `sk-`) and click **Save**
4. (Optional) Select voice and VAD settings
5. Click **Start Voice Assistant** at the bottom
6. Allow microphone access
7. Start speaking — "Create a monthly budget table with categories and amounts"
8. The AI will modify the spreadsheet in real-time!

### Import XLSX

Click the **Import XLSX** button in the toolbar to load an existing Excel file into the spreadsheet. The AI can then read, analyze, and modify the imported data through voice commands.

### Build for Production

```bash
npm run build
npm run preview
```

---

## Technologies

| Technology | Purpose |
|---|---|
| **React 19** | UI framework |
| **TypeScript 5.9** | Static typing, strict mode |
| **Vite 8** | Bundler and dev server |
| **Tailwind CSS 4** | Utility-first styling |
| **Univer Sheets** | Canvas-based spreadsheet engine |
| **Motion 12** | Fluid UI animations |
| **Zod 4** | Action parameter validation |
| **RxJS** | Univer peer dependency |
| **xlsx** | XLSX file import |
| **vite-plugin-pwa** | PWA support |

### External APIs

| API | Purpose |
|---|---|
| **OpenAI Realtime API** (WebRTC) | Real-time voice conversation |

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   BROWSER (React SPA)                    │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │              AppToolbar                           │   │
│  │  API Key │ Voice │ VAD │ Import │ Language        │   │
│  ├──────────────────────────────────────────────────┤   │
│  │                                                   │   │
│  │         Univer Sheets (Canvas2D)                  │   │
│  │         Full spreadsheet engine                   │   │
│  │                                                   │   │
│  ├──────────────────────────────────────────────────┤   │
│  │    VoiceControlBar: [Mute] [Start/Stop] [Chat]   │   │
│  └──────────────────────────────────────────────────┘   │
│                         │                                │
│  ┌──────────────────────┴──────────────────────────┐    │
│  │        useRealtimeSession (WebRTC Engine)         │   │
│  │   RTCPeerConnection ◄──► RTCDataChannel           │   │
│  └──────────────────────┬──────────────────────────┘    │
│                          │                               │
│  ┌───────────────────────┴─────────────────────────┐    │
│  │         Spreadsheet Action Registry              │    │
│  │  set_cell_value │ set_range_values │ formulas    │    │
│  │  format_cells │ insert/delete rows │ clear       │    │
│  └──────────────────────────────────────────────────┘    │
└──────────────────────────┬───────────────────────────────┘
                           │
              ┌────────────┴────────────┐
              │   OpenAI Realtime API    │
              │   WebRTC P2P Connection  │
              │   Audio ◄────► Audio     │
              │   DataChannel ◄► Events  │
              └─────────────────────────┘
```

## Project Structure

```
src/
├── i18n/                         # Internationalization (en, pt)
├── components/
│   ├── atoms/                    # UI primitives (Button, Input, Select, icons)
│   ├── molecules/                # AudioVisualizer, VoiceControlBar
│   ├── organisms/                # SpreadsheetEditor, AppToolbar, TranscriptPanel
│   ├── templates/                # PageLayout
│   └── pages/
│       └── SpreadsheetPage/      # Main page (Controller/View pattern)
├── hooks/
│   ├── useRealtimeSession.ts     # WebRTC engine
│   ├── useSpreadsheet.ts         # Univer Sheets integration
│   ├── useAudioControls.ts       # Mic mute + frequency data
│   └── useActionRegistry.ts      # Function call execution
├── core/
│   ├── types/realtime.ts         # OpenAI Realtime API types
│   ├── webrtc/ephemeralToken.ts  # Token exchange
│   └── events/eventEmitter.ts    # Typed event system
├── actions/
│   ├── registry.ts               # Zod-based action registry
│   └── spreadsheetActions.ts     # Voice-triggered spreadsheet actions
├── storage/
│   └── keyManager.ts             # AES-256-GCM API key encryption
├── App.tsx                       # Root component
├── main.tsx                      # Entry point
└── index.css                     # Tailwind CSS
```

---

## Voice Actions

The AI can trigger these spreadsheet actions through voice:

| Action | Description | Example Voice Command |
|---|---|---|
| `set_cell_value` | Set a single cell | "Put 500 in B2" |
| `set_range_values` | Fill multiple cells | "Create headers: Name, Amount, Date in A1 to C1" |
| `set_cell_formula` | Add a formula | "Sum B2 to B10 in B11" |
| `get_cell_value` | Read a cell | "What's in A1?" |
| `get_range_values` | Read a range | "Show me A1 to D5" |
| `get_sheet_summary` | Overview of data | "What data is in the spreadsheet?" |
| `format_cells` | Style cells | "Make A1 to D1 bold with blue background" |
| `set_number_format` | Number formatting | "Format B column as currency" |
| `insert_rows` | Add rows | "Insert 3 rows after row 5" |
| `delete_rows` | Remove rows | "Delete rows 8 to 10" |
| `insert_columns` | Add columns | "Add a column after C" |
| `delete_columns` | Remove columns | "Delete column D" |
| `set_column_width` | Resize columns | "Make column A 200 pixels wide" |
| `clear_range` | Clear cells | "Clear everything" |

---

## Contributing

### Development Setup

```bash
git clone https://github.com/frederico-kluser/realtimeTalk.git
cd realtimeTalk
npm install --legacy-peer-deps
npm run dev
```

### Guidelines

1. **Follow Atomic Design** for components
2. **Controller/View pattern** for pages
3. **Max 400 lines per file**
4. **Use `@/` path aliases**
5. **Use i18n** for all user-facing strings
6. **Use Motion animations** for transitions
7. **No state in view files**
8. **TypeScript strict mode** — all code must pass `tsc --noEmit`

---

## License

This project is open source. See the repository for license details.
