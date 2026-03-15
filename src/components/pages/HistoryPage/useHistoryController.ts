import { useEffect, useState } from 'react';
import { getDB, type SessionRecord } from '@/storage/idb';
import { exportAllData, importAllData } from '@/storage/exportImport';

export function useHistoryController() {
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    void loadSessions();
  }, []);

  async function loadSessions() {
    const db = await getDB();
    const all = await db.getAll('sessions');
    setSessions(all.sort((a, b) => b.startedAt.localeCompare(a.startedAt)));
  }

  async function handleExport() {
    const json = await exportAllData();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `voice-ai-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleImport() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      const text = await file.text();
      await importAllData(text);
      await loadSessions();
    };
    input.click();
  }

  async function handleDeleteSession(id: string) {
    const db = await getDB();
    await db.delete('sessions', id);
    setSessions((prev) => prev.filter((s) => s.id !== id));
  }

  const toggleExpanded = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return {
    sessions,
    expandedId,
    toggleExpanded,
    handleExport,
    handleImport,
    handleDeleteSession,
  };
}
