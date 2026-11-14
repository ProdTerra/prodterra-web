import { describe, expect, it } from "vitest";
import { emptyLotPlanting, isPlantingComplete, isValidPlantingMonth, type LotPlanting } from "./lotPlanting";

const today = new Date(Date.UTC(2026, 10, 14));

const potatoLot: LotPlanting = {
  currentUse: { kind: "crop", cropKey: "potato" },
  plantedOn: "2026-08",
  previousUse: { kind: "crop", cropKey: "cabbage" },
  hasIrrigation: false,
};

describe("isPlantingComplete", () => {
  it("is complete when the four questions are answered", () => {
    expect(isPlantingComplete(potatoLot, today)).toBe(true);
  });

  it("needs the planting month when something is planted", () => {
    expect(isPlantingComplete({ ...potatoLot, plantedOn: null }, today)).toBe(false);
  });

  it("does not need a planting month for a resting lot", () => {
    expect(isPlantingComplete({ ...potatoLot, currentUse: { kind: "fallow" }, plantedOn: null }, today)).toBe(true);
  });

  it("is incomplete while the previous use or irrigation is missing", () => {
    expect(isPlantingComplete({ ...potatoLot, previousUse: null }, today)).toBe(false);
    expect(isPlantingComplete({ ...potatoLot, hasIrrigation: null }, today)).toBe(false);
    expect(isPlantingComplete(emptyLotPlanting, today)).toBe(false);
  });
});

describe("isValidPlantingMonth", () => {
  it("accepts this month and past months", () => {
    expect(isValidPlantingMonth("2026-11", today)).toBe(true);
    expect(isValidPlantingMonth("2025-12", today)).toBe(true);
  });

  it("rejects future months and badly written values", () => {
    expect(isValidPlantingMonth("2026-12", today)).toBe(false);
    expect(isValidPlantingMonth("2026-13", today)).toBe(false);
    expect(isValidPlantingMonth("nov-2026", today)).toBe(false);
  });
});
