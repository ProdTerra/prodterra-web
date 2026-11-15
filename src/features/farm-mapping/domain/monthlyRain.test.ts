import { describe, expect, it } from "vitest";
import { monthlyRainInLitersPerSquareMeter } from "./monthlyRain";

describe("monthlyRainInLitersPerSquareMeter", () => {
  it("turns the daily average into the liters that fall on each square meter in the month", () => {
    expect(monthlyRainInLitersPerSquareMeter(2.5, 3)).toBe(78);
    expect(monthlyRainInLitersPerSquareMeter(9.2, 10)).toBe(285);
  });

  it("uses the length of each month", () => {
    expect(monthlyRainInLitersPerSquareMeter(10, 4)).toBe(300);
    expect(monthlyRainInLitersPerSquareMeter(10, 2)).toBe(283);
  });
});
