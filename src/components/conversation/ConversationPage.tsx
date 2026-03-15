import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useRealtimeSession } from '@/hooks/useRealtimeSession';
import { useAudioControls } from '@/hooks/useAudioControls';
import { useActionRegistry } from '@/hooks/useActionRegistry';
import { usePersonality } from '@/hooks/usePersonality';
import { useMemory } from '@/hooks/useMemory';
import { appActions } from '@/actions/appActions';
import { PERSONALITY_PRESETS } from '@/personality/presets';
import type { PersonalityConfig } from '@/personality/types';
import type { RealtimeModel, RealtimeVoice, ServerEvent, ResponseDoneEvent, VADEagerness } from '@/core/types/realtime';
import type { TranscriptEntry, SessionRecord } from '@/storage/idb';
import { getDB } from '@/storage/idb';
import { estimateCost, formatCost } from '@/utils/costEstimator';
import { apiKeyManager } from '@/storage/keyManager';
import { StatusIndicator } from '@/components/shared/StatusIndicator';
import { AudioVisualizer } from '@/components/shared/AudioVisualizer';
import { TranscriptPanel } from './TranscriptPanel';
import { ActionLogPanel } from './ActionLogPanel';

const MODELS: { value: RealtimeModel; label: string }[] = [
  { value: 'gpt-realtime', label: 'GPT Realtime' },
  { value: 'gpt-realtime-mini', label: 'GPT Realtime Mini' },
  { value: 'gpt-realtime-1.5', label: 'GPT Realtime 1.5' },
];

const VOICES: RealtimeVoice[] = [
  'alloy', 'ash', 'ballad', 'coral', 'echo', 'sage', 'shimmer', 'verse', 'marin', 'cedar'
];

export function ConversationPage() {
  const [model, setModel] = useState<RealtimeModel>('gpt-realtime-mini');
  const [voice, setVoice] = useState<RealtimeVoice>('marin');
  const [vadEagerness, setVadEagerness] = useState<VADEagerness>('medium');
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [totalCost, setTotalCost] = useState(0);
  const [totalTokens, setTotalTokens] = useState(0);
  const [selectedPersonality, setSelectedPersonality] = useState<PersonalityConfig>(PERSONALITY_PRESETS[0]!);
  const [showSettings, setShowSettings] = useState(false);

  const sessionStartRef = useRef<string>(new Date().toISOString());
  const sessionIdRef = useRef<string>(crypto.randomUUID());

  const handleTranscript = useCallback((text: string, role: 'user' | 'assistant') => {
    setTranscript(prev => [...prev, { role, text, timestamp: new Date().toISOString() }]);
  }, []);

  const handleEvent = useCallback((event: ServerEvent) => {
    if (event.type === 'response.done') {
      const done = event as ResponseDoneEvent;
      if (done.response.usage) {
        const cost = estimateCost(model, done.response.usage.input_tokens, done.response.usage.output_tokens);
        setTotalCost(prev => prev + cost);
        setTotalTokens(prev => prev + done.response.usage!.total_tokens);
      }

      void actionHandlers.handleResponseDone(done);
    }

    if (event.type === 'conversation.item.created') {
      const item = event as { item?: { id?: string } };
      if (item.item?.id) {
        // Track for context window management
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [model]);

  const session = useRealtimeSession({
    model,
    voice,
    initialConfig: {
      model,
      voice,
      tools: appActions.getToolDefinitions(),
      tool_choice: 'auto',
      turn_detection: {
        type: 'semantic_vad',
        eagerness: vadEagerness,
        create_response: true,
        interrupt_response: true,
      },
    },
    onEvent: handleEvent,
    onTranscript: handleTranscript,
    onError: (err) => console.error('Session error:', err),
  });

  const audioControls = useAudioControls(session.mediaStream);
  const actionHandlers = useActionRegistry(appActions, session);
  const personality = usePersonality(session);
  const memory = useMemory();

  // Apply personality and inject memories on connect
  useEffect(() => {
    if (session.status === 'connected') {
      personality.applyPersonality(selectedPersonality);
      void memory.loadAndInjectMemories(session.sendEvent);
      actionHandlers.syncTools();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.status]);

  const handleConnect = useCallback(async () => {
    if (!apiKeyManager.hasKey()) {
      setShowSettings(true);
      return;
    }
    sessionStartRef.current = new Date().toISOString();
    sessionIdRef.current = crypto.randomUUID();
    setTranscript([]);
    setTotalCost(0);
    setTotalTokens(0);
    await session.connect();
  }, [session]);

  const handleDisconnect = useCallback(async () => {
    session.disconnect();

    // Save session to IndexedDB
    if (transcript.length > 0) {
      const record: SessionRecord = {
        id: sessionIdRef.current,
        startedAt: sessionStartRef.current,
        endedAt: new Date().toISOString(),
        model,
        durationMs: Date.now() - new Date(sessionStartRef.current).getTime(),
        totalTokens,
        estimatedCostUsd: totalCost,
        transcript,
        actionsTriggered: actionHandlers.actionLog.map(a => a.name),
        personalityId: selectedPersonality.id,
      };

      try {
        const db = await getDB();
        await db.put('sessions', record);
      } catch (e) {
        console.error('Failed to save session:', e);
      }

      // Extract memories
      const fullTranscript = transcript.map(t => `${t.role}: ${t.text}`).join('\n');
      void memory.extractAndSaveFacts(sessionIdRef.current, fullTranscript);
    }
  }, [session, transcript, model, totalTokens, totalCost, actionHandlers.actionLog, selectedPersonality.id, memory]);

  const isActive = session.status !== 'idle' && session.status !== 'disconnected' && session.status !== 'error';

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-gray-900">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Voice AI</h1>
          <StatusIndicator status={session.status} />
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
            <span>{formatCost(totalCost)}</span>
            <span className="text-gray-300 dark:text-gray-600">|</span>
            <span>{totalTokens.toLocaleString()} tok</span>
          </div>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            title="Settings"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
          <Link
            to="/history"
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            title="History"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </Link>
        </div>
      </header>

      {/* Settings Panel (collapsible) */}
      {showSettings && (
        <SettingsPanel
          model={model}
          setModel={setModel}
          voice={voice}
          setVoice={setVoice}
          vadEagerness={vadEagerness}
          setVadEagerness={setVadEagerness}
          selectedPersonality={selectedPersonality}
          setSelectedPersonality={setSelectedPersonality}
          isActive={isActive}
        />
      )}

      {/* Transcript */}
      <TranscriptPanel entries={transcript} />

      {/* Action Log */}
      <ActionLogPanel entries={actionHandlers.actionLog} />

      {/* Controls */}
      <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-4">
        <div className="flex flex-col items-center gap-3">
          {/* Audio Visualizer */}
          {isActive && (
            <AudioVisualizer
              getFrequencyData={audioControls.getFrequencyData}
              isActive={session.status === 'listening' || session.status === 'speaking'}
            />
          )}

          {/* Main Controls */}
          <div className="flex items-center gap-3">
            {/* Mute Button */}
            {isActive && (
              <button
                onClick={audioControls.toggleMute}
                className={`p-3 rounded-full transition-colors ${
                  audioControls.muted
                    ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                }`}
                title={audioControls.muted ? 'Unmute' : 'Mute'}
              >
                {audioControls.muted ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m-4 0h8m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                )}
              </button>
            )}

            {/* Connect/Disconnect Button */}
            <button
              onClick={isActive ? () => void handleDisconnect() : () => void handleConnect()}
              disabled={session.status === 'connecting'}
              className={`px-8 py-3 rounded-full font-medium text-sm transition-all ${
                isActive
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : session.status === 'connecting'
                  ? 'bg-yellow-500 text-white cursor-wait'
                  : 'bg-indigo-500 hover:bg-indigo-600 text-white'
              }`}
            >
              {isActive ? 'End Session' : session.status === 'connecting' ? 'Connecting...' : 'Start Conversation'}
            </button>
          </div>

          {/* Error display */}
          {session.error && (
            <p className="text-sm text-red-500">{session.error}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function SettingsPanel({
  model, setModel, voice, setVoice, vadEagerness, setVadEagerness,
  selectedPersonality, setSelectedPersonality, isActive
}: {
  model: RealtimeModel;
  setModel: (m: RealtimeModel) => void;
  voice: RealtimeVoice;
  setVoice: (v: RealtimeVoice) => void;
  vadEagerness: VADEagerness;
  setVadEagerness: (v: VADEagerness) => void;
  selectedPersonality: PersonalityConfig;
  setSelectedPersonality: (p: PersonalityConfig) => void;
  isActive: boolean;
}) {
  const [apiKey, setApiKey] = useState(apiKeyManager.hasKey() ? '••••••••' : '');

  const handleSaveKey = () => {
    if (apiKey && !apiKey.startsWith('••')) {
      try {
        apiKeyManager.set(apiKey);
        setApiKey('••••••••');
      } catch (e) {
        alert((e as Error).message);
      }
    }
  };

  return (
    <div className="border-b border-gray-200 dark:border-gray-700 px-4 py-3 bg-gray-50 dark:bg-gray-800/50 space-y-3">
      {/* API Key */}
      <div className="flex items-center gap-2">
        <label className="text-xs font-medium text-gray-600 dark:text-gray-400 w-20">API Key</label>
        <input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          onBlur={handleSaveKey}
          placeholder="sk-..."
          className="flex-1 text-sm px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        />
        <button
          onClick={handleSaveKey}
          className="text-xs px-3 py-1.5 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600"
        >
          Save
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {/* Model */}
        <div>
          <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Model</label>
          <select
            value={model}
            onChange={(e) => setModel(e.target.value as RealtimeModel)}
            disabled={isActive}
            className="w-full text-sm px-2 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            {MODELS.map(m => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
        </div>

        {/* Voice */}
        <div>
          <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Voice</label>
          <select
            value={voice}
            onChange={(e) => setVoice(e.target.value as RealtimeVoice)}
            disabled={isActive}
            className="w-full text-sm px-2 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            {VOICES.map(v => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        </div>

        {/* VAD Eagerness */}
        <div>
          <label className="text-xs font-medium text-gray-600 dark:text-gray-400">VAD</label>
          <select
            value={vadEagerness}
            onChange={(e) => setVadEagerness(e.target.value as VADEagerness)}
            disabled={isActive}
            className="w-full text-sm px-2 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="auto">Auto</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        {/* Personality */}
        <div>
          <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Personality</label>
          <select
            value={selectedPersonality.id}
            onChange={(e) => {
              const p = PERSONALITY_PRESETS.find(p => p.id === e.target.value);
              if (p) setSelectedPersonality(p);
            }}
            className="w-full text-sm px-2 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            {PERSONALITY_PRESETS.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
