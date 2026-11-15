import type { MonthClimate, PlanAlert } from "../infrastructure/plansApi";

export type ClimateDescription = {
  rainInMillimeters: number;
  rainLevel: "dry" | "normal" | "wet";
  humidityLevel: "low" | "normal" | "high";
  hasFrostNights: boolean;
};

export const dryMonthInMillimeters = 30;
export const wetMonthInMillimeters = 150;
export const highHumidityInPercent = 80;
export const lowHumidityInPercent = 50;
const frostThresholdInCelsius = 2;

function daysInMonth(monthKey: string): number {
  const [year, month] = monthKey.split("-").map(Number);
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

export function describeClimate(climate: MonthClimate, monthKey: string): ClimateDescription {
  const rainInMillimeters = Math.round(climate.precipitationInMillimetersPerDay * daysInMonth(monthKey));
  return {
    rainInMillimeters,
    rainLevel: rainInMillimeters < dryMonthInMillimeters ? "dry" : rainInMillimeters > wetMonthInMillimeters ? "wet" : "normal",
    humidityLevel:
      climate.relativeHumidityInPercent > highHumidityInPercent ? "high" : climate.relativeHumidityInPercent < lowHumidityInPercent ? "low" : "normal",
    hasFrostNights: climate.minimumTemperatureInCelsius < frostThresholdInCelsius,
  };
}

const alertOrder: Record<PlanAlert["type"], number> = {
  frost: 0,
  drought: 1,
  temperature: 2,
  waterExcess: 3,
  irrigation: 4,
  pest: 5,
};

export function compareAlerts(first: PlanAlert, second: PlanAlert): number {
  if (first.level !== second.level) {
    return first.level === "risk" ? -1 : 1;
  }
  return alertOrder[first.type] - alertOrder[second.type];
}

export function sortAlerts(alerts: PlanAlert[]): PlanAlert[] {
  return [...alerts].sort(compareAlerts);
}
