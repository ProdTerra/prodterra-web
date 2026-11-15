import { useEffect, useReducer } from "react";
import { getBrowserStorage } from "@/shared/infrastructure/browserStorage";
import { rotationPlanReducer } from "../application/rotationPlanState";
import { emptyRotationPlan, type RotationPlan } from "../domain/rotationPlan";
import { loadRotationPlan, saveRotationPlan } from "../infrastructure/rotationPlanStorage";

function readSavedPlan(): RotationPlan {
  const storage = getBrowserStorage();
  return storage ? loadRotationPlan(storage) : emptyRotationPlan;
}

function initialPlanFor(lotIds: string[]): RotationPlan {
  return rotationPlanReducer(readSavedPlan(), { type: "lotsChanged", lotIds });
}

export function useRotationPlan(lotIds: string[]) {
  const [plan, dispatch] = useReducer(rotationPlanReducer, lotIds, initialPlanFor);

  useEffect(() => {
    const storage = getBrowserStorage();
    if (storage) {
      saveRotationPlan(storage, plan);
    }
  }, [plan]);

  return [plan, dispatch] as const;
}

export function useSavedRotationPlan(lotIds: string[]): RotationPlan {
  const [plan] = useReducer(rotationPlanReducer, lotIds, initialPlanFor);
  return plan;
}
