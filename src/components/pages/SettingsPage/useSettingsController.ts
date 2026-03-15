import { useState } from 'react';
import { apiKeyManager } from '@/storage/keyManager';
import { useT } from '@/i18n';

export function useSettingsController() {
  const t = useT();
  const [apiKey, setApiKey] = useState('');
  const [passphrase, setPassphrase] = useState('');
  const [saved, setSaved] = useState(false);
  const [message, setMessage] = useState('');

  const handleSaveKey = () => {
    try {
      apiKeyManager.set(apiKey);
      setSaved(true);
      setMessage(t.apiKeySaved);
    } catch (e) {
      setMessage((e as Error).message);
    }
  };

  const handlePersist = async () => {
    if (!passphrase) {
      setMessage(t.enterPassphrase);
      return;
    }
    await apiKeyManager.persistEncrypted(passphrase);
    setMessage(t.apiKeyEncrypted);
  };

  const handleLoadKey = async () => {
    if (!passphrase) {
      setMessage(t.enterYourPassphrase);
      return;
    }
    const loaded = await apiKeyManager.loadEncrypted(passphrase);
    if (loaded) {
      setMessage(t.apiKeyLoaded);
      setSaved(true);
    } else {
      setMessage(t.decryptFailed);
    }
  };

  const handleClearKey = () => {
    apiKeyManager.clear();
    apiKeyManager.clearPersisted();
    setApiKey('');
    setSaved(false);
    setMessage(t.apiKeyCleared);
  };

  return {
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
  };
}
