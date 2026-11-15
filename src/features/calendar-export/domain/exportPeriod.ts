export type ExportPeriod = { kind: "all" } | { kind: "range"; fromMonth: string; toMonth: string };

export function monthsInPeriod(planMonths: string[], period: ExportPeriod): string[] {
  if (period.kind === "all") {
    return planMonths;
  }
  return planMonths.filter((month) => month >= period.fromMonth && month <= period.toMonth);
}

export function monthsUntilEnd(planMonths: string[], fromMonth: string): string[] {
  return planMonths.filter((month) => month >= fromMonth);
}
