import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/atoms/Button';
import { AcademicCapIcon, MicrophoneIcon, PuzzleIcon, GlobeIcon, ArrowRightIcon, CheckCircleIcon } from '@/components/atoms/teacherIcons';
import { useT } from '@/i18n';

interface WelcomeTutorialProps {
  onComplete: () => void;
  hasApiKey: boolean;
  onOpenSettings: () => void;
}

const STEPS = [
  { icon: <AcademicCapIcon />, key: 'tutorialStep1' as const },
  { icon: <MicrophoneIcon />, key: 'tutorialStep2' as const },
  { icon: <PuzzleIcon />, key: 'tutorialStep3' as const },
  { icon: <GlobeIcon />, key: 'tutorialStep4' as const },
];

export function WelcomeTutorial({ onComplete, hasApiKey, onOpenSettings }: WelcomeTutorialProps) {
  const t = useT();
  const [step, setStep] = useState(0);

  const titles = [t.tutorialStep1Title, t.tutorialStep2Title, t.tutorialStep3Title, t.tutorialStep4Title];
  const descriptions = [t.tutorialStep1Desc, t.tutorialStep2Desc, t.tutorialStep3Desc, t.tutorialStep4Desc];

  const isLastStep = step === STEPS.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      if (!hasApiKey) {
        onOpenSettings();
      }
      onComplete();
    } else {
      setStep(step + 1);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-indigo-950 px-4"
    >
      <div className="w-full max-w-md">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {t.tutorialWelcome}
          </h1>
          <p className="text-gray-500 dark:text-gray-400">{t.tutorialSubtitle}</p>
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -50, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-6"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4 [&>svg]:w-8 [&>svg]:h-8">
                {STEPS[step]!.icon}
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {titles[step]}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                {descriptions[step]}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {STEPS.map((_, i) => (
              <motion.div
                key={i}
                className={`h-2 rounded-full transition-all ${
                  i === step
                    ? 'w-8 bg-indigo-500'
                    : i < step
                      ? 'w-2 bg-indigo-300 dark:bg-indigo-700'
                      : 'w-2 bg-gray-200 dark:bg-gray-700'
                }`}
                layout
              />
            ))}
          </div>

          <div className="flex gap-2">
            {step > 0 && (
              <Button variant="ghost" size="sm" onClick={() => setStep(step - 1)}>
                {t.back}
              </Button>
            )}
            <Button variant="primary" size="sm" onClick={handleNext}>
              <span className="flex items-center gap-1.5">
                {isLastStep ? (
                  <>
                    <CheckCircleIcon />
                    {t.tutorialStart}
                  </>
                ) : (
                  <>
                    {t.tutorialNext}
                    <ArrowRightIcon />
                  </>
                )}
              </span>
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
