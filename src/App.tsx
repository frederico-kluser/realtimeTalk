import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { I18nProvider } from '@/i18n';
import { TeacherPage } from '@/components/pages/TeacherPage';
import { SettingsPage } from '@/components/pages/SettingsPage';
import { HistoryPage } from '@/components/pages/HistoryPage';
import { FaqPage } from '@/components/pages/FaqPage';

export function App() {
  return (
    <I18nProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<TeacherPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/faq" element={<FaqPage />} />
        </Routes>
      </BrowserRouter>
    </I18nProvider>
  );
}
