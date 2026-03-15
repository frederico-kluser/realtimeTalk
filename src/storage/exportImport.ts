import { getDB, type SessionRecord, type MemoryRecord } from './idb';
import type { PersonalityConfig } from '@/personality/types';

interface ExportPayload {
  exportedAt: string;
  version: number;
  sessions: SessionRecord[];
  memories: MemoryRecord[];
  personalities: PersonalityConfig[];
}

export async function exportAllData(): Promise<string> {
  const db = await getDB();
  const [sessions, memories, personalities] = await Promise.all([
    db.getAll('sessions'),
    db.getAll('memories'),
    db.getAll('personalities'),
  ]);

  const payload: ExportPayload = {
    exportedAt: new Date().toISOString(),
    version: 1,
    sessions,
    memories,
    personalities,
  };

  return JSON.stringify(payload, null, 2);
}

export async function importAllData(jsonString: string): Promise<void> {
  const payload = JSON.parse(jsonString) as ExportPayload;
  const db = await getDB();
  const tx = db.transaction(['sessions', 'memories', 'personalities'], 'readwrite');

  for (const s of payload.sessions ?? []) {
    await tx.objectStore('sessions').put(s);
  }
  for (const m of payload.memories ?? []) {
    await tx.objectStore('memories').put(m);
  }
  for (const p of payload.personalities ?? []) {
    await tx.objectStore('personalities').put(p);
  }
  await tx.done;
}
