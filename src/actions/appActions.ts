import { z } from 'zod';
import { createActionRegistry } from './registry';
import { getDB } from '@/storage/idb';
import type { CorrectionEntry, Flashcard, TutorReport, VocabularyEntry } from '@/storage/idb';
import { calculateNextReview } from '@/utils/srs';
import { EXPRESSIONS } from './data/expressions';
import { getRandomWords } from './data/vocabularyBank';
import type { VocabTopic, VocabDifficulty } from './data/vocabularyBank';
import { getRandomQuestions } from './data/grammarQuiz';
import type { QuizTopic, QuizDifficulty } from './data/grammarQuiz';
import { getDebateTopics, findDebateTopic, getRandomDebateTopic } from './data/debateTopics';
import { sessionContext } from './sessionContext';
import type { CorrectionMode } from './sessionContext';
import { similarityScore, findDifferences } from '@/utils/textSimilarity';
import { getScenario, buildRoleplayInstructions } from '@/personality/scenarios';
import type { ScenarioId, ScenarioDifficulty } from '@/personality/scenarios';

const DEFERRED_CORRECTION_ADDENDUM = `

# DEFERRED CORRECTION MODE (ACTIVE)
Do NOT correct grammar inline. Do NOT point out mistakes during conversation. Instead, silently log ALL errors using log_grammar_correction and continue the conversation naturally as if the student spoke correctly. When the student asks for feedback (e.g. "show my mistakes", "what errors did I make?") or says "correct me now", call get_session_corrections to deliver all accumulated corrections at once.`;

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

  start_vocabulary_quiz: {
    description: 'Start a vocabulary quiz session. Fetches previously missed words for spaced repetition and adds new words from the chosen topic. Sofia conducts the quiz entirely by voice — presenting words one by one, evaluating responses, and giving immediate feedback. Use when the student says "quiz me", "vocabulary quiz", or proactively after 10+ minutes of session.',
    parameters: z.object({
      topic: z.enum(['food', 'travel', 'business', 'daily_life', 'emotions', 'technology']).describe('Vocabulary topic for the quiz'),
      difficulty: z.enum(['beginner', 'intermediate', 'advanced']).describe('Difficulty level matching the student CEFR level'),
      count: z.number().min(3).max(20).default(10).describe('Number of words in the quiz (default 10)'),
    }),
    handler: async ({ topic, difficulty, count }: {
      topic: VocabTopic;
      difficulty: VocabDifficulty;
      count: number;
    }) => {
      const db = await getDB();
      const allVocab = await db.getAll('vocabulary');

      // Find previously missed words for spaced repetition
      const missedWords = allVocab
        .filter(v => !v.correct && v.category === topic)
        .reduce<Map<string, VocabularyEntry>>((acc, v) => {
          // Keep only the latest attempt per word
          const existing = acc.get(v.word);
          if (!existing || v.timestamp > existing.timestamp) {
            acc.set(v.word, v);
          }
          return acc;
        }, new Map());

      // Also check which words the student already got right (to exclude from new words)
      const correctWords = new Set(
        allVocab.filter(v => v.correct).map(v => v.word)
      );

      // Build quiz: prioritize missed words, then fill with new ones
      const missedList = [...missedWords.values()].slice(0, Math.ceil(count / 2));
      const missedWordSet = new Set(missedList.map(m => m.word));
      const excludeFromNew = new Set([...correctWords, ...missedWordSet]);
      const remainingCount = count - missedList.length;

      const newWords = getRandomWords(topic, difficulty, remainingCount, excludeFromNew);

      const quizWords = [
        ...missedList.map(m => ({
          word: m.word,
          isReview: true,
          category: topic,
        })),
        ...newWords.map(w => ({
          word: w.word,
          translation: w.translation,
          example: w.example,
          isReview: false,
          category: topic,
        })),
      ].sort(() => Math.random() - 0.5);

      return {
        topic,
        difficulty,
        totalWords: quizWords.length,
        reviewWords: missedList.length,
        newWords: newWords.length,
        words: quizWords,
        instructions: [
          'Present each word one at a time by voice.',
          'For each word, ask the student to translate it, use it in a sentence, or provide a synonym.',
          'Review words (isReview: true) are words the student previously got wrong — give extra encouragement.',
          'After the student responds, immediately call log_quiz_result with the word, whether it was correct, and the category.',
          'Give brief feedback after each answer: confirm correct answers, gently correct wrong ones with the right answer and an example.',
          'At the end, summarize the results: total correct, total wrong, and words to review.',
        ],
      };
    },
  },

  start_multiple_choice_quiz: {
    description: 'Start a multiple-choice quiz on grammar, vocabulary, idioms, prepositions, or tenses. Sofia reads each question aloud with four options (A, B, C, D) and the student answers by voice. After each answer, call log_quiz_result with the question text, whether the answer was correct, and the topic as category.',
    parameters: z.object({
      topic: z.enum(['grammar', 'vocabulary', 'idioms', 'prepositions', 'tenses']).describe('Quiz topic'),
      count: z.number().min(3).max(20).default(5).describe('Number of questions (default 5)'),
      difficulty: z.enum(['beginner', 'intermediate', 'advanced']).describe('Difficulty level matching the student CEFR level'),
    }),
    handler: async ({ topic, count, difficulty }: {
      topic: QuizTopic;
      count: number;
      difficulty: QuizDifficulty;
    }) => {
      const questions = getRandomQuestions(topic, difficulty, count);

      return {
        topic,
        difficulty,
        totalQuestions: questions.length,
        questions: questions.map((q, i) => ({
          number: i + 1,
          question: q.question,
          A: q.options[0],
          B: q.options[1],
          C: q.options[2],
          D: q.options[3],
          correct_letter: (['A', 'B', 'C', 'D'] as const)[q.correct_index],
          explanation: q.explanation,
        })),
        instructions: [
          'Present each question one at a time by voice.',
          'Read the question clearly, then read all four options: A, B, C, D.',
          'Wait for the student to answer with a letter (A, B, C, or D).',
          'After the student answers, tell them if they are correct or incorrect.',
          'If incorrect, reveal the correct answer and read the explanation.',
          'After each answer, call log_quiz_result with word=question text, correct=true/false, category=topic.',
          'At the end, summarize the results: total correct out of total questions.',
        ],
      };
    },
  },

  start_dictation: {
    description: 'Start a dictation exercise. Returns a list of phrases for Sofia to dictate one at a time. After the student repeats each phrase, call check_dictation with the expected and spoken text. Speak slowly and clearly during dictation.',
    parameters: z.object({
      difficulty: z.enum(['beginner', 'intermediate', 'advanced']).describe('Student difficulty level'),
      topic: z.string().optional().describe('Optional topic hint (e.g. "travel", "food", "work")'),
      count: z.number().min(1).max(10).default(5).describe('Number of phrases to dictate (default 5)'),
    }),
    handler: async ({ difficulty, topic, count }: {
      difficulty: 'beginner' | 'intermediate' | 'advanced';
      topic?: string;
      count: number;
    }) => {
      const phrases: Record<string, string[]> = {
        beginner: [
          'I like to eat breakfast every morning.',
          'The cat is sleeping on the sofa.',
          'Can you help me find the bus stop?',
          'She has two brothers and one sister.',
          'We went to the park after school.',
          'The store closes at nine o\'clock.',
          'I need to buy some milk and bread.',
          'My favorite color is blue.',
          'It is raining outside today.',
          'He works at a hospital near my house.',
        ],
        intermediate: [
          'The meeting has been rescheduled to next Thursday afternoon.',
          'She couldn\'t believe how quickly the time had passed.',
          'If you had told me earlier, I would have made different plans.',
          'The restaurant on the corner serves excellent Italian food.',
          'Despite the heavy traffic, we managed to arrive on time.',
          'He has been working on this project for over three months.',
          'The weather forecast predicts sunshine for the rest of the week.',
          'Could you please send me the report before the end of the day?',
          'They decided to postpone the trip until the situation improved.',
          'I would appreciate it if you could give me some feedback.',
        ],
        advanced: [
          'The unprecedented economic downturn has significantly impacted small businesses throughout the region.',
          'Notwithstanding the considerable challenges, the research team persevered and published their findings.',
          'The committee unanimously agreed that the proposed amendments would strengthen the existing framework.',
          'Had the negotiations not broken down, a mutually beneficial agreement could have been reached.',
          'The archaeological discovery fundamentally altered our understanding of early human civilization.',
          'Contemporary approaches to environmental sustainability require unprecedented levels of international cooperation.',
          'The pharmaceutical company announced breakthrough results from their latest clinical trial.',
          'In retrospect, the decision to diversify the portfolio proved to be remarkably prescient.',
          'The intricate relationship between technological innovation and societal transformation continues to evolve.',
          'Scholars have long debated whether cultural identity is primarily shaped by heritage or environment.',
        ],
      };

      const pool = phrases[difficulty];
      const shuffled = [...pool].sort(() => Math.random() - 0.5);
      const selected = shuffled.slice(0, Math.min(count, pool.length));

      return {
        difficulty,
        topic: topic ?? 'general',
        phrases: selected,
        totalPhrases: selected.length,
        instructions: [
          'Dictate each phrase clearly, one at a time, at a slow and natural pace.',
          'After dictating, wait for the student to repeat what they heard.',
          'Then call check_dictation with the original phrase (expected) and the student\'s transcribed speech (spoken).',
          'Give feedback based on the score: highlight missed or incorrect words.',
          'If the student struggles, repeat the phrase more slowly or break it into smaller parts.',
          ...(topic ? [`Relate the exercise to the topic "${topic}" when giving context or encouragement.`] : []),
        ],
      };
    },
  },

  check_dictation: {
    description: 'Check the student dictation attempt by comparing the expected phrase with what they said. Returns similarity score and specific errors. Tolerant of accent and punctuation differences.',
    parameters: z.object({
      expected: z.string().describe('The original phrase that was dictated'),
      spoken: z.string().describe('The transcribed text of what the student actually said'),
    }),
    handler: async ({ expected, spoken }: { expected: string; spoken: string }) => {
      const score = similarityScore(expected, spoken);
      const missedWords = findDifferences(expected, spoken);

      const rating =
        score >= 0.95 ? 'perfect' :
        score >= 0.85 ? 'excellent' :
        score >= 0.7  ? 'good' :
        score >= 0.5  ? 'fair' :
                        'needs_practice';

      return {
        score: Math.round(score * 100) / 100,
        percentage: `${Math.round(score * 100)}%`,
        rating,
        missedWords,
        expected,
        spoken,
        feedback:
          score >= 0.95 ? 'Almost perfect! The student captured the phrase accurately.' :
          score >= 0.85 ? 'Very good! Only minor differences detected.' :
          score >= 0.7  ? `Good effort. The student missed or changed these words: ${missedWords.join(', ')}.` :
          score >= 0.5  ? `Fair attempt. Several words need attention: ${missedWords.join(', ')}. Consider repeating more slowly.` :
                          `The student had significant difficulty. Missed words: ${missedWords.join(', ')}. Try dictating shorter segments.`,
      };
    },
  },

  log_quiz_result: {
    description: 'Log the result of a single quiz question (vocabulary or multiple choice). Called after each student answer during a quiz. Persists to IndexedDB for progress tracking and spaced repetition.',
    type: 'background' as const,
    parameters: z.object({
      word: z.string().describe('The word or phrase being tested'),
      correct: z.boolean().describe('Whether the student answered correctly'),
      category: z.string().describe('The topic category (food, travel, business, daily_life, emotions, technology, grammar, idioms, prepositions, tenses)'),
    }),
    handler: async ({ word, correct, category }: {
      word: string;
      correct: boolean;
      category: string;
    }) => {
      const sessionId = sessionContext.getSessionId();

      const entry: VocabularyEntry = {
        id: crypto.randomUUID(),
        word,
        correct,
        category,
        timestamp: new Date().toISOString(),
        sessionId: sessionId ?? undefined,
      };

      const db = await getDB();
      await db.put('vocabulary', entry);

      return { logged: true, id: entry.id, word, correct };
    },
  },

  start_roleplay: {
    description: 'Start an immersive roleplay scenario where Sofia assumes a character role (waiter, receptionist, interviewer, etc.) and the student practices real-world situations. The scenario includes target vocabulary for the student level. Use when the student wants to practice a specific situation, or proactively suggest one to make the lesson more engaging.',
    parameters: z.object({
      scenario: z.enum([
        'restaurant', 'airport', 'hotel', 'job_interview',
        'doctor_visit', 'shopping', 'phone_call', 'meeting',
      ]).describe('The roleplay scenario to start'),
      difficulty: z.enum(['beginner', 'intermediate', 'advanced']).describe('Difficulty level matching the student CEFR level'),
    }),
    handler: async ({ scenario: scenarioId, difficulty }: {
      scenario: ScenarioId;
      difficulty: ScenarioDifficulty;
    }) => {
      const scenario = getScenario(scenarioId);
      const roleplayInstructions = buildRoleplayInstructions(scenario, difficulty);
      const vocab = scenario.vocabulary[difficulty];

      // Store roleplay state so end_roleplay knows what to restore
      sessionContext.setRoleplayState({
        scenarioId,
        difficulty,
        startedAt: new Date().toISOString(),
      });

      return {
        instructions: roleplayInstructions,
        scenario: {
          id: scenario.id,
          name: scenario.name,
          description: scenario.description,
          aiRole: scenario.aiRole,
          setting: scenario.setting,
          studentObjective: scenario.studentObjective,
          difficulty,
        },
        targetVocabulary: vocab,
        keyPhrases: scenario.keyPhrases,
        fileContext: {
          name: `Scenario Vocabulary — ${scenario.name} (${difficulty})`,
          content: `Target words for this roleplay:\n${vocab.join(', ')}\n\nKey phrases:\n${scenario.keyPhrases.join('\n')}`,
        },
        systemActions: [
          'Call session.update with the "instructions" field from this response to switch Sofia into the roleplay character.',
          'If fileContexts are supported, inject the "fileContext" as a reference document.',
          'Stay in character until end_roleplay is called.',
        ],
      };
    },
  },

  start_debate: {
    description: 'Start a structured debate exercise. Sofia picks a side and the student argues the opposite. Excellent for practicing opinion expressions, connectors, and argumentation. Use when the student wants to practice debating, expressing opinions, or when you want to challenge intermediate/advanced students. At the end of the debate (after 4-6 exchanges), provide feedback on argumentation vocabulary, connector usage, and argument structure.',
    parameters: z.object({
      topic: z.string().describe('Debate topic — can be a keyword like "remote work" or "AI". If empty or not found, a random topic is chosen.'),
      user_side: z.enum(['for', 'against']).describe('Which side the student will argue'),
    }),
    handler: async ({ topic, user_side }: {
      topic: string;
      user_side: 'for' | 'against';
    }) => {
      // Try to find the requested topic, fall back to random
      const found = topic.trim()
        ? findDebateTopic(topic)
        : undefined;

      const debateTopic = found ?? getRandomDebateTopic();
      const sofiaSide = user_side === 'for' ? 'against' : 'for';

      // Pick expressions for each side
      const studentExpressions = user_side === 'for'
        ? debateTopic.expressions_for
        : debateTopic.expressions_against;

      const sofiaExpressions = sofiaSide === 'for'
        ? debateTopic.expressions_for
        : debateTopic.expressions_against;

      // List all available topics for reference
      const allTopics = getDebateTopics().map(t => ({
        topic: t.topic,
        difficulty: t.difficulty_level,
      }));

      return {
        debate: {
          topic: debateTopic.topic,
          description: debateTopic.description,
          difficulty: debateTopic.difficulty_level,
          student_side: user_side,
          sofia_side: sofiaSide,
        },
        target_expressions: {
          student_should_use: studentExpressions,
          sofia_will_model: sofiaExpressions,
          useful_connectors: debateTopic.useful_connectors,
        },
        available_topics: allTopics,
        instructions: [
          `You are now in DEBATE MODE on the topic: "${debateTopic.topic}".`,
          `You (Sofia) argue ${sofiaSide.toUpperCase()} this topic. The student argues ${user_side.toUpperCase()}.`,
          `Open by stating your position clearly using expressions from your side.`,
          `Model good argumentation: use connectors (${debateTopic.useful_connectors.slice(0, 4).join(', ')}), structured arguments, and polite disagreement.`,
          `Encourage the student to use the target expressions listed in student_should_use.`,
          `If the student struggles, subtly prompt them: "You could say something like '${studentExpressions[0]}'"`,
          `After 4-6 exchanges, wrap up the debate and provide structured feedback:`,
          `  1. Which target expressions the student used (and which they missed)`,
          `  2. How well they used connectors to link their arguments`,
          `  3. The clarity and structure of their arguments`,
          `  4. Suggestions for improvement with specific examples`,
          `Remember: the focus is on LANGUAGE PRACTICE, not on who "wins" the debate.`,
          `Keep the tone friendly, encouraging, and educational throughout.`,
        ],
      };
    },
  },
  end_roleplay: {
    description: 'End the current roleplay scenario, generate a performance scorecard, and restore Sofia to her original tutor personality. Call this when the student completes the scenario objectives or asks to stop the roleplay.',
    parameters: z.object({
      objectives_completed: z.array(z.string()).describe('List of scenario objectives the student completed during the roleplay'),
      vocabulary_used: z.number().min(0).describe('Number of target vocabulary words the student used during the roleplay'),
      grammar_accuracy: z.number().min(0).max(100).describe('Estimated grammar accuracy percentage (0-100) during the roleplay'),
    }),
    handler: async ({ objectives_completed, vocabulary_used, grammar_accuracy }: {
      objectives_completed: string[];
      vocabulary_used: number;
      grammar_accuracy: number;
    }) => {
      const roleplayState = sessionContext.getRoleplayState();
      const scenarioInfo = roleplayState
        ? getScenario(roleplayState.scenarioId)
        : null;

      const totalVocab = scenarioInfo && roleplayState
        ? scenarioInfo.vocabulary[roleplayState.difficulty].length
        : 0;

      const vocabPercentage = totalVocab > 0
        ? Math.round((vocabulary_used / totalVocab) * 100)
        : 0;

      const overallScore = Math.round(
        (objectives_completed.length > 0 ? 40 : 0) +
        (vocabPercentage * 0.3) +
        (grammar_accuracy * 0.3)
      );

      const rating =
        overallScore >= 90 ? 'excellent' :
        overallScore >= 75 ? 'good' :
        overallScore >= 50 ? 'fair' :
                             'needs_practice';

      const duration = roleplayState
        ? Math.round((Date.now() - new Date(roleplayState.startedAt).getTime()) / 1000 / 60)
        : 0;

      // Clear roleplay state
      sessionContext.clearRoleplayState();

      return {
        scorecard: {
          scenario: scenarioInfo?.name ?? 'Unknown',
          difficulty: roleplayState?.difficulty ?? 'unknown',
          duration: `${duration} minutes`,
          overallScore,
          rating,
          objectives: {
            completed: objectives_completed,
            count: objectives_completed.length,
          },
          vocabulary: {
            used: vocabulary_used,
            total: totalVocab,
            percentage: vocabPercentage,
          },
          grammarAccuracy: grammar_accuracy,
        },
        feedback: {
          strengths:
            overallScore >= 75
              ? 'Great job! You handled the situation naturally and used appropriate vocabulary.'
              : 'You made a good effort and practiced important conversation patterns.',
          improvements:
            vocabPercentage < 50
              ? `Try to incorporate more scenario-specific vocabulary. You used ${vocabulary_used} out of ${totalVocab} target words.`
              : grammar_accuracy < 70
                ? 'Focus on grammar accuracy in your next practice session.'
                : 'Keep practicing to make your responses even more natural and fluent.',
          recommendation:
            overallScore >= 75
              ? 'You are ready to try this scenario at a higher difficulty level!'
              : 'Practice this scenario again to improve your score.',
        },
        restoreInstructions: 'Restore the original Sofia tutor personality. Stop playing the roleplay character. Return to being Sofia, the language tutor, and continue the normal lesson.',
      };
    },
  },

  toggle_correction_mode: {
    description: 'Toggle between immediate and deferred grammar correction modes. In deferred mode, errors are silently logged without interrupting conversation flow. Use when the student says "I want to practice fluency", "correct me later", "don\'t correct me now", or similar. Switch back to immediate when the student says "correct me now" or "switch to immediate correction".',
    parameters: z.object({
      mode: z.enum(['immediate', 'deferred']).describe('Correction mode: "immediate" corrects inline, "deferred" logs errors silently'),
    }),
    handler: async ({ mode }: { mode: CorrectionMode }) => {
      sessionContext.setCorrectionMode(mode);

      const basePrompt = sessionContext.getPersonalityPrompt();
      if (basePrompt) {
        const instructions = mode === 'deferred'
          ? basePrompt + DEFERRED_CORRECTION_ADDENDUM
          : basePrompt;

        sessionContext.sendEvent({
          type: 'session.update',
          session: { instructions },
        });
      }

      return {
        mode,
        message: mode === 'deferred'
          ? 'Switched to deferred correction mode. Errors will be logged silently. Continue the conversation naturally without correcting mistakes inline. Use log_grammar_correction to log all errors you detect.'
          : 'Switched to immediate correction mode. Correct grammar mistakes gently as they occur, and log each correction using log_grammar_correction.',
      };
    },
  },

  toggle_immersion_mode: {
    description: 'Toggle immersion mode. When enabled, the tutor speaks ONLY in the target language, forcing total immersion. If the student does not understand, simplify but never switch languages. Use when the student says "immersion mode", "let\'s do immersion", "speak only in X", or similar. To deactivate, use when student says "exit immersion", "stop immersion mode", etc.',
    parameters: z.object({
      enabled: z.boolean().describe('Whether to enable or disable immersion mode'),
      target_language: z.string().describe('The target language to immerse in, e.g. "English", "Spanish", "French"'),
    }),
    handler: async ({ enabled, target_language }: { enabled: boolean; target_language: string }) => {
      if (enabled) {
        const state = { enabled, target_language, activatedAt: new Date().toISOString() };
        localStorage.setItem('immersion_mode', JSON.stringify(state));
      } else {
        localStorage.removeItem('immersion_mode');
      }

      const immersionInstructions = enabled
        ? `You MUST speak ONLY in ${target_language}. If the student doesn't understand, simplify your language but NEVER switch to another language. Use the native language ONLY as an absolute last resort.`
        : 'Immersion mode deactivated. You may now speak in any language as appropriate for the student. Resume normal multilingual tutoring behavior.';

      return {
        enabled,
        target_language,
        _immersionInstructions: immersionInstructions,
      };
    },
  },

  log_fluency_metric: {
    description: 'Silently log a fluency metric during conversation. Call this periodically to track the student fluency over time without interrupting the conversation.',
    type: 'background' as const,
    parameters: z.object({
      metric_type: z.enum(['response_time', 'sentence_complexity', 'vocabulary_range', 'error_rate', 'self_correction']).describe('The type of fluency metric being logged'),
      value: z.number().min(0).max(100).describe('Metric value (0-100 scale)'),
      notes: z.string().optional().describe('Optional context or observation about this metric'),
    }),
    handler: async ({ metric_type, value, notes }: { metric_type: string; value: number; notes?: string }) => {
      const sessionId = sessionContext.getSessionId();
      const key = 'fluency_metrics';
      const existing = JSON.parse(localStorage.getItem(key) ?? '[]') as unknown[];
      const entry = { metric_type, value, notes, sessionId, timestamp: new Date().toISOString() };
      const updated = [...existing, entry].slice(-200);
      localStorage.setItem(key, JSON.stringify(updated));
      return { logged: true, metric_type, value };
    },
  },

  flashcard_session: {
    description: 'Start a flashcard review session using spaced repetition. Fetches cards due for review (next_review <= now) from IndexedDB. Sofia presents each card by voice and the student answers. After each answer, call update_flashcard. Use when the student says "review my flashcards", "let\'s review", "flashcard session", or similar.',
    parameters: z.object({
      max_cards: z.number().min(5).max(30).default(10).describe('Maximum number of cards to review (default 10)'),
      focus_area: z.enum(['vocabulary', 'phrases', 'idioms', 'all']).default('all').describe('Focus area for the review session'),
    }),
    handler: async ({ max_cards, focus_area }: { max_cards: number; focus_area: 'vocabulary' | 'phrases' | 'idioms' | 'all' }) => {
      const db = await getDB();
      const now = new Date().toISOString();
      const allCards = await db.getAll('flashcards');

      const dueCards = allCards
        .filter((c) => c.nextReview <= now)
        .sort((a, b) => a.nextReview.localeCompare(b.nextReview))
        .slice(0, max_cards);

      if (dueCards.length === 0) {
        const nextCard = allCards
          .filter((c) => c.nextReview > now)
          .sort((a, b) => a.nextReview.localeCompare(b.nextReview))[0];

        return {
          cards: [],
          totalDue: 0,
          totalCards: allCards.length,
          message: nextCard
            ? `No cards due for review right now. Next review scheduled for ${new Date(nextCard.nextReview).toLocaleDateString()}.`
            : 'No flashcards yet. Cards are created automatically when you learn new vocabulary during our conversations.',
        };
      }

      return {
        cards: dueCards.map((c) => ({
          word: c.word,
          translation: c.translation,
          context: c.context,
          interval: c.interval,
        })),
        totalDue: dueCards.length,
        totalCards: allCards.length,
        focus_area,
        instructions: [
          'Present each flashcard one at a time by voice.',
          'Say the word in the target language and ask the student to provide the translation or use it in a sentence.',
          'After the student responds, call update_flashcard with the word and whether the answer was correct.',
          'Give brief feedback: confirm correct answers, gently provide the translation for wrong ones with the context sentence.',
          'At the end, summarize the results: total correct, total wrong, and encouragement.',
        ],
      };
    },
  },

  update_flashcard: {
    description: 'Update a flashcard after the student reviews it. Recalculates the next review interval using the SM-2 spaced repetition algorithm. Called after each flashcard answer during a flashcard_session.',
    type: 'background' as const,
    parameters: z.object({
      word: z.string().describe('The flashcard word that was reviewed'),
      correct: z.boolean().describe('Whether the student answered correctly'),
    }),
    handler: async ({ word, correct }: { word: string; correct: boolean }) => {
      const db = await getDB();
      const allCards = await db.getAll('flashcards');
      const card = allCards.find((c) => c.word === word);

      if (!card) return { updated: false, reason: `Flashcard not found: ${word}` };

      const { nextInterval, nextEaseFactor, nextReviewDate } = calculateNextReview(
        correct,
        card.interval,
        card.easeFactor,
      );

      const updated: Flashcard = {
        ...card,
        interval: nextInterval,
        easeFactor: nextEaseFactor,
        nextReview: nextReviewDate,
      };

      await db.put('flashcards', updated);

      return {
        updated: true,
        word,
        correct,
        nextInterval,
        nextReviewDate: new Date(nextReviewDate).toLocaleDateString(),
      };
    },
  },

  add_flashcard: {
    description: 'Add a new flashcard for spaced repetition review. Call this automatically whenever you teach the student a new word, phrase, or idiom during conversation. The card will appear in future flashcard review sessions.',
    type: 'background' as const,
    parameters: z.object({
      word: z.string().describe('The word or phrase in the target language'),
      translation: z.string().describe('Translation in the student native language'),
      context_sentence: z.string().describe('An example sentence using the word'),
      difficulty: z.enum(['easy', 'medium', 'hard']).describe('Estimated difficulty for the student'),
    }),
    handler: async ({ word, translation, context_sentence, difficulty }: {
      word: string;
      translation: string;
      context_sentence: string;
      difficulty: 'easy' | 'medium' | 'hard';
    }) => {
      const db = await getDB();
      const allCards = await db.getAll('flashcards');
      const existing = allCards.find((c) => c.word.toLowerCase() === word.toLowerCase());

      if (existing) return { added: false, reason: `Flashcard already exists for "${word}"` };

      const initialEase = difficulty === 'easy' ? 2.8 : difficulty === 'medium' ? 2.5 : 2.2;

      const card: Flashcard = {
        id: crypto.randomUUID(),
        word,
        translation,
        context: context_sentence,
        nextReview: new Date().toISOString(),
        interval: 0,
        easeFactor: initialEase,
        createdAt: new Date().toISOString(),
      };

      await db.put('flashcards', card);

      return { added: true, id: card.id, word, nextReview: 'now' };
    },
  },

  log_vocabulary_usage: {
    description: 'Silently log new or notable vocabulary used by the student during conversation. Call this when the student uses new words, advanced vocabulary, or words from previous lessons.',
    type: 'background' as const,
    parameters: z.object({
      words: z.array(z.string()).describe('List of vocabulary words used by the student'),
      context: z.string().describe('The sentence or context in which the words were used'),
      is_new: z.boolean().describe('Whether these are new words the student has not used before'),
    }),
    handler: async ({ words, context, is_new }: { words: string[]; context: string; is_new: boolean }) => {
      const sessionId = sessionContext.getSessionId();
      const key = 'vocabulary_usage';
      const existing = JSON.parse(localStorage.getItem(key) ?? '[]') as unknown[];
      const entry = { words, context, is_new, sessionId, timestamp: new Date().toISOString() };
      const updated = [...existing, entry].slice(-500);
      localStorage.setItem(key, JSON.stringify(updated));
      return { logged: true, wordsCount: words.length, is_new };
    },
  },
});
