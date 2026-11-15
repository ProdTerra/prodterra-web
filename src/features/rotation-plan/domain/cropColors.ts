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

const colorByCrop: Record<string, string> = {
  potato: "#3d6fb6",
  onion: "#b39324",
  carrot: "#e08a2c",
  cabbage: "#2f9c95",
  lettuce: "#6b8e23",
  chayote: "#2b8fc7",
  tomato: "#c2463b",
  broccoli: "#3f8f4f",
  cauliflower: "#7a4fa3",
  strawberry: "#b8457a",
};

function fallbackColor(cropKey: string): string {
  const hash = [...cropKey].reduce((sum, character) => sum + character.charCodeAt(0), 0);
  return cropPalette[hash % cropPalette.length];
}

export function assignCropColors(rotations: LotRotation[]): Map<string, string> {
  const colors = new Map<string, string>();
  for (const block of rotations.flatMap((rotation) => rotation.blocks)) {
    if (block.kind === "crop" && !colors.has(block.cropKey)) {
      colors.set(block.cropKey, colorByCrop[block.cropKey] ?? fallbackColor(block.cropKey));
    }
  }
  return colors;
}

export const restBlockColor = "#8b8f86";
