import type { ReactNode } from 'react';
import { Label } from '@/components/atoms/Label';

interface FormFieldProps {
  label: string;
  children: ReactNode;
  className?: string;
}

export function FormField({ label, children, className = '' }: FormFieldProps) {
  return (
    <div className={className}>
      <Label>{label}</Label>
      {children}
    </div>
  );
}
