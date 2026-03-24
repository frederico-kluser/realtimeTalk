import { motion, AnimatePresence } from 'motion/react';
import { PageLayout } from '@/components/templates/PageLayout';
import { TutorHeader } from '@/components/organisms/TutorHeader';
import { TutorOnboarding } from '@/components/organisms/TutorOnboarding';
import { TranscriptPanel } from '@/components/organisms/TranscriptPanel';
import { ActionLogPanel } from '@/components/organisms/ActionLogPanel';
import { SessionControls } from '@/components/organisms/SessionControls';
import { ChallengeCard } from '@/components/organisms/ChallengeCard';
import { QuickActionBar } from '@/components/organisms/QuickActionBar';
import { ProgressBadge } from '@/components/molecules/ProgressBadge';
import { TutorSettingsPanel } from '@/components/organisms/TutorSettingsPanel';
import type { useTeacherController } from './useTeacherController';

type TeacherViewProps = ReturnType<typeof useTeacherController>;

export function TeacherPageView(props: TeacherViewProps) {
  const {
    voice,
    setVoice,
    transcript,
    totalCost,
    totalTokens,
    showSettings,
    setShowSettings,
    showOnboarding,
    session,
    audioControls,
    actionHandlers,
    isActive,
    activeChallenge,
    studentProfile,
    gamificationData,
    handleStartLesson,
    handleQuickAction,
    handleChallengeResponse,
    handleDismissChallenge,
    handleOnboardingComplete,
    handleDisconnect,
    handleToggleMute,
  } = props;

  return (
    <PageLayout>
      {/* Header */}
      <TutorHeader
        status={session.status}
        voice={voice}
        onVoiceChange={setVoice}
        totalCost={totalCost}
        totalTokens={totalTokens}
        isActive={isActive}
        onToggleSettings={() => setShowSettings(!showSettings)}
      />

      {/* Settings Panel (API key only) */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="overflow-hidden"
          >
            <TutorSettingsPanel isActive={isActive} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content */}
      {!isActive ? (
        /* === IDLE STATE: Welcome / Activity Selection === */
        <div className="flex-1 flex flex-col items-center justify-center px-4 gap-6">
          {/* Progress badge */}
          <ProgressBadge
            level={studentProfile?.level}
            points={gamificationData?.points}
            streak={gamificationData?.streak}
          />

          {/* Welcome text */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {studentProfile ? 'Ready for your next lesson?' : 'Ready to start learning English?'}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {studentProfile
                ? 'Pick an activity or start a free conversation with Sofia'
                : 'Sofia will assess your level and create a personalized learning plan'}
            </p>
          </motion.div>

          {/* Start button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => void handleStartLesson()}
            className="px-10 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-2xl font-semibold text-base shadow-lg shadow-indigo-500/30 transition-all"
          >
            Start Lesson
          </motion.button>

          {/* Quick actions */}
          <QuickActionBar isActive={false} onAction={handleQuickAction} />
        </div>
      ) : (
        /* === ACTIVE STATE: Conversation === */
        <>
          <TranscriptPanel entries={transcript} />

          {/* Challenge card overlay */}
          <AnimatePresence>
            {activeChallenge && (
              <ChallengeCard
                challenge={activeChallenge}
                onRespond={handleChallengeResponse}
                onDismiss={handleDismissChallenge}
              />
            )}
          </AnimatePresence>

          <ActionLogPanel entries={actionHandlers.actionLog} />

          {/* Quick actions during session */}
          <QuickActionBar isActive={true} onAction={handleQuickAction} />
        </>
      )}

      {/* Session controls */}
      <SessionControls
        status={session.status}
        isActive={isActive}
        error={session.error}
        muted={audioControls.muted}
        onToggleMute={handleToggleMute}
        onConnect={() => void handleStartLesson()}
        onDisconnect={() => void handleDisconnect()}
        getFrequencyData={audioControls.getFrequencyData}
      />

      {/* Onboarding overlay */}
      <AnimatePresence>
        {showOnboarding && (
          <TutorOnboarding
            voice={voice}
            onVoiceChange={setVoice}
            onComplete={handleOnboardingComplete}
          />
        )}
      </AnimatePresence>
    </PageLayout>
  );
}
