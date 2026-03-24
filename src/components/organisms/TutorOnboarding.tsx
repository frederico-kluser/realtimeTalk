import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { Select } from '@/components/atoms/Select';
import { apiKeyManager } from '@/storage/keyManager';
import type { RealtimeVoice } from '@/core/types/realtime';

const VOICE_OPTIONS = [
  'alloy', 'ash', 'ballad', 'coral', 'echo', 'sage', 'shimmer', 'verse', 'marin', 'cedar',
].map((v) => ({ value: v, label: v.charAt(0).toUpperCase() + v.slice(1) }));

interface TutorOnboardingProps {
  voice: string;
  onVoiceChange: (v: RealtimeVoice) => void;
  onComplete: () => void;
}

const STEPS = [
  {
    icon: '1',
    titleEn: 'Set Up Your API Key',
    descEn: 'Enter your OpenAI API key to connect with Sofia. Your key stays safely in your browser — never sent to any server except OpenAI.',
    hasInput: true,
  },
  {
    icon: '2',
    titleEn: 'Choose Sofia\'s Voice',
    descEn: 'Pick a voice that feels right. Sofia will use this voice in all your lessons. You can change it anytime.',
    hasVoice: true,
  },
  {
    icon: '3',
    titleEn: 'Start Speaking!',
    descEn: 'Click "Start Lesson" and talk naturally. Sofia will assess your level, correct your mistakes gently, and adapt to help you improve. You can also try quizzes, roleplay scenarios, and more!',
    hasFinal: true,
  },
];

export function TutorOnboarding({ voice, onVoiceChange, onComplete }: TutorOnboardingProps) {
  const [step, setStep] = useState(0);
  const [apiKey, setApiKey] = useState('');
  const [error, setError] = useState('');

  const handleSaveKey = () => {
    if (!apiKey || !apiKey.startsWith('sk-')) {
      setError('Please enter a valid OpenAI API key (starts with sk-)');
      return;
    }
    try {
      apiKeyManager.set(apiKey);
      setError('');
      setStep(1);
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      localStorage.setItem('teacher_onboarded', 'true');
      onComplete();
    }
  };

  const handleSkip = () => {
    localStorage.setItem('teacher_onboarded', 'true');
    onComplete();
  };

  const current = STEPS[step]!;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-8 text-center">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl mb-3"
          >
            {step === 0 ? '🔑' : step === 1 ? '🎙️' : '🚀'}
          </motion.div>
          <h2 className="text-xl font-bold text-white">Welcome to Sofia</h2>
          <p className="text-indigo-100 text-sm mt-1">Your AI English Tutor</p>
        </div>

        {/* Step indicator */}
        <div className="flex justify-center gap-2 py-3">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-colors ${
                i === step ? 'bg-indigo-500' : i < step ? 'bg-indigo-300' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            />
          ))}
        </div>

        {/* Content */}
        <div className="px-6 pb-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {current.titleEn}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                {current.descEn}
              </p>

              {current.hasInput && (
                <div className="space-y-2">
                  <Input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="sk-..."
                    className="w-full"
                    autoFocus
                  />
                  {error && <p className="text-xs text-red-500">{error}</p>}
                  <Button variant="primary" size="sm" onClick={handleSaveKey} className="w-full">
                    Save API Key
                  </Button>
                  {apiKeyManager.hasKey() && (
                    <p className="text-xs text-green-600 dark:text-green-400 text-center">
                      API key already configured
                    </p>
                  )}
                </div>
              )}

              {current.hasVoice && (
                <div className="space-y-3">
                  <Select
                    value={voice}
                    onChange={(e) => onVoiceChange(e.target.value as RealtimeVoice)}
                    options={VOICE_OPTIONS}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
                    Recommended: Coral (Sofia's default voice)
                  </p>
                </div>
              )}

              {current.hasFinal && (
                <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-indigo-700 dark:text-indigo-300">
                    <span className="font-medium">What Sofia can do:</span>
                  </div>
                  <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                    <li>- Assess your English level (A1-C2)</li>
                    <li>- Correct grammar mistakes gently</li>
                    <li>- Vocabulary quizzes and flashcards</li>
                    <li>- Roleplay real-world scenarios</li>
                    <li>- Pronunciation exercises</li>
                    <li>- Track your progress over time</li>
                  </ul>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="flex items-center justify-between mt-5">
            <button
              onClick={handleSkip}
              className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              Skip tutorial
            </button>
            <Button
              variant="primary"
              size="sm"
              onClick={current.hasInput ? (apiKeyManager.hasKey() ? handleNext : handleSaveKey) : handleNext}
            >
              {step === STEPS.length - 1 ? "Let's Go!" : 'Next'}
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
