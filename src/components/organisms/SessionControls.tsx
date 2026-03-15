import type { SessionStatus } from '@/hooks/useRealtimeSession';
import { AudioVisualizer } from '@/components/molecules/AudioVisualizer';
import { MicIcon, MicOffIcon } from '@/components/atoms/icons';

interface SessionControlsProps {
  status: SessionStatus;
  isActive: boolean;
  error: string | null;
  muted: boolean;
  onToggleMute: () => void;
  onConnect: () => void;
  onDisconnect: () => void;
  getFrequencyData: () => Uint8Array;
}

export function SessionControls({
  status,
  isActive,
  error,
  muted,
  onToggleMute,
  onConnect,
  onDisconnect,
  getFrequencyData,
}: SessionControlsProps) {
  return (
    <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-4">
      <div className="flex flex-col items-center gap-3">
        {isActive && (
          <AudioVisualizer
            getFrequencyData={getFrequencyData}
            isActive={status === 'listening' || status === 'speaking'}
          />
        )}

        <div className="flex items-center gap-3">
          {isActive && (
            <button
              onClick={onToggleMute}
              className={`p-3 rounded-full transition-colors ${
                muted
                  ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
              }`}
              title={muted ? 'Unmute' : 'Mute'}
            >
              {muted ? <MicOffIcon /> : <MicIcon />}
            </button>
          )}

          <button
            onClick={isActive ? onDisconnect : onConnect}
            disabled={status === 'connecting'}
            className={`px-8 py-3 rounded-full font-medium text-sm transition-all ${
              isActive
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : status === 'connecting'
                  ? 'bg-yellow-500 text-white cursor-wait'
                  : 'bg-indigo-500 hover:bg-indigo-600 text-white'
            }`}
          >
            {isActive ? 'End Session' : status === 'connecting' ? 'Connecting...' : 'Start Conversation'}
          </button>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
    </div>
  );
}
