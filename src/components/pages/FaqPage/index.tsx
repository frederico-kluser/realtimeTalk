import { useFaqController } from './useFaqController';
import { FaqPageView } from './FaqPageView';

export function FaqPage() {
  const controller = useFaqController();
  return <FaqPageView {...controller} />;
}
