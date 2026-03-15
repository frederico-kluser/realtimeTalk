import type { SessionStatus } from '@/hooks/useRealtimeSession';

const STATUS_CONFIG: Record<SessionStatus, { label: string; color: string; animate?: string }> = {
  idle: { label: 'Idle', color: 'bg-gray-400' },
  connecting: { label: 'Connecting...', color: 'bg-yellow-400', animate: 'animate-pulse' },
  connected: { label: 'Connected', color: 'bg-green-400' },
  listening: { label: 'Listening...', color: 'bg-blue-400', animate: 'animate-pulse' },
  thinking: { label: 'Thinking...', color: 'bg-purple-400', animate: 'animate-bounce' },
  speaking: { label: 'Speaking...', color: 'bg-indigo-400', animate: 'animate-pulse' },
  error: { label: 'Error', color: 'bg-red-400' },
  disconnected: { label: 'Disconnected', color: 'bg-gray-300' },
};

export function StatusDot({ status }: { status: SessionStatus }) {
  const config = STATUS_CONFIG[status];
  return (
    <div className="flex items-center gap-2">
      <div className={`w-2.5 h-2.5 rounded-full ${config.color} ${config.animate ?? ''}`} />
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {config.label}
      </span>
    </div>
  );
}
