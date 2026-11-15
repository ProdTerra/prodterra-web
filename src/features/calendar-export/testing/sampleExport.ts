import type { GridBlock } from "@/features/calendar/domain/monthGrid";
import type { CalendarExportInput, ExportLabels } from "../application/buildCalendarExport";

const sampleAlertTexts = {
  frost: { action: "Protege el cultivo del frío", cause: "Noches de hasta 1,4 °C" },
  temperature: { action: "Revisa si el cultivo aguanta este mes", cause: "Promedio de 28 °C, fuera de lo que soporta" },
  drought: { action: "Riega unos 60 L/m² o espera las lluvias", cause: "Sin riego le falta agua este mes" },
  irrigation: { action: "Riega unos 25 L/m² este mes", cause: "La lluvia del mes no alcanza" },
  waterExcess: { action: "Revisa el drenaje del lote", cause: "Llueven unos 80 L/m² de más" },
  pest: { action: "Vigila el tizón tardío", cause: "El clima de este mes la favorece" },
};

export const sampleLabels: ExportLabels = {
  brand: "ProdTerra",
  defaultFarmName: "Mi finca",
  calendarName: (calendar) => (calendar === "farmer" ? "Tu calendario" : "Recomendado"),
  period: (fromMonth, toMonth) => `De ${fromMonth} a ${toMonth}`,
  monthTitle: (monthKey) => `Mes ${monthKey}`,
  weekdayShort: (isoDate) => ["lun", "mar", "mié", "jue", "vie", "sáb", "dom"][Number(isoDate.slice(8, 10)) - 1],
  cropName: (cropKey) => ({ potato: "Papa", onion: "Cebolla", carrot: "Zanahoria" })[cropKey] ?? cropKey,
  rest: "Descanso",
  free: "Sin cultivo",
  sowing: "Siembra",
  harvest: "Cosecha",
  climateTitle: (monthTitle) => `Clima típico de ${monthTitle}`,
  temperature: (minimum, maximum) => `${minimum} a ${maximum} °C`,
  frost: "Puede helar",
  rain: (liters) => `Unos ${liters} L/m² en el mes`,
  rainLevel: (level) => ({ dry: "Mes seco", normal: "Lluvia normal", wet: "Mes lluvioso" })[level],
  humidity: (percent) => `${percent} % de humedad`,
  humidityLevel: (level) => ({ low: "Aire seco", normal: "Humedad normal", high: "Humedad alta" })[level],
  sun: (value) => `${value} kWh/m² de sol al día`,
  status: (status) => ({ ok: "Bien", watch: "Atención", risk: "Riesgo" })[status],
  alertText: (alert) => sampleAlertTexts[alert.type],
  pestsText: (pestKeys) => ({ action: `Vigila ${pestKeys.join(", ")}`, cause: "El clima de este mes las favorece" }),
  lotGroupName: (lotNumbers) => `Lotes ${lotNumbers.join(", ")}`,
  sourceNote: "Clima típico NASA POWER, no es un pronóstico",
  page: (pageNumber, totalPages) => `Página ${pageNumber} de ${totalPages}`,
};

const sampleBlocks: GridBlock[] = [
  { id: "a", lotId: "lot-1", kind: "crop", cropKey: "potato", startDate: "2026-03-04", endDate: "2026-06-20" },
  { id: "b", lotId: "lot-1", kind: "rest", cropKey: null, startDate: "2026-06-21", endDate: "2026-07-10" },
  { id: "c", lotId: "lot-2", kind: "crop", cropKey: "onion", startDate: "2026-03-10", endDate: "2026-07-30" },
  { id: "d", lotId: "lot-3", kind: "crop", cropKey: "carrot", startDate: "2026-03-18", endDate: "2026-06-12" },
  { id: "e", lotId: "lot-4", kind: "rest", cropKey: null, startDate: "2026-02-01", endDate: "2026-03-15" },
  { id: "f", lotId: "lot-4", kind: "crop", cropKey: "potato", startDate: "2026-03-16", endDate: "2026-07-15" },
  { id: "g", lotId: "lot-5", kind: "crop", cropKey: "onion", startDate: "2026-01-05", endDate: "2026-03-25" },
];

export function sampleInput(calendar: "farmer" | "recommended"): CalendarExportInput {
  return {
    calendar,
    farmName: "La Esperanza",
    paperSize: "A4",
    months: ["2026-03", "2026-06"],
    lots: [
      { id: "lot-1", number: 1, name: "Lote norte", color: "#f2b705" },
      { id: "lot-2", number: 2, name: "Lote del río", color: "#7cc4e8" },
      { id: "lot-3", number: 3, name: "Lote 3", color: "#f08a7e" },
      { id: "lot-4", number: 4, name: "Lote de la quebrada grande del fondo", color: "#b7d77a" },
      { id: "lot-5", number: 5, name: "Lote 5", color: "#c9a5e6" },
    ],
    blocks: sampleBlocks,
    insights:
      calendar === "farmer"
        ? null
        : {
            climateByLot: {
              "lot-1": [
                {
                  month: 3,
                  meanTemperatureInCelsius: 12,
                  minimumTemperatureInCelsius: 1.4,
                  maximumTemperatureInCelsius: 19.6,
                  relativeHumidityInPercent: 84,
                  precipitationInMillimetersPerDay: 0.8,
                  solarRadiationInKilowattHoursPerSquareMeterPerDay: 5.1,
                },
              ],
            },
            monthsByLot: {
              "lot-1": [
                {
                  month: "2026-03",
                  cropKey: "potato",
                  isRest: false,
                  status: "risk",
                  alerts: [
                    { type: "frost", level: "risk", minimumTemperatureInCelsius: 1.4 },
                    { type: "pest", level: "watch", pestKey: "late-blight" },
                  ],
                },
              ],
              "lot-2": [{ month: "2026-03", cropKey: "onion", isRest: false, status: "watch", alerts: [{ type: "irrigation", level: "watch", litersPerSquareMeter: 25 }] }],
              "lot-3": [{ month: "2026-03", cropKey: "carrot", isRest: false, status: "ok", alerts: [] }],
              "lot-4": [
                {
                  month: "2026-03",
                  cropKey: "potato",
                  isRest: false,
                  status: "risk",
                  alerts: [
                    { type: "drought", level: "risk", litersPerSquareMeter: 60 },
                    { type: "frost", level: "risk", minimumTemperatureInCelsius: 1.4 },
                    { type: "pest", level: "watch", pestKey: "late-blight" },
                  ],
                },
              ],
              "lot-5": [{ month: "2026-03", cropKey: "onion", isRest: false, status: "watch", alerts: [{ type: "waterExcess", level: "watch", litersPerSquareMeter: 80 }] }],
            },
          },
  };
}
