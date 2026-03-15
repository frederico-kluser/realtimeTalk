import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  active?: boolean;
}

const BASE_CLASSES =
  'p-2 rounded-lg transition-colors text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800';

export function IconButton({ children, active, className = '', ...props }: IconButtonProps) {
  return (
    <button
      className={`${BASE_CLASSES} ${active ? 'bg-gray-100 dark:bg-gray-800' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
