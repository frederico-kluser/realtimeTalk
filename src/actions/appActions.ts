import { z } from 'zod';
import { createActionRegistry } from './registry';
import { EXPRESSIONS } from './data/expressions';

export const appActions = createActionRegistry({
  search_web: {
    description: 'Search the web when the user asks about current events, real-time information, or anything requiring up-to-date data',
    parameters: z.object({
      query: z.string().describe('Search query'),
    }),
    handler: async ({ query }: { query: string }) => {
      return { message: `Search for "${query}" would be performed here`, query };
    },
  },

  create_reminder: {
    description: 'Create a reminder when the user asks to be reminded about something',
    parameters: z.object({
      text: z.string().describe('Reminder text'),
      time: z.string().describe('Time in ISO 8601 format or relative like "in 10 minutes"'),
    }),
    handler: async ({ text, time }: { text: string; time: string }) => {
      const reminder = { id: crypto.randomUUID(), text, time, createdAt: new Date().toISOString() };
      const existing = JSON.parse(localStorage.getItem('reminders') ?? '[]') as unknown[];
      localStorage.setItem('reminders', JSON.stringify([...existing, reminder]));

      if (Notification.permission === 'granted') {
        void new Notification('Reminder created', { body: text });
      }
      return { confirmed: true, id: reminder.id };
    },
  },

  get_current_time: {
    description: 'Get the current date and time when the user asks what time it is',
    parameters: z.object({
      timezone: z.string().optional().describe('IANA timezone like "America/New_York"'),
    }),
    handler: async ({ timezone }: { timezone?: string }) => {
      const now = new Date();
      const tz = timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone;
      const formatted = now.toLocaleString('en-US', { timeZone: tz });
      return { datetime: formatted, iso: now.toISOString() };
    },
  },

  get_daily_expression: {
    description: 'Get the daily idiomatic expression to present at the start of a session. Returns an expression with meaning and examples. Call this at the beginning of every session.',
    parameters: z.object({}),
    handler: async () => {
      const today = new Date().toISOString().slice(0, 10);
      const storedDate = localStorage.getItem('daily_expression_date');
      const storedExpression = localStorage.getItem('daily_expression');

      if (storedDate === today && storedExpression) {
        return JSON.parse(storedExpression) as unknown;
      }

      // Deterministic selection: hash the date string to pick an index
      let hash = 0;
      for (let i = 0; i < today.length; i++) {
        hash = (hash * 31 + today.charCodeAt(i)) | 0;
      }
      const index = Math.abs(hash) % EXPRESSIONS.length;
      const expression = EXPRESSIONS[index];

      // Track seen expressions to avoid repetition
      const seen = JSON.parse(localStorage.getItem('seen_expressions') ?? '[]') as string[];
      if (!seen.includes(expression.expression)) {
        localStorage.setItem('seen_expressions', JSON.stringify([...seen, expression.expression]));
      }

      localStorage.setItem('daily_expression_date', today);
      localStorage.setItem('daily_expression', JSON.stringify(expression));

      return expression;
    },
  },

  mark_expression_learned: {
    description: 'Mark that the student used the daily expression during conversation. Called when the student correctly uses the expression of the day.',
    type: 'background' as const,
    parameters: z.object({
      expression: z.string().describe('The idiomatic expression the student used'),
      used_correctly: z.boolean().describe('Whether the student used it correctly'),
    }),
    handler: async ({ expression, used_correctly }: { expression: string; used_correctly: boolean }) => {
      const learned = JSON.parse(localStorage.getItem('learned_expressions') ?? '[]') as Array<{
        expression: string;
        used_correctly: boolean;
        date: string;
      }>;
      const entry = { expression, used_correctly, date: new Date().toISOString() };
      localStorage.setItem('learned_expressions', JSON.stringify([...learned, entry]));
      return { recorded: true, expression, used_correctly };
    },
  },

  log_interaction: {
    description: 'Log an important interaction silently without interrupting conversation',
    type: 'background' as const,
    parameters: z.object({
      event: z.string(),
    }),
    handler: async ({ event }: { event: string }) => {
      console.log('[analytics]', event);
      return { logged: true };
    },
  },
});
