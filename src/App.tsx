import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ConversationPage } from '@/components/conversation/ConversationPage';
import { SettingsPage } from '@/components/settings/SettingsPage';
import { HistoryPage } from '@/components/history/HistoryPage';
import { PersonalityEditor } from '@/components/personality/PersonalityEditor';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ConversationPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/personality/:id?" element={<PersonalityEditor />} />
      </Routes>
    </BrowserRouter>
  );
}
