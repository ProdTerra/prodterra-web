import type { Polygon } from "geojson";
import { describe, expect, it } from "vitest";
import { toSilhouettePoints } from "./lotSilhouette";

const wideLot: Polygon = {
  type: "Polygon",
  coordinates: [
    [
      [-83.894, 9.918],
      [-83.89, 9.918],
      [-83.89, 9.919],
      [-83.894, 9.919],
      [-83.894, 9.918],
    ],
  ],
};

describe("toSilhouettePoints", () => {
  it("fits the lot inside the drawing box keeping its proportions", () => {
    const points = toSilhouettePoints(wideLot, 100, 4);
    const xs = points.map(([x]) => x);
    const ys = points.map(([, y]) => y);
    expect(Math.min(...xs)).toBeCloseTo(4, 5);
    expect(Math.max(...xs)).toBeCloseTo(96, 5);
    expect(Math.max(...ys) - Math.min(...ys)).toBeLessThan(30);
  });

  it("draws north at the top of the box", () => {
    const points = toSilhouettePoints(wideLot, 100, 4);
    const [, southY] = points[0];
    const [, northY] = points[2];
    expect(northY).toBeLessThan(southY);
  });

  it("does not repeat the closing point", () => {
    expect(toSilhouettePoints(wideLot, 100, 4)).toHaveLength(4);
  });
});
