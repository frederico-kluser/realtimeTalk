import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { PageLayout } from '@/components/templates/PageLayout';
import { StatusDot } from '@/components/atoms/StatusDot';
import { Select } from '@/components/atoms/Select';
import { LanguageSelector } from '@/components/atoms/LanguageSelector';
import { CostTokenDisplay } from '@/components/molecules/CostTokenDisplay';
import { AudioVisualizer } from '@/components/molecules/AudioVisualizer';
import { TranscriptPanel } from '@/components/organisms/TranscriptPanel';
import { TeacherSidebar } from '@/components/organisms/TeacherSidebar';
import { TeacherQuickActions } from '@/components/organisms/TeacherQuickActions';
import { TeacherOnboarding } from '@/components/organisms/TeacherOnboarding';
import { MicIcon, MicOffIcon, SettingsIcon, ClockIcon } from '@/components/atoms/icons';
import { useT } from '@/i18n';
import type { useTeacherController } from './useTeacherController';

const VOICE_OPTIONS = [
  { value: 'coral', label: 'Coral' },
  { value: 'alloy', label: 'Alloy' },
  { value: 'ash', label: 'Ash' },
  { value: 'ballad', label: 'Ballad' },
  { value: 'echo', label: 'Echo' },
  { value: 'sage', label: 'Sage' },
  { value: 'shimmer', label: 'Shimmer' },
  { value: 'verse', label: 'Verse' },
  { value: 'marin', label: 'Marin' },
  { value: 'cedar', label: 'Cedar' },
];

type TeacherViewProps = ReturnType<typeof useTeacherController>;

export function TeacherPageView(props: TeacherViewProps) {
  const {
    voice,
    setVoice,
    transcript,
    totalCost,
    totalTokens,
    session,
    audioControls,
    isActive,
    hasApiKey,
    showOnboarding,
    level,
    points,
    streak,
    wordsLearned,
    correctionsCount,
    sessionMinutes,
    progressPercent,
    dailyExpression,
    handleConnect,
    handleDisconnect,
    handleToggleMute,
    handleQuickAction,
    handleOnboardingComplete,
  } = props;

  const t = useT();

  return (
    <PageLayout>
      {/* Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">🎓</span>
          <div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">{t.teacherTitle}</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">{t.teacherSubtitle}</p>
          </div>
          <StatusDot status={session.status} />
        </div>

        <div className="flex items-center gap-2">
          <CostTokenDisplay totalCost={totalCost} totalTokens={totalTokens} />

          {/* Voice selector - only customization option */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-gray-500 dark:text-gray-400">{t.teacherVoiceModel}:</span>
            <Select
              options={VOICE_OPTIONS}
              value={voice}
              onChange={(e) => setVoice(e.target.value as typeof voice)}
              disabled={isActive}
              className="!w-24 !py-1 !text-xs"
            />
          </div>

          <LanguageSelector />

          <Link
            to="/settings"
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            title={t.settings}
          >
            <SettingsIcon />
          </Link>
          <Link
            to="/history"
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            title={t.history}
          >
            <ClockIcon />
          </Link>
        </div>
      </motion.header>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - visible on large screens */}
        <TeacherSidebar
          level={level}
          points={points}
          streak={streak}
          wordsLearned={wordsLearned}
          correctionsCount={correctionsCount}
          sessionMinutes={sessionMinutes}
          progressPercent={progressPercent}
          dailyExpression={dailyExpression}
        />

        {/* Center area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Mobile stats bar */}
          <div className="lg:hidden flex items-center justify-between px-4 py-2 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-gray-900 dark:text-white px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                {level || t.teacherNoLevel}
              </span>
              {streak > 0 && (
                <span className="text-xs text-orange-600 dark:text-orange-400">
                  🔥 {streak} {t.teacherDays}
                </span>
              )}
              <span className="text-xs text-indigo-600 dark:text-indigo-400">
                ⭐ {points} {t.teacherPoints}
              </span>
            </div>
            <span className="text-xs text-gray-500">📚 {wordsLearned} {t.teacherWordsLearned}</span>
          </div>

          {/* Quick Actions - shown when session is active */}
          <AnimatePresence>
            {isActive && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="overflow-hidden border-b border-gray-100 dark:border-gray-800"
              >
                <TeacherQuickActions onAction={handleQuickAction} disabled={!isActive} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Transcript */}
          {!isActive && !hasApiKey ? (
            <div className="flex-1 flex items-center justify-center">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center p-8"
              >
                <span className="text-5xl mb-4 block">🔑</span>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{t.teacherApiKeyNeeded}</p>
                <Link
                  to="/settings"
                  className="inline-block px-6 py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium rounded-full transition-colors"
                >
                  {t.teacherGoToSettings}
                </Link>
              </motion.div>
            </div>
          ) : !isActive && transcript.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center p-8 max-w-sm"
              >
                <span className="text-6xl mb-4 block">🎓</span>
                <p className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {t.teacherTitle}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                  {t.teacherEmptyState}
                </p>
                {dailyExpression && (
                  <div className="rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-4 mb-6 text-left">
                    <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-1">
                      💡 {t.teacherTodayExpression}
                    </p>
                    <p className="text-sm font-medium text-amber-900 dark:text-amber-200">
                      &quot;{dailyExpression.expression}&quot;
                    </p>
                    <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
                      {dailyExpression.meaning}
                    </p>
                  </div>
                )}
              </motion.div>
            </div>
          ) : (
            <TranscriptPanel entries={transcript} />
          )}

          {/* Bottom Controls */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30, delay: 0.1 }}
            className="border-t border-gray-200 dark:border-gray-700 px-4 py-4 bg-white dark:bg-gray-900"
          >
            <div className="flex flex-col items-center gap-3">
              {/* Audio visualizer */}
              <AnimatePresence>
                {isActive && !audioControls.muted && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                  >
                    <AudioVisualizer
                      getFrequencyData={audioControls.getFrequencyData}
                      isActive={session.status === 'listening' || session.status === 'speaking'}
                      color="#6366f1"
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Paused indicator */}
              <AnimatePresence>
                {isActive && audioControls.muted && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400"
                  >
                    <span className="inline-block w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                    {t.pausedMessage}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex items-center gap-3">
                {/* Mute button */}
                <AnimatePresence>
                  {isActive && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0 }}
                      onClick={handleToggleMute}
                      className={`p-3 rounded-full transition-colors ${
                        audioControls.muted
                          ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'
                          : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                      }`}
                      title={audioControls.muted ? t.resumeConversation : t.pauseConversation}
                    >
                      {audioControls.muted ? <MicOffIcon /> : <MicIcon />}
                    </motion.button>
                  )}
                </AnimatePresence>

                {/* Connect / Disconnect */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={isActive ? () => void handleDisconnect() : () => void handleConnect()}
                  disabled={session.status === 'connecting' || !hasApiKey}
                  className={`px-8 py-3 rounded-full font-medium text-sm transition-all ${
                    isActive
                      ? 'bg-red-500 hover:bg-red-600 text-white'
                      : session.status === 'connecting'
                        ? 'bg-yellow-500 text-white cursor-wait'
                        : !hasApiKey
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'
                          : 'bg-indigo-500 hover:bg-indigo-600 text-white'
                  }`}
                >
                  {isActive
                    ? t.teacherEndLesson
                    : session.status === 'connecting'
                      ? t.connecting
                      : t.teacherStartLesson}
                </motion.button>
              </div>

              {/* Error */}
              <AnimatePresence>
                {session.error && (
                  <motion.p
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="text-sm text-red-500"
                  >
                    {session.error}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Onboarding overlay */}
      <TeacherOnboarding isOpen={showOnboarding} onComplete={handleOnboardingComplete} />
    </PageLayout>
  );
}
