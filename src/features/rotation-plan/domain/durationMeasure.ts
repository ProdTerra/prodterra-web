const daysPerWeek = 7;
const averageDaysPerMonth = 30.44;

export function toWeeks(durationInDays: number): number {
  return Math.max(1, Math.round(durationInDays / daysPerWeek));
}

export function toHalfMonths(durationInDays: number): number {
  return Math.max(1, Math.round((durationInDays / averageDaysPerMonth) * 2));
}
