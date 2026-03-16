import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PERSONALITY_PRESETS } from '@/personality/presets';
import type { PersonalityConfig } from '@/personality/types';

function createEmptyConfig(): PersonalityConfig {
  return {
    id: crypto.randomUUID(),
    name: '',
    version: 1,
    createdAt: new Date().toISOString(),
    identity: { name: '', role: '', backstory: '', expertise: [] },
    voice: { model_voice: 'marin', tone: '', verbosity: 'moderate', language: 'en-US' },
    rules: { always: [], never: [], forbidden_topics: [], scope: '' },
    deflections: { out_of_scope: '', jailbreak: '', unknown: '' },
  };
}

export function usePersonalityEditorController() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [config, setConfig] = useState<PersonalityConfig>(createEmptyConfig());
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (id) {
      // Try to load existing personality for editing
      const stored = JSON.parse(
        localStorage.getItem('personalities') ?? '[]'
      ) as PersonalityConfig[];
      const allPersonalities = [...PERSONALITY_PRESETS, ...stored];
      const existing = allPersonalities.find((p) => p.id === id);
      if (existing) {
        setConfig({ ...existing });
        setIsEditing(true);
      }
    }
  }, [id]);

  const updateField = <K extends keyof PersonalityConfig>(
    key: K,
    value: PersonalityConfig[K]
  ) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    const existing = JSON.parse(
      localStorage.getItem('personalities') ?? '[]'
    ) as PersonalityConfig[];
    const updated = [config, ...existing.filter((p) => p.id !== config.id)];
    localStorage.setItem('personalities', JSON.stringify(updated));
    navigate('/');
  };

  const canSave = Boolean(config.name && config.identity.name);

  return {
    config,
    updateField,
    handleSave,
    canSave,
    isEditing,
  };
}
