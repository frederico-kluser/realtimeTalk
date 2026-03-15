interface SectionTitleProps {
  children: string;
  uppercase?: boolean;
}

export function SectionTitle({ children, uppercase = false }: SectionTitleProps) {
  return (
    <h2
      className={`text-sm font-semibold text-gray-900 dark:text-white ${
        uppercase ? 'uppercase' : ''
      }`}
    >
      {children}
    </h2>
  );
}
