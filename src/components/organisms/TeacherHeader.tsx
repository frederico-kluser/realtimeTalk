import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { LanguageSelector } from '@/components/atoms/LanguageSelector';
import { IconButton } from '@/components/atoms/IconButton';
import { StatusDot } from '@/components/atoms/StatusDot';
import { SettingsIcon, ClockIcon, HelpCircleIcon } from '@/components/atoms/icons';
import { ProgressBadge } from '@/components/molecules/ProgressBadge';
import { useT } from '@/i18n';
import type { SessionStatus } from '@/hooks/useRealtimeSession';

interface TeacherHeaderProps {
  status: SessionStatus;
  isActive: boolean;
  level: string;
  streak: number;
  points: number;
  onToggleSettings: () => void;
}

export function TeacherHeader({
  status,
  isActive,
  level,
  streak,
  points,
  onToggleSettings,
}: TeacherHeaderProps) {
  const t = useT();

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm"
    >
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">📚</span>
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">
            {t.teacherTitle}
          </h1>
        </div>
        {isActive && <StatusDot status={status} />}
        {!isActive && level && (
          <ProgressBadge level={level} streak={streak} points={points} />
        )}
      </div>

      <div className="flex items-center gap-1.5">
        <LanguageSelector />
        <IconButton onClick={onToggleSettings} title={t.settings}>
          <SettingsIcon />
        </IconButton>
        <Link
          to="/history"
          className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          title={t.history}
        >
          <ClockIcon />
        </Link>
        <Link
          to="/faq"
          className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          title={t.faq}
        >
          <HelpCircleIcon />
        </Link>
      </div>
    </motion.header>
  );
}
