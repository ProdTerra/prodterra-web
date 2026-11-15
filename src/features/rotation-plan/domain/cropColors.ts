import type { LotRotation } from "./rotationPlan";

export const cropPalette = [
  "#3f8f4f",
  "#e08a2c",
  "#3d6fb6",
  "#b8457a",
  "#b39324",
  "#2f9c95",
  "#7a4fa3",
  "#c2463b",
  "#6b8e23",
  "#2b8fc7",
] as const;

export function assignCropColors(rotations: LotRotation[]): Map<string, string> {
  const colors = new Map<string, string>();
  for (const block of rotations.flatMap((rotation) => rotation.blocks)) {
    if (block.kind === "crop" && !colors.has(block.cropKey)) {
      colors.set(block.cropKey, cropPalette[colors.size % cropPalette.length]);
    }
  }
  return colors;
}
