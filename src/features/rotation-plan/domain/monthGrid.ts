import { daysInMonth } from "./rotationSchedule";
import { fromIsoDate } from "./planDates";

export function mondayFirstOffset(monthKey: string): number {
  const weekday = fromIsoDate(`${monthKey}-01`).getUTCDay();
  return (weekday + 6) % 7;
}

export function monthDates(monthKey: string): string[] {
  return Array.from({ length: daysInMonth(monthKey) }, (_, index) => `${monthKey}-${String(index + 1).padStart(2, "0")}`);
}

export function shiftMonth(monthKey: string, months: number): string {
  const [year, month] = monthKey.split("-").map(Number);
  const shifted = new Date(Date.UTC(year, month - 1 + months, 1));
  return shifted.toISOString().slice(0, 7);
}
