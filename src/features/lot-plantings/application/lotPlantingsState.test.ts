import { describe, expect, it } from "vitest";
import { emptyLotPlanting } from "../domain/lotPlanting";
import { lotPlantingsReducer, planningFor } from "./lotPlantingsState";

describe("lotPlantingsReducer", () => {
  it("records the answers of one lot without touching the others", () => {
    const state = lotPlantingsReducer(
      lotPlantingsReducer({}, { type: "currentUseChosen", shapeId: "a", currentUse: { kind: "crop", cropKey: "potato" } }),
      { type: "irrigationChosen", shapeId: "a", hasIrrigation: true },
    );
    expect(planningFor(state, "a")).toEqual({
      ...emptyLotPlanting,
      currentUse: { kind: "crop", cropKey: "potato" },
      hasIrrigation: true,
    });
    expect(planningFor(state, "b")).toEqual(emptyLotPlanting);
  });

  it("clears the planting month when the lot is set to rest", () => {
    const planted = lotPlantingsReducer(
      lotPlantingsReducer({}, { type: "currentUseChosen", shapeId: "a", currentUse: { kind: "crop", cropKey: "potato" } }),
      { type: "plantingMonthChosen", shapeId: "a", plantedOn: "2026-08" },
    );
    const resting = lotPlantingsReducer(planted, { type: "currentUseChosen", shapeId: "a", currentUse: { kind: "fallow" } });
    expect(planningFor(resting, "a").plantedOn).toBeNull();
  });

  it("copies one lot's answers to every lot", () => {
    const answered = lotPlantingsReducer({}, { type: "irrigationChosen", shapeId: "a", hasIrrigation: true });
    const copied = lotPlantingsReducer(answered, { type: "appliedToAllLots", fromShapeId: "a", shapeIds: ["a", "b", "c"] });
    expect(planningFor(copied, "c")).toEqual(planningFor(answered, "a"));
  });

  it("forgets lots that no longer exist", () => {
    const answered = lotPlantingsReducer({}, { type: "irrigationChosen", shapeId: "old", hasIrrigation: true });
    const pruned = lotPlantingsReducer(answered, { type: "lotsChanged", shapeIds: ["new"] });
    expect(Object.keys(pruned)).toEqual([]);
  });
});
