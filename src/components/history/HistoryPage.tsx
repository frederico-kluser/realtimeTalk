import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getDB, type SessionRecord } from '@/storage/idb';
import { formatCost } from '@/utils/costEstimator';
import { exportAllData, importAllData } from '@/storage/exportImport';

export function HistoryPage() {
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
    setSessions(prev => prev.filter(s => s.id !== id));
  }

  function formatDuration(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  }

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-gray-900">
      <header className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Session History</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => void handleExport()}
            className="text-xs px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            Export
          </button>
          <button
            onClick={() => void handleImport()}
            className="text-xs px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            Import
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        {sessions.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-600">
            <p>No sessions yet. Start a conversation!</p>
          </div>
        ) : (
          sessions.map(session => (
            <div
              key={session.id}
              className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
            >
              <button
                onClick={() => setExpandedId(expandedId === session.id ? null : session.id)}
                className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-800/50"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {new Date(session.startedAt).toLocaleDateString()} {new Date(session.startedAt).toLocaleTimeString()}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {session.model} · {formatDuration(session.durationMs)} · {session.transcript.length} messages · {formatCost(session.estimatedCostUsd)}
                  </p>
                </div>
                <svg
                  className={`w-4 h-4 text-gray-400 transition-transform ${expandedId === session.id ? 'rotate-180' : ''}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {expandedId === session.id && (
                <div className="px-4 pb-3 border-t border-gray-100 dark:border-gray-700/50">
                  <div className="mt-2 space-y-2 max-h-60 overflow-y-auto">
                    {session.transcript.map((entry, i) => (
                      <div key={i} className={`text-sm ${entry.role === 'user' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-700 dark:text-gray-300'}`}>
                        <span className="font-medium">{entry.role === 'user' ? 'You' : 'AI'}:</span> {entry.text}
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => void handleDeleteSession(session.id)}
                    className="mt-2 text-xs text-red-500 hover:text-red-600"
                  >
                    Delete session
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
