import { useHistoryController } from './useHistoryController';
import { HistoryPageView } from './HistoryPageView';

export function HistoryPage() {
  const controller = useHistoryController();
  return <HistoryPageView {...controller} />;
}
