import { Input } from '@/components/atoms/Input';
import { Button } from '@/components/atoms/Button';
import { SectionTitle } from '@/components/atoms/SectionTitle';

interface ApiKeySectionProps {
  apiKey: string;
  onApiKeyChange: (key: string) => void;
  passphrase: string;
  onPassphraseChange: (passphrase: string) => void;
  saved: boolean;
  onSaveKey: () => void;
  onPersist: () => void;
  onLoadKey: () => void;
  onClearKey: () => void;
}

export function ApiKeySection({
  apiKey,
  onApiKeyChange,
  passphrase,
  onPassphraseChange,
  saved,
  onSaveKey,
  onPersist,
  onLoadKey,
  onClearKey,
}: ApiKeySectionProps) {
  return (
    <section className="space-y-3">
      <SectionTitle uppercase>API Key (BYOK)</SectionTitle>
      <p className="text-xs text-gray-500 dark:text-gray-400">
        Your API key is stored in memory only. Optionally encrypt and persist it with a passphrase.
      </p>

      <Input
        type="password"
        value={apiKey}
        onChange={(e) => onApiKeyChange(e.target.value)}
        placeholder="sk-..."
      />

      <Button variant="primary" size="sm" fullWidth onClick={onSaveKey} disabled={!apiKey}>
        Save to Memory
      </Button>

      <div className="border-t border-gray-200 dark:border-gray-700 pt-3 space-y-2">
        <Input
          type="password"
          value={passphrase}
          onChange={(e) => onPassphraseChange(e.target.value)}
          placeholder="Encryption passphrase"
        />
        <div className="grid grid-cols-2 gap-2">
          <Button variant="ghost" size="sm" onClick={onPersist} disabled={!saved}>
            Encrypt & Save
          </Button>
          <Button variant="ghost" size="sm" onClick={onLoadKey}>
            Load Saved Key
          </Button>
        </div>
      </div>

      <Button variant="outline-danger" size="sm" fullWidth onClick={onClearKey}>
        Clear All Key Data
      </Button>
    </section>
  );
}
