import { Input } from '@/components/atoms/Input';
import { Select } from '@/components/atoms/Select';
import { Textarea } from '@/components/atoms/Textarea';
import { SectionTitle } from '@/components/atoms/SectionTitle';
import { TagInput } from '@/components/molecules/TagInput';
import type { PersonalityConfig } from '@/personality/types';
import type { RealtimeVoice } from '@/core/types/realtime';

const VOICE_OPTIONS = [
  'alloy', 'ash', 'ballad', 'coral', 'echo', 'sage', 'shimmer', 'verse', 'marin', 'cedar',
].map((v) => ({ value: v, label: v }));

const VERBOSITY_OPTIONS = [
  { value: 'concise', label: 'Concise' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'detailed', label: 'Detailed' },
];

interface PersonalityFormProps {
  config: PersonalityConfig;
  onUpdate: <K extends keyof PersonalityConfig>(key: K, value: PersonalityConfig[K]) => void;
}

export function PersonalityFormBasicSection({ config, onUpdate }: PersonalityFormProps) {
  return (
    <section className="space-y-2">
      <SectionTitle>Basic Info</SectionTitle>
      <Input
        value={config.name}
        onChange={(e) => onUpdate('name', e.target.value)}
        placeholder="Personality name"
      />
    </section>
  );
}

export function PersonalityFormIdentitySection({ config, onUpdate }: PersonalityFormProps) {
  return (
    <section className="space-y-2">
      <SectionTitle>Identity</SectionTitle>
      <Input
        value={config.identity.name}
        onChange={(e) => onUpdate('identity', { ...config.identity, name: e.target.value })}
        placeholder="Character name"
      />
      <Input
        value={config.identity.role}
        onChange={(e) => onUpdate('identity', { ...config.identity, role: e.target.value })}
        placeholder="Role (e.g., 'Tech Support Specialist')"
      />
      <Textarea
        value={config.identity.backstory}
        onChange={(e) => onUpdate('identity', { ...config.identity, backstory: e.target.value })}
        placeholder="Backstory"
        rows={3}
      />
      <TagInput
        tags={config.identity.expertise}
        onTagsChange={(expertise) => onUpdate('identity', { ...config.identity, expertise })}
        placeholder="Add expertise (Enter)"
        badgeColor="indigo"
      />
    </section>
  );
}

export function PersonalityFormVoiceSection({ config, onUpdate }: PersonalityFormProps) {
  return (
    <section className="space-y-2">
      <SectionTitle>Voice</SectionTitle>
      <Select
        value={config.voice.model_voice}
        onChange={(e) =>
          onUpdate('voice', { ...config.voice, model_voice: e.target.value as RealtimeVoice })
        }
        options={VOICE_OPTIONS}
      />
      <Input
        value={config.voice.tone}
        onChange={(e) => onUpdate('voice', { ...config.voice, tone: e.target.value })}
        placeholder="Tone (e.g., 'friendly, clear, empathetic')"
      />
      <Select
        value={config.voice.verbosity}
        onChange={(e) =>
          onUpdate('voice', {
            ...config.voice,
            verbosity: e.target.value as 'concise' | 'moderate' | 'detailed',
          })
        }
        options={VERBOSITY_OPTIONS}
      />
    </section>
  );
}

export function PersonalityFormRulesSection({ config, onUpdate }: PersonalityFormProps) {
  return (
    <section className="space-y-2">
      <SectionTitle>Rules</SectionTitle>
      <Textarea
        value={config.rules.scope}
        onChange={(e) => onUpdate('rules', { ...config.rules, scope: e.target.value })}
        placeholder="Scope of the assistant"
        rows={2}
      />
      <TagInput
        tags={config.rules.always}
        onTagsChange={(always) => onUpdate('rules', { ...config.rules, always })}
        placeholder="Always do... (Enter)"
        badgeColor="green"
        borderColor="green"
      />
      <TagInput
        tags={config.rules.never}
        onTagsChange={(never) => onUpdate('rules', { ...config.rules, never })}
        placeholder="Never do... (Enter)"
        badgeColor="red"
        borderColor="red"
      />
    </section>
  );
}

export function PersonalityFormDeflectionsSection({ config, onUpdate }: PersonalityFormProps) {
  return (
    <section className="space-y-2">
      <SectionTitle>Deflection Responses</SectionTitle>
      <Input
        value={config.deflections.out_of_scope}
        onChange={(e) =>
          onUpdate('deflections', { ...config.deflections, out_of_scope: e.target.value })
        }
        placeholder="Out of scope response"
      />
      <Input
        value={config.deflections.jailbreak}
        onChange={(e) =>
          onUpdate('deflections', { ...config.deflections, jailbreak: e.target.value })
        }
        placeholder="Identity challenge response"
      />
      <Input
        value={config.deflections.unknown}
        onChange={(e) =>
          onUpdate('deflections', { ...config.deflections, unknown: e.target.value })
        }
        placeholder="Unknown answer response"
      />
    </section>
  );
}
