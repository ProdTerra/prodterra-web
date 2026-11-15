import { saveFarmDraft } from "@/features/farm-mapping/infrastructure/farmDraftStorage";
import { saveRotationPlan } from "@/features/rotation-plan/infrastructure/rotationPlanStorage";
import { readJson, writeJson, type KeyValueStorage } from "@/shared/infrastructure/browserStorage";
import type { SavedFarm } from "../domain/savedFarm";

const activeFarmKey = "prodterra.activeSavedFarm";

export type ActiveSavedFarm = { id: string; name: string };

function isActiveSavedFarm(value: unknown): value is ActiveSavedFarm {
  const candidate = value as Partial<ActiveSavedFarm> | null;
  return typeof candidate?.id === "string" && typeof candidate.name === "string";
}

export function loadActiveSavedFarm(storage: KeyValueStorage): ActiveSavedFarm | null {
  const stored = readJson(storage, activeFarmKey);
  return isActiveSavedFarm(stored) ? stored : null;
}

export function rememberActiveSavedFarm(storage: KeyValueStorage, farm: ActiveSavedFarm): void {
  writeJson(storage, activeFarmKey, farm);
}

export function forgetActiveSavedFarm(storage: KeyValueStorage): void {
  storage.removeItem(activeFarmKey);
}

export function openSavedFarmInPlanner(storage: KeyValueStorage, farm: SavedFarm): void {
  saveFarmDraft(storage, { ...farm.snapshot.draft, step: "analysis" });
  saveRotationPlan(storage, farm.snapshot.rotationPlan);
  rememberActiveSavedFarm(storage, { id: farm.id, name: farm.name });
}
