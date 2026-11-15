import { CircleCheck, OctagonAlert, TriangleAlert } from "lucide-react";
import { useTranslations } from "next-intl";
import type { MonthSummary } from "../domain/monthSummary";
import type { GridLot } from "./PlanMonthGrid";
import type { AlertText } from "./useAlertText";
import type { PlanAlert } from "../infrastructure/plansApi";

type MonthSummaryLineProps = {
  summary: MonthSummary<GridLot>;
  alertText: (alert: PlanAlert) => AlertText;
};

export function MonthSummaryLine({ summary, alertText }: MonthSummaryLineProps) {
  const translate = useTranslations("calendar.insights.summary");

  if (!summary.mostSevere) {
    return (
      <p className="month-summary" data-status="ok">
        <span className="month-summary__count" data-status="ok">
          <CircleCheck aria-hidden size={18} />
          {translate("calm")}
        </span>
      </p>
    );
  }

  return (
    <p className="month-summary">
      {summary.riskCount > 0 && (
        <span className="month-summary__count" data-status="risk">
          <OctagonAlert aria-hidden size={18} />
          {translate("riskCount", { count: summary.riskCount })}
        </span>
      )}
      {summary.watchCount > 0 && (
        <span className="month-summary__count" data-status="watch">
          <TriangleAlert aria-hidden size={18} />
          {translate("watchCount", { count: summary.watchCount })}
        </span>
      )}
      <span className="month-summary__worst">
        {translate("mostSevere", { alarm: alertText(summary.mostSevere.alert).name, lot: summary.mostSevere.lot.name })}
      </span>
    </p>
  );
}
