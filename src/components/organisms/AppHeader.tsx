import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { BackIcon } from '@/components/atoms/icons';

interface AppHeaderProps {
  title: string;
  backTo?: string;
  children?: ReactNode;
}

export function AppHeader({ title, backTo, children }: AppHeaderProps) {
  return (
    <header className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-3">
        {backTo && (
          <Link
            to={backTo}
            className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <BackIcon />
          </Link>
        )}
        <h1 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h1>
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </header>
  );
}
