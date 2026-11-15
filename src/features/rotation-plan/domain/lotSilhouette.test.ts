import type { Polygon } from "geojson";
import { describe, expect, it } from "vitest";
import { silhouetteBounds, toSilhouettePoints } from "./lotSilhouette";

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

describe("silhouetteBounds", () => {
  it("covers a square area of ground around the lot, with the same margin as the drawing", () => {
    const bounds = silhouetteBounds(wideLot, 100, 4);
    const latitudeSpan = bounds.north - bounds.south;
    const longitudeSpan = bounds.east - bounds.west;
    expect(longitudeSpan * Math.cos((9.9185 * Math.PI) / 180)).toBeCloseTo(latitudeSpan, 8);
    expect(longitudeSpan).toBeCloseTo((0.004 * 100) / 92, 8);
    expect((bounds.west + bounds.east) / 2).toBeCloseTo(-83.892, 8);
    expect((bounds.south + bounds.north) / 2).toBeCloseTo(9.9185, 8);
  });
});
