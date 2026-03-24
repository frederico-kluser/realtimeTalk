import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useRealtimeSession } from '@/hooks/useRealtimeSession';
import { useAudioControls } from '@/hooks/useAudioControls';
import { useActionRegistry } from '@/hooks/useActionRegistry';
import { usePersonality } from '@/hooks/usePersonality';
import { useMemory } from '@/hooks/useMemory';
import { appActions } from '@/actions/appActions';
import { PERSONALITY_PRESETS } from '@/personality/presets';
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

const SOFIA_PERSONALITY = PERSONALITY_PRESETS.find((p) => p.id === 'language-tutor')!;
const TUTORIAL_STORAGE_KEY = 'teacher_tutorial_completed';

export function useTeacherController() {
  const [model] = useState<RealtimeModel>('gpt-realtime-mini');
  const [voice, setVoice] = useState<RealtimeVoice>(SOFIA_PERSONALITY.voice.model_voice as RealtimeVoice);
  const [vadEagerness] = useState<VADEagerness>('medium');
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [totalCost, setTotalCost] = useState(0);
  const [totalTokens, setTotalTokens] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [pendingActivity, setPendingActivity] = useState<string | null>(null);
  const [resumingSession, setResumingSession] = useState<SessionRecord | null>(null);

  // Student profile state
  const [studentLevel, setStudentLevel] = useState<string | null>(null);
  const [studentStreak, setStudentStreak] = useState(0);
  const [studentPoints, setStudentPoints] = useState(0);

  const location = useLocation();
  const sessionStartRef = useRef<string>(new Date().toISOString());
  const sessionIdRef = useRef<string>(crypto.randomUUID());
  const resumeHandledRef = useRef(false);

  // Load student profile on mount
  useEffect(() => {
    void (async () => {
      try {
        const db = await getDB();
        const profiles = await db.getAll('student_profile');
        if (profiles.length > 0) {
          const profile = profiles[0]!;
          setStudentLevel(profile.level ?? null);
        }
        const gamData = await db.getAll('gamification');
        if (gamData.length > 0) {
          const gam = gamData[0]!;
          setStudentPoints(gam.points ?? 0);
          setStudentStreak(gam.streak ?? 0);
        }
      } catch {
        // IndexedDB not available or empty
      }
    })();
  }, []);

  // Check if tutorial should be shown
  useEffect(() => {
    if (!localStorage.getItem(TUTORIAL_STORAGE_KEY)) {
      setShowTutorial(true);
    }
  }, []);

  const handleTutorialComplete = useCallback(() => {
    localStorage.setItem(TUTORIAL_STORAGE_KEY, 'true');
    setShowTutorial(false);
  }, []);

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

  // Apply personality and inject memories when connected
  useEffect(() => {
    if (session.status === 'connected') {
      sessionContext.setSendEvent(session.sendEvent);
      sessionContext.setBaseVadEagerness(vadEagerness);
      personality.applyPersonality(SOFIA_PERSONALITY);
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

      // Inject activity context if user selected one from welcome screen
      if (pendingActivity) {
        const activityPrompts: Record<string, string> = {
          free: 'Let\'s have a free conversation to practice English.',
          quiz: 'I want to start a vocabulary quiz.',
          roleplay: 'Let\'s do a roleplay scenario.',
          pronunciation: 'I want to practice pronunciation.',
          dictation: 'Let\'s do a dictation exercise.',
          flashcards: 'Let\'s review my flashcards.',
          debate: 'Let\'s have a debate to practice argumentation.',
        };

        const prompt = activityPrompts[pendingActivity] ?? pendingActivity;
        session.sendEvent({
          type: 'conversation.item.create',
          item: {
            type: 'message',
            role: 'user',
            content: [{ type: 'input_text', text: prompt }],
          },
        });
        session.sendEvent({ type: 'response.create' });
        setPendingActivity(null);
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

  const handleConnect = useCallback(async (activity?: string) => {
    if (!apiKeyManager.hasKey()) {
      setShowSettings(true);
      return;
    }
    if (activity) {
      setPendingActivity(activity);
    }
    sessionStartRef.current = new Date().toISOString();
    sessionIdRef.current = crypto.randomUUID();
    sessionContext.setSessionId(sessionIdRef.current);
    setTranscript([]);
    setTotalCost(0);
    setTotalTokens(0);
    await session.connect();
  }, [session]);

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
        personalityId: SOFIA_PERSONALITY.id,
        ...(pendingReport ? { tutorReport: pendingReport } : {}),
      };

      try {
        const db = await getDB();
        await db.put('sessions', record);

        // Refresh student data after session
        const profiles = await db.getAll('student_profile');
        if (profiles.length > 0) {
          setStudentLevel(profiles[0]!.level ?? null);
        }
        const gamData = await db.getAll('gamification');
        if (gamData.length > 0) {
          setStudentPoints(gamData[0]!.points ?? 0);
          setStudentStreak(gamData[0]!.streak ?? 0);
        }
      } catch (e) {
        console.error('Failed to save session:', e);
      }

      const fullTranscript = transcript.map((t) => `${t.role}: ${t.text}`).join('\n');
      void memory.extractAndSaveFacts(sessionIdRef.current, fullTranscript);
    }

    sessionContext.clear();
  }, [session, transcript, model, totalTokens, totalCost, actionHandlers.actionLog, memory]);

  // Inject a user message into active session (for quick actions and challenge answers)
  const injectUserMessage = useCallback((text: string) => {
    if (session.status !== 'idle' && session.status !== 'disconnected') {
      session.sendEvent({
        type: 'conversation.item.create',
        item: {
          type: 'message',
          role: 'user',
          content: [{ type: 'input_text', text }],
        },
      });
      session.sendEvent({ type: 'response.create' });
      setTranscript((prev) => [...prev, { role: 'user', text, timestamp: new Date().toISOString() }]);
    }
  }, [session]);

  // Handle resume session from navigation state (from History page)
  useEffect(() => {
    const state = location.state as { resumeSession?: SessionRecord } | null;
    if (state?.resumeSession && !resumeHandledRef.current) {
      resumeHandledRef.current = true;
      setTranscript([...state.resumeSession.transcript]);
      setResumingSession(state.resumeSession);
      void (async () => {
        sessionStartRef.current = new Date().toISOString();
        sessionIdRef.current = crypto.randomUUID();
        sessionContext.setSessionId(sessionIdRef.current);
        setTotalCost(0);
        setTotalTokens(0);
        await session.connect();
      })();
      window.history.replaceState({}, '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);

  const isActive =
    session.status !== 'idle' &&
    session.status !== 'disconnected' &&
    session.status !== 'error';

  return {
    voice,
    setVoice,
    transcript,
    totalCost,
    totalTokens,
    showSettings,
    setShowSettings,
    showTutorial,
    handleTutorialComplete,
    session,
    audioControls,
    actionHandlers,
    isActive,
    handleConnect,
    handleDisconnect,
    handleToggleMute,
    injectUserMessage,
    studentLevel,
    studentStreak,
    studentPoints,
  };
}
