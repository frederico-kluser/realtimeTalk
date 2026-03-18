import { useSpreadsheetController } from './useSpreadsheetController';
import { SpreadsheetPageView } from './SpreadsheetPageView';

export function SpreadsheetPage() {
  const controller = useSpreadsheetController();
  return <SpreadsheetPageView {...controller} />;
}
