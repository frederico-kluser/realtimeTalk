import type { RealtimeModel } from '@/core/types/realtime';

const AUDIO_PRICING: Record<RealtimeModel, { input: number; output: number }> = {
  'gpt-realtime': { input: 32, output: 64 },
  'gpt-realtime-1.5': { input: 32, output: 64 },
  'gpt-realtime-mini': { input: 10, output: 20 },
};

export function estimateCost(
  model: RealtimeModel,
  inputTokens: number,
  outputTokens: number
): number {
  const prices = AUDIO_PRICING[model];
  return (inputTokens * prices.input + outputTokens * prices.output) / 1_000_000;
}

export function formatCost(usd: number): string {
  if (usd < 0.01) return `$${(usd * 100).toFixed(2)}c`;
  return `$${usd.toFixed(4)}`;
}
