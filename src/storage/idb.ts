import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { PersonalityConfig } from '@/personality/types';

export interface TranscriptEntry {
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export interface TutorReport {
  readonly summary: string;
  readonly correctionsCount: number;
  readonly newVocabulary: readonly string[];
  readonly score?: number;
  readonly level?: string;
}

export interface SessionRecord {
  id: string;
  startedAt: string;
  endedAt: string;
  model: string;
  durationMs: number;
  totalTokens: number;
  estimatedCostUsd: number;
  transcript: TranscriptEntry[];
  actionsTriggered: string[];
  personalityId?: string;
  tutorReport?: TutorReport;
}

export interface MemoryRecord {
  id: string;
  fact: string;
  source: string;
  createdAt: string;
  relevanceScore?: number;
}

// --- Language Tutor Stores ---

export interface StudentProfile {
  readonly id: string;
  readonly level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  readonly scores: readonly number[];
  readonly knownWords: number;
  readonly avgScore: number;
  readonly lastSession: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface VocabularyEntry {
  readonly id: string;
  readonly word: string;
  readonly correct: boolean;
  readonly category: string;
  readonly timestamp: string;
  readonly sessionId?: string;
}

export interface CorrectionEntry {
  readonly id: string;
  readonly original: string;
  readonly corrected: string;
  readonly rule: string;
  readonly severity: 'low' | 'medium' | 'high';
  readonly sessionId: string;
  readonly timestamp: string;
}

export interface Flashcard {
  readonly id: string;
  readonly word: string;
  readonly translation: string;
  readonly context: string;
  readonly nextReview: string;
  readonly interval: number;
  readonly easeFactor: number;
  readonly createdAt: string;
}

export interface GamificationData {
  readonly id: string;
  readonly points: number;
  readonly streak: number;
  readonly achievements: readonly string[];
  readonly lastActive: string;
}

interface VoiceAIDB extends DBSchema {
  sessions: {
    key: string;
    value: SessionRecord;
    indexes: { 'by-date': string };
  };
  memories: {
    key: string;
    value: MemoryRecord;
    indexes: { 'by-date': string };
  };
  personalities: {
    key: string;
    value: PersonalityConfig;
  };
  student_profile: {
    key: string;
    value: StudentProfile;
  };
  vocabulary: {
    key: string;
    value: VocabularyEntry;
    indexes: { 'by-word': string; 'by-session': string };
  };
  corrections: {
    key: string;
    value: CorrectionEntry;
    indexes: { 'by-session': string; 'by-date': string };
  };
  flashcards: {
    key: string;
    value: Flashcard;
    indexes: { 'by-next-review': string };
  };
  gamification: {
    key: string;
    value: GamificationData;
  };
}

let dbPromise: Promise<IDBPDatabase<VoiceAIDB>> | null = null;

export function getDB(): Promise<IDBPDatabase<VoiceAIDB>> {
  if (!dbPromise) {
    dbPromise = openDB<VoiceAIDB>('voice-ai-app', 2, {
      upgrade(db, oldVersion) {
        if (oldVersion < 1) {
          const sessions = db.createObjectStore('sessions', { keyPath: 'id' });
          sessions.createIndex('by-date', 'startedAt');
          const memories = db.createObjectStore('memories', { keyPath: 'id' });
          memories.createIndex('by-date', 'createdAt');
          db.createObjectStore('personalities', { keyPath: 'id' });
        }

        if (oldVersion < 2) {
          db.createObjectStore('student_profile', { keyPath: 'id' });

          const vocabulary = db.createObjectStore('vocabulary', { keyPath: 'id' });
          vocabulary.createIndex('by-word', 'word');
          vocabulary.createIndex('by-session', 'sessionId');

          const corrections = db.createObjectStore('corrections', { keyPath: 'id' });
          corrections.createIndex('by-session', 'sessionId');
          corrections.createIndex('by-date', 'timestamp');

          const flashcards = db.createObjectStore('flashcards', { keyPath: 'id' });
          flashcards.createIndex('by-next-review', 'nextReview');

          db.createObjectStore('gamification', { keyPath: 'id' });
        }
      },
    });
  }
  return dbPromise;
}
