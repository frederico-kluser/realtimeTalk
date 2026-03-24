import { motion } from 'motion/react';

interface ActivityCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
  onClick: () => void;
  disabled?: boolean;
}

export function ActivityCard({ icon, title, description, color, onClick, disabled }: ActivityCardProps) {
  return (
    <motion.button
      whileHover={disabled ? {} : { scale: 1.03, y: -2 }}
      whileTap={disabled ? {} : { scale: 0.97 }}
      onClick={onClick}
      disabled={disabled}
      className={`flex items-start gap-3 p-4 rounded-xl border text-left transition-all w-full ${
        disabled
          ? 'opacity-50 cursor-not-allowed border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/30'
          : `border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:shadow-md hover:border-${color}-300 dark:hover:border-${color}-600 cursor-pointer`
      }`}
    >
      <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center bg-${color}-100 dark:bg-${color}-900/30 text-${color}-600 dark:text-${color}-400`}>
        {icon}
      </div>
      <div className="min-w-0">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">{title}</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">{description}</p>
      </div>
    </motion.button>
  );
}
