import { motion } from 'motion/react';
import { FireIcon, StarIcon } from '@/components/atoms/teacherIcons';

interface ProgressBadgeProps {
  level: string;
  streak: number;
  points: number;
}

export function ProgressBadge({ level, streak, points }: ProgressBadgeProps) {
  return (
    <div className="flex items-center gap-3">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300"
      >
        <span className="text-xs font-bold">{level}</span>
      </motion.div>

      {streak > 0 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-1 px-2 py-1 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400"
        >
          <FireIcon />
          <span className="text-xs font-bold">{streak}</span>
        </motion.div>
      )}

      {points > 0 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-1 px-2 py-1 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400"
        >
          <StarIcon />
          <span className="text-xs font-bold">{points}</span>
        </motion.div>
      )}
    </div>
  );
}
