import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/atoms/Button';
import { XIcon } from '@/components/atoms/icons';
import { useT } from '@/i18n';

interface ContextModalProps {
  isOpen: boolean;
  onStart: (context: string) => void;
  onClose: () => void;
}

export function ContextModal({ isOpen, onStart, onClose }: ContextModalProps) {
  const t = useT();
  const [context, setContext] = useState('');

  const handleStart = () => {
    onStart(context.trim());
    setContext('');
  };

  const handleSkip = () => {
    onStart('');
    setContext('');
  };

  const handleClose = () => {
    onClose();
    setContext('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t.contextModalTitle}
              </h2>
              <button
                onClick={handleClose}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded"
              >
                <XIcon />
              </button>
            </div>

            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t.contextModalDescription}
            </p>

            <textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder={t.contextModalPlaceholder}
              rows={4}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              autoFocus
            />

            <div className="flex gap-3 justify-end">
              <Button variant="ghost" size="sm" onClick={handleSkip}>
                {t.contextModalSkip}
              </Button>
              <Button variant="primary" size="sm" onClick={handleStart}>
                {t.contextModalStart}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
