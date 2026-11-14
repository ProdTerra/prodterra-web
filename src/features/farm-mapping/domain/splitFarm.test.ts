import type { Polygon } from "geojson";
import { describe, expect, it } from "vitest";
import { calculateAreaInHectares, validateLot } from "./farmGeometry";
import { splitIntoEqualStrips } from "./splitFarm";

const irregularFarm: Polygon = {
  type: "Polygon",
  coordinates: [
    [
      [-83.8935, 9.9165],
      [-83.8905, 9.9168],
      [-83.8898, 9.9192],
      [-83.8921, 9.9201],
      [-83.8940, 9.9186],
      [-83.8935, 9.9165],
    ],
  ],
};

describe("splitIntoEqualStrips", () => {
  it.each([
    ["vertical", 4],
    ["horizontal", 7],
  ] as const)("cuts the farm into %s strips of the same area (%i lots)", (orientation, count) => {
    const strips = splitIntoEqualStrips(irregularFarm, count, orientation);
    const farmArea = calculateAreaInHectares(irregularFarm);
    expect(strips).toHaveLength(count);
    for (const strip of strips) {
      expect(calculateAreaInHectares(strip)).toBeCloseTo(farmArea / count, 2);
    }
  });

  it("keeps every strip inside the farm and without overlaps", () => {
    const strips = splitIntoEqualStrips(irregularFarm, 5, "vertical");
    strips.forEach((strip, index) => {
      const previous = strips.slice(0, index).map((geometry, lotIndex) => ({ lotNumber: lotIndex + 1, geometry }));
      expect(validateLot(strip, irregularFarm, previous)).toEqual({ isValid: true });
    });
  });

  it("returns the whole farm when asked for a single lot", () => {
    const [onlyStrip] = splitIntoEqualStrips(irregularFarm, 1, "vertical");
    expect(calculateAreaInHectares(onlyStrip)).toBeCloseTo(calculateAreaInHectares(irregularFarm), 4);
  });
});

describe("strip order", () => {
  it("numbers horizontal strips from north to south and vertical strips from west to east", () => {
    const northernmostLatitude = (polygon: Polygon) => Math.max(...polygon.coordinates[0].map(([, latitude]) => latitude));
    const westernmostLongitude = (polygon: Polygon) => Math.min(...polygon.coordinates[0].map(([longitude]) => longitude));
    const horizontal = splitIntoEqualStrips(irregularFarm, 3, "horizontal");
    const vertical = splitIntoEqualStrips(irregularFarm, 3, "vertical");
    expect(northernmostLatitude(horizontal[0])).toBeGreaterThan(northernmostLatitude(horizontal[2]));
    expect(westernmostLongitude(vertical[0])).toBeLessThan(westernmostLongitude(vertical[2]));
  });
});
