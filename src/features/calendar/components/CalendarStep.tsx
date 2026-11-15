"use client";

import { ArrowLeft, FilePlus2, RotateCcw, Sparkles, UserRound } from "lucide-react";
import { Dialog } from "@/shared/components/Dialog";
import { useTranslations } from "next-intl";
import { Notice } from "@/shared/components/Notice";
import { useState, type ReactNode } from "react";
import type { Lot } from "@/features/farm-mapping/application/farmMappingState";
import { lotDisplayName } from "@/features/farm-mapping/application/lotDisplayName";
import { useSavedRotationPlan } from "@/features/rotation-plan/components/useRotationPlan";
import { CalendarExportButton } from "@/features/calendar-export/components/CalendarExportButton";
import { sourcesFromEvaluation } from "@/features/calendar-export/application/exportSources";
import { CropLegend } from "@/features/rotation-plan/components/CropLegend";
import { cropColorOf, restBlockColor } from "@/features/rotation-plan/domain/cropColors";
import { statusByMonth } from "../domain/calendar";
import { laneStatusesForMonth } from "../domain/laneStatus";
import { buildMonthLayout, canShowAllLots, effectiveLotSelection, type GridBlock } from "../domain/monthGrid";
import { hasAltitudeWarning, toLotPlans, type PlanVariant } from "../domain/evaluationView";
import { toEvaluationRequest } from "../domain/planRequests";
import { CalendarToolbar } from "./CalendarToolbar";
import { DayDetail } from "./DayDetail";
import { MonthInsights, type LotMonthState } from "./MonthInsights";
import { PlanMonthGrid, type GridLot } from "./PlanMonthGrid";
import { useCalendarLabels } from "./useCalendarLabels";
import { countAlarms } from "../domain/alertDisplay";
import { useRotationEvaluation } from "./useRotationEvaluation";

type CalendarStepProps = {
  lots: Lot[];
  onBack: () => void;
  onNewPlan: () => void;
  actions?: ReactNode;
};

export function CalendarStep({ lots, onBack, onNewPlan, actions }: CalendarStepProps) {
  const translate = useTranslations("calendar");
  const translateLots = useTranslations("farmMapping.lots");
  const plan = useSavedRotationPlan(lots.map((lot) => lot.shapeId));
  const [request] = useState(() => toEvaluationRequest(lots, plan));
  const { state, retry } = useRotationEvaluation(request);
  const evaluation = state.status === "ready" ? state.evaluation : null;
  const [variant, setVariant] = useState<PlanVariant>("recommended");
  const plans = evaluation ? { usesDemoData: evaluation.usesDemoData, lots: toLotPlans(evaluation, variant) } : null;
  const labels = useCalendarLabels(evaluation);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isNewPlanConfirmOpen, setIsNewPlanConfirmOpen] = useState(false);
  const [selectedLotId, setSelectedLotId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const translateInsights = useTranslations("calendar.insights");
  const translateGrid = useTranslations("calendar.grid");
  const [today] = useState(() => new Date());
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
  const lotName = (lot: Lot) => lotDisplayName(lot, (number) => translateLots("defaultName", { number }));
  const months = plans ? statusByMonth(plans.lots) : [];
  const monthIndex = Math.min(selectedIndex, Math.max(months.length - 1, 0));
  const selectedMonth = months[monthIndex]?.month;
  const gridLots: GridLot[] = lots.map((lot) => ({ id: lot.shapeId, number: lot.number, name: lotName(lot), color: lot.color }));
  const lotSelection = effectiveLotSelection(gridLots, selectedLotId);
  const visibleLots = lotSelection ? gridLots.filter((lot) => lot.id === lotSelection) : gridLots;
  const gridBlocks: GridBlock[] = (evaluation?.lots ?? []).flatMap((lotEvaluation) =>
    (lotEvaluation[variant]?.blocks ?? []).map((block, index) => ({
      id: `${lotEvaluation.lotId}-${variant}-${index}`,
      lotId: lotEvaluation.lotId,
      kind: block.kind,
      cropKey: block.cropKey,
      startDate: block.startsOn,
      endDate: block.endsOn,
    })),
  );
  const gridBlockName = (block: GridBlock) => (block.cropKey ? labels.cropName(block.cropKey) : translate("rest"));
  const layout = selectedMonth ? buildMonthLayout(visibleLots, gridBlocks, selectedMonth) : null;
  const layoutIsGrouped = Boolean(layout?.isGrouped);
  const layoutBlockName = (block: GridBlock) =>
    layout?.isGrouped ? `${gridBlockName(block)} · ${translateGrid("lotCount", { count: block.lotCount ?? 0 })}` : gridBlockName(block);
  const gridBlockColor = (block: GridBlock) => (block.cropKey ? cropColorOf(block.cropKey) : restBlockColor);
  const climateLot = evaluation?.lots.find((lotEvaluation) => (lotSelection ? lotEvaluation.lotId === lotSelection : true) && lotEvaluation.climate?.length);
  const monthClimate = selectedMonth ? (climateLot?.climate?.find((climate) => climate.month === Number(selectedMonth.slice(5, 7))) ?? null) : null;
  const monthOfLot = (lotId: string) =>
    plans?.lots.find((lotPlan) => lotPlan.lotId === lotId)?.months.find((candidate) => candidate.month === selectedMonth);
  const rotationOfLot = (lotId: string) => evaluation?.lots.find((lotEvaluation) => lotEvaluation.lotId === lotId)?.[variant] ?? null;
  const lotStates: LotMonthState[] = visibleLots.map((lot) => {
    const month = monthOfLot(lot.id);
    const cropKey = month?.cropKey ?? null;
    const useLabel = cropKey ? labels.cropName(cropKey) : month?.phase === "rest" ? translateInsights("rest") : translateInsights("free");
    const altitudeWarningCrop = cropKey && hasAltitudeWarning(rotationOfLot(lot.id), cropKey) ? labels.cropName(cropKey) : null;
    return { lot, useLabel, status: month?.status ?? null, alerts: month?.alerts ?? [], altitudeWarningCrop };
  });
  const laneStatuses = laneStatusesForMonth(
    layout?.lanes ?? [],
    layoutIsGrouped,
    visibleLots.map((lot) => {
      const month = monthOfLot(lot.id);
      return {
        lotId: lot.id,
        cropKey: month?.cropKey ?? null,
        isRest: month?.phase === "rest",
        status: month?.status ?? null,
        alarmCount: countAlarms(month?.alerts ?? []),
      };
    }),
  );

  return (
    <div className="calendar-step">
      <header className="calendar-step__header">
        <div>
          <h1 className="step-title">{translate("title")}</h1>
          <p className="step-hint">{translate("hint")}</p>
        </div>
        <div className="calendar-step__actions">
          <button type="button" onClick={onBack} className="button button--secondary">
            <ArrowLeft aria-hidden size={18} />
            {translate("backToMyCalendar")}
          </button>
          {evaluation && (
            <CalendarExportButton
              lots={gridLots}
              sources={sourcesFromEvaluation(evaluation)}
              initialCalendar={variant}
              cropName={labels.cropName}
              pestName={labels.pestName}
            />
          )}
          <button type="button" onClick={() => setIsNewPlanConfirmOpen(true)} className="button button--outline">
            <FilePlus2 aria-hidden size={18} />
            {translate("newPlan.action")}
          </button>
          {actions}
        </div>
      </header>

      {state.status === "loading" && (
        <Notice tone="loading">{translate("loading")}</Notice>
      )}
      {state.status === "failed" && (
        <Notice
          tone="error"
          title={translate("failedTitle")}
          action={{ label: translate("retry"), onClick: retry, icon: RotateCcw }}
        >
          {translate("failed")}
        </Notice>
      )}

      {plans && selectedMonth && (
        <>
          {plans.usesDemoData && (
            <Notice tone="demo">{translate("demoNotice")}</Notice>
          )}
          <div role="group" aria-label={translate("variantLabel")} className="variant-switch">
            <button type="button" aria-pressed={variant === "farmer"} onClick={() => setVariant("farmer")}>
              <UserRound aria-hidden size={18} />
              {translate("variantFarmer")}
            </button>
            <button type="button" aria-pressed={variant === "recommended"} onClick={() => setVariant("recommended")}>
              <Sparkles aria-hidden size={18} />
              {translate("variantRecommended")}
            </button>
          </div>
          <CalendarToolbar
            monthTitle={labels.monthName(selectedMonth)}
            canGoBack={monthIndex > 0}
            canGoForward={monthIndex < months.length - 1}
            lots={gridLots}
            selectedLotId={lotSelection}
            showsAllLotsOption={canShowAllLots(gridLots.length)}
            onPrevious={() => setSelectedIndex(monthIndex - 1)}
            onNext={() => setSelectedIndex(monthIndex + 1)}
            onGoToStart={() => {
              setSelectedIndex(0);
              setSelectedDate(evaluation?.startDate ?? null);
            }}
            onSelectLot={setSelectedLotId}
          />
          <div className="calendar-layout">
            <div className="calendar-main">
              <PlanMonthGrid
                monthKey={selectedMonth}
                lanes={layout?.lanes ?? []}
                blocks={layout?.blocks ?? []}
                today={`${todayKey}-${String(today.getDate()).padStart(2, "0")}`}
                selectedDate={selectedDate}
                isSingleLot={visibleLots.length === 1}
                showsMarkers={!layoutIsGrouped}
                laneStatuses={laneStatuses}
                blockName={layoutBlockName}
                blockColor={gridBlockColor}
                onSelectDate={setSelectedDate}
              />
              <div className="calendar-card">
                <CropLegend
                  crops={[...new Set(gridBlocks.flatMap((block) => (block.cropKey ? [block.cropKey] : [])))].map((cropKey) => ({
                    cropKey,
                    color: cropColorOf(cropKey),
                    name: labels.cropName(cropKey),
                  }))}
                  hasRest={gridBlocks.some((block) => block.kind === "rest")}
                />
              </div>
              <div className="calendar-card">
                <DayDetail date={selectedDate} lots={visibleLots} blocks={gridBlocks} blockName={gridBlockName} blockColor={gridBlockColor} />
              </div>
            </div>
            <div className="calendar-side">
              <MonthInsights
                monthKey={selectedMonth}
                monthTitle={labels.monthName(selectedMonth)}
                climate={monthClimate}
                lotStates={lotStates}
                decimal={labels.decimal}
                whole={labels.whole}
                pestName={labels.pestName}
              />
            </div>
          </div>
        </>
      )}

      <Dialog
        isOpen={isNewPlanConfirmOpen}
        tone="info"
        title={translate("newPlan.title")}
        description={translate("newPlan.description")}
        confirmLabel={translate("newPlan.confirm")}
        cancelLabel={translate("newPlan.cancel")}
        onConfirm={() => {
          setIsNewPlanConfirmOpen(false);
          onNewPlan();
        }}
        onCancel={() => setIsNewPlanConfirmOpen(false)}
      />
    </div>
  );
}
