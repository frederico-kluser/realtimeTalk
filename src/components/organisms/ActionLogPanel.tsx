import { motion, AnimatePresence } from 'motion/react';
import type { ActionLogEntry } from '@/hooks/useActionRegistry';
import { useT } from '@/i18n';

interface ActionLogPanelProps {
  entries: ActionLogEntry[];
}

export function ActionLogPanel({ entries }: ActionLogPanelProps) {
  const t = useT();

  if (entries.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      className="border-t border-gray-200 dark:border-gray-700 px-4 py-2"
    >
      <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">
        {t.actions}
      </h3>
      <div className="space-y-1 max-h-32 overflow-y-auto">
        <AnimatePresence>
          {entries.slice(0, 5).map((entry) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded px-2 py-1"
            >
              <span className="font-mono">{entry.name}</span>
              <span className={entry.type === 'background' ? 'text-gray-400' : 'text-green-500'}>
                {entry.durationMs.toFixed(0)}ms
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
