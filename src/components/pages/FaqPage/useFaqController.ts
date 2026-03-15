import { useState } from 'react';

export function useFaqController() {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const toggleExpanded = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return {
    expandedIndex,
    toggleExpanded,
  };
}
