import { useCallback, useEffect, useRef, useState } from 'react';

export function useAudioControls(mediaStream: MediaStream | null) {
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (!mediaStream) return;

    const ctx = new AudioContext();
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 256;
    const source = ctx.createMediaStreamSource(mediaStream);
    source.connect(analyser);
    audioCtxRef.current = ctx;
    analyserRef.current = analyser;

    return () => {
      void ctx.close();
      audioCtxRef.current = null;
      analyserRef.current = null;
    };
  }, [mediaStream]);

  // Reset muted state when mediaStream changes (new connection)
  useEffect(() => {
    if (!mediaStream) {
      setMuted(false);
    }
  }, [mediaStream]);

  const toggleMute = useCallback(() => {
    if (!mediaStream) return;
    const newMuted = !muted;
    mediaStream.getAudioTracks().forEach(t => { t.enabled = !newMuted; });
    setMuted(newMuted);
  }, [mediaStream, muted]);

  const getFrequencyData = useCallback((): Uint8Array => {
    if (!analyserRef.current) return new Uint8Array(0);
    const data = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(data);
    return data;
  }, []);

  return { muted, toggleMute, volume, setVolume, getFrequencyData };
}
