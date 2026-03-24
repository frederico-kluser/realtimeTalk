import { useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { TranscriptEntry } from '@/storage/idb';
import { useT } from '@/i18n';

interface ChallengePanelProps {
  transcript: TranscriptEntry[];
  isActive: boolean;
  onAnswer: (answer: string) => void;
}

type ChallengeType = 'multiple_choice' | 'pronunciation' | 'dictation' | null;

interface DetectedChallenge {
  type: ChallengeType;
  options?: string[];
  targetPhrase?: string;
}

function detectChallenge(transcript: TranscriptEntry[]): DetectedChallenge {
  if (transcript.length === 0) return { type: null };

  // Look at recent assistant messages (last 3) for challenge patterns
  const recentAssistant = transcript
    .filter((t) => t.role === 'assistant')
    .slice(-3);

  for (let i = recentAssistant.length - 1; i >= 0; i--) {
    const entry = recentAssistant[i];
    if (!entry) continue;
    const text = entry.text;

    // Detect multiple choice: A) / A: / A. patterns
    const mcPattern = /(?:^|\n)\s*([A-D])[):.]\s*(.+)/gm;
    const matches: string[] = [];
    let match;
    while ((match = mcPattern.exec(text)) !== null) {
      matches.push(`${match[1] ?? ''}) ${(match[2] ?? '').trim()}`);
    }
    if (matches.length >= 3) {
      return { type: 'multiple_choice', options: matches };
    }

    // Detect pronunciation exercise: "Repeat after me:" pattern
    const pronPattern = /(?:repeat after me|say this|repeat this|try saying)[:\s]+[""]?(.+?)[""]?\s*$/im;
    const pronMatch = pronPattern.exec(text);
    if (pronMatch) {
      return { type: 'pronunciation', targetPhrase: pronMatch[1]!.trim() };
    }

    // Detect dictation
    const dictPattern = /(?:write down|type what you hear|listen and repeat|here is your dictation)[:\s]+[""]?(.+?)[""]?\s*$/im;
    const dictMatch = dictPattern.exec(text);
    if (dictMatch) {
      return { type: 'dictation', targetPhrase: dictMatch[1]!.trim() };
    }
  }

  return { type: null };
}

export function ChallengePanel({ transcript, isActive, onAnswer }: ChallengePanelProps) {
  const t = useT();
  const challenge = useMemo(() => detectChallenge(transcript), [transcript]);

  if (!isActive || !challenge.type) return null;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={challenge.type}
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="border-t border-gray-200 dark:border-gray-700 px-4 py-3 bg-indigo-50 dark:bg-indigo-900/20"
      >
        {challenge.type === 'multiple_choice' && (
          <div>
            <p className="text-xs font-medium text-indigo-600 dark:text-indigo-400 mb-2">
              {t.teacherSelectAnswer}
            </p>
            <div className="grid grid-cols-2 gap-2">
              {challenge.options!.map((option) => {
                const letter = option.charAt(0);
                return (
                  <motion.button
                    key={letter}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onAnswer(letter)}
                    className="text-left px-3 py-2 rounded-lg text-sm bg-white dark:bg-gray-800 border border-indigo-200 dark:border-indigo-700 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-indigo-100 dark:hover:bg-indigo-800/30 transition-colors text-gray-800 dark:text-gray-200"
                  >
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">{letter}</span>
                    <span className="text-gray-600 dark:text-gray-300">{option.slice(1)}</span>
                  </motion.button>
                );
              })}
            </div>
          </div>
        )}

        {challenge.type === 'pronunciation' && (
          <div className="text-center">
            <p className="text-xs font-medium text-indigo-600 dark:text-indigo-400 mb-1">
              {t.teacherRepeatPhrase}
            </p>
            <p className="text-lg font-medium text-gray-900 dark:text-white italic">
              &ldquo;{challenge.targetPhrase}&rdquo;
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {t.teacherSpeakNow}
            </p>
          </div>
        )}

        {challenge.type === 'dictation' && (
          <div className="text-center">
            <p className="text-xs font-medium text-indigo-600 dark:text-indigo-400 mb-1">
              {t.teacherDictationActive}
            </p>
            <div className="flex items-center justify-center gap-2 text-gray-600 dark:text-gray-400">
              <span className="inline-block w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-sm">{t.teacherListening}</span>
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
