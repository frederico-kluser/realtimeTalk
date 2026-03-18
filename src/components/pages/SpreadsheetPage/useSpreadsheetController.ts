import { useCallback, useEffect, useRef, useState } from 'react';
import { useRealtimeSession } from '@/hooks/useRealtimeSession';
import { useAudioControls } from '@/hooks/useAudioControls';
import { useActionRegistry } from '@/hooks/useActionRegistry';
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

const SYSTEM_PROMPT = `You are a financial spreadsheet assistant. You help users manage, analyze, and modify spreadsheet data through voice commands.

CAPABILITIES:
- Read and write cell values
- Create formulas (SUM, AVERAGE, COUNT, IF, VLOOKUP, etc.)
- Format cells (bold, colors, number formats like currency and percentage)
- Insert and delete rows/columns
- Create financial tables, budgets, expense trackers, invoices
- Analyze data and provide insights

RULES:
1. ALWAYS use the get_sheet_summary tool first when the user asks about existing data, before making modifications.
2. Use cell references (A1, B2, etc.) when manipulating the spreadsheet.
3. When creating tables, always set bold headers in row 1 and format numbers appropriately.
4. For currency values, apply "$#,##0.00" number format. For percentages, use "0.00%".
5. After making changes, briefly confirm what you did.
6. When the user asks to "create a budget" or similar, generate a complete structure with headers, sample data, and formulas.
7. Be concise in your spoken responses — the user can see the changes in the spreadsheet.
8. If the user's request is ambiguous, ask for clarification.
9. For financial calculations, always use formulas so values update automatically.
10. Format headers with bold text and a colored background for visibility.`;

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
    onTranscript: handleTranscript,
    onError: (err) => console.error('Session error:', err),
  });

  const audioControls = useAudioControls(session.mediaStream);
  const actionHandlers = useActionRegistry(spreadsheetActions, session);

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
      actionHandlers.syncTools();

      // Inject current spreadsheet context
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

    // Reset file input
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
