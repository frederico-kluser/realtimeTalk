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
} from '@/core/types/realtime';
import type { TranscriptEntry, SessionRecord, StudentProfile, GamificationData } from '@/storage/idb';
import { getDB } from '@/storage/idb';
import { estimateCost } from '@/utils/costEstimator';
import { apiKeyManager } from '@/storage/keyManager';
import { sessionContext } from '@/actions/sessionContext';
import {
  onChallenge,
  offChallenge,
  onDismissChallenge,
  offDismissChallenge,
} from '@/core/events/challengeEvents';
import type { Challenge } from '@/core/events/challengeEvents';
import type { QuickAction } from '@/components/organisms/QuickActionBar';

// Always use Language Tutor (Sofia) personality
const SOFIA_PERSONALITY = PERSONALITY_PRESETS.find((p) => p.id === 'language-tutor')!;

export function useTeacherController() {
  // Only voice is user-configurable
  const [voice, setVoice] = useState<RealtimeVoice>('coral');
  const [model, setModel] = useState<RealtimeModel>('gpt-realtime-mini');

  // Session state
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [totalCost, setTotalCost] = useState(0);
  const [totalTokens, setTotalTokens] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Challenge state
  const [activeChallenge, setActiveChallenge] = useState<Challenge | null>(null);

  // Student data
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);
  const [gamificationData, setGamificationData] = useState<GamificationData | null>(null);

  // Activity context
  const [pendingActivity, setPendingActivity] = useState<string>('');
  const [resumingSession, setResumingSession] = useState<SessionRecord | null>(null);

  const location = useLocation();
  const sessionStartRef = useRef<string>(new Date().toISOString());
  const sessionIdRef = useRef<string>(crypto.randomUUID());
  const resumeHandledRef = useRef(false);

  // Transcript handler
  const handleTranscript = useCallback((text: string, role: 'user' | 'assistant') => {
    setTranscript((prev) => [...prev, { role, text, timestamp: new Date().toISOString() }]);
  }, []);

  // Event handler
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

  // Core hooks
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
        eagerness: 'medium',
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

  // Check onboarding on mount
  useEffect(() => {
    const onboarded = localStorage.getItem('teacher_onboarded');
    if (!onboarded) {
      setShowOnboarding(true);
    }
  }, []);

  // Load student data on mount
  useEffect(() => {
    void loadStudentData();
  }, []);

  // Listen for challenge events
  useEffect(() => {
    const handleChallengeEvent = (challenge: Challenge) => {
      setActiveChallenge(challenge);
    };
    const handleDismiss = () => {
      setActiveChallenge(null);
    };
    onChallenge(handleChallengeEvent);
    onDismissChallenge(handleDismiss);
    return () => {
      offChallenge(handleChallengeEvent);
      offDismissChallenge(handleDismiss);
    };
  }, []);

  async function loadStudentData() {
    try {
      const db = await getDB();
      const profiles = await db.getAll('student_profile');
      if (profiles.length > 0) {
        setStudentProfile(profiles[0]!);
      }
      const gamification = await db.getAll('gamification');
      if (gamification.length > 0) {
        setGamificationData(gamification[0]!);
      }
    } catch {
      // IndexedDB may not have these stores yet
    }
  }

  // Mute toggle
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
            eagerness: 'medium',
            create_response: true,
            interrupt_response: true,
          },
        },
      });
    }
  }, [audioControls, session]);

  // On connected: apply Sofia + inject memories + activity context
  useEffect(() => {
    if (session.status === 'connected') {
      sessionContext.setSendEvent(session.sendEvent);
      personality.applyPersonality(SOFIA_PERSONALITY);
      void memory.loadAndInjectMemories(session.sendEvent);
      actionHandlers.syncTools();

      // Restore immersion mode if previously active
      const immersionState = localStorage.getItem('immersion_mode');
      if (immersionState) {
        const { enabled, target_language } = JSON.parse(immersionState) as {
          enabled: boolean;
          target_language: string;
        };
        if (enabled && target_language) {
          session.sendEvent({
            type: 'conversation.item.create',
            item: {
              type: 'message',
              role: 'system',
              content: [
                {
                  type: 'input_text',
                  text: `You MUST speak ONLY in ${target_language}. If the student doesn't understand, simplify your language but NEVER switch to another language.`,
                },
              ],
            },
          });
        }
      }

      // Inject activity context if selected
      if (pendingActivity) {
        session.sendEvent({
          type: 'conversation.item.create',
          item: {
            type: 'message',
            role: 'user',
            content: [{ type: 'input_text', text: pendingActivity }],
          },
        });
        session.sendEvent({ type: 'response.create' });
        setPendingActivity('');
      }

      // If resuming a session
      if (resumingSession) {
        const transcriptSummary = resumingSession.transcript
          .map((t) => `${t.role === 'user' ? 'User' : 'Assistant'}: ${t.text}`)
          .join('\n');

        session.sendEvent({
          type: 'conversation.item.create',
          item: {
            type: 'message',
            role: 'system',
            content: [
              {
                type: 'input_text',
                text: `# PREVIOUS CONVERSATION CONTEXT\nThe user is continuing a previous lesson. Here is the transcript:\n\n${transcriptSummary}\n\nContinue naturally from where it left off.`,
              },
            ],
          },
        });
        session.sendEvent({ type: 'response.create' });
        setResumingSession(null);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.status]);

  // Start lesson
  const handleStartLesson = useCallback(
    async (activityPrompt?: string) => {
      if (!apiKeyManager.hasKey()) {
        setShowSettings(true);
        return;
      }
      setPendingActivity(activityPrompt || '');
      sessionStartRef.current = new Date().toISOString();
      sessionIdRef.current = crypto.randomUUID();
      sessionContext.setSessionId(sessionIdRef.current);
      setTranscript([]);
      setTotalCost(0);
      setTotalTokens(0);
      setActiveChallenge(null);
      await session.connect();
    },
    [session]
  );

  // Quick action handler
  const handleQuickAction = useCallback(
    (action: QuickAction) => {
      const isActive =
        session.status !== 'idle' &&
        session.status !== 'disconnected' &&
        session.status !== 'error';

      if (isActive) {
        // Send as message during active session
        session.sendEvent({
          type: 'conversation.item.create',
          item: {
            type: 'message',
            role: 'user',
            content: [{ type: 'input_text', text: action.prompt }],
          },
        });
        session.sendEvent({ type: 'response.create' });
        handleTranscript(action.prompt, 'user');
      } else {
        // Start lesson with this activity
        void handleStartLesson(action.prompt);
      }
    },
    [session, handleStartLesson, handleTranscript]
  );

  // Challenge response
  const handleChallengeResponse = useCallback(
    (response: string) => {
      session.sendEvent({
        type: 'conversation.item.create',
        item: {
          type: 'message',
          role: 'user',
          content: [{ type: 'input_text', text: response }],
        },
      });
      session.sendEvent({ type: 'response.create' });
      handleTranscript(response, 'user');
      setActiveChallenge(null);
    },
    [session, handleTranscript]
  );

  const handleDismissChallenge = useCallback(() => {
    setActiveChallenge(null);
  }, []);

  // Onboarding complete
  const handleOnboardingComplete = useCallback(() => {
    setShowOnboarding(false);
  }, []);

  // Disconnect
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
      } catch (e) {
        console.error('Failed to save session:', e);
      }

      const fullTranscript = transcript.map((t) => `${t.role}: ${t.text}`).join('\n');
      void memory.extractAndSaveFacts(sessionIdRef.current, fullTranscript);
    }

    // Reload student data after session
    void loadStudentData();
    sessionContext.clear();
    setActiveChallenge(null);
  }, [session, transcript, model, totalTokens, totalCost, actionHandlers.actionLog, memory]);

  // Handle resume from History page
  const handleResumeSession = useCallback(
    async (sessionRecord: SessionRecord) => {
      if (!apiKeyManager.hasKey()) {
        setShowSettings(true);
        return;
      }
      setModel(sessionRecord.model as RealtimeModel);
      setTranscript([...sessionRecord.transcript]);
      setResumingSession(sessionRecord);
      sessionStartRef.current = new Date().toISOString();
      sessionIdRef.current = crypto.randomUUID();
      sessionContext.setSessionId(sessionIdRef.current);
      setTotalCost(0);
      setTotalTokens(0);
      await session.connect();
    },
    [session]
  );

  // Listen for resume navigation
  useEffect(() => {
    const state = location.state as { resumeSession?: SessionRecord } | null;
    if (state?.resumeSession && !resumeHandledRef.current) {
      resumeHandledRef.current = true;
      void handleResumeSession(state.resumeSession);
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
    showOnboarding,
    session,
    audioControls,
    actionHandlers,
    isActive,
    activeChallenge,
    studentProfile,
    gamificationData,
    handleStartLesson,
    handleQuickAction,
    handleChallengeResponse,
    handleDismissChallenge,
    handleOnboardingComplete,
    handleDisconnect,
    handleToggleMute,
  };
}
