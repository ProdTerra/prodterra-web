import type { Lot } from "@/features/farm-mapping/application/farmMappingState";
import { isLotRotationComplete, rotationOf, type RotationPlan } from "@/features/rotation-plan/domain/rotationPlan";
import type { RotationEvaluationRequest } from "../infrastructure/plansApi";

type LotRequest = RotationEvaluationRequest["lots"][number];

export function toEvaluationRequest(lots: Lot[], plan: RotationPlan): RotationEvaluationRequest | null {
  const { startDate } = plan;
  const rotations = lots.map((lot) => rotationOf(plan, lot.shapeId));
  if (!startDate || !rotations.every(isLotRotationComplete)) {
    return null;
  }
  return {
    startDate,
    lots: lots.map((lot, index) => ({
      lotId: lot.shapeId,
      boundary: lot.geometry,
      previousUse: rotations[index].previousUse as LotRequest["previousUse"],
      hasIrrigation: rotations[index].hasIrrigation as boolean,
      blocks: rotations[index].blocks.map((block) =>
        block.kind === "crop"
          ? { kind: "crop" as const, cropKey: block.cropKey, durationInDays: block.durationInDays }
          : { kind: "rest" as const, durationInDays: block.durationInDays },
      ),
    })),
  };
}
