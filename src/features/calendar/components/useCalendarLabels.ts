import { useFormatter, useLocale } from "next-intl";
import type { RotationEvaluation } from "../infrastructure/plansApi";

export function useCalendarLabels(plans: RotationEvaluation | null) {
  const locale = useLocale();
  const format = useFormatter();
  const localized = (name: { es: string; en: string }) => (locale === "en" ? name.en : name.es);

  return {
    cropName: (cropKey: string) => {
      const crop = plans?.crops.find((candidate) => candidate.key === cropKey);
      return crop ? localized(crop.name) : cropKey;
    },
    pestName: (pestKey: string) => {
      const pest = plans?.pests.find((candidate) => candidate.key === pestKey);
      return pest ? localized(pest.name) : pestKey;
    },
    monthName: (monthKey: string) => {
      const [year, month] = monthKey.split("-").map(Number);
      return format.dateTime(new Date(Date.UTC(year, month - 1, 15)), { month: "long", year: "numeric", timeZone: "UTC" });
    },
    shortMonthName: (monthKey: string) => {
      const [year, month] = monthKey.split("-").map(Number);
      return format.dateTime(new Date(Date.UTC(year, month - 1, 15)), { month: "short", timeZone: "UTC" });
    },
    decimal: (value: number) => format.number(value, { maximumFractionDigits: 1 }).replace("-", "−"),
    whole: (value: number) => format.number(Math.round(value), { useGrouping: "always" }),
  };
}
