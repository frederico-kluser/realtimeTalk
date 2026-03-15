import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Input } from '@/components/atoms/Input';
import { Select } from '@/components/atoms/Select';
import { Button } from '@/components/atoms/Button';
import { Label } from '@/components/atoms/Label';
import { HelpTooltip } from '@/components/atoms/HelpTooltip';
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

const HELP_TEXT = {
  model: 'Choose the AI model for voice conversation.\n\n• GPT Realtime — Full model, most capable\n• GPT Realtime Mini — Faster, lower cost\n• GPT Realtime 1.5 — Latest generation',
  voice: 'Select the AI voice. Each voice has a distinct tone and character. Try different voices to find the best fit for your personality.',
  vad: 'Voice Activity Detection (VAD) controls how eagerly the AI detects that you finished speaking.\n\n• Low — Waits longer before responding (good for thoughtful conversations)\n• Medium — Balanced timing\n• High — Responds quickly (good for rapid Q&A)\n• Auto — Let the model decide',
  personality: 'Choose a personality profile that defines how the AI behaves, speaks, and responds. You can create custom personalities with file context in the editor.',
};

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
          <div className="flex items-center gap-1">
            <Label>Model</Label>
            <HelpTooltip text={HELP_TEXT.model} />
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
            <Label>Voice</Label>
            <HelpTooltip text={HELP_TEXT.voice} />
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
            <Label>VAD</Label>
            <HelpTooltip text={HELP_TEXT.vad} />
          </div>
          <Select
            value={vadEagerness}
            onChange={(e) => onVadEagernessChange(e.target.value as VADEagerness)}
            disabled={isActive}
            options={VAD_OPTIONS}
          />
        </div>
        <div>
          <div className="flex items-center gap-1">
            <Label>Personality</Label>
            <HelpTooltip text={HELP_TEXT.personality} />
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
            <Link
              to="/personality"
              className="text-xs text-indigo-500 hover:text-indigo-700 dark:text-indigo-400 mt-1 inline-block"
            >
              + New Personality
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
