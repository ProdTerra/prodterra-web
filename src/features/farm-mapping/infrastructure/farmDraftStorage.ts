import type { FarmMappingState } from "../application/farmMappingState";

export type KeyValueStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;

export type MapView = { longitude: number; latitude: number; zoom: number };

const draftKey = "prodterra.farmDraft";
const mapViewKey = "prodterra.mapView";
const draftVersion = 1;

type StoredDraft = { version: number; draft: FarmMappingState };

function readJson(storage: KeyValueStorage, key: string): unknown {
  try {
    const raw = storage.getItem(key);
    return raw === null ? null : JSON.parse(raw);
  } catch {
    return null;
  }
}

function writeJson(storage: KeyValueStorage, key: string, value: unknown): void {
  try {
    storage.setItem(key, JSON.stringify(value));
  } catch {
    return;
  }
}

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

export function getBrowserStorage(): KeyValueStorage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
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
