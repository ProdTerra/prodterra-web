import { addDays, fromIsoDate, toIsoDate } from "./planDates";

export const durationUnits = ["days", "weeks", "months"] as const;
export type DurationUnit = (typeof durationUnits)[number];

const daysPerWeek = 7;
const millisecondsPerDay = 86_400_000;

function addMonths(isoDate: string, months: number): string {
  const date = fromIsoDate(isoDate);
  const day = date.getUTCDate();
  const target = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + months, 1));
  const lastDayOfTarget = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)).getUTCDate();
  target.setUTCDate(Math.min(day, lastDayOfTarget));
  return toIsoDate(target);
}

function daysBetween(fromDate: string, toDate: string): number {
  return Math.round((fromIsoDate(toDate).getTime() - fromIsoDate(fromDate).getTime()) / millisecondsPerDay);
}

export function naturalUnitOf(durationInDays: number): DurationUnit {
  return durationInDays % daysPerWeek === 0 ? "weeks" : "days";
}

export function daysForAmount(unit: DurationUnit, amount: number, startDate: string): number {
  if (unit === "days") {
    return amount;
  }
  if (unit === "weeks") {
    return amount * daysPerWeek;
  }
  return daysBetween(startDate, addMonths(startDate, amount));
}

export function amountInUnit(unit: DurationUnit, durationInDays: number, startDate: string): number {
  if (unit === "days") {
    return durationInDays;
  }
  if (unit === "weeks") {
    return Math.max(1, Math.round(durationInDays / daysPerWeek));
  }
  const endDate = addDays(startDate, durationInDays);
  let months = 1;
  while (daysBetween(startDate, addMonths(startDate, months + 1)) <= daysBetween(startDate, endDate) + 14) {
    months += 1;
  }
  return months;
}
