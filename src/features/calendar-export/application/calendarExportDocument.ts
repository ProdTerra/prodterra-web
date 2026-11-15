import type { MonthStatus } from "@/features/calendar/infrastructure/plansApi";
import type { PaperSize } from "../domain/paperSize";

export type ExportDay = { date: string; dayNumber: number; isOutside: boolean; isWeekend: boolean };

export type ExportBar = {
  firstColumn: number;
  lastColumn: number;
  kind: "crop" | "rest";
  label: string | null;
  color: string;
  startsInWeek: boolean;
  endsInWeek: boolean;
};

export type ExportMarker = { column: number; kind: "sowing" | "harvest" };

export type ExportLane = { lotId: string; lotNumber: number; lotName: string; lotColor: string; bars: ExportBar[]; markers: ExportMarker[] };

export type ExportWeek = { days: ExportDay[]; lanes: ExportLane[] };

export type ExportClimateRow = { kind: "temperature" | "rain" | "humidity" | "sun"; headline: string; detail: string | null; isWarning: boolean };

export type ExportClimate = { title: string; rows: ExportClimateRow[] };

export type ExportAlarm = { level: "watch" | "risk"; action: string; cause: string };

export type ExportLotStatus = {
  title: string;
  lots: { id: string; number: number; color: string }[];
  useLabel: string;
  status: MonthStatus | null;
  statusLabel: string | null;
  alarms: ExportAlarm[];
};

export type ExportMonthPage = {
  monthKey: string;
  monthTitle: string;
  weeks: ExportWeek[];
  climate: ExportClimate | null;
  lotStatuses: ExportLotStatus[] | null;
};

export type ExportLegend = {
  crops: { name: string; color: string }[];
  rest: string | null;
  sowing: string;
  harvest: string;
  statuses: { status: MonthStatus; label: string }[];
};

export type CalendarExportDocument = {
  paperSize: PaperSize;
  header: { brand: string; farmName: string; calendarName: string; period: string };
  weekdays: string[];
  pages: ExportMonthPage[];
  legend: ExportLegend;
  sourceNote: string | null;
  pageLabel: (pageNumber: number, totalPages: number) => string;
};
