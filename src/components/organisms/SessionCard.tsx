import { motion, AnimatePresence } from 'motion/react';
import type { SessionRecord } from '@/storage/idb';
import { formatCost } from '@/utils/costEstimator';
import { ChevronDownIcon, ContinueIcon } from '@/components/atoms/icons';
import { useT } from '@/i18n';

interface SessionCardProps {
  session: SessionRecord;
  isExpanded: boolean;
  onToggle: () => void;
  onDelete: () => void;
  onResume: () => void;
}

function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
}

export function SessionCard({ session, isExpanded, onToggle, onDelete, onResume }: SessionCardProps) {
  const t = useT();

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
            {t.messages} · {formatCost(session.estimatedCostUsd)}
          </p>
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        >
          <ChevronDownIcon />
        </motion.div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="overflow-hidden"
          >
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
                    <span className="font-medium">{entry.role === 'user' ? t.you : t.ai}:</span>{' '}
                    {entry.text}
                  </div>
                ))}
              </div>
              <div className="mt-2 flex items-center gap-3">
                <button
                  onClick={onResume}
                  className="inline-flex items-center gap-1 text-xs text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium"
                  title={t.resumeSessionTooltip}
                >
                  <ContinueIcon />
                  {t.resumeSession}
                </button>
                <button
                  onClick={onDelete}
                  className="text-xs text-red-500 hover:text-red-600"
                >
                  {t.deleteSession}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
