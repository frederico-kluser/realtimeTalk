import type { ActionLogEntry } from '@/hooks/useActionRegistry';

interface ActionLogPanelProps {
  entries: ActionLogEntry[];
}

export function ActionLogPanel({ entries }: ActionLogPanelProps) {
  if (entries.length === 0) return null;

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-2">
      <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">
        Actions
      </h3>
      <div className="space-y-1 max-h-32 overflow-y-auto">
        {entries.slice(0, 5).map((entry) => (
          <div
            key={entry.id}
            className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded px-2 py-1"
          >
            <span className="font-mono">{entry.name}</span>
            <span className={entry.type === 'background' ? 'text-gray-400' : 'text-green-500'}>
              {entry.durationMs.toFixed(0)}ms
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
