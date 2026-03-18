import { I18nProvider } from '@/i18n';
import { SpreadsheetPage } from '@/components/pages/SpreadsheetPage';

export function App() {
  return (
    <I18nProvider>
      <SpreadsheetPage />
    </I18nProvider>
  );
}
