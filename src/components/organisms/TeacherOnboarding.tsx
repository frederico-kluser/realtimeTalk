import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
import { Button } from '@/components/atoms';
import { useT } from '@/i18n';

interface TeacherOnboardingProps {
  isOpen: boolean;
  onComplete: () => void;
}

const STEPS = [
  { emoji: '🗣️', titleKey: 'teacherWelcomeStep1Title', descKey: 'teacherWelcomeStep1Desc' },
  { emoji: '🎯', titleKey: 'teacherWelcomeStep2Title', descKey: 'teacherWelcomeStep2Desc' },
  { emoji: '📈', titleKey: 'teacherWelcomeStep3Title', descKey: 'teacherWelcomeStep3Desc' },
] as const;

export function TeacherOnboarding({ isOpen, onComplete }: TeacherOnboardingProps) {
  const t = useT();
  const [step, setStep] = useState(0);

  if (!isOpen) return null;

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      onComplete();
    }
  };

  const currentStep = STEPS[step]!;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-md mx-4 w-full"
      >
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            {t.teacherWelcomeTitle}
          </h2>
          <div className="flex justify-center gap-2 mb-6">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 w-8 rounded-full transition-colors ${
                  i <= step ? 'bg-indigo-500' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              />
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="text-center mb-8"
          >
            <div className="text-5xl mb-4">{currentStep.emoji}</div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {t[currentStep.titleKey] as string}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t[currentStep.descKey] as string}
            </p>
          </motion.div>
        </AnimatePresence>

        <div className="flex gap-3">
          <Button
            variant="ghost"
            fullWidth
            onClick={onComplete}
          >
            Skip
          </Button>
          <Button
            fullWidth
            onClick={handleNext}
          >
            {step < STEPS.length - 1 ? 'Next' : t.teacherWelcomeStart}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
