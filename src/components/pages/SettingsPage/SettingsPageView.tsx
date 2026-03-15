import { motion } from 'motion/react';
import { PageLayout } from '@/components/templates/PageLayout';
import { ContentLayout } from '@/components/templates/ContentLayout';
import { AppHeader } from '@/components/organisms/AppHeader';
import { ApiKeySection } from '@/components/organisms/ApiKeySection';
import { SectionTitle } from '@/components/atoms/SectionTitle';
import { StatusMessage } from '@/components/molecules/StatusMessage';
import { LanguageSelector } from '@/components/atoms/LanguageSelector';
import { useT } from '@/i18n';
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
  const t = useT();

  return (
    <PageLayout>
      <AppHeader title={t.settingsTitle} backTo="/" />

      <ContentLayout>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
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
        </motion.div>

        {message && <StatusMessage message={message} />}

        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30, delay: 0.05 }}
          className="space-y-3"
        >
          <SectionTitle uppercase>{t.language}</SectionTitle>
          <div className="flex items-center gap-3">
            <LanguageSelector />
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30, delay: 0.1 }}
          className="space-y-2"
        >
          <SectionTitle uppercase>{t.about}</SectionTitle>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {t.aboutDescription}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {t.aboutEncryption}
          </p>
        </motion.section>
      </ContentLayout>
    </PageLayout>
  );
}
