import { motion, AnimatePresence } from 'motion/react';
import { AudioVisualizer } from '@/components/molecules/AudioVisualizer';
import { MicIcon, MicOffIcon, ChatIcon } from '@/components/atoms/icons';
import { useT } from '@/i18n';
import type { SessionStatus } from '@/hooks/useRealtimeSession';

interface VoiceControlBarProps {
  status: SessionStatus;
  isActive: boolean;
  error: string | null;
  muted: boolean;
  onToggleMute: () => void;
  onConnect: () => void;
  onDisconnect: () => void;
  onToggleTranscript: () => void;
  transcriptCount: number;
  getFrequencyData: () => Uint8Array;
}

export function VoiceControlBar({
  status,
  isActive,
  error,
  muted,
  onToggleMute,
  onConnect,
  onDisconnect,
  onToggleTranscript,
  transcriptCount,
  getFrequencyData,
}: VoiceControlBarProps) {
  const t = useT();

  const buttonLabel = isActive
    ? t.endSession
    : status === 'connecting'
      ? t.connecting
      : t.startVoice;

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30, delay: 0.1 }}
      className="flex-shrink-0 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3"
    >
      <div className="flex items-center justify-center gap-3">
        <AnimatePresence>
          {isActive && !muted && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, width: 0 }}
              animate={{ opacity: 1, scale: 1, width: 'auto' }}
              exit={{ opacity: 0, scale: 0.8, width: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="overflow-hidden"
            >
              <AudioVisualizer
                getFrequencyData={getFrequencyData}
                isActive={status === 'listening' || status === 'speaking'}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isActive && muted && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400"
            >
              <span className="inline-block w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
              {t.pausedMessage}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isActive && (
            <motion.button
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 25 }}
              onClick={onToggleMute}
              className={`p-2.5 rounded-full transition-colors ${
                muted
                  ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
              }`}
              title={muted ? t.resumeVoice : t.pauseVoice}
            >
              {muted ? <MicOffIcon /> : <MicIcon />}
            </motion.button>
          )}
        </AnimatePresence>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={isActive ? onDisconnect : onConnect}
          disabled={status === 'connecting'}
          className={`px-6 py-2.5 rounded-full font-medium text-sm transition-all ${
            isActive
              ? 'bg-red-500 hover:bg-red-600 text-white'
              : status === 'connecting'
                ? 'bg-yellow-500 text-white cursor-wait'
                : 'bg-indigo-500 hover:bg-indigo-600 text-white'
          }`}
        >
          {buttonLabel}
        </motion.button>

        <AnimatePresence>
          {isActive && (
            <motion.button
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 25 }}
              onClick={onToggleTranscript}
              className="relative p-2.5 rounded-full bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              title={t.transcript}
            >
              <ChatIcon />
              {transcriptCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-indigo-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {transcriptCount > 9 ? '9+' : transcriptCount}
                </span>
              )}
            </motion.button>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
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
