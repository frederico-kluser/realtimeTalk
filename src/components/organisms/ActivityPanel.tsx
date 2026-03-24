import { motion } from 'motion/react';
import { ActivityCard } from '@/components/molecules/ActivityCard';
import {
  ChatBubbleIcon,
  PuzzleIcon,
  TheaterIcon,
  DocumentTextIcon,
  VolumeUpIcon,
  LightningIcon,
  GlobeIcon,
  SparklesIcon,
} from '@/components/atoms/teacherIcons';
import { useT } from '@/i18n';

export type ActivityType =
  | 'free_conversation'
  | 'vocabulary_quiz'
  | 'grammar_quiz'
  | 'roleplay'
  | 'dictation'
  | 'pronunciation'
  | 'immersion'
  | 'debate';

interface ActivityPanelProps {
  onSelectActivity: (activity: ActivityType) => void;
  disabled?: boolean;
}

export function ActivityPanel({ onSelectActivity, disabled }: ActivityPanelProps) {
  const t = useT();

  const activities: Array<{
    type: ActivityType;
    icon: React.ReactNode;
    title: string;
    description: string;
    color: string;
  }> = [
    {
      type: 'free_conversation',
      icon: <ChatBubbleIcon />,
      title: t.actFreeConversation,
      description: t.actFreeConversationDesc,
      color: 'indigo',
    },
    {
      type: 'vocabulary_quiz',
      icon: <PuzzleIcon />,
      title: t.actVocabularyQuiz,
      description: t.actVocabularyQuizDesc,
      color: 'emerald',
    },
    {
      type: 'grammar_quiz',
      icon: <SparklesIcon />,
      title: t.actGrammarQuiz,
      description: t.actGrammarQuizDesc,
      color: 'purple',
    },
    {
      type: 'roleplay',
      icon: <TheaterIcon />,
      title: t.actRoleplay,
      description: t.actRoleplayDesc,
      color: 'amber',
    },
    {
      type: 'pronunciation',
      icon: <VolumeUpIcon />,
      title: t.actPronunciation,
      description: t.actPronunciationDesc,
      color: 'rose',
    },
    {
      type: 'dictation',
      icon: <DocumentTextIcon />,
      title: t.actDictation,
      description: t.actDictationDesc,
      color: 'cyan',
    },
    {
      type: 'immersion',
      icon: <GlobeIcon />,
      title: t.actImmersion,
      description: t.actImmersionDesc,
      color: 'teal',
    },
    {
      type: 'debate',
      icon: <LightningIcon />,
      title: t.actDebate,
      description: t.actDebateDesc,
      color: 'orange',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="px-4 py-4"
    >
      <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
        {t.chooseActivity}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {activities.map((activity, i) => (
          <motion.div
            key={activity.type}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * i }}
          >
            <ActivityCard
              icon={activity.icon}
              title={activity.title}
              description={activity.description}
              color={activity.color}
              onClick={() => onSelectActivity(activity.type)}
              disabled={disabled}
            />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
