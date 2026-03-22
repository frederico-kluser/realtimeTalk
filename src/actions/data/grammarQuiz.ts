export interface QuizQuestion {
  readonly question: string;
  readonly options: readonly [string, string, string, string];
  readonly correct_index: 0 | 1 | 2 | 3;
  readonly explanation: string;
}

export type QuizTopic = 'grammar' | 'vocabulary' | 'idioms' | 'prepositions' | 'tenses';
export type QuizDifficulty = 'beginner' | 'intermediate' | 'advanced';

const BANK: Record<QuizTopic, Record<QuizDifficulty, readonly QuizQuestion[]>> = {
  grammar: {
    beginner: [
      {
        question: 'Which sentence is correct?',
        options: ["She don't like coffee.", "She doesn't like coffee.", "She not like coffee.", "She no like coffee."],
        correct_index: 1,
        explanation: "With third-person singular (she/he/it), we use 'doesn't' for negation in the simple present.",
      },
      {
        question: 'Choose the correct sentence.',
        options: ['He have a car.', 'He has a car.', 'He having a car.', 'He haves a car.'],
        correct_index: 1,
        explanation: "'Has' is the correct third-person singular form of 'have' in the simple present.",
      },
      {
        question: 'Which is correct?',
        options: ['There is many books.', 'There are many books.', 'There am many books.', 'There be many books.'],
        correct_index: 1,
        explanation: "'There are' is used with plural countable nouns like 'books'.",
      },
      {
        question: 'Choose the correct form.',
        options: ['I am agree with you.', 'I agree with you.', 'I am agreeing with you.', 'I do agree to you.'],
        correct_index: 1,
        explanation: "'Agree' is a stative verb used in simple present without 'am' before it.",
      },
    ],
    intermediate: [
      {
        question: 'Which sentence uses the correct word order?',
        options: [
          'She always is late.',
          'She is always late.',
          'Always she is late.',
          'She is late always.',
        ],
        correct_index: 1,
        explanation: "Adverbs of frequency go after the verb 'be' but before other verbs.",
      },
      {
        question: 'Choose the correct sentence.',
        options: [
          'If I would know, I would tell you.',
          'If I knew, I would tell you.',
          'If I know, I would tell you.',
          'If I knowed, I would tell you.',
        ],
        correct_index: 1,
        explanation: "Second conditional uses 'if + past simple, would + base verb'.",
      },
      {
        question: 'Which is grammatically correct?',
        options: [
          'The informations are useful.',
          'The information is useful.',
          'The informations is useful.',
          'The information are useful.',
        ],
        correct_index: 1,
        explanation: "'Information' is an uncountable noun and takes a singular verb.",
      },
      {
        question: 'Choose the correct relative clause.',
        options: [
          'The man which called is my boss.',
          'The man who called is my boss.',
          'The man whom called is my boss.',
          'The man whose called is my boss.',
        ],
        correct_index: 1,
        explanation: "'Who' is used as a subject pronoun for people in relative clauses.",
      },
    ],
    advanced: [
      {
        question: 'Which sentence correctly uses the subjunctive?',
        options: [
          'I suggest that he goes home.',
          'I suggest that he go home.',
          'I suggest that he will go home.',
          'I suggest that he is going home.',
        ],
        correct_index: 1,
        explanation: "After 'suggest', the subjunctive uses the base form of the verb without conjugation.",
      },
      {
        question: 'Choose the correct inversion.',
        options: [
          'Not only she finished the project, but she also won an award.',
          'Not only did she finish the project, but she also won an award.',
          'Not only she did finish the project, but she also won an award.',
          'Not only finished she the project, but she also won an award.',
        ],
        correct_index: 1,
        explanation: "After negative adverbials like 'Not only', we use subject-auxiliary inversion.",
      },
      {
        question: 'Which sentence is correct?',
        options: [
          'Had I known, I would have helped.',
          'If had I known, I would have helped.',
          'Had I knew, I would have helped.',
          'I had known, I would have helped.',
        ],
        correct_index: 0,
        explanation: "In formal English, the third conditional can omit 'if' by inverting 'had' and the subject.",
      },
      {
        question: 'Choose the correct cleft sentence.',
        options: [
          'It was the manager which approved the plan.',
          'It was the manager who approved the plan.',
          'It was the manager whom approved the plan.',
          'It is the manager what approved the plan.',
        ],
        correct_index: 1,
        explanation: "In cleft sentences, 'who' is used for people as the subject of the relative clause.",
      },
    ],
  },

  vocabulary: {
    beginner: [
      {
        question: 'What does "purchase" mean?',
        options: ['To sell', 'To buy', 'To borrow', 'To steal'],
        correct_index: 1,
        explanation: "'Purchase' is a formal synonym of 'buy'.",
      },
      {
        question: 'Which word means "very happy"?',
        options: ['Sad', 'Angry', 'Delighted', 'Tired'],
        correct_index: 2,
        explanation: "'Delighted' means extremely pleased or very happy.",
      },
      {
        question: 'What is the opposite of "ancient"?',
        options: ['Old', 'Modern', 'Big', 'Famous'],
        correct_index: 1,
        explanation: "'Modern' is the opposite of 'ancient', which means very old.",
      },
      {
        question: 'What does "beneath" mean?',
        options: ['Above', 'Next to', 'Under', 'Behind'],
        correct_index: 2,
        explanation: "'Beneath' means under or below something.",
      },
    ],
    intermediate: [
      {
        question: 'What does "reluctant" mean?',
        options: ['Eager', 'Hesitant', 'Excited', 'Confident'],
        correct_index: 1,
        explanation: "'Reluctant' means unwilling or hesitant to do something.",
      },
      {
        question: 'Choose the correct synonym for "abandon".',
        options: ['Keep', 'Protect', 'Forsake', 'Maintain'],
        correct_index: 2,
        explanation: "'Forsake' means to abandon or leave behind, similar to 'abandon'.",
      },
      {
        question: 'What does "thorough" mean?',
        options: ['Quick', 'Careless', 'Complete and detailed', 'Simple'],
        correct_index: 2,
        explanation: "'Thorough' means complete with attention to every detail.",
      },
      {
        question: 'Which word means "to make something smaller or less"?',
        options: ['Enhance', 'Diminish', 'Amplify', 'Expand'],
        correct_index: 1,
        explanation: "'Diminish' means to make or become less, smaller, or weaker.",
      },
    ],
    advanced: [
      {
        question: 'What does "ubiquitous" mean?',
        options: ['Rare', 'Found everywhere', 'Invisible', 'Unique'],
        correct_index: 1,
        explanation: "'Ubiquitous' means present, appearing, or found everywhere.",
      },
      {
        question: 'Choose the correct meaning of "pragmatic".',
        options: ['Idealistic', 'Dealing with things practically', 'Theoretical', 'Emotional'],
        correct_index: 1,
        explanation: "'Pragmatic' means dealing with things in a practical rather than theoretical way.",
      },
      {
        question: 'What does "ephemeral" mean?',
        options: ['Eternal', 'Lasting a very short time', 'Significant', 'Predictable'],
        correct_index: 1,
        explanation: "'Ephemeral' means lasting for a very short time; transient.",
      },
      {
        question: 'Which word means "a feeling of listlessness and dissatisfaction"?',
        options: ['Euphoria', 'Malaise', 'Serenity', 'Resilience'],
        correct_index: 1,
        explanation: "'Malaise' is a general feeling of discomfort, unease, or lack of well-being.",
      },
    ],
  },

  idioms: {
    beginner: [
      {
        question: 'What does "break the ice" mean?',
        options: [
          'To literally break ice',
          'To make people feel more comfortable',
          'To start a fight',
          'To cool down',
        ],
        correct_index: 1,
        explanation: "'Break the ice' means to do something to relieve tension or get a conversation started.",
      },
      {
        question: 'What does "piece of cake" mean?',
        options: ['A dessert', 'Something very easy', 'Something expensive', 'A small portion'],
        correct_index: 1,
        explanation: "'Piece of cake' means something that is very easy to do.",
      },
      {
        question: 'What does "hit the sack" mean?',
        options: ['To punch a bag', 'To go to bed', 'To leave quickly', 'To exercise'],
        correct_index: 1,
        explanation: "'Hit the sack' is an informal expression meaning to go to bed or go to sleep.",
      },
      {
        question: 'What does "under the weather" mean?',
        options: ['Outside in the rain', 'Feeling ill', 'In a bad mood', 'Being unlucky'],
        correct_index: 1,
        explanation: "'Under the weather' means feeling slightly ill or unwell.",
      },
    ],
    intermediate: [
      {
        question: 'What does "bite the bullet" mean?',
        options: [
          'To eat something hard',
          'To face a difficult situation bravely',
          'To make a mistake',
          'To speak loudly',
        ],
        correct_index: 1,
        explanation: "'Bite the bullet' means to endure a painful or difficult situation with courage.",
      },
      {
        question: 'What does "let the cat out of the bag" mean?',
        options: [
          'To free an animal',
          'To reveal a secret',
          'To cause trouble',
          'To be careless',
        ],
        correct_index: 1,
        explanation: "'Let the cat out of the bag' means to accidentally reveal a secret.",
      },
      {
        question: 'What does "cost an arm and a leg" mean?',
        options: [
          'To cause physical pain',
          'To be very expensive',
          'To require hard work',
          'To be impossible',
        ],
        correct_index: 1,
        explanation: "'Cost an arm and a leg' means to be extremely expensive.",
      },
      {
        question: 'What does "the ball is in your court" mean?',
        options: [
          'You need to play tennis',
          "It's your turn to make a decision",
          'You won the game',
          'You are in trouble',
        ],
        correct_index: 1,
        explanation: "'The ball is in your court' means it is now your responsibility to take action or make a decision.",
      },
    ],
    advanced: [
      {
        question: 'What does "a red herring" mean?',
        options: [
          'A type of fish',
          'Something that misleads or distracts',
          'An embarrassing mistake',
          'A warning sign',
        ],
        correct_index: 1,
        explanation: "'A red herring' is something that misleads or distracts from the relevant issue.",
      },
      {
        question: 'What does "burn the midnight oil" mean?',
        options: [
          'To waste resources',
          'To work late into the night',
          'To start a fire',
          'To rush through work',
        ],
        correct_index: 1,
        explanation: "'Burn the midnight oil' means to work late into the night, studying or working hard.",
      },
      {
        question: 'What does "a Pyrrhic victory" mean?',
        options: [
          'A great achievement',
          'A victory that comes at too great a cost',
          'An easy win',
          'A historical battle',
        ],
        correct_index: 1,
        explanation: "'A Pyrrhic victory' is a victory that inflicts such a devastating toll that it is tantamount to defeat.",
      },
      {
        question: 'What does "throw someone under the bus" mean?',
        options: [
          'To push someone physically',
          'To betray someone for personal gain',
          'To help someone escape',
          'To give someone a ride',
        ],
        correct_index: 1,
        explanation: "'Throw someone under the bus' means to sacrifice someone else for your own benefit, typically by blaming them.",
      },
    ],
  },

  prepositions: {
    beginner: [
      {
        question: 'Choose the correct preposition: "I live ___ Brazil."',
        options: ['at', 'in', 'on', 'to'],
        correct_index: 1,
        explanation: "We use 'in' with countries, cities, and large areas.",
      },
      {
        question: 'Choose the correct preposition: "The meeting is ___ Monday."',
        options: ['in', 'at', 'on', 'by'],
        correct_index: 2,
        explanation: "We use 'on' with specific days of the week and dates.",
      },
      {
        question: 'Choose the correct preposition: "She arrived ___ 3 o\'clock."',
        options: ['on', 'in', 'at', 'by'],
        correct_index: 2,
        explanation: "We use 'at' with specific times.",
      },
      {
        question: 'Choose the correct preposition: "The book is ___ the table."',
        options: ['in', 'at', 'on', 'to'],
        correct_index: 2,
        explanation: "We use 'on' when something is resting on a surface.",
      },
    ],
    intermediate: [
      {
        question: 'Choose the correct preposition: "She\'s been working here ___ 2015."',
        options: ['for', 'since', 'from', 'during'],
        correct_index: 1,
        explanation: "'Since' is used with a specific point in time (year, date, moment).",
      },
      {
        question: 'Choose the correct preposition: "He insisted ___ paying the bill."',
        options: ['in', 'on', 'at', 'for'],
        correct_index: 1,
        explanation: "'Insist on' is the correct verb-preposition collocation.",
      },
      {
        question: 'Choose the correct preposition: "I\'m not used ___ waking up early."',
        options: ['for', 'at', 'to', 'with'],
        correct_index: 2,
        explanation: "'Be used to' (+ gerund) means being accustomed to something.",
      },
      {
        question: 'Choose the correct preposition: "She apologized ___ being late."',
        options: ['about', 'for', 'of', 'to'],
        correct_index: 1,
        explanation: "'Apologize for' is the correct verb-preposition collocation.",
      },
    ],
    advanced: [
      {
        question: 'Choose the correct preposition: "The report was compiled ___ the basis of recent data."',
        options: ['in', 'at', 'on', 'by'],
        correct_index: 2,
        explanation: "'On the basis of' is a fixed expression meaning 'based on'.",
      },
      {
        question: 'Choose the correct preposition: "He refrained ___ making any comments."',
        options: ['of', 'from', 'against', 'to'],
        correct_index: 1,
        explanation: "'Refrain from' is the correct collocation meaning to hold back from doing something.",
      },
      {
        question: 'Choose the correct preposition: "The decision was made ___ accordance with company policy."',
        options: ['on', 'at', 'in', 'by'],
        correct_index: 2,
        explanation: "'In accordance with' is a fixed formal expression meaning 'following' or 'as required by'.",
      },
      {
        question: 'Choose the correct preposition: "She has a penchant ___ collecting antiques."',
        options: ['of', 'to', 'for', 'in'],
        correct_index: 2,
        explanation: "'A penchant for' means a strong liking or tendency toward something.",
      },
    ],
  },

  tenses: {
    beginner: [
      {
        question: 'Choose the correct form: "She ___ to school every day."',
        options: ['go', 'goes', 'going', 'gone'],
        correct_index: 1,
        explanation: "Third-person singular in the simple present takes the '-s' or '-es' ending.",
      },
      {
        question: 'Choose the correct past form: "I ___ a great movie last night."',
        options: ['watch', 'watches', 'watched', 'watching'],
        correct_index: 2,
        explanation: "'Watched' is the simple past tense of 'watch', used for completed actions in the past.",
      },
      {
        question: 'Choose the correct form: "They ___ playing soccer right now."',
        options: ['is', 'are', 'was', 'were'],
        correct_index: 1,
        explanation: "'Are' is the correct form of 'be' for the present continuous with 'they'.",
      },
      {
        question: 'Choose the correct form: "He ___ to Paris last summer."',
        options: ['go', 'goes', 'went', 'gone'],
        correct_index: 2,
        explanation: "'Went' is the irregular past tense form of 'go'.",
      },
    ],
    intermediate: [
      {
        question: 'Choose the correct tense: "I ___ in this city for ten years."',
        options: ['live', 'lived', 'have lived', 'am living'],
        correct_index: 2,
        explanation: "Present perfect ('have lived') is used for actions that started in the past and continue to the present.",
      },
      {
        question: 'Choose the correct form: "By the time she arrived, we ___ already ___."',
        options: ['have / left', 'had / left', 'has / left', 'were / leaving'],
        correct_index: 1,
        explanation: "Past perfect ('had left') is used for an action completed before another past action.",
      },
      {
        question: 'Choose the correct form: "This time tomorrow, I ___ on the beach."',
        options: ['will lie', 'will be lying', 'am lying', 'would lie'],
        correct_index: 1,
        explanation: "Future continuous ('will be lying') is used for actions in progress at a specific future time.",
      },
      {
        question: 'Choose the correct form: "She ___ English since she was five."',
        options: ['studies', 'studied', 'has been studying', 'is studying'],
        correct_index: 2,
        explanation: "Present perfect continuous is used for actions that started in the past and continue to the present, emphasizing duration.",
      },
    ],
    advanced: [
      {
        question: 'Choose the correct form: "By next June, they ___ married for 25 years."',
        options: [
          'will be',
          'will have been',
          'are going to be',
          'would have been',
        ],
        correct_index: 1,
        explanation: "Future perfect ('will have been') is used for actions that will be completed by a specific future time.",
      },
      {
        question: 'Choose the correct form: "I wish I ___ harder when I was in school."',
        options: ['study', 'studied', 'had studied', 'have studied'],
        correct_index: 2,
        explanation: "'Wish + past perfect' is used to express regret about a past situation.",
      },
      {
        question: 'Choose the correct form: "Hardly ___ the door when the phone rang."',
        options: [
          'I had opened',
          'had I opened',
          'I have opened',
          'did I open',
        ],
        correct_index: 1,
        explanation: "After 'Hardly', we use inversion (auxiliary + subject) with past perfect for emphasis.",
      },
      {
        question: 'Choose the correct form: "It\'s high time you ___ looking for a new job."',
        options: ['start', 'started', 'have started', 'would start'],
        correct_index: 1,
        explanation: "'It's high time' is followed by the past simple to express that something should have happened already.",
      },
    ],
  },
};

/**
 * Select random questions from the bank for a given topic and difficulty.
 * Uses Fisher-Yates shuffle on a copy to avoid bias.
 */
export const getRandomQuestions = (
  topic: QuizTopic,
  difficulty: QuizDifficulty,
  count: number,
): readonly QuizQuestion[] => {
  const pool = [...BANK[topic][difficulty]];

  // Fisher-Yates shuffle
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  return pool.slice(0, Math.min(count, pool.length));
};

/**
 * Select random questions across multiple topics.
 * Distributes count evenly across the requested topics.
 */
export const getRandomQuestionsMultiTopic = (
  topics: readonly QuizTopic[],
  difficulty: QuizDifficulty,
  count: number,
): readonly QuizQuestion[] => {
  const perTopic = Math.ceil(count / topics.length);
  const all = topics.flatMap((t) => [...getRandomQuestions(t, difficulty, perTopic)]);

  // Shuffle combined and trim to exact count
  for (let i = all.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [all[i], all[j]] = [all[j], all[i]];
  }

  return all.slice(0, count);
};
