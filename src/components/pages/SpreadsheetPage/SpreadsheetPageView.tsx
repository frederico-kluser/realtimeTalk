import { AppToolbar } from '@/components/organisms/AppToolbar';
import { SpreadsheetEditor } from '@/components/organisms/SpreadsheetEditor';
import { TranscriptPanel } from '@/components/organisms/TranscriptPanel';
import { VoiceControlBar } from '@/components/molecules/VoiceControlBar';
import type { useSpreadsheetController } from './useSpreadsheetController';

type SpreadsheetPageViewProps = ReturnType<typeof useSpreadsheetController>;

export function SpreadsheetPageView(props: SpreadsheetPageViewProps) {
  const {
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
  } = props;

  return (
    <div className="flex flex-col h-dvh bg-gray-50 dark:bg-gray-950">
      <AppToolbar
        apiKey={apiKeyInput}
        onApiKeyChange={setApiKeyInput}
        onApiKeySave={handleApiKeySave}
        voice={voice}
        onVoiceChange={setVoice}
        vadEagerness={vadEagerness}
        onVadEagernessChange={setVadEagerness}
        onImportXlsx={handleImportXlsx}
        sessionStatus={session.status}
        showSettings={showSettings}
        onToggleSettings={() => setShowSettings(!showSettings)}
        isActive={isActive}
      />

      <div className="flex-1 relative overflow-hidden">
        <SpreadsheetEditor onReady={handleSpreadsheetReady} />

        <TranscriptPanel
          entries={transcript}
          isOpen={showTranscript}
          onClose={() => setShowTranscript(false)}
        />
      </div>

      <VoiceControlBar
        status={session.status}
        isActive={isActive}
        error={session.error}
        muted={audioControls.muted}
        onToggleMute={handleToggleMute}
        onConnect={() => void handleConnect()}
        onDisconnect={handleDisconnect}
        onToggleTranscript={() => setShowTranscript(!showTranscript)}
        transcriptCount={transcript.length}
        getFrequencyData={audioControls.getFrequencyData}
      />

      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        onChange={(e) => void handleFileChange(e)}
        className="hidden"
      />
    </div>
  );
}
