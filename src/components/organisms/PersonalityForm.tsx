import { useRef } from 'react';
import { Input } from '@/components/atoms/Input';
import { Select } from '@/components/atoms/Select';
import { Textarea } from '@/components/atoms/Textarea';
import { SectionTitle } from '@/components/atoms/SectionTitle';
import { TagInput } from '@/components/molecules/TagInput';
import { Button } from '@/components/atoms/Button';
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

const READABLE_EXTENSIONS = [
  '.txt', '.md', '.json', '.csv', '.xml', '.yaml', '.yml', '.html', '.css',
  '.js', '.ts', '.tsx', '.jsx', '.py', '.rb', '.java', '.c', '.cpp', '.h',
  '.sh', '.env', '.toml', '.ini', '.cfg', '.log', '.sql', '.graphql',
];

export function PersonalityFormFileContextSection({ config, onUpdate }: PersonalityFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const files = config.fileContexts ?? [];

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files ?? []);
    const newContexts: Array<{ name: string; content: string }> = [];

    for (const file of selectedFiles) {
      const ext = '.' + file.name.split('.').pop()?.toLowerCase();
      if (!READABLE_EXTENSIONS.includes(ext) && file.type && !file.type.startsWith('text/')) {
        alert(`File "${file.name}" is not a readable text file.`);
        continue;
      }
      if (file.size > 500_000) {
        alert(`File "${file.name}" exceeds 500KB limit.`);
        continue;
      }
      const content = await file.text();
      newContexts.push({ name: file.name, content });
    }

    if (newContexts.length > 0) {
      onUpdate('fileContexts', [...files, ...newContexts]);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeFile = (index: number) => {
    const updated = files.filter((_, i) => i !== index);
    onUpdate('fileContexts', updated);
  };

  return (
    <section className="space-y-2">
      <SectionTitle>File Context</SectionTitle>
      <p className="text-xs text-gray-500 dark:text-gray-400">
        Attach readable files (txt, md, json, csv, code, etc.) as reference context for this personality. Max 500KB per file.
      </p>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={READABLE_EXTENSIONS.join(',')}
        onChange={(e) => void handleFileSelect(e)}
        className="hidden"
      />

      <Button
        variant="ghost"
        size="sm"
        onClick={() => fileInputRef.current?.click()}
      >
        + Attach Files
      </Button>

      {files.length > 0 && (
        <ul className="space-y-1">
          {files.map((f, i) => (
            <li key={i} className="flex items-center justify-between bg-gray-100 dark:bg-gray-800 rounded px-3 py-1.5 text-sm">
              <span className="truncate text-gray-700 dark:text-gray-300">{f.name}</span>
              <span className="flex items-center gap-2 shrink-0 ml-2">
                <span className="text-xs text-gray-400">{(f.content.length / 1024).toFixed(1)}KB</span>
                <button
                  onClick={() => removeFile(i)}
                  className="text-red-500 hover:text-red-700 text-xs font-bold"
                >
                  x
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}
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
