import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { PageLayout } from '@/components/templates/PageLayout';
import { StatusDot } from '@/components/atoms/StatusDot';
import { IconButton } from '@/components/atoms/IconButton';
import { LanguageSelector } from '@/components/atoms/LanguageSelector';
import { CostTokenDisplay } from '@/components/molecules/CostTokenDisplay';
import { TranscriptPanel } from '@/components/organisms/TranscriptPanel';
import { ActionLogPanel } from '@/components/organisms/ActionLogPanel';
import { ConversationSettingsPanel } from '@/components/organisms/ConversationSettingsPanel';
import { SessionControls } from '@/components/organisms/SessionControls';
import { ContextModal } from '@/components/molecules/ContextModal';
import { SettingsIcon, ClockIcon, HelpCircleIcon } from '@/components/atoms/icons';
import { useT } from '@/i18n';
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
    showContextModal,
    session,
    audioControls,
    actionHandlers,
    isActive,
    handleConnect,
    handleContextSubmit,
    handleContextClose,
    handleDisconnect,
    handleToggleMute,
  } = props;

  const t = useT();

  return (
    <PageLayout>
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700"
      >
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">{t.voiceAi}</h1>
          <StatusDot status={session.status} />
        </div>
        <div className="flex items-center gap-2">
          <CostTokenDisplay totalCost={totalCost} totalTokens={totalTokens} />
          <LanguageSelector />
          <IconButton
            onClick={() => setShowSettings(!showSettings)}
            title={t.settings}
          >
            <SettingsIcon />
          </IconButton>
          <Link
            to="/history"
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            title={t.history}
          >
            <ClockIcon />
          </Link>
          <Link
            to="/faq"
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            title={t.faq}
          >
            <HelpCircleIcon />
          </Link>
        </div>
      </motion.header>

      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="overflow-hidden"
          >
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
          </motion.div>
        )}
      </AnimatePresence>

      <TranscriptPanel entries={transcript} />

      <ActionLogPanel entries={actionHandlers.actionLog} />

      <SessionControls
        status={session.status}
        isActive={isActive}
        error={session.error}
        muted={audioControls.muted}
        onToggleMute={handleToggleMute}
        onConnect={() => void handleConnect()}
        onDisconnect={() => void handleDisconnect()}
        getFrequencyData={audioControls.getFrequencyData}
      />

      <ContextModal
        isOpen={showContextModal}
        onStart={(ctx) => void handleContextSubmit(ctx)}
        onClose={handleContextClose}
      />
    </PageLayout>
  );
}
