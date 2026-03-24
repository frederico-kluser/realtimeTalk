import { motion } from 'motion/react';
import type { Challenge } from '@/core/events/challengeEvents';

interface ChallengeCardProps {
  challenge: Challenge;
  onRespond: (response: string) => void;
  onDismiss: () => void;
}

const TYPE_CONFIG: Record<string, { label: string; icon: string; color: string }> = {
  multiple_choice: { label: 'Multiple Choice', icon: 'A', color: 'from-blue-500 to-indigo-600' },
  vocabulary: { label: 'Vocabulary', icon: 'V', color: 'from-emerald-500 to-green-600' },
  pronunciation: { label: 'Pronunciation', icon: 'P', color: 'from-purple-500 to-pink-600' },
  dictation: { label: 'Dictation', icon: 'D', color: 'from-amber-500 to-orange-600' },
  flashcard: { label: 'Flashcard', icon: 'F', color: 'from-cyan-500 to-blue-600' },
};

const OPTION_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

export function ChallengeCard({ challenge, onRespond, onDismiss }: ChallengeCardProps) {
  const config = TYPE_CONFIG[challenge.type] || TYPE_CONFIG.vocabulary!;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className="mx-4 my-2"
    >
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Header */}
        <div className={`bg-gradient-to-r ${config.color} px-4 py-2 flex items-center justify-between`}>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-white/20 flex items-center justify-center text-white text-xs font-bold">
              {config.icon}
            </div>
            <span className="text-sm font-medium text-white">{config.label}</span>
          </div>
          <button
            onClick={onDismiss}
            className="text-white/70 hover:text-white text-xs px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 transition-colors"
          >
            Skip
          </button>
        </div>

        {/* Question */}
        <div className="px-4 py-3">
          <p className="text-sm font-medium text-gray-900 dark:text-white leading-relaxed">
            {challenge.question}
          </p>

          {challenge.hint && (
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 italic">
              {challenge.hint}
            </p>
          )}
        </div>

        {/* Options (multiple choice) */}
        {challenge.options && challenge.options.length > 0 && (
          <div className="px-4 pb-3 grid grid-cols-1 gap-2">
            {challenge.options.map((option, idx) => (
              <motion.button
                key={idx}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onRespond(OPTION_LETTERS[idx] || String(idx + 1))}
                className="flex items-center gap-3 text-left px-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors group"
              >
                <span className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-gray-700 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/40 flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors flex-shrink-0">
                  {OPTION_LETTERS[idx]}
                </span>
                <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">
                  {option}
                </span>
              </motion.button>
            ))}
          </div>
        )}

        {/* Pronunciation / Dictation target */}
        {challenge.targetText && !challenge.options && (
          <div className="px-4 pb-3">
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg px-4 py-3 text-center">
              <p className="text-base font-medium text-gray-900 dark:text-white italic">
                "{challenge.targetText}"
              </p>
              <p className="text-xs text-gray-400 mt-2">
                {challenge.type === 'pronunciation' ? 'Say this out loud' : 'Listen and repeat'}
              </p>
            </div>
            <div className="flex gap-2 mt-3">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => onRespond('I said it')}
                className="flex-1 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium transition-colors"
              >
                Done
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => onRespond('Can you repeat that?')}
                className="py-2 px-4 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm transition-colors"
              >
                Repeat
              </motion.button>
            </div>
          </div>
        )}

        {/* Flashcard (vocabulary with reveal) */}
        {challenge.type === 'flashcard' && !challenge.options && !challenge.targetText && (
          <div className="px-4 pb-3 flex gap-2">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => onRespond('I know this word')}
              className="flex-1 py-2.5 rounded-lg bg-green-500 hover:bg-green-600 text-white text-sm font-medium transition-colors"
            >
              I know it
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => onRespond("I don't know this word")}
              className="flex-1 py-2.5 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors"
            >
              Don't know
            </motion.button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
