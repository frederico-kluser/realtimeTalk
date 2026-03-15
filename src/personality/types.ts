import type { RealtimeVoice } from '@/core/types/realtime';

export interface PersonalityConfig {
  id: string;
  name: string;
  version: number;
  createdAt: string;
  identity: {
    name: string;
    role: string;
    backstory: string;
    expertise: string[];
  };
  voice: {
    model_voice: RealtimeVoice;
    tone: string;
    verbosity: 'concise' | 'moderate' | 'detailed';
    language: string;
    speaking_style?: string;
  };
  rules: {
    always: string[];
    never: string[];
    forbidden_topics: string[];
    scope: string;
  };
  deflections: {
    out_of_scope: string;
    jailbreak: string;
    unknown: string;
  };
  fileContexts?: Array<{
    name: string;
    content: string;
  }>;
}
