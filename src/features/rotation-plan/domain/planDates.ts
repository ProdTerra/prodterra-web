const isoDatePattern = /^(\d{4})-(\d{2})-(\d{2})$/;
const millisecondsPerDay = 86_400_000;

export const daysAheadForStart = 365;

export type StartDateValidation =
  | { isValid: true }
  | { isValid: false; reason: "invalidFormat" | "past" | "tooFar" };

export function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function fromIsoDate(isoDate: string): Date {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

export function localToday(now: Date): string {
  return toIsoDate(new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())));
}

export function isIsoDate(value: string): boolean {
  const match = isoDatePattern.exec(value);
  return match !== null && toIsoDate(fromIsoDate(value)) === value;
}

export function addDays(isoDate: string, days: number): string {
  return toIsoDate(new Date(fromIsoDate(isoDate).getTime() + days * millisecondsPerDay));
}

export function latestStartDate(today: string): string {
  return addDays(today, daysAheadForStart);
}

export function validateStartDate(candidate: string, today: string): StartDateValidation {
  if (!isIsoDate(candidate)) {
    return { isValid: false, reason: "invalidFormat" };
  }
  if (candidate < today) {
    return { isValid: false, reason: "past" };
  }
  if (candidate > latestStartDate(today)) {
    return { isValid: false, reason: "tooFar" };
  }
  return { isValid: true };
}

export function nextMonday(today: string): string {
  const weekday = fromIsoDate(today).getUTCDay();
  const daysUntilMonday = ((8 - weekday) % 7) || 7;
  return addDays(today, daysUntilMonday);
}

export function firstOfNextMonth(today: string): string {
  const date = fromIsoDate(today);
  return toIsoDate(new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 1)));
}
