import type { RotationBlock } from "./rotationPlan";

export const minimumBlockDays = 14;
export const maximumBlockDays = 730;
export const maximumPlanDays = 730;
export const defaultCropDays = 90;
export const defaultRestDays = 28;
export const daysPerStep = 7;

export function totalDays(blocks: RotationBlock[]): number {
  return blocks.reduce((sum, block) => sum + block.durationInDays, 0);
}

export function remainingDays(blocks: RotationBlock[]): number {
  return Math.max(0, maximumPlanDays - totalDays(blocks));
}

export function canAddBlock(blocks: RotationBlock[]): boolean {
  return remainingDays(blocks) >= minimumBlockDays;
}

export function durationForNewBlock(blocks: RotationBlock[], requestedDays: number): number {
  return Math.max(minimumBlockDays, Math.min(requestedDays, remainingDays(blocks), maximumBlockDays));
}

export function longestDurationFor(blocks: RotationBlock[], blockId: string): number {
  const current = blocks.find((block) => block.id === blockId)?.durationInDays ?? 0;
  return Math.min(maximumBlockDays, current + remainingDays(blocks));
}

export function clampBlockDuration(blocks: RotationBlock[], blockId: string, requestedDays: number): number {
  return Math.max(minimumBlockDays, Math.min(requestedDays, longestDurationFor(blocks, blockId)));
}
