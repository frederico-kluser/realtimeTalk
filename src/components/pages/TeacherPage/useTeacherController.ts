import { useCallback, useEffect, useRef, useState } from 'react';
import { useRealtimeSession } from '@/hooks/useRealtimeSession';
import { useAudioControls } from '@/hooks/useAudioControls';
import { useActionRegistry } from '@/hooks/useActionRegistry';
import { usePersonality } from '@/hooks/usePersonality';
import { useMemory } from '@/hooks/useMemory';
import { appActions } from '@/actions/appActions';
import { PERSONALITY_PRESETS } from '@/personality/presets';
import type { RealtimeVoice, ServerEvent, ResponseDoneEvent, VADEagerness } from '@/core/types/realtime';
import type { TranscriptEntry, SessionRecord, StudentProfile, GamificationData } from '@/storage/idb';
import { getDB } from '@/storage/idb';
import { estimateCost } from '@/utils/costEstimator';
import { apiKeyManager } from '@/storage/keyManager';
import { sessionContext } from '@/actions/sessionContext';
import { EXPRESSIONS } from '@/actions/data/expressions';
import type { TeacherAction } from '@/components/organisms/TeacherQuickActions';

const SOFIA_PERSONALITY = PERSONALITY_PRESETS.find((p) => p.id === 'language-tutor')!;
const TEACHER_MODEL = 'gpt-realtime' as const;

export function useTeacherController() {
  const [voice, setVoice] = useState<RealtimeVoice>(SOFIA_PERSONALITY.voice.model_voice);
  const [vadEagerness] = useState<VADEagerness>('medium');
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [totalCost, setTotalCost] = useState(0);
  const [totalTokens, setTotalTokens] = useState(0);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);
  const [gamification, setGamification] = useState<GamificationData | null>(null);
  const [sessionMinutes, setSessionMinutes] = useState(0);
  const [correctionsCount, setCorrectionsCount] = useState(0);
  const [wordsLearned, setWordsLearned] = useState(0);
  const [dailyExpression, setDailyExpression] = useState<{ expression: string; meaning: string } | null>(null);

  const sessionStartRef = useRef<string>(new Date().toISOString());
  const sessionIdRef = useRef<string>(crypto.randomUUID());
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleTranscript = useCallback((text: string, role: 'user' | 'assistant') => {
    setTranscript((prev) => [...prev, { role, text, timestamp: new Date().toISOString() }]);
  }, []);

  const handleEvent = useCallback(
    (event: ServerEvent) => {
      if (event.type === 'response.done') {
        const done = event as ResponseDoneEvent;
        if (done.response.usage) {
          const cost = estimateCost(TEACHER_MODEL, done.response.usage.input_tokens, done.response.usage.output_tokens);
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
    model: TEACHER_MODEL,
    voice,
    initialConfig: {
      model: TEACHER_MODEL,
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
    onError: (err) => console.error('Teacher session error:', err),
  });

  const audioControls = useAudioControls(session.mediaStream);
  const actionHandlers = useActionRegistry(appActions, session);
  const personality = usePersonality(session);
  const memory = useMemory();

  // Load student data on mount
  useEffect(() => {
    void loadStudentData();
    const seen = localStorage.getItem('teacher_onboarding_seen');
    if (!seen) setShowOnboarding(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadStudentData() {
    try {
      const db = await getDB();
      const profiles = await db.getAll('student_profile');
      if (profiles.length > 0) setStudentProfile(profiles[0]!);

      const gamData = await db.getAll('gamification');
      if (gamData.length > 0) setGamification(gamData[0]!);

      const vocabEntries = await db.getAll('vocabulary');
      const uniqueWords = new Set(vocabEntries.filter((v) => v.correct).map((v) => v.word));
      setWordsLearned(uniqueWords.size);

      // Load daily expression
      loadDailyExpression();
    } catch {
      // Silent fail — first time user
    }
  }

  function loadDailyExpression() {
    const today = new Date().toISOString().slice(0, 10);
    let hash = 0;
    for (let i = 0; i < today.length; i++) {
      hash = ((hash << 5) - hash + today.charCodeAt(i)) | 0;
    }
    const idx = Math.abs(hash) % EXPRESSIONS.length;
    const expr = EXPRESSIONS[idx];
    if (expr) {
      setDailyExpression({ expression: expr.expression, meaning: expr.meaning });
    }
  }

  const handleToggleMute = useCallback(() => {
    audioControls.toggleMute();
    const willBeMuted = !audioControls.muted;
    if (willBeMuted) {
      session.sendEvent({ type: 'response.cancel' });
      session.sendEvent({ type: 'input_audio_buffer.clear' });
      session.sendEvent({ type: 'session.update', session: { turn_detection: null } });
    } else {
      session.sendEvent({
        type: 'session.update',
        session: {
          turn_detection: { type: 'semantic_vad', eagerness: vadEagerness, create_response: true, interrupt_response: true },
        },
      });
    }
  }, [audioControls, session, vadEagerness]);

  // Apply personality and memory when connected
  useEffect(() => {
    if (session.status === 'connected') {
      sessionContext.setSendEvent(session.sendEvent);
      personality.applyPersonality(SOFIA_PERSONALITY);
      void memory.loadAndInjectMemories(session.sendEvent);
      actionHandlers.syncTools();

      // Restore immersion mode
      const immersionState = localStorage.getItem('immersion_mode');
      if (immersionState) {
        const { enabled, target_language } = JSON.parse(immersionState) as { enabled: boolean; target_language: string };
        if (enabled && target_language) {
          session.sendEvent({
            type: 'conversation.item.create',
            item: {
              type: 'message',
              role: 'system',
              content: [{ type: 'input_text', text: `You MUST speak ONLY in ${target_language}. If the student doesn't understand, simplify but NEVER switch languages.` }],
            },
          });
        }
      }

      // Start session timer
      timerRef.current = setInterval(() => {
        setSessionMinutes((prev) => prev + 1);
      }, 60_000);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.status]);

  const handleConnect = useCallback(async () => {
    if (!apiKeyManager.hasKey()) return;
    sessionStartRef.current = new Date().toISOString();
    sessionIdRef.current = crypto.randomUUID();
    sessionContext.setSessionId(sessionIdRef.current);
    setTranscript([]);
    setTotalCost(0);
    setTotalTokens(0);
    setSessionMinutes(0);
    setCorrectionsCount(0);
    await session.connect();
  }, [session]);

  const handleDisconnect = useCallback(async () => {
    session.disconnect();
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (transcript.length > 0) {
      const pendingReport = sessionContext.getTutorReport();
      const record: SessionRecord = {
        id: sessionIdRef.current,
        startedAt: sessionStartRef.current,
        endedAt: new Date().toISOString(),
        model: TEACHER_MODEL,
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

    sessionContext.clear();
    void loadStudentData();
  }, [session, transcript, totalTokens, totalCost, actionHandlers.actionLog, memory]);

  const handleQuickAction = useCallback(
    (action: TeacherAction) => {
      if (session.status !== 'connected' && session.status !== 'listening' && session.status !== 'speaking') return;

      const commands: Record<TeacherAction, string> = {
        vocab_quiz: 'Start a vocabulary quiz about daily life topics, 10 questions.',
        grammar_quiz: 'Start a grammar multiple choice quiz, 5 questions.',
        roleplay: 'Let\'s practice a roleplay scenario. Suggest a situation for my level.',
        dictation: 'Start a dictation exercise with 5 sentences for my level.',
        flashcards: 'Let\'s review my flashcards.',
        debate: 'Let\'s have a debate. Pick an interesting topic for my level.',
        pronunciation: 'Start a pronunciation exercise for my level.',
        immersion: 'Let\'s switch to immersion mode in English.',
      };

      const text = commands[action];
      if (!text) return;

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
    },
    [session]
  );

  const handleOnboardingComplete = useCallback(() => {
    setShowOnboarding(false);
    localStorage.setItem('teacher_onboarding_seen', 'true');
  }, []);

  const isActive =
    session.status !== 'idle' &&
    session.status !== 'disconnected' &&
    session.status !== 'error';

  const hasApiKey = apiKeyManager.hasKey();

  const level = studentProfile?.level ?? '';
  const points = gamification?.points ?? 0;
  const streak = gamification?.streak ?? 0;
  const progressPercent = studentProfile
    ? Math.min(100, (studentProfile.avgScore / 100) * 100)
    : 0;

  return {
    voice,
    setVoice,
    transcript,
    totalCost,
    totalTokens,
    session,
    audioControls,
    actionHandlers,
    isActive,
    hasApiKey,
    showOnboarding,
    level,
    points,
    streak,
    wordsLearned,
    correctionsCount,
    sessionMinutes,
    progressPercent,
    dailyExpression,
    handleConnect,
    handleDisconnect,
    handleToggleMute,
    handleQuickAction,
    handleOnboardingComplete,
  };
}
