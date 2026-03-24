import { motion } from 'motion/react';
import { StatusDot } from '@/components/atoms/StatusDot';
import { IconButton } from '@/components/atoms/IconButton';
import { Select } from '@/components/atoms/Select';
import { LanguageSelector } from '@/components/atoms/LanguageSelector';
import { CostTokenDisplay } from '@/components/molecules/CostTokenDisplay';
import { SettingsIcon, ClockIcon } from '@/components/atoms/icons';
import type { SessionStatus } from '@/hooks/useRealtimeSession';
import type { RealtimeVoice } from '@/core/types/realtime';
import { Link } from 'react-router-dom';

const VOICE_OPTIONS = [
  'alloy', 'ash', 'ballad', 'coral', 'echo', 'sage', 'shimmer', 'verse', 'marin', 'cedar',
].map((v) => ({ value: v, label: v.charAt(0).toUpperCase() + v.slice(1) }));

interface TutorHeaderProps {
  status: SessionStatus;
  voice: RealtimeVoice;
  onVoiceChange: (v: RealtimeVoice) => void;
  totalCost: number;
  totalTokens: number;
  isActive: boolean;
  onToggleSettings: () => void;
}

export function TutorHeader({
  status,
  voice,
  onVoiceChange,
  totalCost,
  totalTokens,
  isActive,
  onToggleSettings,
}: TutorHeaderProps) {
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold shadow-md">
          S
        </div>
        <div>
          <h1 className="text-base font-semibold text-gray-900 dark:text-white leading-tight">
            Sofia
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-tight">English Tutor</p>
        </div>
        <StatusDot status={status} />
      </div>

      <div className="flex items-center gap-2">
        {isActive && <CostTokenDisplay totalCost={totalCost} totalTokens={totalTokens} />}

        {!isActive && (
          <Select
            value={voice}
            onChange={(e) => onVoiceChange(e.target.value as RealtimeVoice)}
            options={VOICE_OPTIONS}
            className="text-xs py-1 w-24"
          />
        )}

        <LanguageSelector />

        <IconButton
          onClick={onToggleSettings}
          title="Settings"
        >
          <SettingsIcon />
        </IconButton>

        <Link
          to="/history"
          className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          title="History"
        >
          <ClockIcon />
        </Link>
      </div>
    </motion.header>
  );
}
