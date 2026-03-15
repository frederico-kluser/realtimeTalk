import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { en } from './en';
import { pt } from './pt';

export type Locale = 'en' | 'pt';

const TRANSLATIONS = { en, pt } as const;
const STORAGE_KEY = 'realtimetalk-locale';

function detectLocale(): Locale {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'en' || stored === 'pt') return stored;

  const browserLang = navigator.language || (navigator as { userLanguage?: string }).userLanguage || '';
  if (browserLang.startsWith('pt')) return 'pt';
  return 'en';
}

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: typeof en;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(detectLocale);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem(STORAGE_KEY, newLocale);
  }, []);

  const t = TRANSLATIONS[locale];

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}

export function useT() {
  return useI18n().t;
}
