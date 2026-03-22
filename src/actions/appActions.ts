import { z } from 'zod';
import { createActionRegistry } from './registry';
import { sessionContext } from './sessionContext';
import { getDB } from '@/storage/idb';
import type { CorrectionEntry, TutorReport } from '@/storage/idb';

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

  log_grammar_correction: {
    description: 'Silently log a grammar correction when correcting the student. Always use this action whenever you correct a grammar mistake during conversation.',
    type: 'background' as const,
    parameters: z.object({
      original: z.string().describe('The original incorrect text from the student'),
      corrected: z.string().describe('The corrected version of the text'),
      rule: z.string().describe('The grammar rule that was violated (e.g. "irregular past tense", "subject-verb agreement")'),
      explanation: z.string().describe('Brief explanation of why this is incorrect'),
      severity: z.enum(['minor', 'moderate', 'critical']).describe('How significant the error is'),
    }),
    handler: async (params: {
      original: string;
      corrected: string;
      rule: string;
      explanation: string;
      severity: 'minor' | 'moderate' | 'critical';
    }) => {
      const sessionId = sessionContext.getSessionId();
      if (!sessionId) return { logged: false, reason: 'no active session' };

      const entry: CorrectionEntry = {
        id: crypto.randomUUID(),
        original: params.original,
        corrected: params.corrected,
        rule: params.rule,
        explanation: params.explanation,
        severity: params.severity,
        sessionId,
        timestamp: new Date().toISOString(),
      };

      const db = await getDB();
      await db.put('corrections', entry);
      return { logged: true, id: entry.id };
    },
  },

  get_session_corrections: {
    description: 'Get all grammar corrections from the current session grouped by rule. Use when the student asks about their mistakes (e.g. "what mistakes did I make?", "show my errors").',
    parameters: z.object({}),
    handler: async () => {
      const sessionId = sessionContext.getSessionId();
      if (!sessionId) return { corrections: [], message: 'No active session' };

      const db = await getDB();
      const all = await db.getAllFromIndex('corrections', 'by-session', sessionId);

      const grouped: Record<string, Array<{ original: string; corrected: string; explanation: string; severity: string }>> = {};
      for (const c of all) {
        const group = grouped[c.rule] ?? [];
        group.push({
          original: c.original,
          corrected: c.corrected,
          explanation: c.explanation,
          severity: c.severity,
        });
        grouped[c.rule] = group;
      }

      return {
        totalCorrections: all.length,
        byRule: grouped,
        sessionId,
      };
    },
  },

  generate_session_report: {
    description: 'Generate a session report summarizing the student performance including corrections, vocabulary used, and fluency notes. Use at the end of a tutoring session or when the student asks for a report.',
    parameters: z.object({
      corrections: z.array(z.object({
        original: z.string(),
        corrected: z.string(),
        rule: z.string(),
      })).describe('List of grammar corrections made during the session'),
      vocabulary_used: z.array(z.string()).describe('New or notable vocabulary words used by the student'),
      fluency_notes: z.string().describe('Overall notes on fluency, pronunciation, and communication effectiveness'),
    }),
    handler: async (params: {
      corrections: Array<{ original: string; corrected: string; rule: string }>;
      vocabulary_used: string[];
      fluency_notes: string;
    }) => {
      const sessionId = sessionContext.getSessionId();
      if (!sessionId) return { saved: false, reason: 'no active session' };

      const report: TutorReport = {
        summary: params.fluency_notes,
        correctionsCount: params.corrections.length,
        newVocabulary: params.vocabulary_used,
      };

      sessionContext.setTutorReport(report);

      return {
        saved: true,
        report: {
          summary: report.summary,
          correctionsCount: report.correctionsCount,
          vocabularyCount: report.newVocabulary.length,
          corrections: params.corrections,
          vocabulary: params.vocabulary_used,
        },
      };
    },
  },
});
