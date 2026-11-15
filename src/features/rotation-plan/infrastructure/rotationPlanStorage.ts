import { readJson, writeJson, type KeyValueStorage } from "@/shared/infrastructure/browserStorage";
import { emptyRotationPlan, type RotationPlan } from "../domain/rotationPlan";

const planKey = "prodterra.rotationPlan";
const planVersion = 1;

type StoredPlan = { version: number; plan: RotationPlan };

function isStoredPlan(value: unknown): value is StoredPlan {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const candidate = value as Partial<StoredPlan>;
  const plan = candidate.plan;
  return (
    candidate.version === planVersion &&
    typeof plan === "object" &&
    plan !== null &&
    (plan.startDate === null || typeof plan.startDate === "string") &&
    typeof plan.lots === "object" &&
    plan.lots !== null
  );
}

export function saveRotationPlan(storage: KeyValueStorage, plan: RotationPlan): void {
  writeJson(storage, planKey, { version: planVersion, plan });
}

export function loadRotationPlan(storage: KeyValueStorage): RotationPlan {
  const stored = readJson(storage, planKey);
  return isStoredPlan(stored) ? stored.plan : emptyRotationPlan;
}
