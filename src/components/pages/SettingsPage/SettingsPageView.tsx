import { PageLayout } from '@/components/templates/PageLayout';
import { ContentLayout } from '@/components/templates/ContentLayout';
import { AppHeader } from '@/components/organisms/AppHeader';
import { ApiKeySection } from '@/components/organisms/ApiKeySection';
import { SectionTitle } from '@/components/atoms/SectionTitle';
import { StatusMessage } from '@/components/molecules/StatusMessage';
import type { useSettingsController } from './useSettingsController';

type SettingsViewProps = ReturnType<typeof useSettingsController>;

export function SettingsPageView({
  apiKey,
  setApiKey,
  passphrase,
  setPassphrase,
  saved,
  message,
  handleSaveKey,
  handlePersist,
  handleLoadKey,
  handleClearKey,
}: SettingsViewProps) {
  return (
    <PageLayout>
      <AppHeader title="Settings" backTo="/" />

      <ContentLayout>
        <ApiKeySection
          apiKey={apiKey}
          onApiKeyChange={setApiKey}
          passphrase={passphrase}
          onPassphraseChange={setPassphrase}
          saved={saved}
          onSaveKey={handleSaveKey}
          onPersist={() => void handlePersist()}
          onLoadKey={() => void handleLoadKey()}
          onClearKey={handleClearKey}
        />

        {message && <StatusMessage message={message} />}

        <section className="space-y-2">
          <SectionTitle uppercase>About</SectionTitle>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Voice AI App uses WebRTC to connect directly to OpenAI's Realtime API. No backend, no
            data stored on servers. Your API key never leaves your browser.
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Encryption uses AES-256-GCM with PBKDF2 key derivation (100K iterations).
          </p>
        </section>
      </ContentLayout>
    </PageLayout>
  );
}
