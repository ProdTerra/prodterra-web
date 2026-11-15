import { Mountain } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { maximumLotLanes } from "../domain/monthGrid";
import { sortAlerts } from "../domain/monthInsights";
import { splitQuietLots } from "../domain/monthSummary";
import type { MonthStatus, PlanAlert } from "../infrastructure/plansApi";
import type { GridLot } from "./PlanMonthGrid";
import { StatusLabel } from "./StatusLabel";
import { groupPestAlerts, type PestsAlert } from "../domain/alertDisplay";
import type { AlertText } from "./useAlertText";

export type LotMonthState = {
  lot: GridLot;
  useLabel: string;
  status: MonthStatus | null;
  alerts: PlanAlert[];
  altitudeWarningCrop: string | null;
};

type LotGroup = Omit<LotMonthState, "lot"> & { lots: GridLot[] };

type LotStatesCardProps = {
  monthTitle: string;
  lotStates: LotMonthState[];
  alertText: (alert: PlanAlert | PestsAlert) => AlertText;
};

function groupSimilarStates(states: LotMonthState[], shouldGroup: boolean): LotGroup[] {
  if (!shouldGroup) {
    return states.map(({ lot, ...rest }) => ({ lots: [lot], ...rest }));
  }
  const groups = new Map<string, LotGroup>();
  for (const { lot, ...rest } of states) {
    const key = JSON.stringify([rest.useLabel, rest.status, rest.altitudeWarningCrop, sortAlerts(rest.alerts)]);
    const group = groups.get(key);
    if (group) {
      group.lots.push(lot);
    } else {
      groups.set(key, { lots: [lot], ...rest });
    }
  }
  return [...groups.values()];
}

function LotBadge({ lot, label }: { lot: GridLot; label: number }) {
  return (
    <span aria-hidden className="lot-badge lot-badge--small" style={{ ["--lot-color" as string]: lot.color }}>
      {label}
    </span>
  );
}

export function LotStatesCard({ monthTitle, lotStates, alertText }: LotStatesCardProps) {
  const translate = useTranslations("calendar.insights");
  const format = useFormatter();
  const { needsAttention, quiet } = splitQuietLots(lotStates);
  const groups = groupSimilarStates(needsAttention, lotStates.length > maximumLotLanes);
  const numberList = (lots: GridLot[]) => format.list(lots.map((lot) => String(lot.number)), { type: "conjunction" });

  return (
    <section className="calendar-card" aria-labelledby="lot-states-title">
      <h3 id="lot-states-title" className="calendar-card__title">
        {translate("lotsTitle", { month: monthTitle })}
      </h3>
      <ul className="lot-states">
        {groups.map(({ lots, useLabel, status, alerts, altitudeWarningCrop }) => {
          const lot = lots[0];
          return (
            <li key={lot.id} className="lot-state">
              <div className="lot-state__head">
                <LotBadge lot={lot} label={lots.length > 1 ? lots.length : lot.number} />
                <span className="lot-state__name">
                  <strong>{lots.length > 1 ? translate("lotGroup", { numbers: numberList(lots) }) : lot.name}</strong>
                  <span>{useLabel}</span>
                </span>
                {status && <StatusLabel status={status} />}
              </div>
              {altitudeWarningCrop && (
                <p className="lot-state__note">
                  <Mountain aria-hidden size={16} />
                  {translate("altitudeOutOfRange", { crop: altitudeWarningCrop })}
                </p>
              )}
              {alerts.length > 0 && (
                <ul className="lot-state__alerts">
                  {groupPestAlerts(sortAlerts(alerts)).map((alert, index) => {
                    const text = alertText(alert);
                    return (
                      <li key={`${alert.type}-${index}`} data-level={alert.level}>
                        <strong>{text.action}</strong>
                        <span>{text.cause}</span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </li>
          );
        })}
        {quiet.length > 0 && (
          <li className="lot-state lot-state--quiet">
            <div className="lot-state__head">
              <span className="lot-state__badges">
                {quiet.map(({ lot }) => (
                  <LotBadge key={lot.id} lot={lot} label={lot.number} />
                ))}
              </span>
              <span className="lot-state__name">
                <strong>{translate("quietLots", { count: quiet.length, numbers: numberList(quiet.map(({ lot }) => lot)) })}</strong>
              </span>
              <StatusLabel status="ok" />
            </div>
          </li>
        )}
      </ul>
    </section>
  );
}
