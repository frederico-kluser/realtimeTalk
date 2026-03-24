import { motion } from 'motion/react';

const LEVEL_COLORS: Record<string, string> = {
  A1: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400',
  A2: 'bg-green-200 text-green-800 dark:bg-green-800/40 dark:text-green-300',
  B1: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400',
  B2: 'bg-blue-200 text-blue-800 dark:bg-blue-800/40 dark:text-blue-300',
  C1: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400',
  C2: 'bg-purple-200 text-purple-800 dark:bg-purple-800/40 dark:text-purple-300',
};

interface LevelBadgeProps {
  level: string | null;
}

export function LevelBadge({ level }: LevelBadgeProps) {
  if (!level) return null;

  const colorClass = LEVEL_COLORS[level] ?? 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';

  return (
    <motion.span
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${colorClass}`}
    >
      {level}
    </motion.span>
  );
}
