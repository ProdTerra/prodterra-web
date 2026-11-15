"use client";

import { CircleCheck, Cloud, Droplets, GitCompareArrows, OctagonAlert, Sun, Thermometer, TriangleAlert } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { maximumLotLanes } from "../domain/monthGrid";
import { describeClimate, sortAlerts } from "../domain/monthInsights";
import type { MonthClimate, MonthStatus, PlanAlert } from "../infrastructure/plansApi";
import type { GridLot } from "./PlanMonthGrid";

export type LotMonthState = { lot: GridLot; useLabel: string; status: MonthStatus | null; alerts: PlanAlert[] };

type MonthInsightsProps = {
  monthKey: string;
  monthTitle: string;
  climate: MonthClimate | null;
  lotStates: LotMonthState[];
  decimal: (value: number) => string;
  whole: (value: number) => string;
  pestName: (pestKey: string) => string;
  onCompare: (lotId: string) => void;
};

const statusIcons = { ok: CircleCheck, watch: TriangleAlert, risk: OctagonAlert };
const statusRank: Record<MonthStatus, number> = { risk: 0, watch: 1, ok: 2 };

type LotGroup = { lots: GridLot[]; useLabel: string; status: MonthStatus | null; alerts: PlanAlert[] };

function groupSimilarStates(states: LotMonthState[], shouldGroup: boolean): LotGroup[] {
  if (!shouldGroup) {
    return states.map(({ lot, ...rest }) => ({ lots: [lot], ...rest }));
  }
  const groups = new Map<string, LotGroup>();
  for (const { lot, useLabel, status, alerts } of states) {
    const key = JSON.stringify([useLabel, status, sortAlerts(alerts)]);
    const group = groups.get(key);
    if (group) {
      group.lots.push(lot);
    } else {
      groups.set(key, { lots: [lot], useLabel, status, alerts });
    }
  }
  return [...groups.values()];
}

export function MonthInsights(props: MonthInsightsProps) {
  const translate = useTranslations("calendar.insights");
  const { climate, decimal, whole } = props;
  const description = climate ? describeClimate(climate, props.monthKey) : null;
  const [showsQuietLots, setShowsQuietLots] = useState(false);
  const sortedStates = [...props.lotStates].sort((first, second) => statusRank[first.status ?? "ok"] - statusRank[second.status ?? "ok"]);
  const isLongList = sortedStates.length > maximumLotLanes;
  const quietStates = sortedStates.filter((state) => state.alerts.length === 0);
  const visibleStates = isLongList && !showsQuietLots ? sortedStates.filter((state) => state.alerts.length > 0) : sortedStates;
  const shownGroups = groupSimilarStates(visibleStates, isLongList);

  function alertText(alert: PlanAlert): { action: string; cause: string } {
    switch (alert.type) {
      case "frost":
        return { action: translate("action.frost"), cause: translate("cause.frost", { value: decimal(alert.minimumTemperatureInCelsius) }) };
      case "temperature":
        return { action: translate("action.temperature"), cause: translate("cause.temperature", { value: decimal(alert.meanTemperatureInCelsius) }) };
      case "drought":
        return { action: translate("action.drought", { value: whole(alert.litersPerSquareMeter) }), cause: translate("cause.drought") };
      case "irrigation":
        return { action: translate("action.irrigation", { value: whole(alert.litersPerSquareMeter) }), cause: translate("cause.irrigation") };
      case "waterExcess":
        return { action: translate("action.waterExcess"), cause: translate("cause.waterExcess", { value: whole(alert.litersPerSquareMeter) }) };
      case "pest":
        return { action: translate("action.pest", { pest: props.pestName(alert.pestKey) }), cause: translate("cause.pest") };
    }
  }

  return (
    <>
      {climate && description && (
        <section className="calendar-card climate-card" aria-labelledby="climate-card-title">
          <div>
            <h3 id="climate-card-title" className="calendar-card__title">
              {translate("climateTitle", { month: props.monthTitle })}
            </h3>
            <p className="calendar-card__note">{translate("climateNote")}</p>
          </div>
          <ul className="climate-card__facts">
            <li>
              <Thermometer aria-hidden size={18} />
              <span>
                <strong>{translate("temperature", { min: decimal(climate.minimumTemperatureInCelsius), max: decimal(climate.maximumTemperatureInCelsius) })}</strong>
                {description.hasFrostNights && <span data-tone="risk">{translate("frostNights")}</span>}
              </span>
            </li>
            <li>
              <Droplets aria-hidden size={18} />
              <span>
                <strong>{translate(`rainLevel.${description.rainLevel}`)}</strong>
                <span>{translate("rain", { value: whole(description.rainInMillimeters) })}</span>
              </span>
            </li>
            <li>
              <Cloud aria-hidden size={18} />
              <span>
                <strong>{translate(`humidityLevel.${description.humidityLevel}`)}</strong>
                <span>{translate("humidity", { value: whole(climate.relativeHumidityInPercent) })}</span>
              </span>
            </li>
            <li>
              <Sun aria-hidden size={18} />
              <span>
                <strong>{translate("sun", { value: decimal(climate.solarRadiationInKilowattHoursPerSquareMeterPerDay) })}</strong>
              </span>
            </li>
          </ul>
        </section>
      )}

      <section className="calendar-card" aria-labelledby="lot-states-title">
        <h3 id="lot-states-title" className="calendar-card__title">
          {translate("lotsTitle", { month: props.monthTitle })}
        </h3>
        <ul className="lot-states">
          {shownGroups.map(({ lots, useLabel, status, alerts }) => {
            const StatusIcon = status ? statusIcons[status] : null;
            const lot = lots[0];
            return (
              <li key={lot.id} className="lot-state">
                <div className="lot-state__head">
                  <span aria-hidden className="lot-badge lot-badge--small" style={{ ["--lot-color" as string]: lot.color }}>
                    {lots.length > 1 ? lots.length : lot.number}
                  </span>
                  <span className="lot-state__name">
                    <strong>{lots.length > 1 ? translate("lotGroup", { numbers: lots.map((member) => member.number).join(", ") }) : lot.name}</strong>
                    <span>{useLabel}</span>
                  </span>
                  {status && StatusIcon && (
                    <span className="status-chip" data-status={status}>
                      <StatusIcon aria-hidden size={16} />
                      {translate(`status.${status}`)}
                    </span>
                  )}
                </div>
                {alerts.length > 0 && (
                  <ul className="lot-state__alerts">
                    {sortAlerts(alerts).map((alert, index) => {
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
                {lots.length === 1 && (
                  <button type="button" onClick={() => props.onCompare(lot.id)} className="link-button lot-state__compare">
                    <GitCompareArrows aria-hidden size={16} />
                    {translate("compare")}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
        {isLongList && quietStates.length > 0 && (
          <button type="button" onClick={() => setShowsQuietLots((current) => !current)} className="button button--secondary button--small">
            {translate(showsQuietLots ? "hideQuietLots" : "showQuietLots", { count: quietStates.length })}
          </button>
        )}
      </section>
    </>
  );
}
