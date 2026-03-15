import { useCallback, useRef, useState } from 'react';
import { createEphemeralToken } from '@/core/webrtc/ephemeralToken';
import { apiKeyManager } from '@/storage/keyManager';
import type {
  RealtimeModel, RealtimeVoice, SessionConfig, ServerEvent
} from '@/core/types/realtime';

export type SessionStatus =
  | 'idle'
  | 'connecting'
  | 'connected'
  | 'listening'
  | 'thinking'
  | 'speaking'
  | 'error'
  | 'disconnected';

interface UseRealtimeSessionOptions {
  model: RealtimeModel;
  voice?: RealtimeVoice;
  initialConfig?: Partial<SessionConfig>;
  onEvent?: (event: ServerEvent) => void;
  onError?: (error: Error) => void;
  onTranscript?: (text: string, role: 'user' | 'assistant') => void;
  onStatusChange?: (status: SessionStatus) => void;
}

export interface RealtimeSessionHandle {
  status: SessionStatus;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  sendEvent: (event: Record<string, unknown>) => void;
  mediaStream: MediaStream | null;
}

const MAX_RECONNECT_ATTEMPTS = 3;

export function useRealtimeSession(
  options: UseRealtimeSessionOptions
): RealtimeSessionHandle {
  const { model, voice = 'marin', initialConfig, onEvent, onError, onTranscript, onStatusChange } = options;

  const [status, setStatusState] = useState<SessionStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const dcRef = useRef<RTCDataChannel | null>(null);
  const audioElRef = useRef<HTMLAudioElement | null>(null);
  const reconnectCountRef = useRef(0);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  const setStatus = useCallback((s: SessionStatus) => {
    setStatusState(s);
    onStatusChange?.(s);
  }, [onStatusChange]);

  const sendEvent = useCallback((event: Record<string, unknown>) => {
    if (dcRef.current?.readyState === 'open') {
      dcRef.current.send(JSON.stringify(event));
    }
  }, []);

  const handleServerEvent = useCallback((raw: string) => {
    let event: ServerEvent;
    try {
      event = JSON.parse(raw) as ServerEvent;
    } catch {
      return;
    }

    onEvent?.(event);

    switch (event.type) {
      case 'input_audio_buffer.speech_started':
        setStatus('listening');
        break;

      case 'response.created':
        setStatus('thinking');
        break;

      case 'response.done': {
        setStatus('connected');
        const done = event as {
          response?: {
            output?: Array<{
              content?: Array<{ transcript?: string; text?: string }>
            }>
          }
        };
        done.response?.output?.forEach(item => {
          item.content?.forEach(c => {
            const text = c.transcript ?? c.text;
            if (text) onTranscript?.(text, 'assistant');
          });
        });
        break;
      }

      case 'input_audio_buffer.speech_stopped':
        setStatus('thinking');
        break;

      case 'error': {
        const err = event as { error?: { message?: string } };
        const msg = err.error?.message ?? 'Unknown Realtime API error';
        setError(msg);
        setStatus('error');
        onError?.(new Error(msg));
        break;
      }

      case 'session.created':
        if (initialConfig) {
          sendEvent({ type: 'session.update', session: initialConfig });
        }
        setStatus('connected');
        reconnectCountRef.current = 0;
        break;
    }
  }, [onEvent, onError, onTranscript, sendEvent, initialConfig, setStatus]);

  const connect = useCallback(async () => {
    setStatus('connecting');
    setError(null);

    try {
      const apiKey = apiKeyManager.get();
      const tokenData = await createEphemeralToken(apiKey, { model, voice });
      const ephemeralKey = tokenData.client_secret.value;

      const pc = new RTCPeerConnection();
      pcRef.current = pc;

      const audioEl = document.createElement('audio');
      audioEl.autoplay = true;
      audioElRef.current = audioEl;
      pc.ontrack = (e) => {
        audioEl.srcObject = e.streams[0] ?? null;
      };

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      setMediaStream(stream);
      stream.getAudioTracks().forEach(track => pc.addTrack(track, stream));

      const dc = pc.createDataChannel('oai-events');
      dcRef.current = dc;
      dc.onmessage = (e) => handleServerEvent(e.data as string);
      dc.onopen = () => setStatus('connected');
      dc.onclose = () => {
        setStatus('disconnected');
        if (reconnectCountRef.current < MAX_RECONNECT_ATTEMPTS) {
          const delay = Math.pow(2, reconnectCountRef.current + 1) * 1000;
          reconnectCountRef.current++;
          reconnectTimeoutRef.current = setTimeout(() => { void connect(); }, delay);
        }
      };

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      const sdpResponse = await fetch(
        `https://api.openai.com/v1/realtime?model=${model}`,
        {
          method: 'POST',
          body: offer.sdp,
          headers: {
            'Authorization': `Bearer ${ephemeralKey}`,
            'Content-Type': 'application/sdp',
          },
        }
      );

      if (!sdpResponse.ok) throw new Error(`SDP exchange failed: ${sdpResponse.status}`);

      await pc.setRemoteDescription({
        type: 'answer',
        sdp: await sdpResponse.text(),
      });
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e.message);
      setStatus('error');
      onError?.(e);
    }
  }, [model, voice, handleServerEvent, onError, setStatus, initialConfig]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    reconnectCountRef.current = 0;

    dcRef.current?.close();
    pcRef.current?.close();
    pcRef.current = null;
    dcRef.current = null;

    mediaStreamRef.current?.getTracks().forEach(t => t.stop());
    mediaStreamRef.current = null;
    setMediaStream(null);

    if (audioElRef.current) {
      audioElRef.current.srcObject = null;
      audioElRef.current = null;
    }

    setStatus('idle');
  }, [setStatus]);

  return {
    status,
    error,
    connect,
    disconnect,
    sendEvent,
    mediaStream,
  };
}
