import { useConversationController } from './useConversationController';
import { ConversationPageView } from './ConversationPageView';

export function ConversationPage() {
  const controller = useConversationController();
  return <ConversationPageView {...controller} />;
}
