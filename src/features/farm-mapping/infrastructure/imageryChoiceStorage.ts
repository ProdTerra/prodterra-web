import { readJson, writeJson, type KeyValueStorage } from "@/shared/infrastructure/browserStorage";
import type { WaybackRelease } from "./waybackImagery";

const imageryChoiceKey = "prodterra.imageryRelease";

function isWaybackRelease(value: unknown): value is WaybackRelease {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.releaseNumber === "number" &&
    typeof candidate.date === "string" &&
    typeof candidate.tileUrl === "string" &&
    candidate.tileUrl.startsWith("https://wayback.maptiles.arcgis.com/")
  );
}

export function loadImageryChoice(storage: KeyValueStorage): WaybackRelease | null {
  const stored = readJson(storage, imageryChoiceKey);
  return isWaybackRelease(stored) ? stored : null;
}

export function saveImageryChoice(storage: KeyValueStorage, release: WaybackRelease | null): void {
  writeJson(storage, imageryChoiceKey, release);
}
