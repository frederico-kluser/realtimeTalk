import { PageLayout } from '@/components/templates/PageLayout';
import { AppHeader } from '@/components/organisms/AppHeader';
import { Button } from '@/components/atoms/Button';
import {
  PersonalityFormBasicSection,
  PersonalityFormIdentitySection,
  PersonalityFormVoiceSection,
  PersonalityFormRulesSection,
  PersonalityFormDeflectionsSection,
} from '@/components/organisms/PersonalityForm';
import type { usePersonalityEditorController } from './usePersonalityEditorController';

type PersonalityEditorViewProps = ReturnType<typeof usePersonalityEditorController>;

export function PersonalityEditorView({
  config,
  updateField,
  handleSave,
  canSave,
}: PersonalityEditorViewProps) {
  return (
    <PageLayout>
      <AppHeader title="Personality Editor" backTo="/">
        <Button variant="primary" size="xs" onClick={handleSave} disabled={!canSave}>
          Save
        </Button>
      </AppHeader>

      <div className="flex-1 overflow-y-auto px-4 py-4 max-w-lg mx-auto w-full space-y-5">
        <PersonalityFormBasicSection config={config} onUpdate={updateField} />
        <PersonalityFormIdentitySection config={config} onUpdate={updateField} />
        <PersonalityFormVoiceSection config={config} onUpdate={updateField} />
        <PersonalityFormRulesSection config={config} onUpdate={updateField} />
        <PersonalityFormDeflectionsSection config={config} onUpdate={updateField} />
      </div>
    </PageLayout>
  );
}
