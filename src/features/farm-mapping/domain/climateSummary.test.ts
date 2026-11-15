import { describe, expect, it } from "vitest";
import { summarizeClimate, type MonthlyClimate } from "./climateSummary";

function month(number: number, mean: number, minimum: number, rain: number): MonthlyClimate {
  return {
    month: number,
    meanTemperatureInCelsius: mean,
    minimumTemperatureInCelsius: minimum,
    maximumTemperatureInCelsius: mean + 7,
    relativeHumidityInPercent: 80 + number,
    precipitationInMillimetersPerDay: rain,
    solarRadiationInKilowattHoursPerSquareMeterPerDay: 4 + number / 10,
  };
}

const months = [month(1, 11.9, 5.2, 3.8), month(2, 12, 6.4, 2.47), month(5, 14, 5.1, 7.83), month(10, 13.2, 8.1, 9.2)];

describe("summarizeClimate", () => {
  it("finds the coldest and warmest months by mean temperature", () => {
    const summary = summarizeClimate(months);
    expect(summary.coldestMonth).toEqual({ month: 1, valueInCelsius: 11.9 });
    expect(summary.warmestMonth).toEqual({ month: 5, valueInCelsius: 14 });
  });

  it("finds the coldest night by minimum temperature", () => {
    expect(summarizeClimate(months).coldestNight).toEqual({ month: 5, valueInCelsius: 5.1 });
  });

  it("finds the driest and wettest months and the yearly rain", () => {
    const summary = summarizeClimate(months);
    expect(summary.driestMonth).toEqual({ month: 2, millimetersPerDay: 2.47 });
    expect(summary.wettestMonth).toEqual({ month: 10, millimetersPerDay: 9.2 });
  });

  it("averages humidity and sunlight over the months", () => {
    const summary = summarizeClimate(months);
    expect(summary.averageHumidityInPercent).toBe(84.5);
    expect(summary.averageSolarRadiation).toBe(4.45);
  });
});
