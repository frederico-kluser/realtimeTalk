import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/atoms/Button';
import { useT } from '@/i18n';

interface TutorialOverlayProps {
  onComplete: () => void;
}

const TUTORIAL_STEPS = [
  { icon: '🎓', titleKey: 'tutorialStep1Title' as const, descKey: 'tutorialStep1Desc' as const },
  { icon: '🔑', titleKey: 'tutorialStep2Title' as const, descKey: 'tutorialStep2Desc' as const },
  { icon: '🗣️', titleKey: 'tutorialStep3Title' as const, descKey: 'tutorialStep3Desc' as const },
  { icon: '📝', titleKey: 'tutorialStep4Title' as const, descKey: 'tutorialStep4Desc' as const },
  { icon: '🚀', titleKey: 'tutorialStep5Title' as const, descKey: 'tutorialStep5Desc' as const },
] as const;

export function TutorialOverlay({ onComplete }: TutorialOverlayProps) {
  const [step, setStep] = useState(0);
  const t = useT();
  const currentStep = TUTORIAL_STEPS[step]!;
  const isLast = step === TUTORIAL_STEPS.length - 1;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
    >
      <motion.div
        key={step}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full p-8 text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 400 }}
          className="text-5xl mb-4"
        >
          {currentStep.icon}
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -20, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              {t[currentStep.titleKey] as string}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
              {t[currentStep.descKey] as string}
            </p>
          </motion.div>
        </AnimatePresence>

        <div className="flex items-center justify-between">
          <div className="flex gap-1.5">
            {TUTORIAL_STEPS.map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i === step
                    ? 'bg-indigo-500'
                    : i < step
                      ? 'bg-indigo-300 dark:bg-indigo-700'
                      : 'bg-gray-300 dark:bg-gray-600'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onComplete}>
              {t.teacherSkipTutorial}
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => (isLast ? onComplete() : setStep(step + 1))}
            >
              {isLast ? t.teacherGetStarted : t.teacherNext}
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
