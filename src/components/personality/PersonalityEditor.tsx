import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { PersonalityConfig } from '@/personality/types';
import type { RealtimeVoice } from '@/core/types/realtime';

const VOICES: RealtimeVoice[] = [
  'alloy', 'ash', 'ballad', 'coral', 'echo', 'sage', 'shimmer', 'verse', 'marin', 'cedar'
];

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

export function PersonalityEditor() {
  const navigate = useNavigate();
  const [config, setConfig] = useState<PersonalityConfig>(createEmptyConfig());
  const [expertiseInput, setExpertiseInput] = useState('');
  const [alwaysInput, setAlwaysInput] = useState('');
  const [neverInput, setNeverInput] = useState('');

  const update = <K extends keyof PersonalityConfig>(
    key: K,
    value: PersonalityConfig[K]
  ) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    const existing = JSON.parse(
      localStorage.getItem('personalities') ?? '[]'
    ) as PersonalityConfig[];
    const updated = [config, ...existing.filter(p => p.id !== config.id)];
    localStorage.setItem('personalities', JSON.stringify(updated));
    navigate('/');
  };

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-gray-900">
      <header className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <Link to="/" className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Personality Editor</h1>
        </div>
        <button
          onClick={handleSave}
          disabled={!config.name || !config.identity.name}
          className="text-sm px-4 py-1.5 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 disabled:opacity-50"
        >
          Save
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-4 max-w-lg mx-auto w-full space-y-5">
        {/* Basic */}
        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Basic Info</h2>
          <input
            value={config.name}
            onChange={(e) => update('name', e.target.value)}
            placeholder="Personality name"
            className="w-full text-sm px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </section>

        {/* Identity */}
        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Identity</h2>
          <input
            value={config.identity.name}
            onChange={(e) => update('identity', { ...config.identity, name: e.target.value })}
            placeholder="Character name"
            className="w-full text-sm px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
          <input
            value={config.identity.role}
            onChange={(e) => update('identity', { ...config.identity, role: e.target.value })}
            placeholder="Role (e.g., 'Tech Support Specialist')"
            className="w-full text-sm px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
          <textarea
            value={config.identity.backstory}
            onChange={(e) => update('identity', { ...config.identity, backstory: e.target.value })}
            placeholder="Backstory"
            rows={3}
            className="w-full text-sm px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
          />
          <div className="flex gap-2">
            <input
              value={expertiseInput}
              onChange={(e) => setExpertiseInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && expertiseInput.trim()) {
                  update('identity', { ...config.identity, expertise: [...config.identity.expertise, expertiseInput.trim()] });
                  setExpertiseInput('');
                }
              }}
              placeholder="Add expertise (Enter)"
              className="flex-1 text-sm px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div className="flex flex-wrap gap-1">
            {config.identity.expertise.map((e, i) => (
              <span key={i} className="text-xs bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-2 py-1 rounded-full flex items-center gap-1">
                {e}
                <button onClick={() => update('identity', { ...config.identity, expertise: config.identity.expertise.filter((_, j) => j !== i) })} className="hover:text-red-500">&times;</button>
              </span>
            ))}
          </div>
        </section>

        {/* Voice */}
        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Voice</h2>
          <select
            value={config.voice.model_voice}
            onChange={(e) => update('voice', { ...config.voice, model_voice: e.target.value as RealtimeVoice })}
            className="w-full text-sm px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            {VOICES.map(v => <option key={v} value={v}>{v}</option>)}
          </select>
          <input
            value={config.voice.tone}
            onChange={(e) => update('voice', { ...config.voice, tone: e.target.value })}
            placeholder="Tone (e.g., 'friendly, clear, empathetic')"
            className="w-full text-sm px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
          <select
            value={config.voice.verbosity}
            onChange={(e) => update('voice', { ...config.voice, verbosity: e.target.value as 'concise' | 'moderate' | 'detailed' })}
            className="w-full text-sm px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="concise">Concise</option>
            <option value="moderate">Moderate</option>
            <option value="detailed">Detailed</option>
          </select>
        </section>

        {/* Rules */}
        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Rules</h2>
          <textarea
            value={config.rules.scope}
            onChange={(e) => update('rules', { ...config.rules, scope: e.target.value })}
            placeholder="Scope of the assistant"
            rows={2}
            className="w-full text-sm px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
          />

          <input
            value={alwaysInput}
            onChange={(e) => setAlwaysInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && alwaysInput.trim()) {
                update('rules', { ...config.rules, always: [...config.rules.always, alwaysInput.trim()] });
                setAlwaysInput('');
              }
            }}
            placeholder="Always do... (Enter)"
            className="w-full text-sm px-3 py-2 rounded-lg border border-green-300 dark:border-green-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
          <div className="flex flex-wrap gap-1">
            {config.rules.always.map((r, i) => (
              <span key={i} className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-1 rounded-full flex items-center gap-1">
                {r}
                <button onClick={() => update('rules', { ...config.rules, always: config.rules.always.filter((_, j) => j !== i) })} className="hover:text-red-500">&times;</button>
              </span>
            ))}
          </div>

          <input
            value={neverInput}
            onChange={(e) => setNeverInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && neverInput.trim()) {
                update('rules', { ...config.rules, never: [...config.rules.never, neverInput.trim()] });
                setNeverInput('');
              }
            }}
            placeholder="Never do... (Enter)"
            className="w-full text-sm px-3 py-2 rounded-lg border border-red-300 dark:border-red-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
          <div className="flex flex-wrap gap-1">
            {config.rules.never.map((r, i) => (
              <span key={i} className="text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 px-2 py-1 rounded-full flex items-center gap-1">
                {r}
                <button onClick={() => update('rules', { ...config.rules, never: config.rules.never.filter((_, j) => j !== i) })} className="hover:text-red-500">&times;</button>
              </span>
            ))}
          </div>
        </section>

        {/* Deflections */}
        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Deflection Responses</h2>
          <input
            value={config.deflections.out_of_scope}
            onChange={(e) => update('deflections', { ...config.deflections, out_of_scope: e.target.value })}
            placeholder="Out of scope response"
            className="w-full text-sm px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
          <input
            value={config.deflections.jailbreak}
            onChange={(e) => update('deflections', { ...config.deflections, jailbreak: e.target.value })}
            placeholder="Identity challenge response"
            className="w-full text-sm px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
          <input
            value={config.deflections.unknown}
            onChange={(e) => update('deflections', { ...config.deflections, unknown: e.target.value })}
            placeholder="Unknown answer response"
            className="w-full text-sm px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </section>
      </div>
    </div>
  );
}
