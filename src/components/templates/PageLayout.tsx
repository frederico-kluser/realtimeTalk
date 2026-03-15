import type { ReactNode } from 'react';

interface PageLayoutProps {
  children: ReactNode;
}

export function PageLayout({ children }: PageLayoutProps) {
  return (
    <div className="flex flex-col h-screen bg-white dark:bg-gray-900">
      {children}
    </div>
  );
}
