import type { Lot } from "@/features/farm-mapping/application/farmMappingState";
import type { LotPlantingsState } from "@/features/lot-plantings/application/lotPlantingsState";
import type { LotPlanRequest } from "../infrastructure/plansApi";

export function toPlanRequests(lots: Lot[], plantings: LotPlantingsState): LotPlanRequest[] | null {
  const requests: LotPlanRequest[] = [];
  for (const lot of lots) {
    const planting = plantings[lot.shapeId];
    if (!planting?.currentUse || !planting.previousUse || planting.hasIrrigation === null) {
      return null;
    }
    if (planting.currentUse.kind === "crop" && !planting.plantedOn) {
      return null;
    }
    requests.push({
      lotId: lot.shapeId,
      boundary: lot.geometry,
      currentUse:
        planting.currentUse.kind === "crop"
          ? { kind: "crop", cropKey: planting.currentUse.cropKey, plantedOn: planting.plantedOn as string }
          : { kind: "fallow" },
      previousUse: planting.previousUse,
      hasIrrigation: planting.hasIrrigation,
    });
  }
  return requests;
}
