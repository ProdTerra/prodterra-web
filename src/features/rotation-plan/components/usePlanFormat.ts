import { useFormatter } from "next-intl";
import { fromIsoDate } from "../domain/planDates";

function monthMiddle(monthKey: string): Date {
  return fromIsoDate(`${monthKey}-15`);
}

export function usePlanFormat() {
  const format = useFormatter();

  return {
    longDate: (isoDate: string) =>
      format.dateTime(fromIsoDate(isoDate), { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }),
    dayMonthYear: (isoDate: string) =>
      format.dateTime(fromIsoDate(isoDate), { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }),
    shortDate: (isoDate: string) =>
      format.dateTime(fromIsoDate(isoDate), { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).replace(".", ""),
    monthTitle: (monthKey: string) =>
      format.dateTime(monthMiddle(monthKey), { month: "long", year: "numeric", timeZone: "UTC" }),
    shortMonth: (monthKey: string) => format.dateTime(monthMiddle(monthKey), { month: "short", timeZone: "UTC" }),
    weekdayShort: (isoDate: string) => format.dateTime(fromIsoDate(isoDate), { weekday: "short", timeZone: "UTC" }),
    decimal: (value: number) => format.number(value, { maximumFractionDigits: 1 }),
    list: (items: string[]) => format.list(items, { type: "conjunction" }),
  };
}
