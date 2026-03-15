import type { InputHTMLAttributes } from 'react';

const BASE_CLASSES =
  'w-full text-sm px-3 py-2 rounded-lg border bg-white dark:bg-gray-700 text-gray-900 dark:text-white';

type InputBorderColor = 'default' | 'green' | 'red';

const BORDER_CLASSES: Record<InputBorderColor, string> = {
  default: 'border-gray-300 dark:border-gray-600',
  green: 'border-green-300 dark:border-green-600',
  red: 'border-red-300 dark:border-red-600',
};

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  borderColor?: InputBorderColor;
}

export function Input({ borderColor = 'default', className = '', ...props }: InputProps) {
  return (
    <input
      className={`${BASE_CLASSES} ${BORDER_CLASSES[borderColor]} ${className}`}
      {...props}
    />
  );
}
