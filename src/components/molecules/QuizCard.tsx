import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface QuizOption {
  label: string;
  value: string;
}

interface QuizCardProps {
  question: string;
  options: QuizOption[];
  correctAnswer?: string;
  onAnswer: (value: string) => void;
  type?: 'multiple-choice' | 'vocab' | 'pronunciation';
}

export function QuizCard({ question, options, correctAnswer, onAnswer, type = 'multiple-choice' }: QuizCardProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);

  const handleSelect = (value: string) => {
    if (revealed) return;
    setSelected(value);
    setRevealed(true);
    onAnswer(value);
  };

  const getBorderColor = (value: string) => {
    if (!revealed) {
      return selected === value
        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
        : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600';
    }
    if (value === correctAnswer) return 'border-green-500 bg-green-50 dark:bg-green-900/20';
    if (value === selected && value !== correctAnswer) return 'border-red-500 bg-red-50 dark:bg-red-900/20';
    return 'border-gray-200 dark:border-gray-700 opacity-50';
  };

  const typeLabel = type === 'vocab' ? '📝' : type === 'pronunciation' ? '🎤' : '🧠';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm"
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">{typeLabel}</span>
        <p className="text-sm font-medium text-gray-900 dark:text-white">{question}</p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {options.map((opt, i) => (
          <motion.button
            key={opt.value}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => handleSelect(opt.value)}
            disabled={revealed}
            className={`p-2.5 rounded-lg border-2 text-left text-sm transition-all ${getBorderColor(opt.value)} ${
              !revealed ? 'cursor-pointer' : 'cursor-default'
            }`}
          >
            <span className="font-medium text-gray-500 dark:text-gray-400 mr-1.5">
              {String.fromCharCode(65 + i)}.
            </span>
            <span className="text-gray-800 dark:text-gray-200">{opt.label}</span>
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {revealed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700"
          >
            {selected === correctAnswer ? (
              <p className="text-sm text-green-600 dark:text-green-400 font-medium">✓ Correct!</p>
            ) : (
              <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                ✗ The correct answer is {correctAnswer}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
