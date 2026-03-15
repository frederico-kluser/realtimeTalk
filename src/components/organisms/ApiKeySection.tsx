import { Input } from '@/components/atoms/Input';
import { Button } from '@/components/atoms/Button';
import { SectionTitle } from '@/components/atoms/SectionTitle';
import { useT } from '@/i18n';

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
  const t = useT();

  return (
    <section className="space-y-3">
      <SectionTitle uppercase>{t.apiKeyByok}</SectionTitle>
      <p className="text-xs text-gray-500 dark:text-gray-400">
        {t.apiKeyDescription}
      </p>

      <Input
        type="password"
        value={apiKey}
        onChange={(e) => onApiKeyChange(e.target.value)}
        placeholder="sk-..."
      />

      <Button variant="primary" size="sm" fullWidth onClick={onSaveKey} disabled={!apiKey}>
        {t.saveToMemory}
      </Button>

      <div className="border-t border-gray-200 dark:border-gray-700 pt-3 space-y-2">
        <Input
          type="password"
          value={passphrase}
          onChange={(e) => onPassphraseChange(e.target.value)}
          placeholder={t.encryptionPassphrase}
        />
        <div className="grid grid-cols-2 gap-2">
          <Button variant="ghost" size="sm" onClick={onPersist} disabled={!saved}>
            {t.encryptAndSave}
          </Button>
          <Button variant="ghost" size="sm" onClick={onLoadKey}>
            {t.loadSavedKey}
          </Button>
        </div>
      </div>

      <Button variant="outline-danger" size="sm" fullWidth onClick={onClearKey}>
        {t.clearAllKeyData}
      </Button>
    </section>
  );
}
