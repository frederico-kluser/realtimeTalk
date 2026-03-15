import { useState } from 'react';
import { Link } from 'react-router-dom';
import { apiKeyManager } from '@/storage/keyManager';

export function SettingsPage() {
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

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-gray-900">
      <header className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <Link
          to="/"
          className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Settings</h1>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-6 max-w-lg mx-auto w-full space-y-6">
        {/* API Key Section */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white uppercase">API Key (BYOK)</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Your API key is stored in memory only. Optionally encrypt and persist it with a passphrase.
          </p>

          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="sk-..."
            className="w-full text-sm px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />

          <button
            onClick={handleSaveKey}
            disabled={!apiKey}
            className="w-full text-sm px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 disabled:opacity-50"
          >
            Save to Memory
          </button>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-3 space-y-2">
            <input
              type="password"
              value={passphrase}
              onChange={(e) => setPassphrase(e.target.value)}
              placeholder="Encryption passphrase"
              className="w-full text-sm px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => void handlePersist()}
                disabled={!saved}
                className="text-sm px-3 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50"
              >
                Encrypt & Save
              </button>
              <button
                onClick={() => void handleLoadKey()}
                className="text-sm px-3 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                Load Saved Key
              </button>
            </div>
          </div>

          <button
            onClick={handleClearKey}
            className="w-full text-sm px-4 py-2 text-red-500 border border-red-300 dark:border-red-700 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            Clear All Key Data
          </button>
        </section>

        {/* Status message */}
        {message && (
          <p className="text-sm text-center text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-2">
            {message}
          </p>
        )}

        {/* Info */}
        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white uppercase">About</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Voice AI App uses WebRTC to connect directly to OpenAI's Realtime API. No backend, no data stored on servers. Your API key never leaves your browser.
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Encryption uses AES-256-GCM with PBKDF2 key derivation (100K iterations).
          </p>
        </section>
      </div>
    </div>
  );
}
