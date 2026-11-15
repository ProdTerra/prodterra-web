import { describe, expect, it } from "vitest";
import { isApproximateLocation, zoomForAccuracy } from "./locationAccuracy";

describe("location accuracy", () => {
  it("treats a margin of error above 200 m as approximate", () => {
    expect(isApproximateLocation(30)).toBe(false);
    expect(isApproximateLocation(200)).toBe(false);
    expect(isApproximateLocation(4500)).toBe(true);
  });

  it("zooms out further the less precise the location is", () => {
    expect(zoomForAccuracy(30)).toBe(17);
    expect(zoomForAccuracy(1000)).toBeLessThan(zoomForAccuracy(300));
    expect(zoomForAccuracy(50_000)).toBe(10);
  });
});
