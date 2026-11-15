import {
  getBrowserStorage,
  readJson,
  writeJson,
  type KeyValueStorage,
} from "@/shared/infrastructure/browserStorage";
import type { FarmMappingState } from "../application/farmMappingState";

export { getBrowserStorage, type KeyValueStorage };

export type MapView = { longitude: number; latitude: number; zoom: number };

const draftKey = "prodterra.farmDraft";
const mapViewKey = "prodterra.mapView";
const draftVersion = 1;

type StoredDraft = { version: number; draft: FarmMappingState };

function isStoredDraft(value: unknown): value is StoredDraft {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const candidate = value as Partial<StoredDraft>;
  return candidate.version === draftVersion && Array.isArray(candidate.draft?.lots);
}

function isMapView(value: unknown): value is MapView {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const candidate = value as Partial<MapView>;
  return [candidate.longitude, candidate.latitude, candidate.zoom].every(Number.isFinite);
}

export function saveFarmDraft(storage: KeyValueStorage, draft: FarmMappingState): void {
  writeJson(storage, draftKey, { version: draftVersion, draft: { ...draft, rejection: null } });
}

export function loadFarmDraft(storage: KeyValueStorage): FarmMappingState | null {
  const stored = readJson(storage, draftKey);
  return isStoredDraft(stored) ? stored.draft : null;
}

export function saveMapView(storage: KeyValueStorage, view: MapView): void {
  writeJson(storage, mapViewKey, view);
}

export function loadMapView(storage: KeyValueStorage): MapView | null {
  const stored = readJson(storage, mapViewKey);
  return isMapView(stored) ? stored : null;
}
