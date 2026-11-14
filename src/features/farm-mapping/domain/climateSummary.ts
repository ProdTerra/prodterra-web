export type MonthlyClimate = {
  month: number;
  meanTemperatureInCelsius: number;
  minimumTemperatureInCelsius: number;
  maximumTemperatureInCelsius: number;
  relativeHumidityInPercent: number;
  precipitationInMillimetersPerDay: number;
  solarRadiationInKilowattHoursPerSquareMeterPerDay: number;
};

type MonthTemperature = { month: number; valueInCelsius: number };
type MonthRain = { month: number; millimetersPerDay: number };

export type ClimateSummary = {
  coldestMonth: MonthTemperature;
  warmestMonth: MonthTemperature;
  coldestNight: MonthTemperature;
  driestMonth: MonthRain;
  wettestMonth: MonthRain;
  averageHumidityInPercent: number;
  averageSolarRadiation: number;
};

function pickBy(months: MonthlyClimate[], value: (month: MonthlyClimate) => number, wantLowest: boolean) {
  return months.reduce((best, candidate) => {
    const isBetter = wantLowest ? value(candidate) < value(best) : value(candidate) > value(best);
    return isBetter ? candidate : best;
  });
}

function averageOf(months: MonthlyClimate[], value: (month: MonthlyClimate) => number): number {
  const total = months.reduce((sum, month) => sum + value(month), 0);
  return Math.round((total / months.length) * 100) / 100;
}

export function summarizeClimate(months: MonthlyClimate[]): ClimateSummary {
  const meanTemperature = (month: MonthlyClimate) => month.meanTemperatureInCelsius;
  const minimumTemperature = (month: MonthlyClimate) => month.minimumTemperatureInCelsius;
  const rain = (month: MonthlyClimate) => month.precipitationInMillimetersPerDay;
  const coldest = pickBy(months, meanTemperature, true);
  const warmest = pickBy(months, meanTemperature, false);
  const coldestNight = pickBy(months, minimumTemperature, true);
  const driest = pickBy(months, rain, true);
  const wettest = pickBy(months, rain, false);

  return {
    coldestMonth: { month: coldest.month, valueInCelsius: coldest.meanTemperatureInCelsius },
    warmestMonth: { month: warmest.month, valueInCelsius: warmest.meanTemperatureInCelsius },
    coldestNight: { month: coldestNight.month, valueInCelsius: coldestNight.minimumTemperatureInCelsius },
    driestMonth: { month: driest.month, millimetersPerDay: driest.precipitationInMillimetersPerDay },
    wettestMonth: { month: wettest.month, millimetersPerDay: wettest.precipitationInMillimetersPerDay },
    averageHumidityInPercent: averageOf(months, (month) => month.relativeHumidityInPercent),
    averageSolarRadiation: averageOf(months, (month) => month.solarRadiationInKilowattHoursPerSquareMeterPerDay),
  };
}
