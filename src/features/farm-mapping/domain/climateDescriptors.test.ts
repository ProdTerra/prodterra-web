import { describe, expect, it } from "vitest";
import { describeHumidity, describeTemperature } from "./climateDescriptors";

describe("describeTemperature", () => {
  it("names the yearly temperature band from the monthly means", () => {
    expect(describeTemperature(9, 11)).toBe("cold");
    expect(describeTemperature(15, 17.1)).toBe("cool");
    expect(describeTemperature(19, 23)).toBe("mild");
    expect(describeTemperature(25, 28)).toBe("warm");
  });

  it("uses the average of the coldest and warmest months", () => {
    expect(describeTemperature(11, 13)).toBe("cool");
  });
});

describe("describeHumidity", () => {
  it("names how humid the air is", () => {
    expect(describeHumidity(89.5)).toBe("veryHumid");
    expect(describeHumidity(78)).toBe("humid");
    expect(describeHumidity(60)).toBe("dry");
  });
});
