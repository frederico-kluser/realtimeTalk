import { useSettingsController } from './useSettingsController';
import { SettingsPageView } from './SettingsPageView';

export function SettingsPage() {
  const controller = useSettingsController();
  return <SettingsPageView {...controller} />;
}
