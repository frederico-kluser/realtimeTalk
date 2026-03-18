import { useCallback, useEffect, useRef, useState } from 'react';
import { useRealtimeSession } from '@/hooks/useRealtimeSession';
import { useAudioControls } from '@/hooks/useAudioControls';
import { useActionRegistry } from '@/hooks/useActionRegistry';
import { useAdaptiveVAD } from '@/hooks/useAdaptiveVAD';
import { spreadsheetActions, setSpreadsheetRef } from '@/actions/spreadsheetActions';
import type { SpreadsheetHandle } from '@/hooks/useSpreadsheet';
import type {
  RealtimeVoice,
  ServerEvent,
  ResponseDoneEvent,
  VADEagerness,
} from '@/core/types/realtime';
import { apiKeyManager } from '@/storage/keyManager';

interface TranscriptEntry {
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

// Concise, markdown-formatted prompt optimized for GPT Realtime 1.5.
// Follows 2025-2026 best practices: <300 words, no role prompting,
// specific instructions, markdown delimiters.
const SYSTEM_PROMPT = `# Spreadsheet Voice Assistant

## Workflow
1. Call **get_sheet_summary** before reading or modifying existing data.
2. Make changes using the available tools.
3. Confirm briefly what you did — the user sees the spreadsheet live.

## When creating tables
- Bold headers in row 1 with colored background.
- Use formulas (SUM, AVERAGE, IF, VLOOKUP) so values auto-update.
- Currency: "$#,##0.00". Percentages: "0.00%".

## Undo support
- When the user says "undo", "revert", or "go back", call **undo_last_change**.
- You can undo multiple steps by calling it repeatedly.

## Rules
- Ask for clarification if the request is ambiguous.
- Be concise in spoken responses.`;

export function useSpreadsheetController() {
  const [voice, setVoice] = useState<RealtimeVoice>('marin');
  const [vadEagerness, setVadEagerness] = useState<VADEagerness>('medium');
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');

  const spreadsheetHandleRef = useRef<SpreadsheetHandle | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleTranscript = useCallback((text: string, role: 'user' | 'assistant') => {
    setTranscript((prev) => [...prev, { role, text, timestamp: new Date().toISOString() }]);
  }, []);

  const handleEvent = useCallback(
    (event: ServerEvent) => {
      if (event.type === 'response.done') {
        const done = event as ResponseDoneEvent;
        void actionHandlers.handleResponseDone(done);
      }
      // Feed speech events to adaptive VAD
      if (event.type === 'input_audio_buffer.speech_started') {
        adaptiveVAD.onSpeechStarted();
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const session = useRealtimeSession({
    model: 'gpt-realtime-1.5',
    voice,
    initialConfig: {
      model: 'gpt-realtime-1.5',
      voice,
      instructions: SYSTEM_PROMPT,
      tools: spreadsheetActions.getToolDefinitions(),
      tool_choice: 'auto',
      turn_detection: {
        type: 'semantic_vad',
        eagerness: vadEagerness,
        create_response: true,
        interrupt_response: true,
      },
    },
    onEvent: handleEvent,
    onTranscript: (text, role) => {
      handleTranscript(text, role);
      if (role === 'user') {
        adaptiveVAD.onTranscriptReceived();
      }
    },
    onError: (err) => console.error('Session error:', err),
  });

  const audioControls = useAudioControls(session.mediaStream);
  const actionHandlers = useActionRegistry(spreadsheetActions, session);
  const adaptiveVAD = useAdaptiveVAD(session, vadEagerness);

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
            eagerness: adaptiveVAD.eagerness,
            create_response: true,
            interrupt_response: true,
          },
        },
      });
    }
  }, [audioControls, session, adaptiveVAD.eagerness]);

  useEffect(() => {
    if (session.status === 'connected') {
      actionHandlers.syncTools();

      if (spreadsheetHandleRef.current) {
        const summary = spreadsheetHandleRef.current.getSheetSummary();
        session.sendEvent({
          type: 'conversation.item.create',
          item: {
            type: 'message',
            role: 'system',
            content: [{
              type: 'input_text',
              text: `Current spreadsheet state:\n${summary}`,
            }],
          },
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.status]);

  const handleSpreadsheetReady = useCallback((handle: SpreadsheetHandle) => {
    spreadsheetHandleRef.current = handle;
    setSpreadsheetRef(handle);
  }, []);

  const handleConnect = useCallback(async () => {
    if (!apiKeyManager.hasKey()) {
      setShowSettings(true);
      return;
    }
    setTranscript([]);
    await session.connect();
  }, [session]);

  const handleDisconnect = useCallback(() => {
    session.disconnect();
  }, [session]);

  const handleApiKeySave = useCallback(() => {
    if (apiKeyInput) {
      apiKeyManager.set(apiKeyInput);
      setApiKeyInput('');
      setShowSettings(false);
    }
  }, [apiKeyInput]);

  const handleImportXlsx = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !spreadsheetHandleRef.current) return;

    const { read, utils } = await import('xlsx');
    const buffer = await file.arrayBuffer();
    const workbook = read(buffer);
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) return;

    const worksheet = workbook.Sheets[sheetName]!;
    const jsonData = utils.sheet_to_json<(string | number)[]>(worksheet, { header: 1 });

    if (jsonData.length > 0) {
      spreadsheetHandleRef.current.setRangeValues(0, 0, jsonData);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const isActive =
    session.status !== 'idle' &&
    session.status !== 'disconnected' &&
    session.status !== 'error';

  return {
    voice,
    setVoice,
    vadEagerness,
    setVadEagerness,
    transcript,
    showSettings,
    setShowSettings,
    showTranscript,
    setShowTranscript,
    apiKeyInput,
    setApiKeyInput,
    session,
    audioControls,
    isActive,
    fileInputRef,
    handleSpreadsheetReady,
    handleConnect,
    handleDisconnect,
    handleToggleMute,
    handleApiKeySave,
    handleImportXlsx,
    handleFileChange,
  };
}
