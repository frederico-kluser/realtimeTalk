import { useI18n } from '@/i18n';
import type { Locale } from '@/i18n';

export function LanguageSelector() {
  const { locale, setLocale, t } = useI18n();

  return (
    <select
      value={locale}
      onChange={(e) => setLocale(e.target.value as Locale)}
      className="text-xs bg-transparent border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 text-gray-600 dark:text-gray-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      title={t.language}
    >
      <option value="en">{t.languageEnglish}</option>
      <option value="pt">{t.languagePortuguese}</option>
    </select>
  );
}
