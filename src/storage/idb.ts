import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { PersonalityConfig } from '@/personality/types';

export interface TranscriptEntry {
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
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
}

export interface MemoryRecord {
  id: string;
  fact: string;
  source: string;
  createdAt: string;
  relevanceScore?: number;
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
}

let dbPromise: Promise<IDBPDatabase<VoiceAIDB>> | null = null;

export function getDB(): Promise<IDBPDatabase<VoiceAIDB>> {
  if (!dbPromise) {
    dbPromise = openDB<VoiceAIDB>('voice-ai-app', 1, {
      upgrade(db) {
        const sessions = db.createObjectStore('sessions', { keyPath: 'id' });
        sessions.createIndex('by-date', 'startedAt');
        const memories = db.createObjectStore('memories', { keyPath: 'id' });
        memories.createIndex('by-date', 'createdAt');
        db.createObjectStore('personalities', { keyPath: 'id' });
      },
    });
  }
  return dbPromise;
}
