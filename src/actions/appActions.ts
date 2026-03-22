import { z } from 'zod';
import { createActionRegistry } from './registry';
import { getDB } from '@/storage/idb';
import type { CorrectionEntry, TutorReport } from '@/storage/idb';
import { EXPRESSIONS } from './data/expressions';
import { sessionContext } from './sessionContext';
import { similarityScore, findDifferences } from '@/utils/textSimilarity';

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

  pronunciation_exercise: {
    description: 'Start a pronunciation exercise. Returns a phrase for the student to repeat aloud. After the student speaks, call evaluate_pronunciation with the expected and spoken text.',
    parameters: z.object({
      difficulty: z.enum(['beginner', 'intermediate', 'advanced']).describe('Student difficulty level'),
      focus: z.enum(['vowels', 'consonants', 'intonation', 'general']).optional().describe('Phonetic focus area'),
    }),
    handler: async ({ difficulty, focus }: { difficulty: 'beginner' | 'intermediate' | 'advanced'; focus?: 'vowels' | 'consonants' | 'intonation' | 'general' }) => {
      const phrases: Record<string, Record<string, string[]>> = {
        beginner: {
          vowels: [
            'The cat sat on the mat.',
            'I see a big tree.',
            'She ate a piece of cake.',
          ],
          consonants: [
            'The red bus stops here.',
            'Put the cup on the desk.',
            'Bob built a big boat.',
          ],
          intonation: [
            'Is this your book?',
            'What a beautiful day!',
            'I like apples.',
          ],
          general: [
            'Good morning, how are you?',
            'I would like a glass of water.',
            'The weather is nice today.',
          ],
        },
        intermediate: {
          vowels: [
            'The curious tourist explored the ancient ruins.',
            'She usually chooses beautiful blue shoes.',
            'The eagle soared above the open ocean.',
          ],
          consonants: [
            'The strength of the bridge surprised the architects.',
            'She sells seashells by the seashore.',
            'The sixth sick sheik sat on a thick silk sheet.',
          ],
          intonation: [
            'You finished the entire project by yourself?',
            'I never expected such an incredible performance!',
            'Although it rained, we decided to go hiking anyway.',
          ],
          general: [
            'The weather is particularly pleasant this afternoon.',
            'Could you please explain that one more time?',
            'I have been studying English for three years.',
          ],
        },
        advanced: {
          vowels: [
            'The entrepreneurial philanthropist inaugurated the environmental initiative.',
            'Thoroughly thoughtful people routinely evaluate their philosophical viewpoints.',
            'The archaeological excavation revealed previously undiscovered hieroglyphics.',
          ],
          consonants: [
            'The distinguished linguist articulated complex theoretical frameworks.',
            'Sophisticated statistical methodologies strengthened the hypothesis.',
            'The inexplicable phenomenon perplexed theastrophysicists.',
          ],
          intonation: [
            'Had I known about the circumstances, I would have approached the situation differently.',
            'Not only did she complete the marathon, but she also set a new personal record!',
            'The more you practice pronunciation, the more natural it becomes, wouldn\'t you agree?',
          ],
          general: [
            'Despite the unprecedented challenges, the team demonstrated remarkable resilience.',
            'The comprehensive analysis revealed several previously overlooked discrepancies.',
            'Contemporary architectural designs increasingly prioritize environmental sustainability.',
          ],
        },
      };

      const focusArea = focus ?? 'general';
      const pool = phrases[difficulty][focusArea];
      const phrase = pool[Math.floor(Math.random() * pool.length)];

      return {
        phrase,
        difficulty,
        focus: focusArea,
        instructions: `Say this phrase to the student and ask them to repeat it. After they speak, call evaluate_pronunciation with expected="${phrase}" and the student's transcribed speech.`,
      };
    },
  },

  evaluate_pronunciation: {
    description: 'Evaluate the student pronunciation by comparing expected text with their spoken transcription. Returns a similarity score and problematic words. Note: comparison is textual (based on transcription), not phonetic.',
    parameters: z.object({
      expected: z.string().describe('The original phrase the student was asked to repeat'),
      spoken: z.string().describe('The transcribed text of what the student actually said'),
    }),
    handler: async ({ expected, spoken }: { expected: string; spoken: string }) => {
      const score = similarityScore(expected, spoken);
      const problematicWords = findDifferences(expected, spoken);

      return {
        score: Math.round(score * 100) / 100,
        percentage: `${Math.round(score * 100)}%`,
        problematicWords,
        expected,
        spoken,
        rating:
          score >= 0.95 ? 'excellent' :
          score >= 0.8  ? 'good' :
          score >= 0.6  ? 'fair' :
                          'needs_practice',
      };
    },
  },

  log_pronunciation: {
    description: 'Log words the student had difficulty pronouncing for tracking recurring pronunciation issues. Called after evaluate_pronunciation when problematic words are found.',
    type: 'background' as const,
    parameters: z.object({
      words: z.array(z.string()).describe('Words the student mispronounced or omitted'),
      expected_phrase: z.string().describe('The full expected phrase'),
      score: z.number().min(0).max(1).describe('The similarity score from evaluate_pronunciation'),
    }),
    handler: async ({ words, expected_phrase, score }: { words: string[]; expected_phrase: string; score: number }) => {
      const sessionId = sessionContext.getSessionId();
      const key = 'pronunciation_difficulties';
      const existing = JSON.parse(localStorage.getItem(key) ?? '[]') as Array<{
        word: string;
        count: number;
        lastSeen: string;
        sessions: string[];
      }>;

      const now = new Date().toISOString();

      for (const word of words) {
        const entry = existing.find((e) => e.word === word);
        if (entry) {
          entry.count += 1;
          entry.lastSeen = now;
          if (sessionId && !entry.sessions.includes(sessionId)) {
            entry.sessions.push(sessionId);
          }
        } else {
          existing.push({
            word,
            count: 1,
            lastSeen: now,
            sessions: sessionId ? [sessionId] : [],
          });
        }
      }

      localStorage.setItem(key, JSON.stringify(existing));

      return {
        logged: true,
        wordsTracked: words.length,
        expectedPhrase: expected_phrase,
        score,
      };
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
