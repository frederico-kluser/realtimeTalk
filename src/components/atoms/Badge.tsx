type BadgeColor = 'indigo' | 'green' | 'red';

const COLOR_CLASSES: Record<BadgeColor, string> = {
  indigo: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300',
  green: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
  red: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
};

interface BadgeProps {
  label: string;
  color?: BadgeColor;
  onRemove?: () => void;
}

export function Badge({ label, color = 'indigo', onRemove }: BadgeProps) {
  return (
    <span
      className={`text-xs ${COLOR_CLASSES[color]} px-2 py-1 rounded-full flex items-center gap-1`}
    >
      {label}
      {onRemove && (
        <button onClick={onRemove} className="hover:text-red-500">
          &times;
        </button>
      )}
    </span>
  );
}
