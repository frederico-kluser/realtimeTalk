import { useCallback, useState } from 'react';
import { compilePersonalityPrompt } from '@/personality/compiler';
import { PERSONALITY_PRESETS } from '@/personality/presets';
import type { PersonalityConfig } from '@/personality/types';
import type { RealtimeSessionHandle } from './useRealtimeSession';
import { sessionContext } from '@/actions/sessionContext';

export function usePersonality(session: RealtimeSessionHandle) {
  const [active, setActive] = useState<PersonalityConfig | null>(null);

  const applyPersonality = useCallback((config: PersonalityConfig) => {
    const prompt = compilePersonalityPrompt(config);
    sessionContext.setPersonalityPrompt(prompt);
    session.sendEvent({
      type: 'session.update',
      session: {
        instructions: prompt,
        voice: config.voice.model_voice,
      },
    });
    setActive(config);
  }, [session]);

  const saveToStorage = useCallback((config: PersonalityConfig) => {
    const existing = JSON.parse(
      localStorage.getItem('personalities') ?? '[]'
    ) as PersonalityConfig[];
    const updated = [
      config,
      ...existing.filter(p => p.id !== config.id),
    ];
    localStorage.setItem('personalities', JSON.stringify(updated));
  }, []);

  const loadFromStorage = useCallback((): PersonalityConfig[] => {
    const stored = JSON.parse(
      localStorage.getItem('personalities') ?? '[]'
    ) as PersonalityConfig[];
    return [...PERSONALITY_PRESETS, ...stored];
  }, []);

  return { active, applyPersonality, saveToStorage, loadFromStorage };
}
