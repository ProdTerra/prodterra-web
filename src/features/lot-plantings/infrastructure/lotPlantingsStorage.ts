import { readJson, writeJson, type KeyValueStorage } from "@/shared/infrastructure/browserStorage";
import type { LotPlantingsState } from "../application/lotPlantingsState";

const plantingsKey = "prodterra.lotPlantings";
const plantingsVersion = 1;

type StoredPlantings = { version: number; plantings: LotPlantingsState };

function isStoredPlantings(value: unknown): value is StoredPlantings {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const candidate = value as Partial<StoredPlantings>;
  return (
    candidate.version === plantingsVersion &&
    typeof candidate.plantings === "object" &&
    candidate.plantings !== null
  );
}

export function saveLotPlantings(storage: KeyValueStorage, plantings: LotPlantingsState): void {
  writeJson(storage, plantingsKey, { version: plantingsVersion, plantings });
}

export function loadLotPlantings(storage: KeyValueStorage): LotPlantingsState {
  const stored = readJson(storage, plantingsKey);
  return isStoredPlantings(stored) ? stored.plantings : {};
}
