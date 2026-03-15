import { useState } from 'react';
import { apiKeyManager } from '@/storage/keyManager';

export function useSettingsController() {
  const [apiKey, setApiKey] = useState('');
  const [passphrase, setPassphrase] = useState('');
  const [saved, setSaved] = useState(false);
  const [message, setMessage] = useState('');

  const handleSaveKey = () => {
    try {
      apiKeyManager.set(apiKey);
      setSaved(true);
      setMessage('API key saved to memory.');
    } catch (e) {
      setMessage((e as Error).message);
    }
  };

  const handlePersist = async () => {
    if (!passphrase) {
      setMessage('Please enter a passphrase.');
      return;
    }
    await apiKeyManager.persistEncrypted(passphrase);
    setMessage('API key encrypted and saved to localStorage.');
  };

  const handleLoadKey = async () => {
    if (!passphrase) {
      setMessage('Please enter your passphrase.');
      return;
    }
    const loaded = await apiKeyManager.loadEncrypted(passphrase);
    if (loaded) {
      setMessage('API key loaded from encrypted storage.');
      setSaved(true);
    } else {
      setMessage('Failed to decrypt. Wrong passphrase or no saved key.');
    }
  };

  const handleClearKey = () => {
    apiKeyManager.clear();
    apiKeyManager.clearPersisted();
    setApiKey('');
    setSaved(false);
    setMessage('API key cleared from memory and storage.');
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
