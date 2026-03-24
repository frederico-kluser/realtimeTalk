import { useState, useCallback } from 'react';
import { motion } from 'motion/react';
import { Input } from '@/components/atoms/Input';
import { Button } from '@/components/atoms/Button';
import { SectionTitle } from '@/components/atoms/SectionTitle';
import { XIcon } from '@/components/atoms/icons';
import { LanguageSelector } from '@/components/atoms/LanguageSelector';
import { useT } from '@/i18n';
import { apiKeyManager } from '@/storage/keyManager';

interface TeacherSettingsDrawerProps {
  onClose: () => void;
}

export function TeacherSettingsDrawer({ onClose }: TeacherSettingsDrawerProps) {
  const t = useT();
  const [apiKey, setApiKey] = useState(apiKeyManager.hasKey() ? '••••••••' : '');
  const [passphrase, setPassphrase] = useState('');
  const [message, setMessage] = useState('');

  const handleSaveKey = useCallback(() => {
    if (apiKey && !apiKey.startsWith('••')) {
      try {
        apiKeyManager.set(apiKey);
        setApiKey('••••••••');
        setMessage(t.apiKeySaved);
      } catch (e) {
        setMessage((e as Error).message);
      }
    }
  }, [apiKey, t]);

  const handlePersist = useCallback(async () => {
    if (!passphrase) {
      setMessage(t.enterPassphrase);
      return;
    }
    try {
      await apiKeyManager.persistEncrypted(passphrase);
      setMessage(t.apiKeyEncrypted);
    } catch (e) {
      setMessage((e as Error).message);
    }
  }, [passphrase, t]);

  const handleLoadKey = useCallback(async () => {
    if (!passphrase) {
      setMessage(t.enterYourPassphrase);
      return;
    }
    try {
      await apiKeyManager.loadEncrypted(passphrase);
      setApiKey('••••••••');
      setMessage(t.apiKeyLoaded);
    } catch {
      setMessage(t.decryptFailed);
    }
  }, [passphrase, t]);

  const handleClearKey = useCallback(() => {
    apiKeyManager.clear();
    setApiKey('');
    setPassphrase('');
    setMessage(t.apiKeyCleared);
  }, [t]);

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-40 bg-black/40"
        onClick={onClose}
      />
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed right-0 top-0 bottom-0 z-50 w-80 bg-white dark:bg-gray-900 shadow-2xl p-5 overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">{t.settings}</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
          >
            <XIcon />
          </button>
        </div>

        <div className="space-y-6">
          {/* API Key */}
          <section className="space-y-3">
            <SectionTitle uppercase>{t.apiKeyByok}</SectionTitle>
            <p className="text-xs text-gray-500 dark:text-gray-400">{t.apiKeyDescription}</p>
            <Input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-..."
            />
            <Button variant="primary" size="sm" fullWidth onClick={handleSaveKey} disabled={!apiKey}>
              {t.saveToMemory}
            </Button>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-3 space-y-2">
              <Input
                type="password"
                value={passphrase}
                onChange={(e) => setPassphrase(e.target.value)}
                placeholder={t.encryptionPassphrase}
              />
              <div className="grid grid-cols-2 gap-2">
                <Button variant="ghost" size="xs" onClick={() => void handlePersist()}>
                  {t.encryptAndSave}
                </Button>
                <Button variant="ghost" size="xs" onClick={() => void handleLoadKey()}>
                  {t.loadSavedKey}
                </Button>
              </div>
            </div>

            <Button variant="outline-danger" size="sm" fullWidth onClick={handleClearKey}>
              {t.clearAllKeyData}
            </Button>

            {message && (
              <p className="text-xs text-indigo-600 dark:text-indigo-400">{message}</p>
            )}
          </section>

          {/* Language */}
          <section className="space-y-3">
            <SectionTitle uppercase>{t.language}</SectionTitle>
            <LanguageSelector />
          </section>
        </div>
      </motion.div>
    </>
  );
}
