import { describe, expect, it } from "vitest";
import type { Polygon } from "geojson";
import { calculateAreaInHectares, validateLot } from "./farmGeometry";

const metersToDegrees = 1 / 111_320;

function square(originLongitude: number, originLatitude: number, sideInMeters: number): Polygon {
  const side = sideInMeters * metersToDegrees;
  return {
    type: "Polygon",
    coordinates: [
      [
        [originLongitude, originLatitude],
        [originLongitude + side, originLatitude],
        [originLongitude + side, originLatitude + side],
        [originLongitude, originLatitude + side],
        [originLongitude, originLatitude],
      ],
    ],
  };
}

const farmBoundary = square(-83.892, 9.918, 200);

describe("calculateAreaInHectares", () => {
  it("returns about one hectare for a 100 m square", () => {
    expect(calculateAreaInHectares(square(-83.892, 9.918, 100))).toBeCloseTo(1, 1);
  });
});

describe("validateLot", () => {
  it("accepts a lot inside the farm that does not overlap other lots", () => {
    const lot = square(-83.892, 9.918, 50);
    expect(validateLot(lot, farmBoundary, [])).toEqual({ isValid: true });
  });

  it("rejects a lot that goes outside the farm boundary", () => {
    const lot = square(-83.8915, 9.918, 300);
    expect(validateLot(lot, farmBoundary, [])).toEqual({
      isValid: false,
      reason: "outsideFarm",
    });
  });

  it("rejects a lot that overlaps an existing lot and names it", () => {
    const existingLot = { name: "Norte", geometry: square(-83.892, 9.918, 80) };
    const lot = square(-83.892 + 40 * metersToDegrees, 9.918, 80);
    expect(validateLot(lot, farmBoundary, [existingLot])).toEqual({
      isValid: false,
      reason: "overlapsLot",
      overlappedLotName: "Norte",
    });
  });

  it("accepts a lot that only shares an edge with an existing lot", () => {
    const existingLot = { name: "Norte", geometry: square(-83.892, 9.918, 80) };
    const lot = square(-83.892 + 80 * metersToDegrees, 9.918, 80);
    expect(validateLot(lot, farmBoundary, [existingLot])).toEqual({ isValid: true });
  });
});
