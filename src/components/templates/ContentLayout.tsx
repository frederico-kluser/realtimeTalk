import type { ReactNode } from 'react';

interface ContentLayoutProps {
  children: ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'full';
}

const MAX_WIDTH_CLASSES = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  full: '',
};

export function ContentLayout({ children, maxWidth = 'md' }: ContentLayoutProps) {
  return (
    <div className={`flex-1 overflow-y-auto px-4 py-6 ${MAX_WIDTH_CLASSES[maxWidth]} mx-auto w-full space-y-6`}>
      {children}
    </div>
  );
}
