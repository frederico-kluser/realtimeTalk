import { motion } from 'motion/react';

export type QuickAction = {
  id: string;
  label: string;
  icon: string;
  prompt: string;
};

const IDLE_ACTIONS: QuickAction[] = [
  { id: 'free_chat', label: 'Free Chat', icon: '💬', prompt: '' },
  { id: 'quiz', label: 'Quiz Me', icon: '📝', prompt: 'I want to do a vocabulary quiz' },
  { id: 'roleplay', label: 'Roleplay', icon: '🎭', prompt: 'Let\'s do a roleplay scenario' },
  { id: 'flashcards', label: 'Flashcards', icon: '📖', prompt: 'Let\'s review my flashcards' },
  { id: 'dictation', label: 'Dictation', icon: '🎧', prompt: 'Let\'s practice dictation' },
  { id: 'pronunciation', label: 'Pronunciation', icon: '🗣️', prompt: 'I want to practice pronunciation' },
];

const ACTIVE_ACTIONS: QuickAction[] = [
  { id: 'quiz', label: 'Quiz me', icon: '📝', prompt: 'Quiz me on vocabulary' },
  { id: 'roleplay', label: 'Roleplay', icon: '🎭', prompt: 'Let\'s do a roleplay' },
  { id: 'progress', label: 'My progress', icon: '📊', prompt: 'What is my current level and progress?' },
  { id: 'expression', label: 'Daily word', icon: '💡', prompt: 'What is today\'s expression?' },
  { id: 'flashcards', label: 'Flashcards', icon: '📖', prompt: 'Let\'s review flashcards' },
];

interface QuickActionBarProps {
  isActive: boolean;
  onAction: (action: QuickAction) => void;
}

export function QuickActionBar({ isActive, onAction }: QuickActionBarProps) {
  const actions = isActive ? ACTIVE_ACTIONS : IDLE_ACTIONS;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="px-4 py-2"
    >
      {!isActive && (
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 text-center">
          Choose an activity
        </p>
      )}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {actions.map((action) => (
          <motion.button
            key={action.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onAction(action)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-colors flex-shrink-0 ${
              isActive
                ? 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 hover:text-indigo-700 dark:hover:text-indigo-300'
                : 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 border border-indigo-200 dark:border-indigo-800'
            }`}
          >
            <span>{action.icon}</span>
            <span>{action.label}</span>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
