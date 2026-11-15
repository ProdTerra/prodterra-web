import { useFormatter, useTranslations } from "next-intl";
import type { PlanAlert } from "@/features/calendar/infrastructure/plansApi";
import type { ExportLabels } from "../application/buildCalendarExport";

type NameLookups = { cropName: (cropKey: string) => string; pestName: (pestKey: string) => string };

function utcDate(isoDate: string): Date {
  return new Date(`${isoDate}T12:00:00Z`);
}

export function useCalendarExportLabels({ cropName, pestName }: NameLookups): ExportLabels {
  const translate = useTranslations("calendarExport");
  const translateInsights = useTranslations("calendar.insights");
  const translateGrid = useTranslations("calendar.grid");
  const format = useFormatter();
  const list = (items: string[]) => format.list(items, { type: "conjunction" });
  const decimal = (value: number) => format.number(value, { maximumFractionDigits: 1 }).replace("-", "−");
  const whole = (value: number) => format.number(Math.round(value), { useGrouping: "always" });
  const monthTitle = (monthKey: string) => format.dateTime(utcDate(`${monthKey}-15`), { month: "long", year: "numeric", timeZone: "UTC" });

  function alertText(alert: PlanAlert): { action: string; cause: string } {
    switch (alert.type) {
      case "frost":
        return { action: translateInsights("action.frost"), cause: translateInsights("cause.frost", { value: decimal(alert.minimumTemperatureInCelsius) }) };
      case "temperature":
        return {
          action: translateInsights("action.temperature"),
          cause: translateInsights("cause.temperature", { value: decimal(alert.meanTemperatureInCelsius) }),
        };
      case "drought":
        return { action: translateInsights("action.drought", { value: whole(alert.litersPerSquareMeter) }), cause: translateInsights("cause.drought") };
      case "irrigation":
        return { action: translateInsights("action.irrigation", { value: whole(alert.litersPerSquareMeter) }), cause: translateInsights("cause.irrigation") };
      case "waterExcess":
        return { action: translateInsights("action.waterExcess"), cause: translateInsights("cause.waterExcess", { value: whole(alert.litersPerSquareMeter) }) };
      case "pest":
        return { action: translateInsights("action.pest", { pest: pestName(alert.pestKey) }), cause: translateInsights("cause.pest") };
    }
  }

  return {
    brand: translate("pdf.brand"),
    defaultFarmName: translate("pdf.defaultFarmName"),
    calendarName: (calendar) => translate(`calendar.${calendar}`),
    period: (fromMonth, toMonth) => translate("pdf.period", { from: monthTitle(fromMonth), to: monthTitle(toMonth) }),
    monthTitle,
    weekdayShort: (isoDate) => format.dateTime(utcDate(isoDate), { weekday: "short", timeZone: "UTC" }),
    cropName,
    rest: translateInsights("rest"),
    free: translateInsights("free"),
    sowing: translateGrid("sowing"),
    harvest: translateGrid("harvest"),
    climateTitle: (month) => translate("pdf.climateTitle", { month }),
    temperature: (minimum, maximum) => translate("pdf.temperature", { min: decimal(minimum), max: decimal(maximum) }),
    frost: translate("pdf.frost"),
    rain: (liters) => translate("pdf.rain", { value: whole(liters) }),
    rainLevel: (level) => translateInsights(`rainLevel.${level}`),
    humidity: (percent) => translate("pdf.humidity", { value: whole(percent) }),
    humidityLevel: (level) => translateInsights(`humidityLevel.${level}`),
    sun: (value) => translate("pdf.sun", { value: decimal(value) }),
    status: (status) => translateInsights(`status.${status}`),
    alertText,
    pestsText: (pestKeys) => ({ action: translateInsights("action.pest", { pest: list(pestKeys.map(pestName)) }), cause: translateInsights("cause.pest") }),
    lotGroupName: (lotNumbers) => translateInsights("lotGroup", { numbers: lotNumbers.join(", ") }),
    sourceNote: translate("pdf.sourceNote"),
    page: (page, total) => translate("pdf.page", { page, total }),
  };
}
