import { useState } from 'react';
import { Input } from '@/components/atoms/Input';
import { Button } from '@/components/atoms/Button';
import { Label } from '@/components/atoms/Label';
import { apiKeyManager } from '@/storage/keyManager';

interface TutorSettingsPanelProps {
  isActive: boolean;
}

export function TutorSettingsPanel({ isActive }: TutorSettingsPanelProps) {
  const [apiKey, setApiKey] = useState(apiKeyManager.hasKey() ? '••••••••' : '');
  const [status, setStatus] = useState<'idle' | 'saved' | 'error'>('idle');

  const handleSaveKey = () => {
    if (apiKey && !apiKey.startsWith('••')) {
      try {
        apiKeyManager.set(apiKey);
        setApiKey('••••••••');
        setStatus('saved');
        setTimeout(() => setStatus('idle'), 2000);
      } catch (e) {
        setStatus('error');
        alert((e as Error).message);
      }
    }
  };

  return (
    <div className="border-b border-gray-200 dark:border-gray-700 px-4 py-3 bg-gray-50 dark:bg-gray-800/50">
      <div className="flex items-center gap-2">
        <Label className="w-20 text-sm">API Key</Label>
        <Input
          type="password"
          value={apiKey}
          onChange={(e) => {
            setApiKey(e.target.value);
            setStatus('idle');
          }}
          onBlur={handleSaveKey}
          placeholder="sk-..."
          className="flex-1 py-1.5 text-sm"
          disabled={isActive}
        />
        <Button variant="primary" size="xs" onClick={handleSaveKey} disabled={isActive}>
          Save
        </Button>
      </div>
      {status === 'saved' && (
        <p className="text-xs text-green-600 dark:text-green-400 mt-1 ml-20">
          API key saved successfully
        </p>
      )}
      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 ml-20">
        Your key stays in your browser. Never sent to any server except OpenAI.
      </p>
    </div>
  );
}
