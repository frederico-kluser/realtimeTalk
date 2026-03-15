import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const [config, setConfig] = useState<PersonalityConfig>(createEmptyConfig());

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
  };
}
