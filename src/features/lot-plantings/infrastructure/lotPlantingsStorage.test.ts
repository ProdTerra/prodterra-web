import { describe, expect, it } from "vitest";
import { loadLotPlantings, saveLotPlantings } from "./lotPlantingsStorage";

function createMemoryStorage() {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => void values.set(key, value),
    removeItem: (key: string) => void values.delete(key),
  };
}

describe("lot plantings storage", () => {
  it("restores the saved answers", () => {
    const storage = createMemoryStorage();
    const plantings = {
      "lot-a": {
        currentUse: { kind: "crop" as const, cropKey: "potato" },
        plantedOn: "2026-08",
        previousUse: { kind: "unknown" as const },
        hasIrrigation: false,
      },
    };
    saveLotPlantings(storage, plantings);
    expect(loadLotPlantings(storage)).toEqual(plantings);
  });

  it("returns no answers when nothing valid was saved", () => {
    const storage = createMemoryStorage();
    expect(loadLotPlantings(storage)).toEqual({});
    storage.setItem("prodterra.lotPlantings", "{broken");
    expect(loadLotPlantings(storage)).toEqual({});
  });
});
