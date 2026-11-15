"use client";

import { summarizeMonth } from "../domain/monthSummary";
import type { MonthClimate } from "../infrastructure/plansApi";
import { ClimateCard } from "./ClimateCard";
import { LotStatesCard, type LotMonthState } from "./LotStatesCard";
import { MonthSummaryLine } from "./MonthSummaryLine";
import { useAlertText } from "./useAlertText";

export type { LotMonthState } from "./LotStatesCard";

type MonthInsightsProps = {
  monthKey: string;
  monthTitle: string;
  climate: MonthClimate | null;
  lotStates: LotMonthState[];
  decimal: (value: number) => string;
  whole: (value: number) => string;
  pestName: (pestKey: string) => string;
};

export function MonthInsights(props: MonthInsightsProps) {
  const { climate, decimal, whole, pestName } = props;
  const alertText = useAlertText({ decimal, whole, pestName });

  return (
    <>
      <MonthSummaryLine summary={summarizeMonth(props.lotStates)} alertText={alertText} />
      {climate && <ClimateCard monthKey={props.monthKey} monthTitle={props.monthTitle} climate={climate} decimal={decimal} whole={whole} />}
      <LotStatesCard monthTitle={props.monthTitle} lotStates={props.lotStates} alertText={alertText} />
    </>
  );
}
