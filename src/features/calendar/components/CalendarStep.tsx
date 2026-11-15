"use client";

import { ArrowLeft } from "lucide-react";
import { useTranslations } from "next-intl";
import { Notice } from "@/shared/components/Notice";
import { useState } from "react";
import type { Lot } from "@/features/farm-mapping/application/farmMappingState";
import { lotDisplayName } from "@/features/farm-mapping/application/lotDisplayName";
import { loadLotPlantings } from "@/features/lot-plantings/infrastructure/lotPlantingsStorage";
import { getBrowserStorage } from "@/shared/infrastructure/browserStorage";
import { alarmsForMonth, statusByMonth } from "../domain/calendar";
import { toPlanRequests } from "../domain/planRequests";
import { AlarmList } from "./AlarmList";
import { LotDayGrid } from "./LotDayGrid";
import { LotPlanDialog } from "./LotPlanDialog";
import { MonthStrip } from "./MonthStrip";
import { StatusLegend } from "./StatusLegend";
import { useCalendarLabels } from "./useCalendarLabels";
import { useFarmPlans } from "./useFarmPlans";

type CalendarStepProps = {
  lots: Lot[];
  onEditCrops: () => void;
};

function readRequests(lots: Lot[]) {
  const storage = getBrowserStorage();
  return storage ? toPlanRequests(lots, loadLotPlantings(storage)) : null;
}

export function CalendarStep({ lots, onEditCrops }: CalendarStepProps) {
  const translate = useTranslations("calendar");
  const translateLots = useTranslations("farmMapping.lots");
  const [requests] = useState(() => readRequests(lots));
  const { state, retry } = useFarmPlans(requests);
  const plans = state.status === "ready" ? state.plans : null;
  const labels = useCalendarLabels(plans);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [openLotId, setOpenLotId] = useState<string | null>(null);
  const [today] = useState(() => new Date());
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
  const lotName = (lot: Lot) => lotDisplayName(lot, (number) => translateLots("defaultName", { number }));

  const months = plans ? statusByMonth(plans.lots) : [];
  const selectedMonth = months[selectedIndex]?.month;
  const openLot = lots.find((lot) => lot.shapeId === openLotId) ?? null;
  const openPlan = plans?.lots.find((plan) => plan.lotId === openLotId) ?? null;

  return (
    <div className="calendar-step">
      <header className="calendar-step__header">
        <div>
          <h1 className="step-title">{translate("title")}</h1>
          <p className="step-hint">{translate("hint")}</p>
        </div>
        <button type="button" onClick={onEditCrops} className="button button--secondary">
          <ArrowLeft aria-hidden size={18} />
          {translate("editCrops")}
        </button>
      </header>

      {state.status === "loading" && (
        <Notice tone="loading">{translate("loading")}</Notice>
      )}
      {state.status === "failed" && (
        <Notice tone="error" action={{ label: translate("retry"), onClick: retry }}>
          {translate("failed")}
        </Notice>
      )}

      {plans && selectedMonth && (
        <>
          {plans.usesDemoData && (
            <Notice tone="demo">{translate("demoNotice")}</Notice>
          )}
          <MonthStrip
            months={months}
            selectedIndex={selectedIndex}
            monthName={labels.monthName}
            shortMonthName={labels.shortMonthName}
            onSelect={setSelectedIndex}
          />
          <div className="calendar-step__body">
            <div className="calendar-step__grid">
              <LotDayGrid
                lots={lots}
                plans={plans.lots}
                monthKey={selectedMonth}
                todayKey={todayKey}
                todayDay={today.getDate()}
                lotName={lotName}
                cropName={labels.cropName}
                monthName={labels.monthName}
                onOpenLot={setOpenLotId}
              />
              <StatusLegend />
            </div>
            <AlarmList
              alarms={alarmsForMonth(plans.lots, selectedMonth)}
              lots={lots}
              monthTitle={labels.monthName(selectedMonth)}
              lotName={lotName}
              pestName={labels.pestName}
              decimal={labels.decimal}
              whole={labels.whole}
              onOpenLot={setOpenLotId}
            />
          </div>
        </>
      )}

      <LotPlanDialog
        lot={openLot}
        plan={openPlan}
        lotName={lotName}
        cropName={labels.cropName}
        monthName={labels.monthName}
        whole={labels.whole}
        onClose={() => setOpenLotId(null)}
      />
    </div>
  );
}
