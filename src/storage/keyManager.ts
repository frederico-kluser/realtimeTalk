const KEY_STORAGE_ID = 'oai_ek_v1';

class ApiKeyManager {
  private key: string | null = null;

  set(key: string): void {
    if (!key.startsWith('sk-')) throw new Error('Invalid API key format');
    this.key = key;
  }

  get(): string {
    if (!this.key) throw new Error('API key not configured');
    return this.key;
  }

  clear(): void {
    this.key = null;
  }

  hasKey(): boolean {
    return this.key !== null;
  }

  async persistEncrypted(passphrase: string): Promise<void> {
    if (!this.key) return;
    const enc = new TextEncoder();
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));

    const baseKey = await crypto.subtle.importKey(
      'raw', enc.encode(passphrase), 'PBKDF2', false, ['deriveKey']
    );
    const aesKey = await crypto.subtle.deriveKey(
      { name: 'PBKDF2', salt, iterations: 100_000, hash: 'SHA-256' },
      baseKey,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt']
    );
    const ciphertext = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      aesKey,
      enc.encode(this.key)
    );

    const payload = {
      salt: btoa(String.fromCharCode(...salt)),
      iv: btoa(String.fromCharCode(...iv)),
      data: btoa(String.fromCharCode(...new Uint8Array(ciphertext))),
    };
    localStorage.setItem(KEY_STORAGE_ID, JSON.stringify(payload));
  }

  async loadEncrypted(passphrase: string): Promise<boolean> {
    const raw = localStorage.getItem(KEY_STORAGE_ID);
    if (!raw) return false;

    try {
      const { salt, iv, data } = JSON.parse(raw) as Record<string, string>;
      const enc = new TextEncoder();
      const dec = new TextDecoder();
      const saltBuf = Uint8Array.from(atob(salt!), c => c.charCodeAt(0));
      const ivBuf = Uint8Array.from(atob(iv!), c => c.charCodeAt(0));
      const dataBuf = Uint8Array.from(atob(data!), c => c.charCodeAt(0));

      const baseKey = await crypto.subtle.importKey(
        'raw', enc.encode(passphrase), 'PBKDF2', false, ['deriveKey']
      );
      const aesKey = await crypto.subtle.deriveKey(
        { name: 'PBKDF2', salt: saltBuf, iterations: 100_000, hash: 'SHA-256' },
        baseKey,
        { name: 'AES-GCM', length: 256 },
        false,
        ['decrypt']
      );
      const plaintext = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: ivBuf }, aesKey, dataBuf
      );
      this.key = dec.decode(plaintext);
      return true;
    } catch {
      return false;
    }
  }

  clearPersisted(): void {
    localStorage.removeItem(KEY_STORAGE_ID);
  }
}

export const apiKeyManager = new ApiKeyManager();
