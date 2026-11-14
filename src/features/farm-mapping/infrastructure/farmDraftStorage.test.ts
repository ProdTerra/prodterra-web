import { describe, expect, it } from "vitest";
import type { FarmMappingState } from "../application/farmMappingState";
import { loadFarmDraft, loadMapView, saveFarmDraft, saveMapView } from "./farmDraftStorage";

function createMemoryStorage() {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => void values.set(key, value),
    removeItem: (key: string) => void values.delete(key),
    values,
  };
}

const failingStorage = {
  getItem: () => {
    throw new Error("blocked");
  },
  setItem: () => {
    throw new Error("blocked");
  },
  removeItem: () => {
    throw new Error("blocked");
  },
};

const draft: FarmMappingState = {
  step: "lots",
  farmBoundary: {
    shapeId: "farm-1",
    areaInHectares: 2.4,
    geometry: { type: "Polygon", coordinates: [[[-83.89, 9.91], [-83.88, 9.91], [-83.88, 9.92], [-83.89, 9.91]]] },
  },
  lots: [],
  lastLotNumber: 0,
  rejection: { reason: "outsideFarm" },
};

describe("farm draft storage", () => {
  it("restores the saved progress without the last rejection message", () => {
    const storage = createMemoryStorage();
    saveFarmDraft(storage, draft);
    expect(loadFarmDraft(storage)).toEqual({ ...draft, rejection: null });
  });

  it("returns nothing when no progress was saved", () => {
    expect(loadFarmDraft(createMemoryStorage())).toBeNull();
  });

  it("ignores saved data that is not valid", () => {
    const storage = createMemoryStorage();
    storage.setItem("prodterra.farmDraft", "{not json");
    expect(loadFarmDraft(storage)).toBeNull();
    storage.setItem("prodterra.farmDraft", JSON.stringify({ version: 99, draft }));
    expect(loadFarmDraft(storage)).toBeNull();
  });

  it("keeps working when the browser blocks storage", () => {
    expect(() => saveFarmDraft(failingStorage, draft)).not.toThrow();
    expect(loadFarmDraft(failingStorage)).toBeNull();
  });

  it("remembers where the map was looking", () => {
    const storage = createMemoryStorage();
    const view = { longitude: -83.892, latitude: 9.918, zoom: 17 };
    saveMapView(storage, view);
    expect(loadMapView(storage)).toEqual(view);
    expect(loadMapView(failingStorage)).toBeNull();
  });
});
