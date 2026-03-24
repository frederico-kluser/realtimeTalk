import { motion } from 'motion/react';

interface ProgressBadgeProps {
  level?: string;
  points?: number;
  streak?: number;
}

const LEVEL_COLORS: Record<string, string> = {
  A1: 'from-green-400 to-green-600',
  A2: 'from-emerald-400 to-emerald-600',
  B1: 'from-blue-400 to-blue-600',
  B2: 'from-indigo-400 to-indigo-600',
  C1: 'from-purple-400 to-purple-600',
  C2: 'from-amber-400 to-amber-600',
};

const LEVEL_LABELS: Record<string, string> = {
  A1: 'Beginner',
  A2: 'Elementary',
  B1: 'Intermediate',
  B2: 'Upper Intermediate',
  C1: 'Advanced',
  C2: 'Proficient',
};

export function ProgressBadge({ level, points, streak }: ProgressBadgeProps) {
  const gradient = level ? LEVEL_COLORS[level] || 'from-gray-400 to-gray-600' : 'from-gray-400 to-gray-600';
  const label = level ? LEVEL_LABELS[level] || level : 'New Student';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center gap-2"
    >
      <div className={`bg-gradient-to-br ${gradient} text-white rounded-2xl px-6 py-3 shadow-lg`}>
        <div className="text-2xl font-bold text-center">{level || '?'}</div>
        <div className="text-xs font-medium text-white/80 text-center">{label}</div>
      </div>

      <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
        {points !== undefined && (
          <span className="flex items-center gap-1">
            <span className="text-amber-500 font-semibold">{points}</span> pts
          </span>
        )}
        {streak !== undefined && streak > 0 && (
          <span className="flex items-center gap-1">
            <span className="text-orange-500 font-semibold">{streak}</span> day streak
          </span>
        )}
      </div>
    </motion.div>
  );
}
