import type { Polygon } from "geojson";
import { describe, expect, it } from "vitest";
import { calculateAreaInHectares, validateLot } from "./farmGeometry";
import { splitFarm } from "./splitFarm";

const irregularFarm: Polygon = {
  type: "Polygon",
  coordinates: [
    [
      [-83.8935, 9.9165],
      [-83.8905, 9.9168],
      [-83.8898, 9.9192],
      [-83.8921, 9.9201],
      [-83.894, 9.9186],
      [-83.8935, 9.9165],
    ],
  ],
};

const metersToDegrees = 1 / 111_320;

function rotatedRectangle(lengthInMeters: number, widthInMeters: number, angleInDegrees: number): Polygon {
  const radians = (angleInDegrees * Math.PI) / 180;
  const center: [number, number] = [-83.892, 9.918];
  const corners = [
    [-lengthInMeters / 2, -widthInMeters / 2],
    [lengthInMeters / 2, -widthInMeters / 2],
    [lengthInMeters / 2, widthInMeters / 2],
    [-lengthInMeters / 2, widthInMeters / 2],
  ].map(([x, y]) => {
    const rotatedX = x * Math.cos(radians) - y * Math.sin(radians);
    const rotatedY = x * Math.sin(radians) + y * Math.cos(radians);
    return [center[0] + rotatedX * metersToDegrees, center[1] + rotatedY * metersToDegrees];
  });
  return { type: "Polygon", coordinates: [[...corners, corners[0]]] };
}

function longestSideInMeters(polygon: Polygon): number {
  const ring = polygon.coordinates[0];
  let longest = 0;
  for (let index = 0; index < ring.length - 1; index += 1) {
    const [x1, y1] = ring[index];
    const [x2, y2] = ring[index + 1];
    longest = Math.max(longest, Math.hypot(x2 - x1, y2 - y1) / metersToDegrees);
  }
  return longest;
}

describe("splitFarm", () => {
  it.each([
    ["along", 4],
    ["across", 7],
    ["grid", 6],
  ] as const)("cuts the farm into %s parts of the same area (%i lots)", (layout, count) => {
    const parts = splitFarm(irregularFarm, count, layout);
    const farmArea = calculateAreaInHectares(irregularFarm);
    expect(parts).toHaveLength(count);
    for (const part of parts) {
      expect(calculateAreaInHectares(part)).toBeCloseTo(farmArea / count, 2);
    }
  });

  it("keeps every part inside the farm and without overlaps", () => {
    for (const layout of ["along", "across", "grid"] as const) {
      const parts = splitFarm(irregularFarm, 6, layout);
      parts.forEach((part, index) => {
        const previous = parts.slice(0, index).map((geometry, lotIndex) => ({ lotNumber: lotIndex + 1, geometry }));
        expect(validateLot(part, irregularFarm, previous)).toEqual({ isValid: true });
      });
    }
  });

  it("follows the long side of a slanted farm", () => {
    const slantedFarm = rotatedRectangle(400, 100, 35);
    const along = splitFarm(slantedFarm, 4, "along");
    const across = splitFarm(slantedFarm, 4, "across");
    expect(longestSideInMeters(along[0])).toBeGreaterThan(380);
    expect(longestSideInMeters(across[0])).toBeLessThan(110);
  });

  it("uses rows and columns for a grid and falls back to strips for a prime count", () => {
    expect(splitFarm(irregularFarm, 6, "grid")).toHaveLength(6);
    expect(splitFarm(irregularFarm, 5, "grid")).toHaveLength(5);
  });

  it("returns the whole farm when asked for a single lot", () => {
    const [onlyPart] = splitFarm(irregularFarm, 1, "along");
    expect(calculateAreaInHectares(onlyPart)).toBeCloseTo(calculateAreaInHectares(irregularFarm), 4);
  });
});
