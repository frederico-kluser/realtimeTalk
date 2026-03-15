import type { SessionRecord } from '@/storage/idb';
import { formatCost } from '@/utils/costEstimator';
import { ChevronDownIcon } from '@/components/atoms/icons';

interface SessionCardProps {
  session: SessionRecord;
  isExpanded: boolean;
  onToggle: () => void;
  onDelete: () => void;
}

function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
}

export function SessionCard({ session, isExpanded, onToggle, onDelete }: SessionCardProps) {
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-800/50"
      >
        <div>
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {new Date(session.startedAt).toLocaleDateString()}{' '}
            {new Date(session.startedAt).toLocaleTimeString()}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {session.model} · {formatDuration(session.durationMs)} · {session.transcript.length}{' '}
            messages · {formatCost(session.estimatedCostUsd)}
          </p>
        </div>
        <ChevronDownIcon className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
      </button>

      {isExpanded && (
        <div className="px-4 pb-3 border-t border-gray-100 dark:border-gray-700/50">
          <div className="mt-2 space-y-2 max-h-60 overflow-y-auto">
            {session.transcript.map((entry, i) => (
              <div
                key={i}
                className={`text-sm ${
                  entry.role === 'user'
                    ? 'text-indigo-600 dark:text-indigo-400'
                    : 'text-gray-700 dark:text-gray-300'
                }`}
              >
                <span className="font-medium">{entry.role === 'user' ? 'You' : 'AI'}:</span>{' '}
                {entry.text}
              </div>
            ))}
          </div>
          <button
            onClick={onDelete}
            className="mt-2 text-xs text-red-500 hover:text-red-600"
          >
            Delete session
          </button>
        </div>
      )}
    </div>
  );
}
