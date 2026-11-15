import { describe, expect, it } from "vitest";
import type { Polygon } from "geojson";
import { farmMappingReducer, initialFarmMappingState } from "./farmMappingState";
import { lotColors } from "../domain/lotColors";

const geometry: Polygon = {
  type: "Polygon",
  coordinates: [
    [
      [-83.892, 9.918],
      [-83.891, 9.918],
      [-83.891, 9.919],
      [-83.892, 9.918],
    ],
  ],
};

const stateWithBoundary = farmMappingReducer(
  farmMappingReducer(initialFarmMappingState, { type: "locationConfirmed" }),
  { type: "boundaryFinished", shapeId: "farm-1", geometry, areaInHectares: 2.4 },
);

describe("farmMappingReducer", () => {
  it("starts by asking for the farm location", () => {
    expect(initialFarmMappingState.step).toBe("locate");
  });

  it("moves to drawing the boundary once the location is confirmed", () => {
    const state = farmMappingReducer(initialFarmMappingState, { type: "locationConfirmed" });
    expect(state.step).toBe("boundary");
  });

  it("stores the boundary with its area and moves to the lots step", () => {
    expect(stateWithBoundary.step).toBe("lots");
    expect(stateWithBoundary.farmBoundary).toEqual({
      shapeId: "farm-1",
      geometry,
      areaInHectares: 2.4,
    });
  });

  it("numbers accepted lots and gives each a different color", () => {
    const withOneLot = farmMappingReducer(stateWithBoundary, {
      type: "lotAccepted",
      shapeId: "lot-a",
      geometry,
      areaInHectares: 0.5,
    });
    const withTwoLots = farmMappingReducer(withOneLot, {
      type: "lotAccepted",
      shapeId: "lot-b",
      geometry,
      areaInHectares: 0.7,
    });
    expect(withTwoLots.lots.map((lot) => [lot.number, lot.color])).toEqual([
      [1, lotColors[0]],
      [2, lotColors[1]],
    ]);
    expect(withTwoLots.rejection).toBeNull();
  });

  it("keeps the rejection reason when a lot is not valid", () => {
    const state = farmMappingReducer(stateWithBoundary, {
      type: "lotRejected",
      validation: { isValid: false, reason: "overlapsLot", overlappedLotNumber: 2 },
    });
    expect(state.lots).toHaveLength(0);
    expect(state.rejection).toEqual({ reason: "overlapsLot", overlappedLotNumber: 2 });
  });

  it("renames and removes lots", () => {
    const withLot = farmMappingReducer(stateWithBoundary, {
      type: "lotAccepted",
      shapeId: "lot-a",
      geometry,
      areaInHectares: 0.5,
    });
    const renamed = farmMappingReducer(withLot, {
      type: "lotRenamed",
      shapeId: "lot-a",
      name: "Potrero de arriba",
    });
    expect(renamed.lots[0].customName).toBe("Potrero de arriba");
    const removed = farmMappingReducer(renamed, { type: "lotRemoved", shapeId: "lot-a" });
    expect(removed.lots).toHaveLength(0);
  });

  it("clears the boundary and every lot when the boundary is redrawn", () => {
    const withLot = farmMappingReducer(stateWithBoundary, {
      type: "lotAccepted",
      shapeId: "lot-a",
      geometry,
      areaInHectares: 0.5,
    });
    const reset = farmMappingReducer(withLot, { type: "boundaryReset" });
    expect(reset.step).toBe("boundary");
    expect(reset.farmBoundary).toBeNull();
    expect(reset.lots).toHaveLength(0);
  });

  it("goes back to the location step when asked", () => {
    const state = farmMappingReducer(
      farmMappingReducer(initialFarmMappingState, { type: "locationConfirmed" }),
      { type: "locationChangeRequested" },
    );
    expect(state.step).toBe("locate");
  });
});

describe("restoring a saved draft", () => {
  it("replaces the current progress with the saved one", () => {
    const saved = farmMappingReducer(stateWithBoundary, {
      type: "lotAccepted",
      shapeId: "lot-a",
      geometry,
      areaInHectares: 0.5,
    });
    const restored = farmMappingReducer(initialFarmMappingState, {
      type: "draftRestored",
      draft: saved,
    });
    expect(restored).toEqual(saved);
  });
});

describe("splitting the farm into equal lots", () => {
  it("replaces every lot with the new ones numbered from one", () => {
    const withManualLot = farmMappingReducer(stateWithBoundary, {
      type: "lotAccepted",
      shapeId: "manual",
      geometry,
      areaInHectares: 0.5,
    });
    const split = farmMappingReducer(withManualLot, {
      type: "lotsReplaced",
      lots: [
        { shapeId: "split-a", geometry, areaInHectares: 1.2 },
        { shapeId: "split-b", geometry, areaInHectares: 1.2 },
      ],
    });
    expect(split.lots.map((lot) => [lot.shapeId, lot.number, lot.color])).toEqual([
      ["split-a", 1, lotColors[0]],
      ["split-b", 2, lotColors[1]],
    ]);
    expect(split.lastLotNumber).toBe(2);
  });
});

describe("moving through the rotation steps", () => {
  const withLot = farmMappingReducer(stateWithBoundary, {
    type: "lotAccepted",
    shapeId: "lot-a",
    geometry,
    areaInHectares: 0.5,
  });
  const planStep = farmMappingReducer(withLot, { type: "lotsConfirmed" });

  it("goes to the rotation plan once the lots are confirmed", () => {
    expect(planStep.step).toBe("plan");
    expect(farmMappingReducer(stateWithBoundary, { type: "lotsConfirmed" }).step).toBe("lots");
  });

  it("goes from the plan to the farmer calendar and then to the analysis", () => {
    const myCalendar = farmMappingReducer(planStep, { type: "planConfirmed" });
    expect(myCalendar.step).toBe("myCalendar");
    expect(farmMappingReducer(myCalendar, { type: "analysisRequested" }).step).toBe("analysis");
    expect(farmMappingReducer(withLot, { type: "planConfirmed" }).step).toBe("lots");
  });

  it("goes back to each earlier step keeping the lots", () => {
    const analysis = { ...planStep, step: "analysis" as const };
    expect(farmMappingReducer(analysis, { type: "myCalendarRequested" }).step).toBe("myCalendar");
    expect(farmMappingReducer(analysis, { type: "planEditRequested" }).step).toBe("plan");
    const back = farmMappingReducer(planStep, { type: "lotsEditRequested" });
    expect(back.step).toBe("lots");
    expect(back.lots).toHaveLength(1);
  });

  it("opens a draft saved on a removed step at the rotation plan", () => {
    const oldDraft = { ...planStep, step: "crops" as unknown as "plan" };
    expect(farmMappingReducer(initialFarmMappingState, { type: "draftRestored", draft: oldDraft }).step).toBe("plan");
  });

  it("starts a new plan on the same farm: keeps the boundary and clears the lots", () => {
    const withLot = farmMappingReducer(stateWithBoundary, { type: "lotsReplaced", lots: [{ shapeId: "lot-a", geometry, areaInHectares: 2.4 }] });
    const analysis = { ...withLot, step: "analysis" as const };
    const fresh = farmMappingReducer(analysis, { type: "newPlanRequested" });
    expect(fresh.step).toBe("lots");
    expect(fresh.farmBoundary).toEqual(stateWithBoundary.farmBoundary);
    expect(fresh.lots).toEqual([]);
    expect(fresh.lastLotNumber).toBe(0);
  });

  it("starts over from step 1 without the farm, the lots or the lot count", () => {
    const withLot = farmMappingReducer(stateWithBoundary, { type: "lotsReplaced", lots: [{ shapeId: "lot-a", geometry, areaInHectares: 2.4 }] });
    const analysis = { ...withLot, step: "analysis" as const, rejection: { reason: "outsideFarm" as const } };

    const fresh = farmMappingReducer(analysis, { type: "startOverRequested" });

    expect(fresh).toEqual(initialFarmMappingState);
    expect(fresh).not.toBe(initialFarmMappingState);
  });
});
