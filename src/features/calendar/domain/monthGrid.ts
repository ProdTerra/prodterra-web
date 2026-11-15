export type GridBlock = {
  id: string;
  lotId: string;
  kind: "crop" | "rest";
  cropKey: string | null;
  startDate: string;
  endDate: string;
};

export type WeekSegment = {
  block: GridBlock;
  firstColumn: number;
  lastColumn: number;
  startsInWeek: boolean;
  endsInWeek: boolean;
};

const millisecondsPerDay = 86_400_000;
const daysPerWeek = 7;

function isoDateOf(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function weeksOfMonth(monthKey: string): string[][] {
  const [year, month] = monthKey.split("-").map(Number);
  const firstDay = new Date(Date.UTC(year, month - 1, 1));
  const lastDay = new Date(Date.UTC(year, month, 0));
  const daysSinceMonday = (firstDay.getUTCDay() + 6) % daysPerWeek;
  const gridStart = firstDay.getTime() - daysSinceMonday * millisecondsPerDay;
  const weeks: string[][] = [];
  for (let weekStart = gridStart; weekStart <= lastDay.getTime(); weekStart += daysPerWeek * millisecondsPerDay) {
    weeks.push(Array.from({ length: daysPerWeek }, (_, day) => isoDateOf(new Date(weekStart + day * millisecondsPerDay))));
  }
  return weeks;
}

export function segmentsInWeek(blocks: GridBlock[], week: string[]): WeekSegment[] {
  const weekStart = week[0];
  const weekEnd = week[week.length - 1];
  return blocks
    .filter((block) => block.startDate <= weekEnd && block.endDate >= weekStart)
    .map((block) => ({
      block,
      firstColumn: Math.max(0, week.indexOf(block.startDate) >= 0 ? week.indexOf(block.startDate) : 0),
      lastColumn: week.indexOf(block.endDate) >= 0 ? week.indexOf(block.endDate) : week.length - 1,
      startsInWeek: block.startDate >= weekStart,
      endsInWeek: block.endDate <= weekEnd,
    }));
}
