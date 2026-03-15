import { motion } from 'motion/react';
import type { SessionStatus } from '@/hooks/useRealtimeSession';
import { useT } from '@/i18n';

type StatusConfig = { labelKey: string; color: string; pulse?: boolean; bounce?: boolean };

const STATUS_CONFIG: Record<SessionStatus, StatusConfig> = {
  idle: { labelKey: 'statusIdle', color: 'bg-gray-400' },
  connecting: { labelKey: 'statusConnecting', color: 'bg-yellow-400', pulse: true },
  connected: { labelKey: 'statusConnected', color: 'bg-green-400' },
  listening: { labelKey: 'statusListening', color: 'bg-blue-400', pulse: true },
  thinking: { labelKey: 'statusThinking', color: 'bg-purple-400', bounce: true },
  speaking: { labelKey: 'statusSpeaking', color: 'bg-indigo-400', pulse: true },
  error: { labelKey: 'statusError', color: 'bg-red-400' },
  disconnected: { labelKey: 'statusDisconnected', color: 'bg-gray-300' },
};

export function StatusDot({ status }: { status: SessionStatus }) {
  const t = useT();
  const config = STATUS_CONFIG[status];
  const label = t[config.labelKey as keyof typeof t] as string;

  return (
    <motion.div
      className="flex items-center gap-2"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      key={status}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
    >
      <div
        className={`w-2.5 h-2.5 rounded-full ${config.color} ${config.pulse ? 'animate-pulse' : ''} ${config.bounce ? 'animate-bounce' : ''}`}
      />
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </span>
    </motion.div>
  );
}
