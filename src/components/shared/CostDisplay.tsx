import { formatCost } from '@/utils/costEstimator';

interface CostDisplayProps {
  totalCost: number;
  totalTokens: number;
}

export function CostDisplay({ totalCost, totalTokens }: CostDisplayProps) {
  return (
    <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
      <span>{formatCost(totalCost)}</span>
      <span>{totalTokens.toLocaleString()} tokens</span>
    </div>
  );
}
