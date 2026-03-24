export const en = {
  // Common
  save: 'Save',
  cancel: 'Cancel',
  delete: 'Delete',
  back: 'Back',
  close: 'Close',
  loading: 'Loading...',
  export: 'Export',
  import: 'Import',
  language: 'Language',

  // Conversation Page
  voiceAi: 'Voice AI',
  settings: 'Settings',
  history: 'History',
  startConversation: 'Start Conversation',
  endSession: 'End Session',
  connecting: 'Connecting...',
  pausedMessage: 'Paused — AI and microphone are on hold',
  resumeConversation: 'Resume conversation',
  pauseConversation: 'Pause conversation',
  emptyTranscript: 'Start speaking to begin a conversation...',
  actions: 'Actions',
  you: 'You',
  ai: 'AI',

  // Status
  statusIdle: 'Idle',
  statusConnecting: 'Connecting...',
  statusConnected: 'Connected',
  statusListening: 'Listening...',
  statusThinking: 'Thinking...',
  statusSpeaking: 'Speaking...',
  statusError: 'Error',
  statusDisconnected: 'Disconnected',

  // Settings Page
  settingsTitle: 'Settings',
  apiKeyByok: 'API Key (BYOK)',
  apiKeyDescription: 'Your API key is stored in memory only. Optionally encrypt and persist it with a passphrase.',
  saveToMemory: 'Save to Memory',
  encryptionPassphrase: 'Encryption passphrase',
  encryptAndSave: 'Encrypt & Save',
  loadSavedKey: 'Load Saved Key',
  clearAllKeyData: 'Clear All Key Data',
  about: 'About',
  aboutDescription: 'Voice AI App uses WebRTC to connect directly to OpenAI\'s Realtime API. No backend, no data stored on servers. Your API key never leaves your browser.',
  aboutEncryption: 'Encryption uses AES-256-GCM with PBKDF2 key derivation (100K iterations).',
  apiKeySaved: 'API key saved to memory.',
  enterPassphrase: 'Please enter a passphrase.',
  apiKeyEncrypted: 'API key encrypted and saved to localStorage.',
  enterYourPassphrase: 'Please enter your passphrase.',
  apiKeyLoaded: 'API key loaded from encrypted storage.',
  decryptFailed: 'Failed to decrypt. Wrong passphrase or no saved key.',
  apiKeyCleared: 'API key cleared from memory and storage.',

  // Conversation Settings
  apiKey: 'API Key',
  model: 'Model',
  voice: 'Voice',
  vad: 'VAD',
  personality: 'Personality',
  newPersonality: '+ New Personality',
  helpModel: 'Choose the AI model for voice conversation.\n\n• GPT Realtime — Full model, most capable\n• GPT Realtime Mini — Faster, lower cost\n• GPT Realtime 1.5 — Latest generation',
  helpVoice: 'Select the AI voice. Each voice has a distinct tone and character. Try different voices to find the best fit for your personality.',
  helpVad: 'Voice Activity Detection (VAD) controls how eagerly the AI detects that you finished speaking.\n\n• Low — Waits longer before responding (good for thoughtful conversations)\n• Medium — Balanced timing\n• High — Responds quickly (good for rapid Q&A)\n• Auto — Let the model decide',
  helpPersonality: 'Choose a personality profile that defines how the AI behaves, speaks, and responds. You can create custom personalities with file context in the editor.',
  vadAuto: 'Auto',
  vadLow: 'Low',
  vadMedium: 'Medium',
  vadHigh: 'High',

  // History Page
  sessionHistory: 'Session History',
  noSessions: 'No sessions yet. Start a conversation!',
  deleteSession: 'Delete session',
  messages: 'messages',

  // Personality Editor
  personalityEditor: 'Personality Editor',
  basicInfo: 'Basic Info',
  personalityName: 'Personality name',
  basicInfoDescription: 'Give your personality a memorable name that reflects its character and purpose.',
  identity: 'Identity',
  identityDescription: 'Define who the AI character is. This shapes how it introduces itself and interacts with users.',
  characterName: 'Character name',
  rolePlaceholder: "Role (e.g., 'Tech Support Specialist')",
  backstory: 'Backstory',
  backstoryPlaceholder: 'Write a brief backstory that gives context to this personality...',
  addExpertise: 'Add expertise (Enter)',
  voiceSection: 'Voice & Style',
  voiceDescription: 'Configure how the AI sounds and communicates. The voice model affects the actual voice, while tone and verbosity shape the speaking style.',
  tonePlaceholder: "Tone (e.g., 'friendly, clear, empathetic')",
  verbosityConcise: 'Concise',
  verbosityModerate: 'Moderate',
  verbosityDetailed: 'Detailed',
  rules: 'Rules & Boundaries',
  rulesDescription: 'Set clear guidelines for what the AI should always or never do. This ensures consistent behavior.',
  scopePlaceholder: 'Define the scope and purpose of this assistant...',
  alwaysDoPlaceholder: 'Always do... (Enter)',
  neverDoPlaceholder: 'Never do... (Enter)',
  fileContext: 'File Context',
  fileContextDescription: 'Attach readable files (txt, md, json, csv, code, etc.) as reference context for this personality. Max 500KB per file.',
  attachFiles: '+ Attach Files',
  deflectionResponses: 'Deflection Responses',
  deflectionDescription: 'Define how the AI responds when asked about topics outside its scope, when challenged about its identity, or when it doesn\'t know the answer.',
  outOfScopePlaceholder: 'Out of scope response',
  jailbreakPlaceholder: 'Identity challenge response',
  unknownPlaceholder: 'Unknown answer response',
  fileNotReadable: 'File "{name}" is not a readable text file.',
  fileTooBig: 'File "{name}" exceeds 500KB limit.',

  // FAQ
  faq: 'FAQ',
  faqTitle: 'Frequently Asked Questions',
  faqItems: [
    {
      question: 'What is RealtimeTalk?',
      answer: 'RealtimeTalk is a 100% client-side web application that enables real-time voice conversations with OpenAI\'s AI models. It connects directly from your browser via WebRTC — no backend, no remote database, no server-side authentication required.',
    },
    {
      question: 'Is my API key safe?',
      answer: 'Yes. Your API key never leaves your browser. It is stored only in memory during the session. You can optionally encrypt it with AES-256-GCM using a passphrase and store it locally. No data is sent to any server other than OpenAI.',
    },
    {
      question: 'What does BYOK mean?',
      answer: 'BYOK stands for "Bring Your Own Key". You need your own OpenAI API key with Realtime API access to use this application. This means you pay OpenAI directly for usage — there are no intermediary costs.',
    },
    {
      question: 'Which browsers are supported?',
      answer: 'Any modern browser with WebRTC and getUserMedia support: Chrome, Edge, Firefox, and Safari 15+. HTTPS is required in production for microphone access and the Web Crypto API.',
    },
    {
      question: 'Can I use this offline?',
      answer: 'The app itself works as a PWA and can be installed on your device. However, voice conversations require an internet connection to communicate with OpenAI\'s Realtime API.',
    },
    {
      question: 'How does cost estimation work?',
      answer: 'Cost is estimated per session based on input/output text and audio tokens. The calculation uses OpenAI\'s published pricing for each model. Note: these are estimates and may differ slightly from your actual OpenAI bill.',
    },
    {
      question: 'Can I create custom AI personalities?',
      answer: 'Yes! Use the Personality Editor to create custom personalities with identity, voice settings, rules, file contexts, and deflection responses. You can also attach reference files to give the AI additional context.',
    },
    {
      question: 'Is my conversation data stored anywhere?',
      answer: 'All data is stored locally in your browser using IndexedDB and localStorage. Audio is never recorded — only text transcriptions are saved. You can export/import your data as JSON for backup.',
    },
  ] as Array<{ question: string; answer: string }>,

  // Context Modal
  contextModalTitle: 'Conversation Context',
  contextModalDescription: 'Provide optional context for this conversation. This helps the AI understand the situation and respond more accurately.',
  contextModalPlaceholder: 'E.g.: "I need help debugging a React component" or "Let\'s practice French conversation about traveling"...',
  contextModalStart: 'Start Conversation',
  contextModalSkip: 'Skip',

  // Resume conversation
  resumeSession: 'Continue',
  resumeSessionTooltip: 'Continue this conversation',

  // Edit personality
  editPersonality: 'Edit',

  // Settings descriptions
  settingsSecurityTitle: 'Security & Privacy',
  settingsSecurityDescription: 'Your API key is stored only in your browser\'s memory during the active session. It is never sent to any server other than OpenAI. For persistent storage, you can encrypt it with AES-256-GCM using a passphrase of your choice. The encryption uses PBKDF2 key derivation with 100,000 iterations, a random 16-byte salt, and a random 12-byte IV — making it extremely resistant to brute-force attacks.',
  settingsHowItWorks: 'How It Works',
  settingsHowItWorksDescription: 'RealtimeTalk connects your browser directly to OpenAI\'s Realtime API via WebRTC. There is no backend, no proxy, and no intermediary server. Audio from your microphone is streamed directly to OpenAI, and the AI\'s voice response is played back in real time. All session data (transcripts, memories, personalities) is stored locally in your browser using IndexedDB and localStorage.',
  settingsDataOwnership: 'Data Ownership',
  settingsDataOwnershipDescription: 'You own 100% of your data. Nothing is stored on external servers. You can export all your data (sessions, memories, personalities) as a JSON file at any time from the History page, and import it back to restore your data on any device.',

  // Language selector
  languageEnglish: 'English',
  languagePortuguese: 'Português',

  // Teacher Page
  teacherWelcome: 'Hi! I\'m Sofia, your English tutor',
  teacherWelcomeDesc: 'Practice English through real-time voice conversations. I\'ll adapt to your level and help you improve step by step.',
  teacherChooseActivity: 'What would you like to practice?',
  teacherYourLevel: 'Your level',
  teacherDayStreak: 'day streak',
  teacherActivities: 'Activities',
  teacherSelectAnswer: 'Tap your answer:',
  teacherRepeatPhrase: 'Repeat this phrase:',
  teacherSpeakNow: 'Speak now into your microphone...',
  teacherDictationActive: 'Dictation in progress',
  teacherListening: 'Listening...',
  teacherSkipTutorial: 'Skip',
  teacherNext: 'Next',
  teacherGetStarted: 'Get Started',

  // Teacher Actions
  teacherAction_free: 'Free Talk',
  teacherAction_quiz: 'Vocabulary Quiz',
  teacherAction_roleplay: 'Roleplay',
  teacherAction_pronunciation: 'Pronunciation',
  teacherAction_dictation: 'Dictation',
  teacherAction_flashcards: 'Flashcards',
  teacherAction_debate: 'Debate',

  // Teacher Quick Action Commands
  teacherQuiz: 'Start a vocabulary quiz',
  teacherRoleplay: 'Let\'s do a roleplay scenario',
  teacherPronunciation: 'I want to practice pronunciation',
  teacherDictation: 'Let\'s do a dictation exercise',
  teacherFlashcards: 'Let\'s review my flashcards',
  teacherDebate: 'Let\'s have a debate',

  // Tutorial Steps
  tutorialStep1Title: 'Welcome to Sofia English Tutor!',
  tutorialStep1Desc: 'Sofia is your AI-powered English tutor. She\'ll help you practice speaking, improve grammar, expand vocabulary, and build confidence — all through natural voice conversations.',
  tutorialStep2Title: 'Set Up Your API Key',
  tutorialStep2Desc: 'Click the settings icon (gear) to enter your OpenAI API key. Your key stays in your browser and is never sent to any server other than OpenAI.',
  tutorialStep3Title: 'Choose an Activity',
  tutorialStep3Desc: 'Start a free conversation or pick a specific activity: vocabulary quizzes, roleplays, pronunciation drills, dictation, flashcards, or debates.',
  tutorialStep4Title: 'Interactive Challenges',
  tutorialStep4Desc: 'During quizzes, you\'ll see answer buttons appear on screen. You can tap them or answer by voice — whatever feels natural!',
  tutorialStep5Title: 'Track Your Progress',
  tutorialStep5Desc: 'Sofia remembers your level, tracks your streak, and awards points. Your progress is saved automatically between sessions. Let\'s start learning!',
};

export type Translations = typeof en;
export type TranslationKey = keyof Translations;
