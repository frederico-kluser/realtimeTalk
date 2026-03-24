import { useState } from 'react';
import { Input } from '@/components/atoms/Input';
import { Select } from '@/components/atoms/Select';
import { Button } from '@/components/atoms/Button';
import { Label } from '@/components/atoms/Label';
import { HelpTooltip } from '@/components/atoms/HelpTooltip';
import { apiKeyManager } from '@/storage/keyManager';
import { useT } from '@/i18n';
import type { RealtimeVoice } from '@/core/types/realtime';

const VOICE_OPTIONS: { value: string; label: string }[] = [
  'alloy', 'ash', 'ballad', 'coral', 'echo', 'sage', 'shimmer', 'verse', 'marin', 'cedar',
].map((v) => ({ value: v, label: v.charAt(0).toUpperCase() + v.slice(1) }));

interface TeacherSettingsPanelProps {
  voice: RealtimeVoice;
  onVoiceChange: (v: RealtimeVoice) => void;
  isActive: boolean;
}

export function TeacherSettingsPanel({
  voice,
  onVoiceChange,
  isActive,
}: TeacherSettingsPanelProps) {
  const t = useT();
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
        <Label className="w-20 flex-shrink-0">{t.apiKey}</Label>
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

      <div className="flex items-center gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-1">
            <Label>{t.teacherVoiceLabel}</Label>
            <HelpTooltip text={t.teacherVoiceHelp} />
          </div>
          <Select
            value={voice}
            onChange={(e) => onVoiceChange(e.target.value as RealtimeVoice)}
            disabled={isActive}
            options={VOICE_OPTIONS}
          />
        </div>
      </div>
    </div>
  );
}
