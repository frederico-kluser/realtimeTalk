import { AnimatePresence, motion } from 'motion/react';
import { PageLayout } from '@/components/templates/PageLayout';
import { TeacherHeader } from '@/components/organisms/TeacherHeader';
import { TeacherSettingsPanel } from '@/components/organisms/TeacherSettingsPanel';
import { TeacherSessionControls } from '@/components/organisms/TeacherSessionControls';
import { ActivityPanel } from '@/components/organisms/ActivityPanel';
import { TranscriptPanel } from '@/components/organisms/TranscriptPanel';
import { ActionLogPanel } from '@/components/organisms/ActionLogPanel';
import { WelcomeTutorial } from '@/components/organisms/WelcomeTutorial';
import type { useTeacherController } from './useTeacherController';

type TeacherViewProps = ReturnType<typeof useTeacherController>;

export function TeacherPageView(props: TeacherViewProps) {
  const {
    voice,
    setVoice,
    transcript,
    showSettings,
    setShowSettings,
    showTutorial,
    studentLevel,
    studentStreak,
    studentPoints,
    session,
    audioControls,
    actionHandlers,
    isActive,
    activityLabel,
    handleSelectActivity,
    handleDisconnect,
    handleToggleMute,
    handleTutorialComplete,
    hasApiKey,
  } = props;

  return (
    <PageLayout>
      {/* Tutorial overlay for first-time users */}
      <AnimatePresence>
        {showTutorial && (
          <WelcomeTutorial
            onComplete={handleTutorialComplete}
            hasApiKey={hasApiKey}
            onOpenSettings={() => setShowSettings(true)}
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <TeacherHeader
        status={session.status}
        isActive={isActive}
        level={studentLevel || 'New'}
        streak={studentStreak}
        points={studentPoints}
        onToggleSettings={() => setShowSettings(!showSettings)}
      />

      {/* Simplified settings (voice + API key only) */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="overflow-hidden"
          >
            <TeacherSettingsPanel
              voice={voice}
              onVoiceChange={setVoice}
              isActive={isActive}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content area */}
      {isActive ? (
        <>
          {/* Transcript during active session */}
          <TranscriptPanel entries={transcript} />

          {/* Action log */}
          <ActionLogPanel entries={actionHandlers.actionLog} />

          {/* Session controls */}
          <TeacherSessionControls
            status={session.status}
            isActive={isActive}
            error={session.error}
            muted={audioControls.muted}
            level={studentLevel || 'New'}
            streak={studentStreak}
            points={studentPoints}
            activityLabel={activityLabel}
            onToggleMute={handleToggleMute}
            onDisconnect={() => void handleDisconnect()}
            getFrequencyData={audioControls.getFrequencyData}
          />
        </>
      ) : (
        <>
          {/* Welcome section when idle */}
          <IdleWelcomeSection level={studentLevel} />

          {/* Activity selection grid */}
          <div className="flex-1 overflow-y-auto">
            <ActivityPanel
              onSelectActivity={(a) => void handleSelectActivity(a)}
              disabled={false}
            />
          </div>
        </>
      )}
    </PageLayout>
  );
}

function IdleWelcomeSection({ level }: { level: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="px-4 pt-6 pb-2 text-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
        className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 mb-3"
      >
        <span className="text-3xl">👩‍🏫</span>
      </motion.div>
      <h2 className="text-xl font-bold text-gray-900 dark:text-white">
        {level ? `Welcome back!` : `Meet Sofia, your English tutor`}
      </h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-sm mx-auto">
        {level
          ? `Your level: ${level}. Choose an activity to continue learning.`
          : `Choose an activity below to start your first lesson. Sofia will assess your level and personalize the experience.`
        }
      </p>
    </motion.div>
  );
}
