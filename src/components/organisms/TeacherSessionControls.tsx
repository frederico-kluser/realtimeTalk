import { motion, AnimatePresence } from 'motion/react';
import type { SessionStatus } from '@/hooks/useRealtimeSession';
import { AudioVisualizer } from '@/components/molecules/AudioVisualizer';
import { MicIcon, MicOffIcon } from '@/components/atoms/icons';
import { ProgressBadge } from '@/components/molecules/ProgressBadge';
import { useT } from '@/i18n';

interface TeacherSessionControlsProps {
  status: SessionStatus;
  isActive: boolean;
  error: string | null;
  muted: boolean;
  level: string;
  streak: number;
  points: number;
  activityLabel: string;
  onToggleMute: () => void;
  onDisconnect: () => void;
  getFrequencyData: () => Uint8Array;
}

export function TeacherSessionControls({
  status,
  isActive,
  error,
  muted,
  level,
  streak,
  points,
  activityLabel,
  onToggleMute,
  onDisconnect,
  getFrequencyData,
}: TeacherSessionControlsProps) {
  const t = useT();

  if (!isActive) return null;

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="border-t border-gray-200 dark:border-gray-700 px-4 py-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm"
    >
      <div className="flex flex-col items-center gap-3">
        {/* Activity label */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xs font-medium text-indigo-600 dark:text-indigo-400 uppercase tracking-wider"
        >
          {activityLabel}
        </motion.div>

        {/* Progress during session */}
        <ProgressBadge level={level} streak={streak} points={points} />

        {/* Audio visualizer */}
        <AnimatePresence>
          {!muted && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            >
              <AudioVisualizer
                getFrequencyData={getFrequencyData}
                isActive={status === 'listening' || status === 'speaking'}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Paused indicator */}
        <AnimatePresence>
          {muted && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400"
            >
              <span className="inline-block w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
              {t.pausedMessage}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Control buttons */}
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onToggleMute}
            className={`p-3 rounded-full transition-colors ${
              muted
                ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'
                : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
            }`}
            title={muted ? t.resumeConversation : t.pauseConversation}
          >
            {muted ? <MicOffIcon /> : <MicIcon />}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onDisconnect}
            className="px-8 py-3 rounded-full font-medium text-sm bg-red-500 hover:bg-red-600 text-white transition-all"
          >
            {t.endSession}
          </motion.button>
        </div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              className="text-sm text-red-500"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
