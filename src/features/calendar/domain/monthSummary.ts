import type { PlanAlert } from "../infrastructure/plansApi";
import { compareAlerts, sortAlerts } from "./monthInsights";

export type LotAlerts<Lot> = { lot: Lot; alerts: PlanAlert[] };

export type MonthSummary<Lot> = {
  riskCount: number;
  watchCount: number;
  mostSevere: { lot: Lot; alert: PlanAlert } | null;
};

export type LotMonthFacts = { alerts: PlanAlert[]; altitudeWarningCrop: string | null };

export function summarizeMonth<Lot>(states: LotAlerts<Lot>[]): MonthSummary<Lot> {
  const lotAlerts = states.flatMap(({ lot, alerts }) => alerts.map((alert) => ({ lot, alert })));
  const sortedBySeverity = [...lotAlerts].sort((first, second) => compareAlerts(first.alert, second.alert));
  return {
    riskCount: lotAlerts.filter(({ alert }) => alert.level === "risk").length,
    watchCount: lotAlerts.filter(({ alert }) => alert.level === "watch").length,
    mostSevere: sortedBySeverity[0] ?? null,
  };
}

export function isQuietLot(facts: LotMonthFacts): boolean {
  return facts.alerts.length === 0 && facts.altitudeWarningCrop === null;
}

function compareBySeverity(first: LotMonthFacts, second: LotMonthFacts): number {
  const firstAlert = sortAlerts(first.alerts)[0];
  const secondAlert = sortAlerts(second.alerts)[0];
  if (firstAlert && secondAlert) {
    return compareAlerts(firstAlert, secondAlert);
  }
  return Number(Boolean(secondAlert)) - Number(Boolean(firstAlert));
}

export function splitQuietLots<State extends LotMonthFacts>(states: State[]): { needsAttention: State[]; quiet: State[] } {
  return {
    needsAttention: states.filter((state) => !isQuietLot(state)).sort(compareBySeverity),
    quiet: states.filter(isQuietLot),
  };
}
