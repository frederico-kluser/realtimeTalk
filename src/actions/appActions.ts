import { z } from 'zod';
import { createActionRegistry } from './registry';

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
