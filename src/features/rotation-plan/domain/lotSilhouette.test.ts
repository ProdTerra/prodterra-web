import type { Polygon } from "geojson";
import { describe, expect, it } from "vitest";
import { silhouetteBounds, snapshotFraming, toSilhouettePoints } from "./lotSilhouette";

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

const smallLot: Polygon = {
  type: "Polygon",
  coordinates: [
    [
      [-83.892, 9.918],
      [-83.8918, 9.918],
      [-83.8918, 9.9182],
      [-83.892, 9.9182],
      [-83.892, 9.918],
    ],
  ],
};

describe("snapshotFraming", () => {
  it("keeps the requested detail within what the satellite service can return", () => {
    for (const lot of [wideLot, smallLot]) {
      const framing = snapshotFraming(lot, 64, 6, 256);
      expect((framing.bounds.north - framing.bounds.south) / framing.sizeInPixels).toBeGreaterThanOrEqual(3.2e-6);
      expect(framing.sizeInPixels).toBeGreaterThanOrEqual(128);
    }
  });

  it("leaves a normal lot framed as drawn and widens the view around a tiny lot", () => {
    expect(snapshotFraming(wideLot, 64, 6, 256)).toEqual({ bounds: silhouetteBounds(wideLot, 64, 6), sizeInPixels: 256, padding: 6 });
    const tiny = snapshotFraming(smallLot, 64, 6, 256);
    expect(tiny.padding).toBeGreaterThan(6);
    expect(tiny.bounds.north - tiny.bounds.south).toBeCloseTo(128 * 3.2e-6, 10);
  });
});
