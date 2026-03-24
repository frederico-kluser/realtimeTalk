import { motion } from 'motion/react';

interface StreakBadgeProps {
  streak: number;
  label: string;
}

export function StreakBadge({ streak, label }: StreakBadgeProps) {
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400"
    >
      <span className="text-base">🔥</span>
      <span className="text-sm font-bold">{streak}</span>
      <span className="text-xs">{label}</span>
    </motion.div>
  );
}
