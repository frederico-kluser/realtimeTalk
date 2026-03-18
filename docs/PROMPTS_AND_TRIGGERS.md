# Prompts & Trigger System — Technical Documentation

## Overview

Financial Sheets uses OpenAI's Realtime API (GPT Realtime 1.5) via WebRTC for bidirectional voice communication. The AI assistant receives a system prompt that defines its behavior, and a set of **tool definitions** (triggers) that map voice commands to spreadsheet operations.

This document explains the prompt design decisions and the action registry architecture.

---

## System Prompt Design

### Principles (2025-2026 Best Practices)

The system prompt follows modern prompt engineering research:

1. **Under 300 words** — Over-prompting degrades performance. Each sentence justifies its presence.
2. **Markdown formatting** — GPT models parse Markdown headers and lists more reliably than plain text.
3. **No role prompting** — "You are an expert with 20 years..." has no measurable effect on accuracy (Schulhoff meta-analysis, 1,500+ papers). We removed it.
4. **Specific steps, not vague rules** — Instead of "be helpful", the prompt specifies: "Call get_sheet_summary before modifying existing data."
5. **Static content at top** — Enables prompt caching (50-90% cost reduction on OpenAI).
6. **No generic CoT** — "Think step by step" can degrade GPT Realtime performance. We use specific workflow steps instead.

### Current Prompt Structure

```
# Spreadsheet Voice Assistant         ← Clear title, no persona

## Workflow                           ← Specific ordered steps
1. Call get_sheet_summary first
2. Make changes using tools
3. Confirm briefly

## When creating tables               ← Conditional behavior
- Bold headers, colored background
- Use formulas for auto-update
- Currency/percentage formats

## Undo support                        ← Feature-specific instructions
- Respond to "undo"/"revert"/"go back"
- Can undo multiple steps

## Rules                               ← Minimal constraints
- Ask for clarification if ambiguous
- Be concise in spoken responses
```

### Why Not More Instructions?

Research shows prompts above 500 words have diminishing returns (~12% comprehension loss per 100 extra words). The original 10-rule prompt was replaced with a ~120-word prompt that covers the same behavior through tool descriptions and workflow steps.

---

## Action Registry (Trigger System)

### Architecture

```
Voice Command → GPT Realtime → Function Call → Action Registry → Spreadsheet API
     ↑                                              |
     └──── Function Call Output ←───────────────────┘
```

### How It Works

1. **Tool Definitions**: Each action is registered with a name, description, and Zod schema. At session start, these are sent to the Realtime API as `tools` in the session config.

2. **Voice Trigger**: When the user speaks, GPT Realtime decides which tool(s) to call based on the intent. The model returns a `function_call` in the `response.done` event.

3. **Execution**: The `useActionRegistry` hook receives the function call, parses arguments with Zod validation, and executes the handler.

4. **Response Loop**: The handler result is sent back to the model as `function_call_output`, which triggers the AI to speak a confirmation.

### Action Lifecycle

```
┌─────────────────────────────────────────────────────────────────┐
│  User says: "Put Revenue in A1"                                  │
│                                                                  │
│  1. GPT Realtime detects intent → function_call:                │
│     { name: "set_cell_value", arguments: '{"cell":"A1",         │
│       "value":"Revenue"}' }                                      │
│                                                                  │
│  2. useActionRegistry receives call:                             │
│     - Checks call_id hasn't been executed (dedup)                │
│     - Parses args with Zod schema                                │
│     - Snapshots current cell value (for undo)                    │
│     - Calls handler → spreadsheetRef.setCellValue(0, 0, value)  │
│                                                                  │
│  3. Result sent back to model:                                   │
│     conversation.item.create → function_call_output              │
│     response.create → triggers AI spoken confirmation            │
│                                                                  │
│  4. AI says: "Done, I put Revenue in A1"                        │
└─────────────────────────────────────────────────────────────────┘
```

### Registered Actions

| Action | Type | Undo Support | Description |
|---|---|---|---|
| `set_cell_value` | Conversational | Yes | Write a single cell |
| `set_range_values` | Conversational | Yes | Fill a 2D range |
| `set_cell_formula` | Conversational | Yes | Set formula (=SUM, etc.) |
| `get_cell_value` | Conversational | N/A (read) | Read one cell |
| `get_range_values` | Conversational | N/A (read) | Read a range |
| `get_sheet_summary` | Conversational | N/A (read) | Overview of sheet data |
| `insert_rows` | Conversational | Yes | Add empty rows |
| `delete_rows` | Conversational | Yes | Remove rows (values saved) |
| `insert_columns` | Conversational | Yes | Add empty columns |
| `delete_columns` | Conversational | Yes | Remove columns (values saved) |
| `format_cells` | Conversational | Partial | Bold, colors, fonts |
| `set_number_format` | Conversational | Partial | Currency, %, date formats |
| `set_column_width` | Conversational | No | Resize columns |
| `clear_range` | Conversational | Yes | Clear cell contents |
| `undo_last_change` | Conversational | N/A | Revert last modification |
| `get_current_time` | Conversational | N/A | Current date/time |

### Tool Description Best Practices

Tool descriptions are kept **short and specific** (under 15 words each). The model uses these to decide when to call each tool. Verbose descriptions waste tokens in every request.

**Before (verbose):**
```
"Set the value of a single cell in the spreadsheet. Use when the user asks
to write, set, change, or update a specific cell value."
```

**After (concise):**
```
"Write a value to one cell."
```

The model already understands intent from context — it doesn't need usage instructions in tool descriptions.

### Zod Schema Validation

Every action uses Zod schemas for parameter validation:

```typescript
parameters: z.object({
  cell: z.string().describe('Cell reference like "A1"'),
  value: z.union([z.string(), z.number()]).describe('Text, number, or formula'),
})
```

The schemas are converted to JSON Schema via `z.toJSONSchema()` and sent to the API. This provides:
- **Type safety** at runtime
- **Auto-generated** tool parameter definitions
- **Validation** before handler execution

---

## Undo System

### Design

Before each modifying action, the handler snapshots the affected cells. The snapshot is stored in a bounded history stack (max 20 entries). Each entry contains:

```typescript
interface ChangeEntry {
  actionName: string;     // Which action made the change
  description: string;    // Human-readable summary
  undo: () => void;       // Closure that restores previous state
}
```

### Undo Coverage

- **Full undo**: `set_cell_value`, `set_range_values`, `set_cell_formula`, `clear_range`, `insert_rows`, `delete_rows`, `insert_columns`, `delete_columns`
- **Partial undo**: `format_cells`, `set_number_format` (the change is logged but formatting restoration is not yet implemented)
- **No undo**: `set_column_width`, read operations

### User Flow

1. User says: "Create a budget table"
2. AI creates the table (snapshots saved)
3. User says: "Undo that" or "Revert"
4. AI calls `undo_last_change` → previous values restored
5. AI confirms: "I've reverted the last change"

---

## Adaptive VAD (Voice Activity Detection)

### Problem

The OpenAI Realtime API uses Semantic VAD for end-of-speech detection. The `eagerness` parameter (`low`, `medium`, `high`) controls how quickly it triggers. In noisy environments or with sensitive microphones, the VAD triggers too often on non-speech sounds, causing unnecessary interruptions.

### Solution

The `useAdaptiveVAD` hook automatically adjusts eagerness based on observed behavior:

1. **Track** `speech_started` events (VAD triggered)
2. **Track** user transcripts received (real speech detected)
3. **Every 60 seconds**, compare: if `false_triggers >= 4` and `false_triggers > 2 × real_transcripts`, reduce eagerness one level
4. **If signal is good** (≤1 false trigger, ≥3 real transcripts), increase eagerness one level
5. **Send** `session.update` to the API with the new eagerness value

### Eagerness Levels

```
high → medium → low
  ↑                ↓
  └── good signal ←┘
```

This creates a self-adjusting system that adapts to the user's environment without manual configuration.

---

## File Map

| File | Purpose |
|---|---|
| `src/actions/registry.ts` | Generic action registry factory (Zod → JSON Schema, execute with validation) |
| `src/actions/spreadsheetActions.ts` | All spreadsheet actions + undo history |
| `src/hooks/useActionRegistry.ts` | Connects action registry to WebRTC session (execute calls, send results) |
| `src/hooks/useRealtimeSession.ts` | WebRTC engine (RTCPeerConnection, data channel, events) |
| `src/hooks/useAdaptiveVAD.ts` | Automatic VAD sensitivity adjustment |
| `src/hooks/useSpreadsheet.ts` | Univer Sheets API wrapper |
| `src/components/pages/SpreadsheetPage/useSpreadsheetController.ts` | Main orchestrator (prompt, session config, event handling) |
