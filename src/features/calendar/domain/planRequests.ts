import type { Lot } from "@/features/farm-mapping/application/farmMappingState";
import { isLotRotationComplete, rotationOf, type LotRotation, type RotationPlan } from "@/features/rotation-plan/domain/rotationPlan";
import type { LotPlanRequest } from "../infrastructure/plansApi";

function currentUseOf(rotation: LotRotation, startDate: string): LotPlanRequest["currentUse"] {
  const firstBlock = rotation.blocks[0];
  return firstBlock.kind === "crop"
    ? { kind: "crop", cropKey: firstBlock.cropKey, plantedOn: startDate.slice(0, 7) }
    : { kind: "fallow" };
}

export function toPlanRequests(lots: Lot[], plan: RotationPlan): LotPlanRequest[] | null {
  const { startDate } = plan;
  const rotations = lots.map((lot) => rotationOf(plan, lot.shapeId));
  if (!startDate || !rotations.every(isLotRotationComplete)) {
    return null;
  }
  return lots.map((lot, index) => ({
    lotId: lot.shapeId,
    boundary: lot.geometry,
    currentUse: currentUseOf(rotations[index], startDate),
    previousUse: rotations[index].previousUse as LotPlanRequest["previousUse"],
    hasIrrigation: rotations[index].hasIrrigation as boolean,
  }));
}
