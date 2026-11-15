import type { FarmMappingState } from "@/features/farm-mapping/application/farmMappingState";
import type { RotationPlan } from "@/features/rotation-plan/domain/rotationPlan";

export type SavedFarmSnapshot = {
  farmBoundary: NonNullable<FarmMappingState["farmBoundary"]>;
  lots: FarmMappingState["lots"];
  draft: FarmMappingState;
  rotationPlan: RotationPlan;
};

export type SavedFarmSummary = { id: string; name: string; lotCount: number; createdAt: string; updatedAt: string };

export type SavedFarm = SavedFarmSummary & { snapshot: SavedFarmSnapshot };

export type FarmNameError = "nameRequired" | "nameTooLong";

const maximumNameLength = 80;

export function validateFarmName(name: string): FarmNameError | null {
  const trimmed = name.trim();
  if (trimmed.length === 0) {
    return "nameRequired";
  }
  return trimmed.length > maximumNameLength ? "nameTooLong" : null;
}

export function buildSnapshot(state: FarmMappingState, rotationPlan: RotationPlan): SavedFarmSnapshot | null {
  if (!state.farmBoundary || state.lots.length === 0) {
    return null;
  }
  return { farmBoundary: state.farmBoundary, lots: state.lots, draft: { ...state, rejection: null }, rotationPlan };
}
