import { motion } from 'motion/react';
import { PageLayout } from '@/components/templates/PageLayout';
import { AppHeader } from '@/components/organisms/AppHeader';
import { Button } from '@/components/atoms/Button';
import {
  PersonalityFormBasicSection,
  PersonalityFormIdentitySection,
  PersonalityFormVoiceSection,
  PersonalityFormRulesSection,
  PersonalityFormDeflectionsSection,
  PersonalityFormFileContextSection,
} from '@/components/organisms/PersonalityForm';
import { useT } from '@/i18n';
import type { usePersonalityEditorController } from './usePersonalityEditorController';

type PersonalityEditorViewProps = ReturnType<typeof usePersonalityEditorController>;

export function PersonalityEditorView({
  config,
  updateField,
  handleSave,
  canSave,
}: PersonalityEditorViewProps) {
  const t = useT();

  const sections = [
    <PersonalityFormBasicSection key="basic" config={config} onUpdate={updateField} />,
    <PersonalityFormIdentitySection key="identity" config={config} onUpdate={updateField} />,
    <PersonalityFormVoiceSection key="voice" config={config} onUpdate={updateField} />,
    <PersonalityFormRulesSection key="rules" config={config} onUpdate={updateField} />,
    <PersonalityFormFileContextSection key="file" config={config} onUpdate={updateField} />,
    <PersonalityFormDeflectionsSection key="deflections" config={config} onUpdate={updateField} />,
  ];

  return (
    <PageLayout>
      <AppHeader title={t.personalityEditor} backTo="/">
        <Button variant="primary" size="xs" onClick={handleSave} disabled={!canSave}>
          {t.save}
        </Button>
      </AppHeader>

      <div className="flex-1 overflow-y-auto px-4 py-4 max-w-lg mx-auto w-full space-y-5">
        {sections.map((section, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 30,
              delay: i * 0.05,
            }}
          >
            {section}
          </motion.div>
        ))}
      </div>
    </PageLayout>
  );
}
