import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Input } from '@/components/atoms/Input';
import { Select } from '@/components/atoms/Select';
import { Button } from '@/components/atoms/Button';
import { Label } from '@/components/atoms/Label';
import { HelpTooltip } from '@/components/atoms/HelpTooltip';
import { EditIcon } from '@/components/atoms/icons';
import { apiKeyManager } from '@/storage/keyManager';
import { PERSONALITY_PRESETS } from '@/personality/presets';
import { useT } from '@/i18n';
import type { PersonalityConfig } from '@/personality/types';
import type { RealtimeModel, RealtimeVoice, VADEagerness } from '@/core/types/realtime';

const MODEL_OPTIONS = [
  { value: 'gpt-realtime', label: 'GPT Realtime' },
  { value: 'gpt-realtime-mini', label: 'GPT Realtime Mini' },
  { value: 'gpt-realtime-1.5', label: 'GPT Realtime 1.5' },
];

const VOICE_OPTIONS: { value: string; label: string }[] = [
  'alloy', 'ash', 'ballad', 'coral', 'echo', 'sage', 'shimmer', 'verse', 'marin', 'cedar',
].map((v) => ({ value: v, label: v }));

interface ConversationSettingsPanelProps {
  model: RealtimeModel;
  onModelChange: (m: RealtimeModel) => void;
  voice: RealtimeVoice;
  onVoiceChange: (v: RealtimeVoice) => void;
  vadEagerness: VADEagerness;
  onVadEagernessChange: (v: VADEagerness) => void;
  selectedPersonality: PersonalityConfig;
  onPersonalityChange: (p: PersonalityConfig) => void;
  isActive: boolean;
}

export function ConversationSettingsPanel({
  model,
  onModelChange,
  voice,
  onVoiceChange,
  vadEagerness,
  onVadEagernessChange,
  selectedPersonality,
  onPersonalityChange,
  isActive,
}: ConversationSettingsPanelProps) {
  const t = useT();
  const [apiKey, setApiKey] = useState(apiKeyManager.hasKey() ? '••••••••' : '');

  const vadOptions = [
    { value: 'auto', label: t.vadAuto },
    { value: 'low', label: t.vadLow },
    { value: 'medium', label: t.vadMedium },
    { value: 'high', label: t.vadHigh },
  ];

  const allPersonalities = useMemo(() => {
    const stored = JSON.parse(
      localStorage.getItem('personalities') ?? '[]'
    ) as PersonalityConfig[];
    return [...PERSONALITY_PRESETS, ...stored];
  }, []);

  const personalityOptions = allPersonalities.map((p) => ({ value: p.id, label: p.name }));

  const handleSaveKey = () => {
    if (apiKey && !apiKey.startsWith('••')) {
      try {
        apiKeyManager.set(apiKey);
        setApiKey('••••••••');
      } catch (e) {
        alert((e as Error).message);
      }
    }
  };

  return (
    <div className="border-b border-gray-200 dark:border-gray-700 px-4 py-3 bg-gray-50 dark:bg-gray-800/50 space-y-3">
      <div className="flex items-center gap-2">
        <Label className="w-20">{t.apiKey}</Label>
        <Input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          onBlur={handleSaveKey}
          placeholder="sk-..."
          className="flex-1 py-1.5"
        />
        <Button variant="primary" size="xs" onClick={handleSaveKey}>
          {t.save}
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div>
          <div className="flex items-center gap-1">
            <Label>{t.model}</Label>
            <HelpTooltip text={t.helpModel} />
          </div>
          <Select
            value={model}
            onChange={(e) => onModelChange(e.target.value as RealtimeModel)}
            disabled={isActive}
            options={MODEL_OPTIONS}
          />
        </div>
        <div>
          <div className="flex items-center gap-1">
            <Label>{t.voice}</Label>
            <HelpTooltip text={t.helpVoice} />
          </div>
          <Select
            value={voice}
            onChange={(e) => onVoiceChange(e.target.value as RealtimeVoice)}
            disabled={isActive}
            options={VOICE_OPTIONS}
          />
        </div>
        <div>
          <div className="flex items-center gap-1">
            <Label>{t.vad}</Label>
            <HelpTooltip text={t.helpVad} />
          </div>
          <Select
            value={vadEagerness}
            onChange={(e) => onVadEagernessChange(e.target.value as VADEagerness)}
            disabled={isActive}
            options={vadOptions}
          />
        </div>
        <div>
          <div className="flex items-center gap-1">
            <Label>{t.personality}</Label>
            <HelpTooltip text={t.helpPersonality} />
          </div>
          <Select
            value={selectedPersonality.id}
            onChange={(e) => {
              const p = allPersonalities.find((p) => p.id === e.target.value);
              if (p) onPersonalityChange(p);
            }}
            disabled={isActive}
            options={personalityOptions}
          />
          {!isActive && (
            <div className="flex items-center gap-3 mt-1">
              <Link
                to="/personality"
                className="text-xs text-indigo-500 hover:text-indigo-700 dark:text-indigo-400 inline-block"
              >
                {t.newPersonality}
              </Link>
              <Link
                to={`/personality/${selectedPersonality.id}`}
                className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                title={t.editPersonality}
              >
                <EditIcon />
                {t.editPersonality}
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
