"use client";

import { useEffect, useState } from "react";
import type { Lot } from "@/features/farm-mapping/application/farmMappingState";
import { localToday, validateStartDate } from "../domain/planDates";
import { RotationScreen } from "./RotationScreen";
import { StartDateScreen } from "./StartDateScreen";
import { useRotationPlan } from "./useRotationPlan";

type PlanStepProps = {
  lots: Lot[];
  onEditLots: () => void;
  onContinue: () => void;
};

export function PlanStep({ lots, onEditLots, onContinue }: PlanStepProps) {
  const [plan, dispatch] = useRotationPlan(lots.map((lot) => lot.shapeId));
  const [today] = useState(() => localToday(new Date()));
  const validStartDate = plan.startDate !== null && validateStartDate(plan.startDate, today).isValid ? plan.startDate : null;
  const [isChoosingStart, setIsChoosingStart] = useState(validStartDate === null);

  useEffect(() => {
    document.querySelector(".farm-mapping")?.scrollTo({ top: 0 });
  }, [isChoosingStart]);

  if (isChoosingStart || validStartDate === null) {
    return (
      <StartDateScreen
        initialDate={validStartDate}
        today={today}
        onEditLots={onEditLots}
        onConfirm={(startDate) => {
          dispatch({ type: "startDateChosen", startDate });
          setIsChoosingStart(false);
        }}
      />
    );
  }

  return (
    <RotationScreen
      lots={lots}
      plan={plan}
      startDate={validStartDate}
      dispatch={dispatch}
      onChangeStartDate={() => setIsChoosingStart(true)}
      onEditLots={onEditLots}
      onContinue={onContinue}
    />
  );
}
