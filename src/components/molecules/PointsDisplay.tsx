import { motion } from 'motion/react';

interface PointsDisplayProps {
  points: number;
}

export function PointsDisplay({ points }: PointsDisplayProps) {
  if (points <= 0) return null;

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className="flex items-center gap-1 text-xs font-semibold text-amber-600 dark:text-amber-400"
    >
      <span className="text-sm">⭐</span>
      <span>{points}</span>
    </motion.div>
  );
}
