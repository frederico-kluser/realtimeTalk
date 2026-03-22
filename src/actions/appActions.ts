import { z } from 'zod';
import { createActionRegistry } from './registry';
import { getDB } from '@/storage/idb';
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

  placement_test: {
    description: 'Start a placement test to determine the student CEFR level (A1-C2). Use this when a new student has no known level.',
    parameters: z.object({
      target_language: z.string().describe('The language the student is learning, e.g. "English", "Spanish"'),
    }),
    handler: async ({ target_language }: { target_language: string }) => {
      return {
        target_language,
        instructions: 'Conduct a conversational placement test following the criteria below. Ask 8-12 questions with increasing difficulty. After the test, call save_student_level with the determined level and scores.',
        criteria: {
          A1: {
            vocabulary: 'Basic words: greetings, numbers, colors, family members, common objects',
            grammar: 'Simple present tense, basic subject-verb agreement, articles',
            comprehension: 'Understands very short, simple sentences about familiar topics',
            fluency: 'Isolated words and memorized phrases, long pauses',
          },
          A2: {
            vocabulary: 'Everyday vocabulary: shopping, local geography, employment',
            grammar: 'Past simple, future with "going to", comparatives, prepositions of place',
            comprehension: 'Understands sentences about areas of immediate relevance',
            fluency: 'Short sentences, some hesitation but can communicate basic needs',
          },
          B1: {
            vocabulary: 'Broader topics: work, school, leisure, travel, current events',
            grammar: 'Present perfect, conditionals (1st/2nd), passive voice, relative clauses',
            comprehension: 'Understands main points of clear standard speech on familiar matters',
            fluency: 'Can maintain a conversation with some circumlocution',
          },
          B2: {
            vocabulary: 'Abstract topics, technical vocabulary in own field, idiomatic expressions',
            grammar: 'All tenses, reported speech, mixed conditionals, subjunctive',
            comprehension: 'Understands extended speech and complex arguments',
            fluency: 'Speaks fluently with natural flow, occasional self-correction',
          },
          C1: {
            vocabulary: 'Wide range including colloquial, idiomatic, and specialized terms',
            grammar: 'Nuanced use of tenses, cleft sentences, inversion, advanced modals',
            comprehension: 'Understands implicit meaning, irony, and cultural references',
            fluency: 'Expresses ideas spontaneously without obvious searching for words',
          },
          C2: {
            vocabulary: 'Near-native range, subtle distinctions, register-appropriate choices',
            grammar: 'Complete mastery, stylistic variation, rhetorical devices',
            comprehension: 'Understands virtually everything heard with ease',
            fluency: 'Speaks effortlessly with precision, differentiating finer shades of meaning',
          },
        },
      };
    },
  },

  save_student_level: {
    description: 'Save the student CEFR level and skill scores after a placement test. Called automatically after placement_test completes.',
    type: 'background' as const,
    parameters: z.object({
      level: z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']).describe('The determined CEFR level'),
      scores: z.object({
        vocabulary: z.number().min(0).max(100).describe('Vocabulary score 0-100'),
        grammar: z.number().min(0).max(100).describe('Grammar score 0-100'),
        comprehension: z.number().min(0).max(100).describe('Comprehension score 0-100'),
        fluency: z.number().min(0).max(100).describe('Fluency score 0-100'),
      }),
    }),
    handler: async ({ level, scores }: {
      level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
      scores: { vocabulary: number; grammar: number; comprehension: number; fluency: number };
    }) => {
      const scoreValues = [scores.vocabulary, scores.grammar, scores.comprehension, scores.fluency];
      const avgScore = scoreValues.reduce((a, b) => a + b, 0) / scoreValues.length;
      const now = new Date().toISOString();

      const db = await getDB();
      const profileId = 'current';

      await db.put('student_profile', {
        id: profileId,
        level,
        scores: scoreValues,
        knownWords: 0,
        avgScore: Math.round(avgScore * 100) / 100,
        lastSession: now,
        createdAt: now,
        updatedAt: now,
      });

      // Also save as a memory fact so useMemory injects it in future sessions
      await db.put('memories', {
        id: `student-level-${profileId}`,
        fact: `The student's CEFR level is ${level} (vocabulary: ${scores.vocabulary}, grammar: ${scores.grammar}, comprehension: ${scores.comprehension}, fluency: ${scores.fluency}). Adapt all exercises and conversations to this level.`,
        source: 'placement-test',
        createdAt: now,
      });

      return { saved: true, level, avgScore: Math.round(avgScore * 100) / 100 };
    },
  },
});
