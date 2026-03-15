import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { I18nProvider } from '@/i18n';
import { ConversationPage } from '@/components/pages/ConversationPage';
import { SettingsPage } from '@/components/pages/SettingsPage';
import { HistoryPage } from '@/components/pages/HistoryPage';
import { PersonalityEditorPage } from '@/components/pages/PersonalityEditorPage';
import { FaqPage } from '@/components/pages/FaqPage';

export function App() {
  return (
    <I18nProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<ConversationPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/personality/:id?" element={<PersonalityEditorPage />} />
          <Route path="/faq" element={<FaqPage />} />
        </Routes>
      </BrowserRouter>
    </I18nProvider>
  );
}
