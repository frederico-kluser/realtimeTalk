import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ConversationPage } from '@/components/pages/ConversationPage';
import { SettingsPage } from '@/components/pages/SettingsPage';
import { HistoryPage } from '@/components/pages/HistoryPage';
import { PersonalityEditorPage } from '@/components/pages/PersonalityEditorPage';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ConversationPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/personality/:id?" element={<PersonalityEditorPage />} />
      </Routes>
    </BrowserRouter>
  );
}
