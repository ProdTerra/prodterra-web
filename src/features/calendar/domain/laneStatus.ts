import type { MonthStatus } from "../infrastructure/plansApi";
import { worstStatus } from "./calendar";
import { laneKeyForUse, type GridLane } from "./monthGrid";

export type LaneStatus = { status: MonthStatus; alarmCount: number };

export type LotMonthStatus = {
  lotId: string;
  cropKey: string | null;
  isRest: boolean;
  status: MonthStatus | null;
  alarmCount: number;
};

export function combineLaneStatus(entries: LaneStatus[]): LaneStatus | null {
  if (entries.length === 0) {
    return null;
  }
  return {
    status: worstStatus(entries.map((entry) => entry.status)),
    alarmCount: entries.reduce((total, entry) => total + entry.alarmCount, 0),
  };
}

function groupedLaneKeyOf(lotMonth: LotMonthStatus): string | null {
  if (lotMonth.cropKey || lotMonth.isRest) {
    return laneKeyForUse(lotMonth.cropKey);
  }
  return null;
}

export function laneStatusesForMonth(lanes: GridLane[], isGrouped: boolean, lotMonths: LotMonthStatus[]): Record<string, LaneStatus> {
  const laneKeyOf = (lotMonth: LotMonthStatus) => (isGrouped ? groupedLaneKeyOf(lotMonth) : lotMonth.lotId);
  const statuses: Record<string, LaneStatus> = {};
  for (const lane of lanes) {
    const entries = lotMonths.flatMap((lotMonth) =>
      lotMonth.status !== null && laneKeyOf(lotMonth) === lane.id ? [{ status: lotMonth.status, alarmCount: lotMonth.alarmCount }] : [],
    );
    const combined = combineLaneStatus(entries);
    if (combined) {
      statuses[lane.id] = combined;
    }
  }
  return statuses;
}
