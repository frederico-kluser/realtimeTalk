import { motion } from 'motion/react';
import { Select } from '@/components/atoms/Select';
import { IconButton } from '@/components/atoms/IconButton';
import { LanguageSelector } from '@/components/atoms/LanguageSelector';
import { StatusDot } from '@/components/atoms/StatusDot';
import { SettingsIcon, ClockIcon } from '@/components/atoms/icons';
import { LevelBadge } from '@/components/molecules/LevelBadge';
import { StreakCounter } from '@/components/molecules/StreakCounter';
import { PointsDisplay } from '@/components/molecules/PointsDisplay';
import { CostTokenDisplay } from '@/components/molecules/CostTokenDisplay';
import { useT } from '@/i18n';
import type { SessionStatus } from '@/hooks/useRealtimeSession';
import type { RealtimeVoice } from '@/core/types/realtime';
import { Link } from 'react-router-dom';

const VOICE_OPTIONS: { value: string; label: string }[] = [
  'alloy', 'ash', 'ballad', 'coral', 'echo', 'sage', 'shimmer', 'verse', 'marin', 'cedar',
].map((v) => ({ value: v, label: v.charAt(0).toUpperCase() + v.slice(1) }));

interface TeacherHeaderProps {
  status: SessionStatus;
  voice: RealtimeVoice;
  onVoiceChange: (v: RealtimeVoice) => void;
  level: string | null;
  streak: number;
  points: number;
  totalCost: number;
  totalTokens: number;
  isActive: boolean;
  onSettingsClick: () => void;
}

export function TeacherHeader({
  status,
  voice,
  onVoiceChange,
  level,
  streak,
  points,
  totalCost,
  totalTokens,
  isActive,
  onSettingsClick,
}: TeacherHeaderProps) {
  const t = useT();

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="border-b border-gray-200 dark:border-gray-700 px-4 py-3"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">🎓</span>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Sofia</h1>
          </div>
          <StatusDot status={status} />
          <LevelBadge level={level} />
          <StreakCounter streak={streak} />
          <PointsDisplay points={points} />
        </div>

        <div className="flex items-center gap-2">
          <CostTokenDisplay totalCost={totalCost} totalTokens={totalTokens} />
          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-500 dark:text-gray-400 hidden sm:inline">{t.voice}:</span>
            <Select
              value={voice}
              onChange={(e) => onVoiceChange(e.target.value as RealtimeVoice)}
              disabled={isActive}
              options={VOICE_OPTIONS}
              className="text-xs py-1 w-24"
            />
          </div>
          <LanguageSelector />
          <IconButton onClick={onSettingsClick} title={t.settings}>
            <SettingsIcon />
          </IconButton>
          <Link
            to="/history"
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            title={t.history}
          >
            <ClockIcon />
          </Link>
        </div>
      </div>
    </motion.header>
  );
}
