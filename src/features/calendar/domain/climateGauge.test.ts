import { describe, expect, it } from "vitest";
import { climateGauge, humidityGaugeLimits, rainGaugeLimits } from "./climateGauge";

describe("climateGauge", () => {
  it("places the month value and the dry and wet limits along the bar", () => {
    expect(climateGauge(75, rainGaugeLimits)).toEqual({ valuePercent: 25, lowPercent: 10, highPercent: 50 });
    expect(climateGauge(90, humidityGaugeLimits)).toEqual({ valuePercent: 90, lowPercent: 50, highPercent: 80 });
  });

  it("keeps values beyond the scale at its ends", () => {
    expect(climateGauge(450, rainGaugeLimits).valuePercent).toBe(100);
    expect(climateGauge(-3, humidityGaugeLimits).valuePercent).toBe(0);
  });
});
