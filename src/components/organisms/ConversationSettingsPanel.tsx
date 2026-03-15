import { useState } from 'react';
import { Input } from '@/components/atoms/Input';
import { Select } from '@/components/atoms/Select';
import { Button } from '@/components/atoms/Button';
import { Label } from '@/components/atoms/Label';
import { apiKeyManager } from '@/storage/keyManager';
import { PERSONALITY_PRESETS } from '@/personality/presets';
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

const VAD_OPTIONS = [
  { value: 'auto', label: 'Auto' },
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

const PERSONALITY_OPTIONS = PERSONALITY_PRESETS.map((p) => ({ value: p.id, label: p.name }));

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
  const [apiKey, setApiKey] = useState(apiKeyManager.hasKey() ? '••••••••' : '');

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
        <Label className="w-20">API Key</Label>
        <Input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          onBlur={handleSaveKey}
          placeholder="sk-..."
          className="flex-1 py-1.5"
        />
        <Button variant="primary" size="xs" onClick={handleSaveKey}>
          Save
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div>
          <Label>Model</Label>
          <Select
            value={model}
            onChange={(e) => onModelChange(e.target.value as RealtimeModel)}
            disabled={isActive}
            options={MODEL_OPTIONS}
          />
        </div>
        <div>
          <Label>Voice</Label>
          <Select
            value={voice}
            onChange={(e) => onVoiceChange(e.target.value as RealtimeVoice)}
            disabled={isActive}
            options={VOICE_OPTIONS}
          />
        </div>
        <div>
          <Label>VAD</Label>
          <Select
            value={vadEagerness}
            onChange={(e) => onVadEagernessChange(e.target.value as VADEagerness)}
            disabled={isActive}
            options={VAD_OPTIONS}
          />
        </div>
        <div>
          <Label>Personality</Label>
          <Select
            value={selectedPersonality.id}
            onChange={(e) => {
              const p = PERSONALITY_PRESETS.find((p) => p.id === e.target.value);
              if (p) onPersonalityChange(p);
            }}
            options={PERSONALITY_OPTIONS}
          />
        </div>
      </div>
    </div>
  );
}
