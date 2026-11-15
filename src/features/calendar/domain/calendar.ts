import type { LotPlan, MonthStatus, PlanAlert } from "../infrastructure/plansApi";

export type CalendarAlarm = { lotId: string; month: string; alert: PlanAlert };

const statusRank: Record<MonthStatus, number> = { ok: 0, watch: 1, risk: 2 };
const alertPriority: Record<PlanAlert["type"], number> = {
  frost: 0,
  drought: 1,
  temperature: 2,
  pest: 3,
  irrigation: 4,
};

export function daysInMonth(monthKey: string): number {
  const [year, month] = monthKey.split("-").map(Number);
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

export function worstStatus(statuses: MonthStatus[]): MonthStatus {
  return statuses.reduce<MonthStatus>((worst, status) => (statusRank[status] > statusRank[worst] ? status : worst), "ok");
}

export function statusByMonth(plans: LotPlan[]): { month: string; status: MonthStatus }[] {
  const months = plans[0]?.months.map((month) => month.month) ?? [];
  return months.map((monthKey) => ({
    month: monthKey,
    status: worstStatus(
      plans.flatMap((plan) => plan.months.filter((month) => month.month === monthKey).map((month) => month.status)),
    ),
  }));
}

export function alarmsForMonth(plans: LotPlan[], monthKey: string): CalendarAlarm[] {
  const alarms = plans.flatMap((plan) =>
    (plan.months.find((month) => month.month === monthKey)?.alerts ?? []).map((alert) => ({
      lotId: plan.lotId,
      month: monthKey,
      alert,
    })),
  );
  return alarms.sort(
    (first, second) =>
      statusRank[second.alert.level] - statusRank[first.alert.level] ||
      alertPriority[first.alert.type] - alertPriority[second.alert.type],
  );
}
