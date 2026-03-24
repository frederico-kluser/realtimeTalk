import { motion } from 'motion/react';
import { ProgressRing } from '@/components/molecules/ProgressRing';
import { StreakBadge } from '@/components/molecules/StreakBadge';
import { useT } from '@/i18n';

interface TeacherSidebarProps {
  level: string;
  points: number;
  streak: number;
  wordsLearned: number;
  correctionsCount: number;
  sessionMinutes: number;
  progressPercent: number;
  dailyExpression?: { expression: string; meaning: string } | null;
}

const levelColors: Record<string, string> = {
  A1: '#22c55e',
  A2: '#84cc16',
  B1: '#eab308',
  B2: '#f97316',
  C1: '#ef4444',
  C2: '#a855f7',
};

export function TeacherSidebar({
  level,
  points,
  streak,
  wordsLearned,
  correctionsCount,
  sessionMinutes,
  progressPercent,
  dailyExpression,
}: TeacherSidebarProps) {
  const t = useT();

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="w-64 shrink-0 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-4 space-y-5 overflow-y-auto hidden lg:block"
    >
      {/* Level & Progress */}
      <div className="flex flex-col items-center gap-3">
        <ProgressRing
          progress={progressPercent}
          size={80}
          strokeWidth={5}
          color={levelColors[level] ?? '#6366f1'}
        >
          <div className="text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">{t.teacherLevel}</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">{level || t.teacherNoLevel}</p>
          </div>
        </ProgressRing>

        <div className="flex items-center gap-3">
          <StreakBadge streak={streak} label={t.teacherDays} />
          <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
            <span className="text-sm font-bold">{points}</span>
            <span className="text-xs">{t.teacherPoints}</span>
          </div>
        </div>
      </div>

      {/* Session Stats */}
      <div className="space-y-2">
        <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          {t.teacherProgress}
        </h3>
        <div className="grid grid-cols-3 gap-2">
          <StatCard label={t.teacherCorrections} value={correctionsCount} emoji="✏️" />
          <StatCard label={t.teacherWordsLearned} value={wordsLearned} emoji="📚" />
          <StatCard label={t.teacherSessionTime} value={`${sessionMinutes}m`} emoji="⏱️" />
        </div>
      </div>

      {/* Daily Expression */}
      {dailyExpression && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-3"
        >
          <h3 className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-1">
            💡 {t.teacherTodayExpression}
          </h3>
          <p className="text-sm font-medium text-amber-900 dark:text-amber-200">
            &quot;{dailyExpression.expression}&quot;
          </p>
          <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
            {dailyExpression.meaning}
          </p>
        </motion.div>
      )}
    </motion.aside>
  );
}

function StatCard({ label, value, emoji }: { label: string; value: string | number; emoji: string }) {
  return (
    <div className="flex flex-col items-center p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
      <span className="text-base">{emoji}</span>
      <span className="text-sm font-bold text-gray-900 dark:text-white">{value}</span>
      <span className="text-[10px] text-gray-500 dark:text-gray-400 text-center leading-tight">{label}</span>
    </div>
  );
}
