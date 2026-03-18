export const en = {
  // Common
  save: 'Save',
  cancel: 'Cancel',
  close: 'Close',
  loading: 'Loading...',
  language: 'Language',

  // App
  appTitle: 'Financial Sheets',
  settings: 'Settings',

  // Voice
  startVoice: 'Start Voice Assistant',
  endSession: 'End Session',
  connecting: 'Connecting...',
  pausedMessage: 'Paused — AI and microphone are on hold',
  resumeVoice: 'Resume voice',
  pauseVoice: 'Pause voice',

  // Spreadsheet
  importXlsx: 'Import XLSX',
  transcript: 'Transcript',
  emptyTranscript: 'Start speaking to manage your spreadsheet...',
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

  // Settings
  apiKey: 'API Key',
  voice: 'Voice',
  vad: 'VAD',
  vadAuto: 'Auto',
  vadLow: 'Low',
  vadMedium: 'Medium',
  vadHigh: 'High',

  // Language selector
  languageEnglish: 'English',
  languagePortuguese: 'Português',
};

export type Translations = typeof en;
export type TranslationKey = keyof Translations;
