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
