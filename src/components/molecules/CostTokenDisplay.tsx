import { formatCost } from '@/utils/costEstimator';

interface CostTokenDisplayProps {
  totalCost: number;
  totalTokens: number;
}

export function CostTokenDisplay({ totalCost, totalTokens }: CostTokenDisplayProps) {
  return (
    <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
      <span>{formatCost(totalCost)}</span>
      <span className="text-gray-300 dark:text-gray-600">|</span>
      <span>{totalTokens.toLocaleString()} tok</span>
    </div>
  );
}
