import { addDays } from "./planDates";
import type { RotationBlock } from "./rotationPlan";

export type ScheduledBlock = { block: RotationBlock; startDate: string; endDate: string };

export type DayUse = { kind: "crop"; cropKey: string } | { kind: "rest" };

export type DayMarker = "sowing" | "harvest" | null;

export type CalendarDay = { day: number; use: DayUse | null; marker: DayMarker };

export function scheduleBlocks(startDate: string, blocks: RotationBlock[]): ScheduledBlock[] {
  let nextStart = startDate;
  return blocks.map((block) => {
    const scheduled = { block, startDate: nextStart, endDate: addDays(nextStart, block.durationInDays - 1) };
    nextStart = addDays(scheduled.endDate, 1);
    return scheduled;
  });
}

export function monthKeyOf(isoDate: string): string {
  return isoDate.slice(0, 7);
}

export function daysInMonth(monthKey: string): number {
  const [year, month] = monthKey.split("-").map(Number);
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

export function nextMonthKey(monthKey: string): string {
  const [year, month] = monthKey.split("-").map(Number);
  return month === 12 ? `${year + 1}-01` : `${year}-${String(month + 1).padStart(2, "0")}`;
}

export function planEndDate(startDate: string, schedules: ScheduledBlock[][]): string {
  return schedules.reduce((latest, schedule) => {
    const lastEnd = schedule.at(-1)?.endDate ?? startDate;
    return lastEnd > latest ? lastEnd : latest;
  }, startDate);
}

export function planMonths(startDate: string, schedules: ScheduledBlock[][]): string[] {
  const lastMonth = monthKeyOf(planEndDate(startDate, schedules));
  const months = [monthKeyOf(startDate)];
  while (months[months.length - 1] < lastMonth) {
    months.push(nextMonthKey(months[months.length - 1]));
  }
  return months;
}

function toDayUse(block: RotationBlock): DayUse {
  return block.kind === "crop" ? { kind: "crop", cropKey: block.cropKey } : { kind: "rest" };
}

function markerFor(scheduled: ScheduledBlock, isoDate: string): DayMarker {
  if (scheduled.block.kind !== "crop") {
    return null;
  }
  if (isoDate === scheduled.startDate) {
    return "sowing";
  }
  return isoDate === scheduled.endDate ? "harvest" : null;
}

export function dayUsesForMonth(schedule: ScheduledBlock[], monthKey: string): CalendarDay[] {
  return Array.from({ length: daysInMonth(monthKey) }, (_, index) => {
    const isoDate = `${monthKey}-${String(index + 1).padStart(2, "0")}`;
    const scheduled = schedule.find((candidate) => candidate.startDate <= isoDate && isoDate <= candidate.endDate);
    return {
      day: index + 1,
      use: scheduled ? toDayUse(scheduled.block) : null,
      marker: scheduled ? markerFor(scheduled, isoDate) : null,
    };
  });
}
