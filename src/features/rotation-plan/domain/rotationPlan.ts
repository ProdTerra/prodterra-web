export type RotationBlock =
  | { id: string; kind: "crop"; cropKey: string; durationInDays: number }
  | { id: string; kind: "rest"; durationInDays: number };

export type PreviousUse = { kind: "crop"; cropKey: string } | { kind: "fallow" } | { kind: "unknown" };

export type LotRotation = {
  previousUse: PreviousUse | null;
  hasIrrigation: boolean | null;
  blocks: RotationBlock[];
};

export type RotationPlan = {
  startDate: string | null;
  lots: Record<string, LotRotation>;
};

export type MissingLotAnswer = "previousUse" | "irrigation" | "blocks";

export const emptyLotRotation: LotRotation = { previousUse: null, hasIrrigation: null, blocks: [] };

export const emptyRotationPlan: RotationPlan = { startDate: null, lots: {} };

export function rotationOf(plan: RotationPlan, lotId: string): LotRotation {
  return plan.lots[lotId] ?? emptyLotRotation;
}

export function missingAnswers(rotation: LotRotation): MissingLotAnswer[] {
  const missing: MissingLotAnswer[] = [];
  if (!rotation.previousUse) {
    missing.push("previousUse");
  }
  if (rotation.hasIrrigation === null) {
    missing.push("irrigation");
  }
  if (rotation.blocks.length === 0) {
    missing.push("blocks");
  }
  return missing;
}

export function isLotRotationComplete(rotation: LotRotation): boolean {
  return missingAnswers(rotation).length === 0;
}
