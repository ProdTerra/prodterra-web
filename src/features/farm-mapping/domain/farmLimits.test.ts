import { describe, expect, it } from "vitest";
import { maximumFarmAreaInHectares, maximumLots, minimumFarmAreaInHectares, validateFarmArea } from "./farmLimits";

describe("validateFarmArea", () => {
  it("accepts farms between the minimum and maximum size", () => {
    expect(validateFarmArea(2.4)).toEqual({ isValid: true });
    expect(validateFarmArea(maximumFarmAreaInHectares)).toEqual({ isValid: true });
  });

  it("rejects areas too large to be a farm", () => {
    expect(validateFarmArea(308_912_483.9)).toEqual({ isValid: false, reason: "tooLarge" });
  });

  it("rejects tiny accidental shapes", () => {
    expect(validateFarmArea(minimumFarmAreaInHectares / 2)).toEqual({ isValid: false, reason: "tooSmall" });
  });

  it("caps the number of lots the calendar can plan", () => {
    expect(maximumLots).toBe(30);
  });
});
