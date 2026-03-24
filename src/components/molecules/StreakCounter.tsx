import { motion } from 'motion/react';

interface StreakCounterProps {
  streak: number;
}

export function StreakCounter({ streak }: StreakCounterProps) {
  if (streak <= 0) return null;

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className="flex items-center gap-1 text-xs font-semibold text-orange-600 dark:text-orange-400"
    >
      <span className="text-sm">🔥</span>
      <span>{streak}</span>
    </motion.div>
  );
}
