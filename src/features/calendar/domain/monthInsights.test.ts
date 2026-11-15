import { describe, expect, it } from "vitest";
import { describeClimate, sortAlerts } from "./monthInsights";

const january = {
  month: 1,
  meanTemperatureInCelsius: 11.9,
  minimumTemperatureInCelsius: 1.2,
  maximumTemperatureInCelsius: 18.8,
  relativeHumidityInPercent: 89.6,
  precipitationInMillimetersPerDay: 0.8,
  solarRadiationInKilowattHoursPerSquareMeterPerDay: 4.6,
};

describe("describeClimate", () => {
  it("turns the typical month into rain for the whole month and plain words", () => {
    expect(describeClimate(january, "2027-01")).toEqual({
      rainInMillimeters: 25,
      rainLevel: "dry",
      humidityLevel: "high",
      hasFrostNights: true,
    });
    expect(describeClimate({ ...january, precipitationInMillimetersPerDay: 6, relativeHumidityInPercent: 70, minimumTemperatureInCelsius: 8 }, "2027-06")).toEqual({
      rainInMillimeters: 180,
      rainLevel: "wet",
      humidityLevel: "normal",
      hasFrostNights: false,
    });
  });
});

describe("sortAlerts", () => {
  it("puts risks before things to watch, and frost and drought first", () => {
    const sorted = sortAlerts([
      { type: "pest", level: "watch", pestKey: "late-blight" },
      { type: "irrigation", level: "watch", litersPerSquareMeter: 20 },
      { type: "drought", level: "risk", litersPerSquareMeter: 30 },
      { type: "frost", level: "risk", minimumTemperatureInCelsius: 1 },
    ]);
    expect(sorted.map((alert) => alert.type)).toEqual(["frost", "drought", "irrigation", "pest"]);
  });
});
