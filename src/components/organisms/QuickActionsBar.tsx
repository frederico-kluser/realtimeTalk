import { motion } from 'motion/react';
import { useT } from '@/i18n';

interface QuickActionsBarProps {
  isActive: boolean;
  onAction: (command: string) => void;
}

const ACTIONS = [
  { id: 'quiz', icon: '📝', commandKey: 'teacherQuiz' as const },
  { id: 'roleplay', icon: '🎭', commandKey: 'teacherRoleplay' as const },
  { id: 'pronunciation', icon: '🎤', commandKey: 'teacherPronunciation' as const },
  { id: 'dictation', icon: '📖', commandKey: 'teacherDictation' as const },
  { id: 'flashcards', icon: '📚', commandKey: 'teacherFlashcards' as const },
  { id: 'debate', icon: '💬', commandKey: 'teacherDebate' as const },
] as const;

export function QuickActionsBar({ isActive, onAction }: QuickActionsBarProps) {
  const t = useT();

  if (!isActive) return null;

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="border-t border-gray-200 dark:border-gray-700 px-4 py-2 bg-gray-50 dark:bg-gray-800/50"
    >
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="text-xs text-gray-500 dark:text-gray-400 shrink-0">
          {t.teacherActivities}:
        </span>
        {ACTIONS.map((action, i) => (
          <motion.button
            key={action.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onAction(t[action.commandKey])}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:border-indigo-300 dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors shrink-0"
          >
            <span>{action.icon}</span>
            <span>{t[`teacherAction_${action.id}` as keyof typeof t] as string}</span>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
