import { motion } from 'motion/react';
import { useT } from '@/i18n';

export type TeacherAction =
  | 'vocab_quiz'
  | 'grammar_quiz'
  | 'roleplay'
  | 'dictation'
  | 'flashcards'
  | 'debate'
  | 'pronunciation'
  | 'immersion';

interface QuickAction {
  id: TeacherAction;
  labelKey: keyof ReturnType<typeof useT>;
  emoji: string;
  color: string;
}

const ACTIONS: QuickAction[] = [
  { id: 'vocab_quiz', labelKey: 'teacherVocabQuiz', emoji: '📝', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800' },
  { id: 'grammar_quiz', labelKey: 'teacherGrammarQuiz', emoji: '🧠', color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800' },
  { id: 'roleplay', labelKey: 'teacherRoleplay', emoji: '🎭', color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800' },
  { id: 'dictation', labelKey: 'teacherDictation', emoji: '🎧', color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800' },
  { id: 'flashcards', labelKey: 'teacherFlashcards', emoji: '🃏', color: 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 border-pink-200 dark:border-pink-800' },
  { id: 'pronunciation', labelKey: 'teacherPronunciation', emoji: '🎤', color: 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800' },
  { id: 'debate', labelKey: 'teacherDebate', emoji: '💬', color: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800' },
  { id: 'immersion', labelKey: 'teacherImmersion', emoji: '🌍', color: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800' },
];

interface TeacherQuickActionsProps {
  onAction: (action: TeacherAction) => void;
  disabled?: boolean;
}

export function TeacherQuickActions({ onAction, disabled }: TeacherQuickActionsProps) {
  const t = useT();

  return (
    <div className="grid grid-cols-4 gap-2 px-4 py-3">
      {ACTIONS.map((action, i) => (
        <motion.button
          key={action.id}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.03 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onAction(action.id)}
          disabled={disabled}
          className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border transition-all ${action.color} ${
            disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer hover:shadow-sm'
          }`}
        >
          <span className="text-lg">{action.emoji}</span>
          <span className="text-[10px] font-medium leading-tight text-center">
            {t[action.labelKey] as string}
          </span>
        </motion.button>
      ))}
    </div>
  );
}
