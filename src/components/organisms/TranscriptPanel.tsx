import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useT } from '@/i18n';

interface TranscriptEntry {
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

interface TranscriptPanelProps {
  entries: TranscriptEntry[];
  isOpen: boolean;
  onClose: () => void;
}

export function TranscriptPanel({ entries, isOpen, onClose }: TranscriptPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const t = useT();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [entries]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: 320, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 320, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="absolute right-0 top-0 bottom-0 w-80 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 flex flex-col z-20 shadow-xl"
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              {t.transcript}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-2">
            {entries.length === 0 && (
              <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-4">
                {t.emptyTranscript}
              </p>
            )}
            {entries.map((entry, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`text-sm rounded-lg px-3 py-2 ${
                  entry.role === 'user'
                    ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-900 dark:text-indigo-200 ml-4'
                    : 'bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-200 mr-4'
                }`}
              >
                <span className="text-xs font-medium text-gray-400 dark:text-gray-500">
                  {entry.role === 'user' ? t.you : t.ai}
                </span>
                <p className="mt-0.5">{entry.text}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
