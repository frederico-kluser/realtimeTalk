import type { TextareaHTMLAttributes } from 'react';

const BASE_CLASSES =
  'w-full text-sm px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none';

export function Textarea({ className = '', ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={`${BASE_CLASSES} ${className}`} {...props} />;
}
