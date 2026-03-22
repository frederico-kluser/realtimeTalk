# Action Triggers — How to Create TypeScript Actions for Voice Conversations

This guide explains how to create custom actions (function calling triggers) that the AI can invoke during a voice conversation in RealtimeTalk.

---

## Overview

Actions are TypeScript functions that the AI model can call during a conversation. When the user says something that matches an action's description, the model automatically triggers it. For example:

- User says: *"What time is it?"* → triggers `get_current_time`
- User says: *"Remind me to call John in 10 minutes"* → triggers `create_reminder`
- User says: *"Search for the latest news about AI"* → triggers `search_web`

Actions use **Zod** for parameter validation and are automatically converted to OpenAI's tool format.

---

## Architecture

```
src/actions/
├── registry.ts      # Core registry engine (don't modify)
└── appActions.ts    # Your action definitions (add new actions here)
```

The flow:
1. Actions are defined with Zod schemas in `appActions.ts`
2. `createActionRegistry()` converts them to OpenAI tool definitions
3. Tools are sent to the Realtime API via `session.update`
4. When the AI calls a tool, the handler executes and returns a result
5. For `conversational` actions, the result is sent back to the AI to continue talking
6. For `background` actions, the result is logged silently

---

## Step-by-Step: Creating a New Action

### 1. Define the Action

Open `src/actions/appActions.ts` and add your action to the `createActionRegistry()` call:

```typescript
import { z } from 'zod';
import { createActionRegistry } from './registry';

export const appActions = createActionRegistry({
  // ... existing actions ...

  // YOUR NEW ACTION
  translate_text: {
    description: 'Translate text to another language when the user asks for a translation',
    parameters: z.object({
      text: z.string().describe('The text to translate'),
      targetLanguage: z.string().describe('Target language code like "es", "fr", "pt"'),
    }),
    handler: async ({ text, targetLanguage }: { text: string; targetLanguage: string }) => {
      // Your logic here
      const translated = `[Translated "${text}" to ${targetLanguage}]`;
      return { translated, from: 'en', to: targetLanguage };
    },
  },
});
```

### 2. Anatomy of an Action

```typescript
action_name: {
  // REQUIRED: Description tells the AI WHEN to call this action.
  // Be specific — the model uses this to decide if the action is relevant.
  description: 'Description of when to trigger this action',

  // REQUIRED: Zod schema defining the parameters.
  // Use .describe() on each field — this helps the AI fill them correctly.
  parameters: z.object({
    param1: z.string().describe('What this parameter is'),
    param2: z.number().optional().describe('Optional numeric parameter'),
  }),

  // OPTIONAL: Action type. Defaults to 'conversational'.
  // 'conversational' — result is sent back to the AI to inform its response
  // 'background' — executes silently without affecting the conversation
  type: 'conversational',

  // REQUIRED: Async handler function that receives validated parameters.
  handler: async (params) => {
    // Your implementation
    return { /* result object */ };
  },
}
```

### 3. Parameter Types with Zod

Zod schemas are automatically converted to JSON Schema for OpenAI. Common patterns:

```typescript
import { z } from 'zod';

// String parameter
z.string().describe('User query')

// Number parameter
z.number().describe('Temperature in Celsius')

// Optional parameter
z.string().optional().describe('Optional timezone')

// Enum parameter
z.enum(['low', 'medium', 'high']).describe('Priority level')

// Boolean parameter
z.boolean().describe('Whether to include details')

// Array parameter
z.array(z.string()).describe('List of tags')
```

---

## Action Types

### Conversational Actions (default)

The result is sent back to the AI model, which uses it to formulate its spoken response.

```typescript
get_weather: {
  description: 'Get the current weather when the user asks about weather conditions',
  parameters: z.object({
    city: z.string().describe('City name'),
  }),
  // type defaults to 'conversational'
  handler: async ({ city }) => {
    const data = await fetchWeather(city);
    return { temperature: data.temp, condition: data.condition, city };
  },
},
```

**Flow:** User speaks → AI calls tool → handler runs → result sent to AI → AI speaks the answer

### Background Actions

Execute silently without interrupting the conversation. Useful for analytics, logging, or side effects.

```typescript
track_topic: {
  description: 'Track the conversation topic for analytics',
  type: 'background',
  parameters: z.object({
    topic: z.string().describe('The detected topic'),
    sentiment: z.enum(['positive', 'neutral', 'negative']),
  }),
  handler: async ({ topic, sentiment }) => {
    console.log(`[analytics] Topic: ${topic}, Sentiment: ${sentiment}`);
    await saveAnalytics({ topic, sentiment });
    return { tracked: true };
  },
},
```

**Flow:** AI calls tool → handler runs → result logged → conversation continues uninterrupted

---

## Examples

### Example 1: Calculator

```typescript
calculate: {
  description: 'Perform a mathematical calculation when the user asks to compute something',
  parameters: z.object({
    expression: z.string().describe('Mathematical expression like "2 + 2" or "sqrt(144)"'),
  }),
  handler: async ({ expression }: { expression: string }) => {
    try {
      // WARNING: In production, use a safe math parser instead of eval
      const result = Function(`"use strict"; return (${expression})`)();
      return { expression, result: String(result) };
    } catch {
      return { expression, error: 'Invalid expression' };
    }
  },
},
```

### Example 2: Save Note

```typescript
save_note: {
  description: 'Save a note when the user asks to remember or write something down',
  parameters: z.object({
    title: z.string().describe('Short title for the note'),
    content: z.string().describe('The note content'),
  }),
  handler: async ({ title, content }: { title: string; content: string }) => {
    const notes = JSON.parse(localStorage.getItem('notes') ?? '[]');
    const note = { id: crypto.randomUUID(), title, content, createdAt: new Date().toISOString() };
    notes.push(note);
    localStorage.setItem('notes', JSON.stringify(notes));
    return { saved: true, id: note.id, title };
  },
},
```

### Example 3: Fetch API Data

```typescript
get_stock_price: {
  description: 'Get the current stock price when the user asks about stock market data',
  parameters: z.object({
    symbol: z.string().describe('Stock ticker symbol like "AAPL" or "GOOGL"'),
  }),
  handler: async ({ symbol }: { symbol: string }) => {
    const response = await fetch(`https://api.example.com/stocks/${symbol}`);
    if (!response.ok) return { error: `Could not find stock ${symbol}` };
    const data = await response.json();
    return { symbol, price: data.price, currency: 'USD' };
  },
},
```

### Example 4: Control Smart Home (Background)

```typescript
set_light: {
  description: 'Control smart home lights when the user asks to turn lights on or off',
  type: 'background',
  parameters: z.object({
    room: z.string().describe('Room name like "bedroom" or "kitchen"'),
    action: z.enum(['on', 'off', 'dim']).describe('What to do with the light'),
    brightness: z.number().optional().describe('Brightness percentage 0-100'),
  }),
  handler: async ({ room, action, brightness }) => {
    await fetch('https://my-home-api.local/lights', {
      method: 'POST',
      body: JSON.stringify({ room, action, brightness }),
    });
    return { success: true, room, action };
  },
},
```

---

## How It Works Internally

### Registry (`src/actions/registry.ts`)

```
createActionRegistry(definitions)
  ├── getToolDefinitions() → Converts Zod → JSON Schema → OpenAI ToolDefinition[]
  └── execute(name, argsJson) → Parses JSON args with Zod → calls handler → returns result
```

### Hook (`src/hooks/useActionRegistry.ts`)

```
useActionRegistry(registry, session)
  ├── syncTools()           → Sends session.update with tool definitions
  ├── handleResponseDone()  → Processes function_call items from AI response
  │     ├── Conversational  → Sends function_call_output + response.create
  │     └── Background      → Silent execution, only logged
  └── actionLog             → Array of recent action executions (max 50)
```

### Event Flow

```
1. User speaks → WebRTC audio → OpenAI Realtime API
2. AI decides to call a tool → sends response.done with function_call items
3. handleResponseDone() processes each function_call:
   a. Extracts name + arguments JSON
   b. Calls registry.execute(name, argsJson)
   c. Zod validates and parses the arguments
   d. Handler executes with typed parameters
   e. Result returned
4. For conversational actions:
   a. Sends conversation.item.create with function_call_output
   b. Sends response.create to make AI speak the result
5. For background actions:
   a. Result is logged to actionLog
   b. Conversation continues without interruption
```

---

## Tips

1. **Be specific in descriptions** — The AI decides which tool to call based on the `description` string. Vague descriptions lead to incorrect triggers.

2. **Use `.describe()` on all Zod fields** — This becomes the parameter description in the JSON Schema, helping the AI fill parameters correctly.

3. **Return structured data** — Return objects, not strings. The AI can parse structured results better.

4. **Use `background` for side effects** — If the user doesn't need to hear about the result (analytics, logging, state updates), make it a background action.

5. **Handle errors gracefully** — Return error objects instead of throwing. The AI will use the error message in its response.

6. **Keep handlers fast** — The user is waiting for a spoken response. Long-running handlers create awkward pauses.

7. **Test with voice** — Actions that work with text may need different descriptions for voice. Users speak naturally, not in commands.
