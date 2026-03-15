import { usePersonalityEditorController } from './usePersonalityEditorController';
import { PersonalityEditorView } from './PersonalityEditorView';

export function PersonalityEditorPage() {
  const controller = usePersonalityEditorController();
  return <PersonalityEditorView {...controller} />;
}
