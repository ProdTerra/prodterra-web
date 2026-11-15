export type GridBlock = {
  id: string;
  lotId: string;
  kind: "crop" | "rest";
  cropKey: string | null;
  startDate: string;
  endDate: string;
  lotCount?: number;
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

export type GroupedBlocks = { lanes: string[]; blocks: GridBlock[] };

export function laneKeyForUse(cropKey: string | null): string {
  return cropKey ? `crop:${cropKey}` : "rest";
}

function laneKeyOf(block: GridBlock): string {
  return laneKeyForUse(block.cropKey);
}

export function groupByUse(blocks: GridBlock[], days: string[]): GroupedBlocks {
  const lanes: string[] = [];
  const countsByLane = new Map<string, number[]>();
  const sampleByLane = new Map<string, GridBlock>();
  days.forEach((day, dayIndex) => {
    for (const block of blocks) {
      if (block.startDate > day || block.endDate < day) {
        continue;
      }
      const lane = laneKeyOf(block);
      if (!countsByLane.has(lane)) {
        lanes.push(lane);
        countsByLane.set(lane, Array.from({ length: days.length }, () => 0));
        sampleByLane.set(lane, block);
      }
      countsByLane.get(lane)![dayIndex] += 1;
    }
  });
  const grouped: GridBlock[] = [];
  for (const lane of lanes) {
    const counts = countsByLane.get(lane)!;
    const sample = sampleByLane.get(lane)!;
    let runStart = -1;
    counts.forEach((count, dayIndex) => {
      const isRunEnd = dayIndex === counts.length - 1 || counts[dayIndex + 1] !== count;
      if (count > 0 && runStart < 0) {
        runStart = dayIndex;
      }
      if (count > 0 && isRunEnd) {
        grouped.push({
          id: `${lane}-${days[runStart]}`,
          lotId: lane,
          kind: sample.kind,
          cropKey: sample.cropKey,
          startDate: days[runStart],
          endDate: days[dayIndex],
          lotCount: count,
        });
        runStart = -1;
      }
    });
  }
  return { lanes, blocks: grouped };
}

export const maximumLotLanes = 5;

export type GridLane = { id: string; lotNumber?: number; lotColor?: string };

export type MonthLayout = { isGrouped: boolean; lanes: GridLane[]; blocks: GridBlock[] };

export function buildMonthLayout(
  lots: { id: string; number: number; color: string }[],
  blocks: GridBlock[],
  monthKey: string,
): MonthLayout {
  const lotIds = new Set(lots.map((lot) => lot.id));
  const visibleBlocks = blocks.filter((block) => lotIds.has(block.lotId));
  if (lots.length <= maximumLotLanes) {
    return {
      isGrouped: false,
      lanes: lots.map((lot) => ({ id: lot.id, lotNumber: lot.number, lotColor: lot.color })),
      blocks: visibleBlocks,
    };
  }
  const grouped = groupByUse(visibleBlocks, weeksOfMonth(monthKey).flat());
  return { isGrouped: true, lanes: grouped.lanes.map((id) => ({ id })), blocks: grouped.blocks };
}
