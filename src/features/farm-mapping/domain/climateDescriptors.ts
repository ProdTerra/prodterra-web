export type TemperatureBand = "cold" | "cool" | "mild" | "warm";
export type HumidityBand = "veryHumid" | "humid" | "dry";
export type SunlightBand = "low" | "moderate" | "high";

const coolFromCelsius = 12;
const mildFromCelsius = 18;
const warmFromCelsius = 24;
const veryHumidFromPercent = 85;
const humidFromPercent = 70;
const moderateSunFromKilowattHours = 3.5;
const highSunFromKilowattHours = 5;

export function describeTemperature(coldestMonthCelsius: number, warmestMonthCelsius: number): TemperatureBand {
  const yearlyMiddle = (coldestMonthCelsius + warmestMonthCelsius) / 2;
  if (yearlyMiddle < coolFromCelsius) {
    return "cold";
  }
  if (yearlyMiddle < mildFromCelsius) {
    return "cool";
  }
  return yearlyMiddle < warmFromCelsius ? "mild" : "warm";
}

export function describeHumidity(averageHumidityPercent: number): HumidityBand {
  if (averageHumidityPercent >= veryHumidFromPercent) {
    return "veryHumid";
  }
  return averageHumidityPercent >= humidFromPercent ? "humid" : "dry";
}

export function describeSunlight(averageKilowattHoursPerSquareMeterPerDay: number): SunlightBand {
  if (averageKilowattHoursPerSquareMeterPerDay < moderateSunFromKilowattHours) {
    return "low";
  }
  return averageKilowattHoursPerSquareMeterPerDay < highSunFromKilowattHours ? "moderate" : "high";
}
