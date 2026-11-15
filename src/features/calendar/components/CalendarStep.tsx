"use client";

import { ArrowLeft, FilePlus2, RotateCcw, Sparkles, UserRound } from "lucide-react";
import { Dialog } from "@/shared/components/Dialog";
import { useFormatter, useTranslations } from "next-intl";
import { Notice } from "@/shared/components/Notice";
import { PrintButton } from "@/shared/components/PrintButton";
import { PrintableReport, type ReportLot } from "@/shared/components/PrintableReport";
import { useState, type ReactNode } from "react";
import type { Lot } from "@/features/farm-mapping/application/farmMappingState";
import { lotDisplayName } from "@/features/farm-mapping/application/lotDisplayName";
import { useSavedRotationPlan } from "@/features/rotation-plan/components/useRotationPlan";
import { CropLegend } from "@/features/rotation-plan/components/CropLegend";
import { cropColorOf, restBlockColor } from "@/features/rotation-plan/domain/cropColors";
import { statusByMonth } from "../domain/calendar";
import { buildMonthLayout, type GridBlock } from "../domain/monthGrid";
import { allMonths, toLotPlans, type PlanVariant } from "../domain/evaluationView";
import { toEvaluationRequest } from "../domain/planRequests";
import { CalendarToolbar } from "./CalendarToolbar";
import { DayDetail } from "./DayDetail";
import { LotComparisonDialog } from "./LotComparisonDialog";
import { MonthInsights, type LotMonthState } from "./MonthInsights";
import { PlanMonthGrid, type GridLot } from "./PlanMonthGrid";
import type { EvaluatedRotation, MonthStatus } from "../infrastructure/plansApi";
import { useCalendarLabels } from "./useCalendarLabels";
import { useRotationEvaluation } from "./useRotationEvaluation";

type CalendarStepProps = {
  lots: Lot[];
  onBack: () => void;
  onNewPlan: () => void;
  actions?: ReactNode;
};

const printStatusColors: Record<MonthStatus, string> = { ok: "#cfe8d4", watch: "#fbe9a6", risk: "#f6c3be" };

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
  const [openLotId, setOpenLotId] = useState<string | null>(null);
  const [isNewPlanConfirmOpen, setIsNewPlanConfirmOpen] = useState(false);
  const [selectedLotId, setSelectedLotId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const translateInsights = useTranslations("calendar.insights");
  const translateGrid = useTranslations("calendar.grid");
  const [today] = useState(() => new Date());
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
  const lotName = (lot: Lot) => lotDisplayName(lot, (number) => translateLots("defaultName", { number }));
  const translatePrint = useTranslations("print");
  const format = useFormatter();
  const printDate = (isoDate: string) =>
    format.dateTime(new Date(`${isoDate}T12:00:00Z`), { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

  function reportRow(label: string, rotation: EvaluatedRotation | null) {
    return {
      label,
      cells: (rotation?.months ?? []).map((month) => ({
        month: month.month,
        text: month.cropKey ? labels.cropName(month.cropKey) : month.isRest ? translatePrint("rest") : "",
        color: printStatusColors[month.status],
      })),
    };
  }

  const reportLots: ReportLot[] = evaluation
    ? lots.map((lot) => {
        const lotEvaluation = evaluation.lots.find((candidate) => candidate.lotId === lot.shapeId);
        const blockLine = (key: "line" | "recommendedLine") => (block: EvaluatedRotation["blocks"][number]) =>
          translatePrint(key, {
            name: block.cropKey ? labels.cropName(block.cropKey) : translatePrint("rest"),
            start: printDate(block.startsOn),
            end: printDate(block.endsOn),
          });
        return {
          key: lot.shapeId,
          name: lotName(lot),
          color: lot.color,
          number: lot.number,
          rows: [
            reportRow(translatePrint("farmerRow"), lotEvaluation?.farmer ?? null),
            reportRow(translatePrint("recommendedRow"), lotEvaluation?.recommended ?? null),
          ],
          lines: [
            ...(lotEvaluation?.farmer?.blocks.map(blockLine("line")) ?? []),
            ...(lotEvaluation?.recommended?.blocks.map(blockLine("recommendedLine")) ?? []),
          ],
        };
      })
    : [];

  const months = plans ? statusByMonth(plans.lots) : [];
  const monthIndex = Math.min(selectedIndex, Math.max(months.length - 1, 0));
  const selectedMonth = months[monthIndex]?.month;
  const gridLots: GridLot[] = lots.map((lot) => ({ id: lot.shapeId, number: lot.number, name: lotName(lot), color: lot.color }));
  const visibleLots = selectedLotId ? gridLots.filter((lot) => lot.id === selectedLotId) : gridLots;
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
  const climateLot = evaluation?.lots.find((lotEvaluation) => (selectedLotId ? lotEvaluation.lotId === selectedLotId : true) && lotEvaluation.climate?.length);
  const monthClimate = selectedMonth ? (climateLot?.climate?.find((climate) => climate.month === Number(selectedMonth.slice(5, 7))) ?? null) : null;
  const lotStates: LotMonthState[] = visibleLots.map((lot) => {
    const month = plans?.lots.find((lotPlan) => lotPlan.lotId === lot.id)?.months.find((candidate) => candidate.month === selectedMonth);
    const useLabel = month?.cropKey ? labels.cropName(month.cropKey) : month?.phase === "rest" ? translateInsights("rest") : translateInsights("free");
    return { lot, useLabel, status: month?.status ?? null, alerts: month?.alerts ?? [] };
  });
  const openLot = lots.find((lot) => lot.shapeId === openLotId) ?? null;
  const openEvaluation = evaluation?.lots.find((lotEvaluation) => lotEvaluation.lotId === openLotId) ?? null;

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
          {evaluation && <PrintButton label={translatePrint("download")} />}
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
            selectedLotId={selectedLotId}
            onPrevious={() => setSelectedIndex(monthIndex - 1)}
            onNext={() => setSelectedIndex(monthIndex + 1)}
            onGoToStart={() => {
              setSelectedIndex(0);
              setSelectedDate(evaluation?.startDate ?? null);
            }}
            onSelectLot={setSelectedLotId}
          />
          <div className="calendar-layout">
            <PlanMonthGrid
              monthKey={selectedMonth}
              lanes={layout?.lanes ?? []}
              blocks={layout?.blocks ?? []}
              today={`${todayKey}-${String(today.getDate()).padStart(2, "0")}`}
              selectedDate={selectedDate}
              isSingleLot={visibleLots.length === 1}
          showsMarkers={!layoutIsGrouped}
              blockName={layoutBlockName}
              blockColor={gridBlockColor}
              onSelectDate={setSelectedDate}
            />
            <div className="calendar-side">
              <MonthInsights
                monthKey={selectedMonth}
                monthTitle={labels.monthName(selectedMonth)}
                climate={monthClimate}
                lotStates={lotStates}
                decimal={labels.decimal}
                whole={labels.whole}
                pestName={labels.pestName}
                onCompare={setOpenLotId}
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
          </div>
        </>
      )}

      {evaluation && (
        <PrintableReport
          title={translatePrint("analysisTitle")}
          subtitle={translatePrint("subtitle", { start: printDate(evaluation.startDate), today: format.dateTime(new Date(), { day: "numeric", month: "long", year: "numeric" }) })}
          months={allMonths([...toLotPlans(evaluation, "farmer"), ...toLotPlans(evaluation, "recommended")])}
          monthLabel={labels.shortMonthName}
          legend={[
            { label: translatePrint("statusOk"), color: printStatusColors.ok },
            { label: translatePrint("statusWatch"), color: printStatusColors.watch },
            { label: translatePrint("statusRisk"), color: printStatusColors.risk },
          ]}
          lots={reportLots}
        />
      )}

      <LotComparisonDialog
        lot={openLot}
        evaluation={openEvaluation}
        lotName={lotName}
        cropName={labels.cropName}
        whole={labels.whole}
        onClose={() => setOpenLotId(null)}
      />
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
