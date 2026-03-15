import { Link } from 'react-router-dom';
import { PageLayout } from '@/components/templates/PageLayout';
import { StatusDot } from '@/components/atoms/StatusDot';
import { IconButton } from '@/components/atoms/IconButton';
import { CostTokenDisplay } from '@/components/molecules/CostTokenDisplay';
import { TranscriptPanel } from '@/components/organisms/TranscriptPanel';
import { ActionLogPanel } from '@/components/organisms/ActionLogPanel';
import { ConversationSettingsPanel } from '@/components/organisms/ConversationSettingsPanel';
import { SessionControls } from '@/components/organisms/SessionControls';
import { SettingsIcon, ClockIcon } from '@/components/atoms/icons';
import type { useConversationController } from './useConversationController';

type ConversationViewProps = ReturnType<typeof useConversationController>;

export function ConversationPageView(props: ConversationViewProps) {
  const {
    model,
    setModel,
    voice,
    setVoice,
    vadEagerness,
    setVadEagerness,
    transcript,
    totalCost,
    totalTokens,
    selectedPersonality,
    setSelectedPersonality,
    showSettings,
    setShowSettings,
    session,
    audioControls,
    actionHandlers,
    isActive,
    handleConnect,
    handleDisconnect,
  } = props;

  return (
    <PageLayout>
      <header className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Voice AI</h1>
          <StatusDot status={session.status} />
        </div>
        <div className="flex items-center gap-2">
          <CostTokenDisplay totalCost={totalCost} totalTokens={totalTokens} />
          <IconButton
            onClick={() => setShowSettings(!showSettings)}
            title="Settings"
          >
            <SettingsIcon />
          </IconButton>
          <Link
            to="/history"
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            title="History"
          >
            <ClockIcon />
          </Link>
        </div>
      </header>

      {showSettings && (
        <ConversationSettingsPanel
          model={model}
          onModelChange={setModel}
          voice={voice}
          onVoiceChange={setVoice}
          vadEagerness={vadEagerness}
          onVadEagernessChange={setVadEagerness}
          selectedPersonality={selectedPersonality}
          onPersonalityChange={setSelectedPersonality}
          isActive={isActive}
        />
      )}

      <TranscriptPanel entries={transcript} />

      <ActionLogPanel entries={actionHandlers.actionLog} />

      <SessionControls
        status={session.status}
        isActive={isActive}
        error={session.error}
        muted={audioControls.muted}
        onToggleMute={audioControls.toggleMute}
        onConnect={() => void handleConnect()}
        onDisconnect={() => void handleDisconnect()}
        getFrequencyData={audioControls.getFrequencyData}
      />
    </PageLayout>
  );
}
