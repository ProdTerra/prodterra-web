import { describe, expect, it } from "vitest";
import { toAreaMeasure } from "./areaMeasure";

describe("toAreaMeasure", () => {
  it("uses square meters for plots smaller than one hectare", () => {
    expect(toAreaMeasure(0.4)).toEqual({ unit: "squareMeters", value: 4000 });
  });

  it("rounds square meters to the nearest ten", () => {
    expect(toAreaMeasure(0.41234)).toEqual({ unit: "squareMeters", value: 4120 });
  });

  it("uses hectares with two decimals from one hectare up", () => {
    expect(toAreaMeasure(1.0249)).toEqual({ unit: "hectares", value: 1.02 });
  });

  it("uses one decimal for large farms", () => {
    expect(toAreaMeasure(26.37)).toEqual({ unit: "hectares", value: 26.4 });
  });
});
