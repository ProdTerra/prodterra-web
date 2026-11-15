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
  | { type: "blockAdded"; lotId: string; blockId: string; block: NewBlock; index?: number }
  | { type: "blockMoved"; lotId: string; blockId: string; direction: "up" | "down" }
  | { type: "blockMovedTo"; lotId: string; blockId: string; toIndex: number }
  | { type: "blockDuplicated"; lotId: string; blockId: string; newBlockId: string }
  | { type: "blockRestored"; lotId: string; block: RotationBlock; index: number }
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

function insertAt(blocks: RotationBlock[], block: RotationBlock, index: number): RotationBlock[] {
  const position = Math.max(0, Math.min(index, blocks.length));
  return [...blocks.slice(0, position), block, ...blocks.slice(position)];
}

function addBlock(plan: RotationPlan, lotId: string, blockId: string, newBlock: NewBlock, index?: number): RotationPlan {
  const blocks = rotationOf(plan, lotId).blocks;
  if (!canAddBlock(blocks)) {
    return plan;
  }
  return updateLot(plan, lotId, { blocks: insertAt(blocks, createBlock(blocks, blockId, newBlock), index ?? blocks.length) });
}

function moveBlock(plan: RotationPlan, lotId: string, blockId: string, direction: "up" | "down"): RotationPlan {
  const blocks = rotationOf(plan, lotId).blocks;
  const index = blocks.findIndex((block) => block.id === blockId);
  const target = direction === "up" ? index - 1 : index + 1;
  if (index < 0 || target < 0 || target >= blocks.length) {
    return plan;
  }
  const reordered = [...blocks];
  [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
  return updateLot(plan, lotId, { blocks: reordered });
}

function moveBlockTo(plan: RotationPlan, lotId: string, blockId: string, toIndex: number): RotationPlan {
  const blocks = rotationOf(plan, lotId).blocks;
  const moving = blocks.find((block) => block.id === blockId);
  if (!moving) {
    return plan;
  }
  return updateLot(plan, lotId, { blocks: insertAt(blocks.filter((block) => block.id !== blockId), moving, toIndex) });
}

function duplicateBlock(plan: RotationPlan, lotId: string, blockId: string, newBlockId: string): RotationPlan {
  const blocks = rotationOf(plan, lotId).blocks;
  const index = blocks.findIndex((block) => block.id === blockId);
  if (index < 0 || !canAddBlock(blocks)) {
    return plan;
  }
  const original = blocks[index];
  const copy = { ...original, id: newBlockId, durationInDays: durationForNewBlock(blocks, original.durationInDays) };
  return updateLot(plan, lotId, { blocks: insertAt(blocks, copy, index + 1) });
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
      return addBlock(plan, action.lotId, action.blockId, action.block, action.index);
    case "blockMoved":
      return moveBlock(plan, action.lotId, action.blockId, action.direction);
    case "blockMovedTo":
      return moveBlockTo(plan, action.lotId, action.blockId, action.toIndex);
    case "blockDuplicated":
      return duplicateBlock(plan, action.lotId, action.blockId, action.newBlockId);
    case "blockRestored":
      return updateLot(plan, action.lotId, { blocks: insertAt(rotationOf(plan, action.lotId).blocks, action.block, action.index) });
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
