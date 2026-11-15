"use client";

import { ArrowLeft, RotateCcw, Sparkles, UserRound } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { Notice } from "@/shared/components/Notice";
import { PrintButton } from "@/shared/components/PrintButton";
import { PrintableReport, type ReportLot } from "@/shared/components/PrintableReport";
import { useState, type ReactNode } from "react";
import type { Lot } from "@/features/farm-mapping/application/farmMappingState";
import { lotDisplayName } from "@/features/farm-mapping/application/lotDisplayName";
import { useSavedRotationPlan } from "@/features/rotation-plan/components/useRotationPlan";
import { alarmsForMonth, statusByMonth } from "../domain/calendar";
import { allMonths, toLotPlans, type PlanVariant } from "../domain/evaluationView";
import { toEvaluationRequest } from "../domain/planRequests";
import { AlarmList } from "./AlarmList";
import { LotDayGrid } from "./LotDayGrid";
import { LotComparisonDialog } from "./LotComparisonDialog";
import type { EvaluatedRotation, MonthStatus } from "../infrastructure/plansApi";
import { MonthStrip } from "./MonthStrip";
import { StatusLegend } from "./StatusLegend";
import { useCalendarLabels } from "./useCalendarLabels";
import { useRotationEvaluation } from "./useRotationEvaluation";

type CalendarStepProps = {
  lots: Lot[];
  onBack: () => void;
  actions?: ReactNode;
};

const printStatusColors: Record<MonthStatus, string> = { ok: "#cfe8d4", watch: "#fbe9a6", risk: "#f6c3be" };

export function CalendarStep({ lots, onBack, actions }: CalendarStepProps) {
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
  const selectedMonth = months[selectedIndex]?.month;
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
    </div>
  );
}
