import type { RotationBlock } from "./rotationPlan";

export const minimumBlockDays = 1;
export const maximumBlockDays = 730;
export const maximumBlocksPerLot = 100;
export const defaultCropDays = 90;
export const defaultRestDays = 28;

export function totalDays(blocks: RotationBlock[]): number {
  return blocks.reduce((sum, block) => sum + block.durationInDays, 0);
}

export function canAddBlock(blocks: RotationBlock[]): boolean {
  return blocks.length < maximumBlocksPerLot;
}

export function durationForNewBlock(requestedDays: number): number {
  return Math.max(minimumBlockDays, Math.min(requestedDays, maximumBlockDays));
}

export function clampBlockDuration(requestedDays: number): number {
  return Math.max(minimumBlockDays, Math.min(requestedDays, maximumBlockDays));
}
