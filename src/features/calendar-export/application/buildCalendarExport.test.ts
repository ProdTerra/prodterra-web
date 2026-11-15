import { describe, expect, it } from "vitest";
import type { GridBlock } from "@/features/calendar/domain/monthGrid";
import type { MonthClimate } from "@/features/calendar/infrastructure/plansApi";
import { buildCalendarExport, type CalendarExportInput, type ExportLabels } from "./buildCalendarExport";

const labels: ExportLabels = {
  brand: "ProdTerra",
  defaultFarmName: "Mi finca",
  calendarName: (calendar) => (calendar === "farmer" ? "Tu calendario" : "Recomendado"),
  period: (fromMonth, toMonth) => `${fromMonth} a ${toMonth}`,
  monthTitle: (monthKey) => `Mes ${monthKey}`,
  weekdayShort: (isoDate) => `D${isoDate.slice(8, 10)}`,
  cropName: (cropKey) => ({ potato: "Papa", onion: "Cebolla" })[cropKey] ?? cropKey,
  rest: "Descanso",
  free: "Sin cultivo",
  sowing: "Siembra",
  harvest: "Cosecha",
  climateTitle: (monthTitle) => `Clima de ${monthTitle}`,
  temperature: (minimum, maximum) => `${minimum} a ${maximum} °C`,
  frost: "Puede helar",
  rain: (liters) => `${liters} L/m²`,
  rainLevel: (level) => `lluvia ${level}`,
  humidity: (percent) => `${percent} %`,
  humidityLevel: (level) => `humedad ${level}`,
  sun: (value) => `${value} kWh`,
  status: (status) => ({ ok: "Bien", watch: "Atención", risk: "Riesgo" })[status],
  alertText: (alert) => ({ action: `hacer ${alert.type}`, cause: `por ${alert.type}` }),
  pestsText: (pestKeys) => ({ action: `vigilar ${pestKeys.join(", ")}`, cause: "por plagas" }),
  lotGroupName: (lotNumbers) => `Lotes ${lotNumbers.join(", ")}`,
  sourceNote: "Clima típico NASA POWER, no es un pronóstico",
  page: (pageNumber, totalPages) => `Página ${pageNumber} de ${totalPages}`,
};

const lots = [
  { id: "lot-1", number: 1, name: "Lote norte", color: "#ff0000" },
  { id: "lot-2", number: 2, name: "Lote sur", color: "#00ff00" },
];

const blocks: GridBlock[] = [
  { id: "a", lotId: "lot-1", kind: "crop", cropKey: "potato", startDate: "2026-03-04", endDate: "2026-03-20" },
  { id: "b", lotId: "lot-1", kind: "rest", cropKey: null, startDate: "2026-03-21", endDate: "2026-04-10" },
  { id: "c", lotId: "lot-2", kind: "crop", cropKey: "onion", startDate: "2026-01-10", endDate: "2026-05-30" },
  { id: "d", lotId: "lot-3", kind: "crop", cropKey: "carrot", startDate: "2026-03-01", endDate: "2026-03-30" },
];

const marchClimate: MonthClimate = {
  month: 3,
  meanTemperatureInCelsius: 9,
  minimumTemperatureInCelsius: 1.5,
  maximumTemperatureInCelsius: 17,
  relativeHumidityInPercent: 85,
  precipitationInMillimetersPerDay: 0.5,
  solarRadiationInKilowattHoursPerSquareMeterPerDay: 5.2,
};

function farmerInput(): CalendarExportInput {
  return { calendar: "farmer", farmName: null, paperSize: "A4", months: ["2026-03"], lots, blocks, insights: null };
}

function recommendedInput(): CalendarExportInput {
  return {
    ...farmerInput(),
    calendar: "recommended",
    farmName: "La Esperanza",
    months: ["2026-03", "2026-04"],
    insights: {
      climateByLot: { "lot-2": [marchClimate] },
      monthsByLot: {
        "lot-1": [
          {
            month: "2026-03",
            cropKey: "potato",
            isRest: false,
            status: "risk",
            alerts: [
              { type: "pest", level: "watch", pestKey: "tizon" },
              { type: "drought", level: "risk", litersPerSquareMeter: 40 },
              { type: "pest", level: "watch", pestKey: "pulgon" },
              { type: "frost", level: "risk", minimumTemperatureInCelsius: 1 },
            ],
          },
        ],
        "lot-2": [{ month: "2026-03", cropKey: "onion", isRest: false, status: "ok", alerts: [] }],
      },
    },
  };
}

describe("buildCalendarExport header and pages", () => {
  it("uses the default farm name and one page per month", () => {
    const document = buildCalendarExport(farmerInput(), labels);
    expect(document.header).toEqual({ brand: "ProdTerra", farmName: "Mi finca", calendarName: "Tu calendario", period: "2026-03 a 2026-03" });
    expect(document.pages.map((page) => page.monthTitle)).toEqual(["Mes 2026-03"]);
    expect(document.paperSize).toBe("A4");
  });

  it("names the farm and the period of the recommended calendar", () => {
    const document = buildCalendarExport(recommendedInput(), labels);
    expect(document.header.farmName).toBe("La Esperanza");
    expect(document.header.calendarName).toBe("Recomendado");
    expect(document.header.period).toBe("2026-03 a 2026-04");
    expect(document.pages).toHaveLength(2);
  });

  it("lists the weekdays from Monday", () => {
    const document = buildCalendarExport(farmerInput(), labels);
    expect(document.weekdays).toEqual(["D01", "D02", "D03", "D04", "D05", "D06", "D07"]);
  });
});

describe("buildCalendarExport month grid", () => {
  const [page] = buildCalendarExport(farmerInput(), labels).pages;

  it("lays out the weeks from Monday with outside days and weekends marked", () => {
    expect(page.weeks).toHaveLength(6);
    expect(page.weeks[0].days[0]).toEqual({ date: "2026-02-23", dayNumber: 23, isOutside: true, isWeekend: false });
    expect(page.weeks[0].days[6]).toEqual({ date: "2026-03-01", dayNumber: 1, isOutside: false, isWeekend: true });
  });

  it("gives every selected lot one lane per week, in lot order", () => {
    expect(page.weeks[1].lanes.map((lane) => [lane.lotNumber, lane.lotName])).toEqual([
      [1, "Lote norte"],
      [2, "Lote sur"],
    ]);
  });

  it("draws crop bars with the crop name where they start and at the start of each week", () => {
    const sowingWeek = page.weeks[1].lanes[0];
    expect(sowingWeek.bars).toEqual([
      { firstColumn: 2, lastColumn: 6, kind: "crop", label: "Papa", color: "#3d6fb6", startsInWeek: true, endsInWeek: false },
    ]);
    const harvestWeek = page.weeks[3].lanes[0];
    expect(harvestWeek.bars[0]).toMatchObject({ firstColumn: 0, lastColumn: 4, label: "Papa", endsInWeek: true });
    expect(harvestWeek.bars[1]).toMatchObject({ firstColumn: 5, lastColumn: 6, kind: "rest", label: "Descanso", color: "#8b8f86" });
  });

  it("marks sowing on the first day and harvest on the last day of a crop", () => {
    expect(page.weeks[1].lanes[0].markers).toEqual([{ column: 2, kind: "sowing" }]);
    expect(page.weeks[3].lanes[0].markers).toEqual([{ column: 4, kind: "harvest" }]);
    expect(page.weeks[2].lanes[0].markers).toEqual([]);
  });

  it("never shows lots that were not selected", () => {
    const cropLabels = page.weeks.flatMap((week) => week.lanes.flatMap((lane) => lane.bars.map((bar) => bar.label)));
    expect(cropLabels).not.toContain("carrot");
  });

  it("builds a legend of the crops and rest shown in the selected months", () => {
    const document = buildCalendarExport(farmerInput(), labels);
    expect(document.legend.crops).toEqual([
      { name: "Papa", color: "#3d6fb6" },
      { name: "Cebolla", color: "#b39324" },
    ]);
    expect(document.legend.rest).toBe("Descanso");
  });
});

describe("buildCalendarExport insights", () => {
  it("has no climate, lot status or source note for the farmer calendar", () => {
    const document = buildCalendarExport(farmerInput(), labels);
    expect(document.pages[0].climate).toBeNull();
    expect(document.pages[0].lotStatuses).toBeNull();
    expect(document.sourceNote).toBeNull();
    expect(document.legend.statuses).toEqual([]);
  });

  it("describes the typical climate of the month from the first selected lot that has it", () => {
    const [march, april] = buildCalendarExport(recommendedInput(), labels).pages;
    expect(march.climate).toEqual({
      title: "Clima de Mes 2026-03",
      rows: [
        { kind: "temperature", headline: "1.5 a 17 °C", detail: "Puede helar", isWarning: true },
        { kind: "rain", headline: "lluvia dry", detail: "16 L/m²", isWarning: false },
        { kind: "humidity", headline: "humedad high", detail: "85 %", isWarning: false },
        { kind: "sun", headline: "5.2 kWh", detail: null, isWarning: false },
      ],
    });
    expect(april.climate).toBeNull();
  });

  it("gives each lot its status word and alarms ordered by severity, action first, with pests in one alarm", () => {
    const document = buildCalendarExport(recommendedInput(), labels);
    const [first, second] = document.pages[0].lotStatuses ?? [];
    expect(first).toMatchObject({ title: "Lote norte", lots: [{ number: 1, color: "#ff0000" }], useLabel: "Papa", status: "risk", statusLabel: "Riesgo" });
    expect(first.alarms).toEqual([
      { level: "risk", action: "hacer frost", cause: "por frost" },
      { level: "risk", action: "hacer drought", cause: "por drought" },
      { level: "watch", action: "vigilar tizon, pulgon", cause: "por plagas" },
    ]);
    expect(second).toMatchObject({ title: "Lote sur", useLabel: "Cebolla", status: "ok", statusLabel: "Bien", alarms: [] });
  });

  it("merges lots with the same use, status and alarms into one entry", () => {
    const input = recommendedInput();
    const sameMonth = [{ month: "2026-03", cropKey: "onion", isRest: false, status: "ok" as const, alerts: [] }];
    const document = buildCalendarExport(
      {
        ...input,
        lots: [...input.lots, { id: "lot-3", number: 3, name: "Lote 3", color: "#0000ff" }],
        insights: { ...input.insights!, monthsByLot: { ...input.insights!.monthsByLot, "lot-3": sameMonth } },
      },
      labels,
    );
    const statuses = document.pages[0].lotStatuses ?? [];
    expect(statuses).toHaveLength(2);
    expect(statuses[1]).toMatchObject({ title: "Lotes 2, 3", lots: [{ number: 2 }, { number: 3 }], useLabel: "Cebolla" });
  });

  it("shows a lot without a plan that month as free with no status", () => {
    const [, april] = buildCalendarExport(recommendedInput(), labels).pages;
    expect(april.lotStatuses?.[0]).toMatchObject({ useLabel: "Sin cultivo", status: null, statusLabel: null, alarms: [] });
  });

  it("adds the climate source and the status legend", () => {
    const document = buildCalendarExport(recommendedInput(), labels);
    expect(document.sourceNote).toBe("Clima típico NASA POWER, no es un pronóstico");
    expect(document.legend.statuses).toEqual([
      { status: "ok", label: "Bien" },
      { status: "watch", label: "Atención" },
      { status: "risk", label: "Riesgo" },
    ]);
  });
});
