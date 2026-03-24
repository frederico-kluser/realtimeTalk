import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
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
import { sessionContext } from '@/actions/sessionContext';

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
  const [showContextModal, setShowContextModal] = useState(false);
  const [pendingContext, setPendingContext] = useState<string>('');
  const [resumingSession, setResumingSession] = useState<SessionRecord | null>(null);

  const location = useLocation();
  const sessionStartRef = useRef<string>(new Date().toISOString());
  const sessionIdRef = useRef<string>(crypto.randomUUID());
  const resumeHandledRef = useRef(false);

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
      session.sendEvent({ type: 'response.cancel' });
      session.sendEvent({ type: 'input_audio_buffer.clear' });
      session.sendEvent({
        type: 'session.update',
        session: { turn_detection: null },
      });
    } else {
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
      sessionContext.setSendEvent(session.sendEvent);
      sessionContext.setBaseVadEagerness(vadEagerness);
      personality.applyPersonality(selectedPersonality);
      void memory.loadAndInjectMemories(session.sendEvent);
      actionHandlers.syncTools();

      // Restore immersion mode if previously active
      const immersionState = localStorage.getItem('immersion_mode');
      if (immersionState) {
        const { enabled, target_language } = JSON.parse(immersionState) as { enabled: boolean; target_language: string };
        if (enabled && target_language) {
          session.sendEvent({
            type: 'conversation.item.create',
            item: {
              type: 'message',
              role: 'system',
              content: [{
                type: 'input_text',
                text: `You MUST speak ONLY in ${target_language}. If the student doesn't understand, simplify your language but NEVER switch to another language. Use the native language ONLY as an absolute last resort.`,
              }],
            },
          });
        }
      }

      // Inject user context if provided
      if (pendingContext) {
        session.sendEvent({
          type: 'conversation.item.create',
          item: {
            type: 'message',
            role: 'user',
            content: [{ type: 'input_text', text: pendingContext }],
          },
        });
        setPendingContext('');
      }

      // If resuming a session, inject previous transcript as context
      if (resumingSession) {
        const transcriptSummary = resumingSession.transcript
          .map((t) => `${t.role === 'user' ? 'User' : 'Assistant'}: ${t.text}`)
          .join('\n');

        session.sendEvent({
          type: 'conversation.item.create',
          item: {
            type: 'message',
            role: 'system',
            content: [{
              type: 'input_text',
              text: `# PREVIOUS CONVERSATION CONTEXT\nThe user is continuing a previous conversation. Here is the transcript from the previous session:\n\n${transcriptSummary}\n\nContinue the conversation naturally from where it left off. Reference previous topics when relevant.`,
            }],
          },
        });
        session.sendEvent({ type: 'response.create' });
        setResumingSession(null);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.status]);

  const handleConnect = useCallback(async () => {
    if (!apiKeyManager.hasKey()) {
      setShowSettings(true);
      return;
    }
    setShowContextModal(true);
  }, []);

  const handleContextSubmit = useCallback(async (context: string) => {
    setShowContextModal(false);
    setPendingContext(context);
    sessionStartRef.current = new Date().toISOString();
    sessionIdRef.current = crypto.randomUUID();
    sessionContext.setSessionId(sessionIdRef.current);
    setTranscript([]);
    setTotalCost(0);
    setTotalTokens(0);
    await session.connect();
  }, [session]);

  const handleContextClose = useCallback(() => {
    setShowContextModal(false);
  }, []);

  const handleResumeSession = useCallback(async (sessionRecord: SessionRecord) => {
    if (!apiKeyManager.hasKey()) {
      setShowSettings(true);
      return;
    }

    // Load the personality used in the original session
    const allPersonalities = [
      ...PERSONALITY_PRESETS,
      ...JSON.parse(localStorage.getItem('personalities') ?? '[]') as PersonalityConfig[],
    ];
    const originalPersonality = allPersonalities.find((p) => p.id === sessionRecord.personalityId);
    if (originalPersonality) {
      setSelectedPersonality(originalPersonality);
      setVoice(originalPersonality.voice.model_voice);
    }

    // Set model from original session
    setModel(sessionRecord.model as RealtimeModel);

    // Load previous transcript into view
    setTranscript([...sessionRecord.transcript]);
    setResumingSession(sessionRecord);

    sessionStartRef.current = new Date().toISOString();
    sessionIdRef.current = crypto.randomUUID();
    sessionContext.setSessionId(sessionIdRef.current);
    setTotalCost(0);
    setTotalTokens(0);
    await session.connect();
  }, [session]);

  // Handle resume session from navigation state (from History page)
  useEffect(() => {
    const state = location.state as { resumeSession?: SessionRecord } | null;
    if (state?.resumeSession && !resumeHandledRef.current) {
      resumeHandledRef.current = true;
      void handleResumeSession(state.resumeSession);
      window.history.replaceState({}, '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);

  const handleDisconnect = useCallback(async () => {
    session.disconnect();

    if (transcript.length > 0) {
      const pendingReport = sessionContext.getTutorReport();
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
        ...(pendingReport ? { tutorReport: pendingReport } : {}),
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

    sessionContext.clear();
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

  const handlePersonalityChange = useCallback((p: PersonalityConfig) => {
    setSelectedPersonality(p);
    setVoice(p.voice.model_voice);
  }, []);

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
    handlePersonalityChange,
    showSettings,
    setShowSettings,
    showContextModal,
    session,
    audioControls,
    actionHandlers,
    isActive,
    handleConnect,
    handleContextSubmit,
    handleContextClose,
    handleDisconnect,
    handleToggleMute,
    handleResumeSession,
  };
}
