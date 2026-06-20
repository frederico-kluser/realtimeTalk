import { AnimatePresence } from 'motion/react';
import { PageLayout } from '@/components/templates/PageLayout';
import { TranscriptPanel } from '@/components/organisms/TranscriptPanel';
import { SessionControls } from '@/components/organisms/SessionControls';
import { TeacherHeader } from '@/components/organisms/TeacherHeader';
import { QuickActionsBar } from '@/components/organisms/QuickActionsBar';
import { ChallengePanel } from '@/components/organisms/ChallengePanel';
import { TutorialOverlay } from '@/components/organisms/TutorialOverlay';
import { WelcomeScreen } from '@/components/organisms/WelcomeScreen';
import { TeacherSettingsDrawer } from '@/components/organisms/TeacherSettingsDrawer';
import type { useTeacherController } from './useTeacherController';

type TeacherViewProps = ReturnType<typeof useTeacherController>;

export function TeacherPageView(props: TeacherViewProps) {
  const {
    voice,
    setVoice,
    vadEagerness,
    setVadEagerness,
    transcript,
    totalCost,
    totalTokens,
    showSettings,
    setShowSettings,
    showTutorial,
    handleTutorialComplete,
    session,
    audioControls,
    isActive,
    handleConnect,
    handleDisconnect,
    handleToggleMute,
    injectUserMessage,
    studentLevel,
    studentStreak,
    studentPoints,
    exerciseActive,
  } = props;

  return (
    <PageLayout>
      <TeacherHeader
        status={session.status}
        voice={voice}
        onVoiceChange={setVoice}
        level={studentLevel}
        streak={studentStreak}
        points={studentPoints}
        totalCost={totalCost}
        totalTokens={totalTokens}
        isActive={isActive}
        onSettingsClick={() => setShowSettings(!showSettings)}
      />

      {!isActive ? (
        <WelcomeScreen
          level={studentLevel}
          streak={studentStreak}
          onQuickStart={(activity) => void handleConnect(activity)}
        />
      ) : (
        <>
          <TranscriptPanel entries={transcript} />

          <ChallengePanel
            transcript={transcript}
            isActive={isActive}
            onAnswer={injectUserMessage}
          />

          <QuickActionsBar
            isActive={isActive}
            onAction={injectUserMessage}
          />
        </>
      )}

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

      <AnimatePresence>
        {showTutorial && (
          <TutorialOverlay onComplete={handleTutorialComplete} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSettings && (
          <TeacherSettingsDrawer
            onClose={() => setShowSettings(false)}
            vadEagerness={vadEagerness}
            onVadEagernessChange={setVadEagerness}
            exerciseActive={exerciseActive}
          />
        )}
      </AnimatePresence>
    </PageLayout>
  );
}
