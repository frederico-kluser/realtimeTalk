import { useCallback, useEffect, useRef, useState } from 'react';
import { useRealtimeSession } from '@/hooks/useRealtimeSession';
import { useAudioControls } from '@/hooks/useAudioControls';
import { useActionRegistry } from '@/hooks/useActionRegistry';
import { usePersonality } from '@/hooks/usePersonality';
import { useMemory } from '@/hooks/useMemory';
import { appActions } from '@/actions/appActions';
import { PERSONALITY_PRESETS } from '@/personality/presets';
import type { RealtimeVoice, ServerEvent, ResponseDoneEvent, VADEagerness } from '@/core/types/realtime';
import type { TranscriptEntry, SessionRecord } from '@/storage/idb';
import { getDB } from '@/storage/idb';
import { estimateCost } from '@/utils/costEstimator';
import { apiKeyManager } from '@/storage/keyManager';
import { sessionContext } from '@/actions/sessionContext';
import type { ActivityType } from '@/components/organisms/ActivityPanel';

const LANGUAGE_TUTOR = PERSONALITY_PRESETS.find((p) => p.id === 'language-tutor')!;
const TUTORIAL_KEY = 'teacher_tutorial_completed';

export function useTeacherController() {
  const [voice, setVoice] = useState<RealtimeVoice>('coral');
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [totalCost, setTotalCost] = useState(0);
  const [totalTokens, setTotalTokens] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [showTutorial, setShowTutorial] = useState(
    () => !localStorage.getItem(TUTORIAL_KEY)
  );
  const [currentActivity, setCurrentActivity] = useState<ActivityType | null>(null);
  const [studentLevel, setStudentLevel] = useState('');
  const [studentStreak, setStudentStreak] = useState(0);
  const [studentPoints, setStudentPoints] = useState(0);

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
            'gpt-realtime-mini',
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
    []
  );

  const session = useRealtimeSession({
    model: 'gpt-realtime-mini',
    voice,
    initialConfig: {
      model: 'gpt-realtime-mini',
      voice,
      tools: appActions.getToolDefinitions(),
      tool_choice: 'auto',
      turn_detection: {
        type: 'semantic_vad',
        eagerness: 'medium' as VADEagerness,
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

  // Load student profile on mount
  useEffect(() => {
    void (async () => {
      try {
        const db = await getDB();
        const profiles = await db.getAll('student_profile');
        if (profiles.length > 0) {
          const profile = profiles[0]!;
          setStudentLevel(profile.level || '');
        }

        const gamificationData = await db.getAll('gamification');
        if (gamificationData.length > 0) {
          const gData = gamificationData[0]!;
          setStudentStreak(gData.streak || 0);
          setStudentPoints(gData.points || 0);
        }
      } catch {
        // Ignore errors on first load
      }
    })();
  }, []);

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
            eagerness: 'medium' as VADEagerness,
            create_response: true,
            interrupt_response: true,
          },
        },
      });
    }
  }, [audioControls, session]);

  // On session connected
  useEffect(() => {
    if (session.status === 'connected') {
      sessionContext.setSendEvent(session.sendEvent);

      // Always apply Language Tutor personality
      const tutorWithVoice = {
        ...LANGUAGE_TUTOR,
        voice: { ...LANGUAGE_TUTOR.voice, model_voice: voice },
      };
      personality.applyPersonality(tutorWithVoice);
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
                text: `You MUST speak ONLY in ${target_language}. If the student doesn't understand, simplify your language but NEVER switch to another language.`,
              }],
            },
          });
        }
      }

      // Inject activity context
      if (currentActivity && currentActivity !== 'free_conversation') {
        const activityPrompts: Record<string, string> = {
          vocabulary_quiz: 'The student wants to do a vocabulary quiz. Start by calling start_vocabulary_quiz with a topic and difficulty matching their level. Guide them through the quiz interactively.',
          grammar_quiz: 'The student wants to do a grammar quiz. Start by calling start_multiple_choice_quiz with difficulty matching their level. Present questions one at a time and explain answers.',
          roleplay: 'The student wants to practice with a roleplay scenario. Ask them which scenario they prefer (restaurant, airport, hotel, job_interview, doctor_visit, shopping, phone_call, meeting) and then call start_roleplay.',
          pronunciation: 'The student wants to practice pronunciation. Start by calling pronunciation_exercise with appropriate difficulty. Guide them through pronunciation exercises, having them repeat after you.',
          dictation: 'The student wants to do a dictation exercise. Start by calling start_dictation with appropriate difficulty. Speak sentences clearly and have the student repeat them.',
          immersion: 'The student wants immersion mode. Call toggle_immersion_mode with enabled=true and the appropriate target language. Speak only in the target language from now on.',
          debate: 'The student wants to practice debating. Propose an interesting topic and call start_debate. Take the opposite side and help them practice argumentation vocabulary.',
        };

        const prompt = activityPrompts[currentActivity];
        if (prompt) {
          session.sendEvent({
            type: 'conversation.item.create',
            item: {
              type: 'message',
              role: 'user',
              content: [{ type: 'input_text', text: prompt }],
            },
          });
          session.sendEvent({ type: 'response.create' });
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.status]);

  const handleSelectActivity = useCallback(async (activity: ActivityType) => {
    if (!apiKeyManager.hasKey()) {
      setShowSettings(true);
      return;
    }

    setCurrentActivity(activity);
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
        model: 'gpt-realtime-mini',
        durationMs: Date.now() - new Date(sessionStartRef.current).getTime(),
        totalTokens,
        estimatedCostUsd: totalCost,
        transcript,
        actionsTriggered: actionHandlers.actionLog.map((a) => a.name),
        personalityId: LANGUAGE_TUTOR.id,
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
    try {
      const db = await getDB();
      const profiles = await db.getAll('student_profile');
      if (profiles.length > 0) {
        setStudentLevel(profiles[0]!.level || '');
      }
      const gamificationData = await db.getAll('gamification');
      if (gamificationData.length > 0) {
        setStudentStreak(gamificationData[0]!.streak || 0);
        setStudentPoints(gamificationData[0]!.points || 0);
      }
    } catch {
      // ignore
    }

    sessionContext.clear();
    setCurrentActivity(null);
  }, [session, transcript, totalTokens, totalCost, actionHandlers.actionLog, memory]);

  const handleTutorialComplete = useCallback(() => {
    localStorage.setItem(TUTORIAL_KEY, 'true');
    setShowTutorial(false);
  }, []);

  const isActive =
    session.status !== 'idle' &&
    session.status !== 'disconnected' &&
    session.status !== 'error';

  const activityLabels: Record<ActivityType, string> = {
    free_conversation: 'Free Conversation',
    vocabulary_quiz: 'Vocabulary Quiz',
    grammar_quiz: 'Grammar Quiz',
    roleplay: 'Roleplay',
    dictation: 'Dictation',
    pronunciation: 'Pronunciation',
    immersion: 'Immersion Mode',
    debate: 'Debate',
  };

  return {
    voice,
    setVoice,
    transcript,
    totalCost,
    totalTokens,
    showSettings,
    setShowSettings,
    showTutorial,
    currentActivity,
    studentLevel,
    studentStreak,
    studentPoints,
    session,
    audioControls,
    actionHandlers,
    isActive,
    activityLabel: currentActivity ? activityLabels[currentActivity] : '',
    handleSelectActivity,
    handleDisconnect,
    handleToggleMute,
    handleTutorialComplete,
    hasApiKey: apiKeyManager.hasKey(),
  };
}
