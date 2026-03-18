import { useCallback, useEffect, useRef, useState } from 'react';
import type { RealtimeSessionHandle } from './useRealtimeSession';
import type { VADEagerness } from '@/core/types/realtime';

const EAGERNESS_LEVELS: VADEagerness[] = ['low', 'medium', 'high'];
const WINDOW_MS = 60_000;
const FALSE_TRIGGER_THRESHOLD = 4;
const PENDING_TIMEOUT_MS = 4_000;

export function useAdaptiveVAD(
  session: RealtimeSessionHandle,
  initialEagerness: VADEagerness
) {
  const [eagerness, setEagerness] = useState(initialEagerness);

  const speechStartCountRef = useRef(0);
  const transcriptCountRef = useRef(0);
  const pendingSpeechRef = useRef(false);
  const pendingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const windowTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const updateVAD = useCallback((newEagerness: VADEagerness) => {
    setEagerness(newEagerness);
    session.sendEvent({
      type: 'session.update',
      session: {
        turn_detection: {
          type: 'semantic_vad',
          eagerness: newEagerness,
          create_response: true,
          interrupt_response: true,
        },
      },
    });
  }, [session]);

  const onSpeechStarted = useCallback(() => {
    speechStartCountRef.current++;
    pendingSpeechRef.current = true;

    if (pendingTimerRef.current) clearTimeout(pendingTimerRef.current);
    pendingTimerRef.current = setTimeout(() => {
      if (pendingSpeechRef.current) {
        pendingSpeechRef.current = false;
        // Speech started but no transcript arrived — false trigger
      }
    }, PENDING_TIMEOUT_MS);
  }, []);

  const onTranscriptReceived = useCallback(() => {
    transcriptCountRef.current++;
    pendingSpeechRef.current = false;
    if (pendingTimerRef.current) {
      clearTimeout(pendingTimerRef.current);
      pendingTimerRef.current = null;
    }
  }, []);

  // Periodic window evaluation
  useEffect(() => {
    windowTimerRef.current = setInterval(() => {
      const starts = speechStartCountRef.current;
      const transcripts = transcriptCountRef.current;
      const falseCount = starts - transcripts;

      if (falseCount >= FALSE_TRIGGER_THRESHOLD && falseCount > transcripts * 2) {
        // Too many false triggers → reduce eagerness
        setEagerness(prev => {
          const idx = EAGERNESS_LEVELS.indexOf(prev);
          if (idx > 0) {
            const next = EAGERNESS_LEVELS[idx - 1]!;
            updateVAD(next);
            return next;
          }
          return prev;
        });
      } else if (falseCount <= 1 && transcripts >= 3) {
        // Good signal → increase eagerness
        setEagerness(prev => {
          const idx = EAGERNESS_LEVELS.indexOf(prev);
          if (idx < EAGERNESS_LEVELS.length - 1) {
            const next = EAGERNESS_LEVELS[idx + 1]!;
            updateVAD(next);
            return next;
          }
          return prev;
        });
      }

      // Reset window
      speechStartCountRef.current = 0;
      transcriptCountRef.current = 0;
    }, WINDOW_MS);

    return () => {
      if (windowTimerRef.current) clearInterval(windowTimerRef.current);
      if (pendingTimerRef.current) clearTimeout(pendingTimerRef.current);
    };
  }, [updateVAD]);

  // Sync when initialEagerness changes from UI
  useEffect(() => {
    setEagerness(initialEagerness);
  }, [initialEagerness]);

  return { eagerness, onSpeechStarted, onTranscriptReceived };
}
