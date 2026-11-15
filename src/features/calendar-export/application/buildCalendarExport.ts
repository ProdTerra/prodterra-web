import { segmentsInWeek, weeksOfMonth, type GridBlock, type WeekSegment } from "@/features/calendar/domain/monthGrid";
import { describeClimate, sortAlerts, type ClimateDescription } from "@/features/calendar/domain/monthInsights";
import type { MonthClimate, MonthStatus, PlanAlert } from "@/features/calendar/infrastructure/plansApi";
import { cropColorOf, restBlockColor } from "@/features/rotation-plan/domain/cropColors";
import type { ExportCalendar } from "../domain/lotSelection";
import type { PaperSize } from "../domain/paperSize";
import type {
  CalendarExportDocument,
  ExportBar,
  ExportClimate,
  ExportLane,
  ExportLegend,
  ExportAlarm,
  ExportLotStatus,
  ExportMarker,
  ExportMonthPage,
  ExportWeek,
} from "./calendarExportDocument";

export type ExportLot = { id: string; number: number; name: string; color: string };

export type LotMonthInsight = { month: string; cropKey: string | null; isRest: boolean; status: MonthStatus; alerts: PlanAlert[] };

export type CalendarInsights = {
  climateByLot: Record<string, MonthClimate[] | undefined>;
  monthsByLot: Record<string, LotMonthInsight[] | undefined>;
};

export type CalendarExportInput = {
  calendar: ExportCalendar;
  farmName: string | null;
  paperSize: PaperSize;
  months: string[];
  lots: ExportLot[];
  blocks: GridBlock[];
  insights: CalendarInsights | null;
};

export type ExportLabels = {
  brand: string;
  defaultFarmName: string;
  calendarName: (calendar: ExportCalendar) => string;
  period: (fromMonth: string, toMonth: string) => string;
  monthTitle: (monthKey: string) => string;
  weekdayShort: (isoDate: string) => string;
  cropName: (cropKey: string) => string;
  rest: string;
  free: string;
  sowing: string;
  harvest: string;
  climateTitle: (monthTitle: string) => string;
  temperature: (minimum: number, maximum: number) => string;
  frost: string;
  rain: (litersPerSquareMeter: number) => string;
  rainLevel: (level: ClimateDescription["rainLevel"]) => string;
  humidity: (percent: number) => string;
  humidityLevel: (level: ClimateDescription["humidityLevel"]) => string;
  sun: (kilowattHoursPerSquareMeter: number) => string;
  status: (status: MonthStatus) => string;
  alertText: (alert: PlanAlert) => { action: string; cause: string };
  pestsText: (pestKeys: string[]) => { action: string; cause: string };
  lotGroupName: (lotNumbers: number[]) => string;
  sourceNote: string;
  page: (pageNumber: number, totalPages: number) => string;
};

const mondayWeek = ["2024-01-01", "2024-01-02", "2024-01-03", "2024-01-04", "2024-01-05", "2024-01-06", "2024-01-07"];
const weekendColumns = new Set([5, 6]);
const statusOrder: MonthStatus[] = ["ok", "watch", "risk"];

function blockColor(block: GridBlock): string {
  return block.cropKey ? cropColorOf(block.cropKey) : restBlockColor;
}

function blockLabel(block: GridBlock, labels: ExportLabels): string {
  return block.cropKey ? labels.cropName(block.cropKey) : labels.rest;
}

function toBar(segment: WeekSegment, labels: ExportLabels): ExportBar {
  const showsLabel = segment.startsInWeek || segment.firstColumn === 0;
  return {
    firstColumn: segment.firstColumn,
    lastColumn: segment.lastColumn,
    kind: segment.block.kind,
    label: showsLabel ? blockLabel(segment.block, labels) : null,
    color: blockColor(segment.block),
    startsInWeek: segment.startsInWeek,
    endsInWeek: segment.endsInWeek,
  };
}

function markersOf(segment: WeekSegment): ExportMarker[] {
  if (segment.block.kind !== "crop") {
    return [];
  }
  return [
    ...(segment.startsInWeek ? [{ column: segment.firstColumn, kind: "sowing" as const }] : []),
    ...(segment.endsInWeek ? [{ column: segment.lastColumn, kind: "harvest" as const }] : []),
  ];
}

function buildLane(lot: ExportLot, blocks: GridBlock[], week: string[], labels: ExportLabels): ExportLane {
  const segments = segmentsInWeek(
    blocks.filter((block) => block.lotId === lot.id),
    week,
  );
  return {
    lotId: lot.id,
    lotNumber: lot.number,
    lotName: lot.name,
    lotColor: lot.color,
    bars: segments.map((segment) => toBar(segment, labels)),
    markers: segments.flatMap(markersOf),
  };
}

function buildWeek(monthKey: string, week: string[], input: CalendarExportInput, labels: ExportLabels): ExportWeek {
  return {
    days: week.map((date, column) => ({
      date,
      dayNumber: Number(date.slice(8, 10)),
      isOutside: !date.startsWith(monthKey),
      isWeekend: weekendColumns.has(column),
    })),
    lanes: input.lots.map((lot) => buildLane(lot, input.blocks, week, labels)),
  };
}

function climateOfMonth(input: CalendarExportInput, monthKey: string): MonthClimate | null {
  const monthNumber = Number(monthKey.slice(5, 7));
  for (const lot of input.lots) {
    const climate = input.insights?.climateByLot[lot.id]?.find((candidate) => candidate.month === monthNumber);
    if (climate) {
      return climate;
    }
  }
  return null;
}

function buildClimate(climate: MonthClimate, monthKey: string, labels: ExportLabels): ExportClimate {
  const description = describeClimate(climate, monthKey);
  return {
    title: labels.climateTitle(labels.monthTitle(monthKey)),
    rows: [
      {
        kind: "temperature",
        headline: labels.temperature(climate.minimumTemperatureInCelsius, climate.maximumTemperatureInCelsius),
        detail: description.hasFrostNights ? labels.frost : null,
        isWarning: description.hasFrostNights,
      },
      { kind: "rain", headline: labels.rainLevel(description.rainLevel), detail: labels.rain(description.rainInMillimeters), isWarning: false },
      {
        kind: "humidity",
        headline: labels.humidityLevel(description.humidityLevel),
        detail: labels.humidity(climate.relativeHumidityInPercent),
        isWarning: false,
      },
      { kind: "sun", headline: labels.sun(climate.solarRadiationInKilowattHoursPerSquareMeterPerDay), detail: null, isWarning: false },
    ],
  };
}

function landUseLabelOf(insight: LotMonthInsight | undefined, labels: ExportLabels): string {
  if (insight?.cropKey) {
    return labels.cropName(insight.cropKey);
  }
  return insight?.isRest ? labels.rest : labels.free;
}

function toAlarms(alerts: PlanAlert[], labels: ExportLabels): ExportAlarm[] {
  const sorted = sortAlerts(alerts);
  const pestKeys = sorted.flatMap((alert) => (alert.type === "pest" ? [alert.pestKey] : []));
  const firstPestIndex = sorted.findIndex((alert) => alert.type === "pest");
  return sorted.flatMap((alert, index): ExportAlarm[] => {
    if (alert.type !== "pest") {
      return [{ level: alert.level, ...labels.alertText(alert) }];
    }
    return index === firstPestIndex ? [{ level: alert.level, ...labels.pestsText(pestKeys) }] : [];
  });
}

function buildLotStatus(lot: ExportLot, insights: CalendarInsights, monthKey: string, labels: ExportLabels): ExportLotStatus {
  const insight = insights.monthsByLot[lot.id]?.find((candidate) => candidate.month === monthKey);
  return {
    title: lot.name,
    lots: [{ id: lot.id, number: lot.number, color: lot.color }],
    useLabel: landUseLabelOf(insight, labels),
    status: insight?.status ?? null,
    statusLabel: insight ? labels.status(insight.status) : null,
    alarms: toAlarms(insight?.alerts ?? [], labels),
  };
}

function groupKeyOf(status: ExportLotStatus): string {
  return JSON.stringify([status.useLabel, status.status, status.alarms]);
}

function groupSameStatuses(statuses: ExportLotStatus[], labels: ExportLabels): ExportLotStatus[] {
  const groups = new Map<string, ExportLotStatus>();
  for (const status of statuses) {
    const group = groups.get(groupKeyOf(status));
    if (group) {
      group.lots.push(...status.lots);
      group.title = labels.lotGroupName(group.lots.map((lot) => lot.number));
    } else {
      groups.set(groupKeyOf(status), { ...status, lots: [...status.lots] });
    }
  }
  return [...groups.values()];
}

function buildPage(monthKey: string, input: CalendarExportInput, labels: ExportLabels): ExportMonthPage {
  const monthTitle = labels.monthTitle(monthKey);
  const climate = input.insights ? climateOfMonth(input, monthKey) : null;
  const insights = input.insights;
  return {
    monthKey,
    monthTitle,
    weeks: weeksOfMonth(monthKey).map((week) => buildWeek(monthKey, week, input, labels)),
    climate: climate ? buildClimate(climate, monthKey, labels) : null,
    lotStatuses: insights
      ? groupSameStatuses(
          input.lots.map((lot) => buildLotStatus(lot, insights, monthKey, labels)),
          labels,
        )
      : null,
  };
}

function blocksShown(input: CalendarExportInput): GridBlock[] {
  const lotIds = new Set(input.lots.map((lot) => lot.id));
  const firstDay = `${input.months[0]}-01`;
  const lastDay = `${input.months[input.months.length - 1]}-31`;
  return input.blocks.filter((block) => lotIds.has(block.lotId) && block.startDate <= lastDay && block.endDate >= firstDay);
}

function buildLegend(input: CalendarExportInput, labels: ExportLabels): ExportLegend {
  const shown = blocksShown(input);
  const cropKeys = [...new Set(shown.flatMap((block) => (block.cropKey ? [block.cropKey] : [])))];
  return {
    crops: cropKeys.map((cropKey) => ({ name: labels.cropName(cropKey), color: cropColorOf(cropKey) })),
    rest: shown.some((block) => block.kind === "rest") ? labels.rest : null,
    sowing: labels.sowing,
    harvest: labels.harvest,
    statuses: input.insights ? statusOrder.map((status) => ({ status, label: labels.status(status) })) : [],
  };
}

export function buildCalendarExport(input: CalendarExportInput, labels: ExportLabels): CalendarExportDocument {
  return {
    paperSize: input.paperSize,
    header: {
      brand: labels.brand,
      farmName: input.farmName ?? labels.defaultFarmName,
      calendarName: labels.calendarName(input.calendar),
      period: labels.period(input.months[0], input.months[input.months.length - 1]),
    },
    weekdays: mondayWeek.map(labels.weekdayShort),
    pages: input.months.map((monthKey) => buildPage(monthKey, input, labels)),
    legend: buildLegend(input, labels),
    sourceNote: input.insights ? labels.sourceNote : null,
    pageLabel: labels.page,
  };
}
