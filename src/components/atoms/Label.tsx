import type { ReactNode } from 'react';

interface LabelProps {
  children: ReactNode;
  className?: string;
}

export function Label({ children, className = '' }: LabelProps) {
  return (
    <label className={`text-xs font-medium text-gray-600 dark:text-gray-400 ${className}`}>
      {children}
    </label>
  );
}
