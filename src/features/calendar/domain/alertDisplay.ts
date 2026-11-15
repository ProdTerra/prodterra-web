import type { PlanAlert } from "../infrastructure/plansApi";

export type PestsAlert = { type: "pests"; level: "watch"; pestKeys: string[] };

export type DisplayAlert = Exclude<PlanAlert, { type: "pest" }> | PestsAlert;

export function groupPestAlerts(alerts: PlanAlert[]): DisplayAlert[] {
  const pestKeys = alerts.flatMap((alert) => (alert.type === "pest" ? [alert.pestKey] : []));
  const otherAlerts = alerts.filter((alert): alert is Exclude<PlanAlert, { type: "pest" }> => alert.type !== "pest");
  if (pestKeys.length === 0) {
    return otherAlerts;
  }
  return [...otherAlerts, { type: "pests", level: "watch", pestKeys }];
}

export function countAlarms(alerts: PlanAlert[]): number {
  return groupPestAlerts(alerts).length;
}
