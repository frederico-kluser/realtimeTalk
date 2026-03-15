import { useCallback, useEffect, useRef, useState } from 'react';
import { useRealtimeSession } from '@/hooks/useRealtimeSession';
import { useAudioControls } from '@/hooks/useAudioControls';
import { useActionRegistry } from '@/hooks/useActionRegistry';
import { usePersonality } from '@/hooks/usePersonality';
import { useMemory } from '@/hooks/useMemory';
import { appActions } from '@/actions/appActions';
import { PERSONALITY_PRESETS } from '@/personality/presets';
import type { PersonalityConfig } from '@/personality/types';
import type {
  RealtimeModel,
  RealtimeVoice,
  ServerEvent,
  ResponseDoneEvent,
  VADEagerness,
} from '@/core/types/realtime';
import type { TranscriptEntry, SessionRecord } from '@/storage/idb';
import { getDB } from '@/storage/idb';
import { estimateCost } from '@/utils/costEstimator';
import { apiKeyManager } from '@/storage/keyManager';

export function useConversationController() {
  const [model, setModel] = useState<RealtimeModel>('gpt-realtime-mini');
  const [voice, setVoice] = useState<RealtimeVoice>('marin');
  const [vadEagerness, setVadEagerness] = useState<VADEagerness>('medium');
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [totalCost, setTotalCost] = useState(0);
  const [totalTokens, setTotalTokens] = useState(0);
  const [selectedPersonality, setSelectedPersonality] = useState<PersonalityConfig>(
    PERSONALITY_PRESETS[0]!
  );
  const [showSettings, setShowSettings] = useState(false);

  const sessionStartRef = useRef<string>(new Date().toISOString());
  const sessionIdRef = useRef<string>(crypto.randomUUID());

  const handleTranscript = useCallback((text: string, role: 'user' | 'assistant') => {
    setTranscript((prev) => [...prev, { role, text, timestamp: new Date().toISOString() }]);
  }, []);

  const handleEvent = useCallback(
    (event: ServerEvent) => {
      if (event.type === 'response.done') {
        const done = event as ResponseDoneEvent;
        if (done.response.usage) {
          const cost = estimateCost(
            model,
            done.response.usage.input_tokens,
            done.response.usage.output_tokens
          );
          setTotalCost((prev) => prev + cost);
          setTotalTokens((prev) => prev + done.response.usage!.total_tokens);
        }

        void actionHandlers.handleResponseDone(done);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [model]
  );

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

  const handleToggleMute = useCallback(() => {
    audioControls.toggleMute();
    const willBeMuted = !audioControls.muted;

    if (willBeMuted) {
      // Cancel any in-progress AI response and clear input buffer
      session.sendEvent({ type: 'response.cancel' });
      session.sendEvent({ type: 'input_audio_buffer.clear' });
      // Disable VAD so the AI won't try to respond while paused
      session.sendEvent({
        type: 'session.update',
        session: { turn_detection: null },
      });
    } else {
      // Re-enable VAD when unpausing
      session.sendEvent({
        type: 'session.update',
        session: {
          turn_detection: {
            type: 'semantic_vad',
            eagerness: vadEagerness,
            create_response: true,
            interrupt_response: true,
          },
        },
      });
    }
  }, [audioControls, session, vadEagerness]);

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
        actionsTriggered: actionHandlers.actionLog.map((a) => a.name),
        personalityId: selectedPersonality.id,
      };

      try {
        const db = await getDB();
        await db.put('sessions', record);
      } catch (e) {
        console.error('Failed to save session:', e);
      }

      const fullTranscript = transcript.map((t) => `${t.role}: ${t.text}`).join('\n');
      void memory.extractAndSaveFacts(sessionIdRef.current, fullTranscript);
    }
  }, [
    session,
    transcript,
    model,
    totalTokens,
    totalCost,
    actionHandlers.actionLog,
    selectedPersonality.id,
    memory,
  ]);

  const isActive =
    session.status !== 'idle' &&
    session.status !== 'disconnected' &&
    session.status !== 'error';

  return {
    model,
    setModel,
    voice,
    setVoice,
    vadEagerness,
    setVadEagerness,
    transcript,
    totalCost,
    totalTokens,
    selectedPersonality,
    setSelectedPersonality,
    showSettings,
    setShowSettings,
    session,
    audioControls,
    actionHandlers,
    isActive,
    handleConnect,
    handleDisconnect,
    handleToggleMute,
  };
}
