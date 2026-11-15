import { dryMonthInMillimeters, highHumidityInPercent, lowHumidityInPercent, wetMonthInMillimeters } from "./monthInsights";

export type GaugeLimits = { low: number; high: number; maximum: number };

export type ClimateGauge = { valuePercent: number; lowPercent: number; highPercent: number };

export const rainGaugeLimits: GaugeLimits = { low: dryMonthInMillimeters, high: wetMonthInMillimeters, maximum: 300 };
export const humidityGaugeLimits: GaugeLimits = { low: lowHumidityInPercent, high: highHumidityInPercent, maximum: 100 };

function percentOf(value: number, maximum: number): number {
  return Math.min(100, Math.max(0, (value / maximum) * 100));
}

export function climateGauge(value: number, limits: GaugeLimits): ClimateGauge {
  return {
    valuePercent: percentOf(value, limits.maximum),
    lowPercent: percentOf(limits.low, limits.maximum),
    highPercent: percentOf(limits.high, limits.maximum),
  };
}
