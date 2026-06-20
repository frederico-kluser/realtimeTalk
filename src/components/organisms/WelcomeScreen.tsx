import { motion } from 'motion/react';
import { LevelBadge } from '@/components/molecules/LevelBadge';
import { useT } from '@/i18n';

interface WelcomeScreenProps {
  level: string | null;
  streak: number;
  onQuickStart: (activity: string) => void;
}

const ACTIVITIES = [
  { id: 'free', icon: '💬', labelKey: 'teacherAction_free' as const },
  { id: 'quiz', icon: '📝', labelKey: 'teacherAction_quiz' as const },
  { id: 'roleplay', icon: '🎭', labelKey: 'teacherAction_roleplay' as const },
  { id: 'pronunciation', icon: '🎤', labelKey: 'teacherAction_pronunciation' as const },
  { id: 'dictation', icon: '📖', labelKey: 'teacherAction_dictation' as const },
  { id: 'flashcards', icon: '📚', labelKey: 'teacherAction_flashcards' as const },
] as const;

export function WelcomeScreen({ level, streak, onQuickStart }: WelcomeScreenProps) {
  const t = useT();

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 overflow-auto">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="text-6xl mb-4"
      >
        🎓
      </motion.div>

      <motion.h2
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="text-2xl font-bold text-gray-900 dark:text-white mb-2"
      >
        {t.teacherWelcome}
      </motion.h2>

      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="text-gray-600 dark:text-gray-400 text-center max-w-md mb-2"
      >
        {t.teacherWelcomeDesc}
      </motion.p>

      {(level || streak > 0) && (
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-3 mb-6"
        >
          {level && (
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {t.teacherYourLevel}: <LevelBadge level={level} />
            </span>
          )}
          {streak > 0 && (
            <span className="text-sm text-orange-600 dark:text-orange-400">
              🔥 {streak} {t.teacherDayStreak}
            </span>
          )}
        </motion.div>
      )}

      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.25 }}
        className="w-full max-w-sm"
      >
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 text-center">
          {t.teacherChooseActivity}
        </p>
        <div className="grid grid-cols-2 gap-2">
          {ACTIVITIES.map((activity, i) => (
            <motion.button
              key={activity.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.05 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onQuickStart(activity.id)}
              className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all text-left"
            >
              <span className="text-xl">{activity.icon}</span>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                {t[activity.labelKey] as string}
              </span>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
