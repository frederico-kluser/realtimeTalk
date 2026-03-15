interface EmptyStateProps {
  message: string;
}

export function EmptyState({ message }: EmptyStateProps) {
  return (
    <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-600">
      <p>{message}</p>
    </div>
  );
}
