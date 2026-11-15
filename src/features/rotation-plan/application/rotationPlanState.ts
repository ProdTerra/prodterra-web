import {
  canAddBlock,
  clampBlockDuration,
  defaultCropDays,
  defaultRestDays,
  durationForNewBlock,
} from "../domain/blockLimits";
import {
  rotationOf,
  type LotRotation,
  type PreviousUse,
  type RotationBlock,
  type RotationPlan,
  emptyRotationPlan,
} from "../domain/rotationPlan";

export type NewBlock = { kind: "crop"; cropKey: string; referenceInDays: number | null } | { kind: "rest" };

export type RotationPlanAction =
  | { type: "startDateChosen"; startDate: string }
  | { type: "previousUseChosen"; lotId: string; previousUse: PreviousUse }
  | { type: "irrigationChosen"; lotId: string; hasIrrigation: boolean }
  | { type: "blockAdded"; lotId: string; blockId: string; block: NewBlock }
  | { type: "blockDurationChanged"; lotId: string; blockId: string; durationInDays: number }
  | { type: "blockDurationReset"; lotId: string; blockId: string; referenceInDays: number }
  | { type: "blockRemoved"; lotId: string; blockId: string }
  | { type: "rotationCopiedToAllLots"; fromLotId: string; lotIds: string[] }
  | { type: "lotsChanged"; lotIds: string[] }
  | { type: "planRestored"; plan: RotationPlan };

function updateLot(plan: RotationPlan, lotId: string, changes: Partial<LotRotation>): RotationPlan {
  return { ...plan, lots: { ...plan.lots, [lotId]: { ...rotationOf(plan, lotId), ...changes } } };
}

function createBlock(blocks: RotationBlock[], blockId: string, newBlock: NewBlock): RotationBlock {
  if (newBlock.kind === "rest") {
    return { id: blockId, kind: "rest", durationInDays: durationForNewBlock(blocks, defaultRestDays) };
  }
  const requestedDays = newBlock.referenceInDays ?? defaultCropDays;
  return { id: blockId, kind: "crop", cropKey: newBlock.cropKey, durationInDays: durationForNewBlock(blocks, requestedDays) };
}

function addBlock(plan: RotationPlan, lotId: string, blockId: string, newBlock: NewBlock): RotationPlan {
  const blocks = rotationOf(plan, lotId).blocks;
  if (!canAddBlock(blocks)) {
    return plan;
  }
  return updateLot(plan, lotId, { blocks: [...blocks, createBlock(blocks, blockId, newBlock)] });
}

function resizeBlock(plan: RotationPlan, lotId: string, blockId: string, requestedDays: number): RotationPlan {
  const blocks = rotationOf(plan, lotId).blocks;
  const durationInDays = clampBlockDuration(blocks, blockId, requestedDays);
  return updateLot(plan, lotId, {
    blocks: blocks.map((block) => (block.id === blockId ? { ...block, durationInDays } : block)),
  });
}

function copyToAllLots(plan: RotationPlan, fromLotId: string, lotIds: string[]): RotationPlan {
  const source = rotationOf(plan, fromLotId);
  const copyFor = (lotId: string): LotRotation =>
    lotId === fromLotId
      ? source
      : { ...source, blocks: source.blocks.map((block) => ({ ...block, id: `${lotId}:${block.id}` })) };
  return { ...plan, lots: Object.fromEntries(lotIds.map((lotId) => [lotId, copyFor(lotId)])) };
}

function keepLots(plan: RotationPlan, lotIds: string[]): RotationPlan {
  const plannedLots = Object.entries(plan.lots);
  const remainingLots = plannedLots.filter(([lotId]) => lotIds.includes(lotId));
  const isAnotherFarm = plannedLots.length > 0 && remainingLots.length === 0;
  return isAnotherFarm ? emptyRotationPlan : { ...plan, lots: Object.fromEntries(remainingLots) };
}

export function rotationPlanReducer(plan: RotationPlan, action: RotationPlanAction): RotationPlan {
  switch (action.type) {
    case "startDateChosen":
      return { ...plan, startDate: action.startDate };
    case "previousUseChosen":
      return updateLot(plan, action.lotId, { previousUse: action.previousUse });
    case "irrigationChosen":
      return updateLot(plan, action.lotId, { hasIrrigation: action.hasIrrigation });
    case "blockAdded":
      return addBlock(plan, action.lotId, action.blockId, action.block);
    case "blockDurationChanged":
      return resizeBlock(plan, action.lotId, action.blockId, action.durationInDays);
    case "blockDurationReset":
      return resizeBlock(plan, action.lotId, action.blockId, action.referenceInDays);
    case "blockRemoved":
      return updateLot(plan, action.lotId, {
        blocks: rotationOf(plan, action.lotId).blocks.filter((block) => block.id !== action.blockId),
      });
    case "rotationCopiedToAllLots":
      return copyToAllLots(plan, action.fromLotId, action.lotIds);
    case "lotsChanged":
      return keepLots(plan, action.lotIds);
    case "planRestored":
      return action.plan;
  }
}
