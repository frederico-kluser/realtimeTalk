import { motion, AnimatePresence } from 'motion/react';
import { Input } from '@/components/atoms/Input';
import { Select } from '@/components/atoms/Select';
import { IconButton } from '@/components/atoms/IconButton';
import { LanguageSelector } from '@/components/atoms/LanguageSelector';
import { StatusDot } from '@/components/atoms/StatusDot';
import { SettingsIcon, UploadIcon, ChevronDownIcon } from '@/components/atoms/icons';
import { useT } from '@/i18n';
import type { SessionStatus } from '@/hooks/useRealtimeSession';
import type { RealtimeVoice, VADEagerness } from '@/core/types/realtime';

interface AppToolbarProps {
  apiKey: string;
  onApiKeyChange: (key: string) => void;
  onApiKeySave: () => void;
  voice: RealtimeVoice;
  onVoiceChange: (voice: RealtimeVoice) => void;
  vadEagerness: VADEagerness;
  onVadEagernessChange: (vad: VADEagerness) => void;
  onImportXlsx: () => void;
  sessionStatus: SessionStatus;
  showSettings: boolean;
  onToggleSettings: () => void;
  isActive: boolean;
}

const VOICES: RealtimeVoice[] = ['alloy', 'ash', 'ballad', 'coral', 'echo', 'sage', 'shimmer', 'verse', 'marin', 'cedar'];
const VAD_OPTIONS: VADEagerness[] = ['auto', 'low', 'medium', 'high'];

export function AppToolbar({
  apiKey,
  onApiKeyChange,
  onApiKeySave,
  voice,
  onVoiceChange,
  vadEagerness,
  onVadEagernessChange,
  onImportXlsx,
  sessionStatus,
  showSettings,
  onToggleSettings,
  isActive,
}: AppToolbarProps) {
  const t = useT();

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="flex-shrink-0 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
    >
      <div className="flex items-center justify-between px-4 py-2">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t.appTitle}
          </h1>
          <StatusDot status={sessionStatus} />
        </div>

        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onImportXlsx}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:hover:bg-emerald-900/30 transition-colors"
            title={t.importXlsx}
          >
            <UploadIcon />
            <span className="hidden sm:inline">{t.importXlsx}</span>
          </motion.button>

          <LanguageSelector />

          <IconButton onClick={onToggleSettings} title={t.settings}>
            <SettingsIcon />
            <ChevronDownIcon className={`transition-transform ${showSettings ? 'rotate-180' : ''}`} />
          </IconButton>
        </div>
      </div>

      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="overflow-hidden border-t border-gray-100 dark:border-gray-800"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 px-4 py-3">
              <div className="sm:col-span-2 lg:col-span-1">
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                  {t.apiKey}
                </label>
                <div className="flex gap-1">
                  <Input
                    type="password"
                    value={apiKey}
                    onChange={(e) => onApiKeyChange(e.target.value)}
                    placeholder="sk-..."
                    disabled={isActive}
                    className="text-sm flex-1"
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onApiKeySave}
                    disabled={!apiKey || isActive}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg bg-indigo-500 text-white hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {t.save}
                  </motion.button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                  {t.voice}
                </label>
                <Select
                  value={voice}
                  onChange={(e) => onVoiceChange(e.target.value as RealtimeVoice)}
                  disabled={isActive}
                  className="text-sm"
                  options={VOICES.map((v) => ({ value: v, label: v }))}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                  {t.vad}
                </label>
                <Select
                  value={vadEagerness}
                  onChange={(e) => onVadEagernessChange(e.target.value as VADEagerness)}
                  disabled={isActive}
                  className="text-sm"
                  options={VAD_OPTIONS.map((v) => ({
                    value: v,
                    label: t[`vad${v.charAt(0).toUpperCase() + v.slice(1)}` as keyof typeof t] as string,
                  }))}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
