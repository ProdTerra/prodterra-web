"use client";

import { ArrowLeft, RotateCcw, Satellite } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { MonthStrip } from "@/features/calendar/components/MonthStrip";
import type { Lot } from "@/features/farm-mapping/application/farmMappingState";
import { lotDisplayName } from "@/features/farm-mapping/application/lotDisplayName";
import { Notice } from "@/shared/components/Notice";
import { PrintButton } from "@/shared/components/PrintButton";
import { PrintableReport, type ReportLot } from "@/shared/components/PrintableReport";
import { assignCropColors, restBlockColor } from "../domain/cropColors";
import { localToday } from "../domain/planDates";
import { isLotRotationComplete, rotationOf } from "../domain/rotationPlan";
import { dayUsesForMonth, planMonths, scheduleBlocks, type DayUse, type ScheduledBlock } from "../domain/rotationSchedule";
import { CropLegend } from "./CropLegend";
import { LotDatesSummary } from "./LotDatesSummary";
import { RotationDayGrid } from "./RotationDayGrid";
import { useCropNames } from "./useCropNames";
import { usePlanFormat } from "./usePlanFormat";
import { useSavedRotationPlan } from "./useRotationPlan";

type FarmerCalendarStepProps = {
  lots: Lot[];
  onEditPlan: () => void;
  onAnalyze: () => void;
};

export function FarmerCalendarStep({ lots, onEditPlan, onAnalyze }: FarmerCalendarStepProps) {
  const translate = useTranslations("rotationPlan.myCalendar");
  const translateLots = useTranslations("farmMapping.lots");
  const translatePrint = useTranslations("print");
  const plan = useSavedRotationPlan(lots.map((lot) => lot.shapeId));
  const cropNames = useCropNames();
  const format = usePlanFormat();
  const [today] = useState(() => localToday(new Date()));
  const [selectedIndex, setSelectedIndex] = useState(0);
  const startDate = plan.startDate;
  const rotations = lots.map((lot) => rotationOf(plan, lot.shapeId));
  const isPlanReady = startDate !== null && rotations.every(isLotRotationComplete);
  const lotName = (lot: Lot) => lotDisplayName(lot, (number) => translateLots("defaultName", { number }));

  if (!isPlanReady) {
    return (
      <div className="farmer-calendar">
        <h1 className="step-title">{translate("title")}</h1>
        <Notice tone="warning" title={translate("incompleteTitle")} action={{ label: translate("editPlan"), onClick: onEditPlan, icon: ArrowLeft }}>
          {translate("incomplete")}
        </Notice>
      </div>
    );
  }

  const schedules = new Map(lots.map((lot) => [lot.shapeId, scheduleBlocks(startDate, rotationOf(plan, lot.shapeId).blocks)]));
  const months = planMonths(startDate, [...schedules.values()]).map((month) => ({ month }));
  const selectedMonth = months[Math.min(selectedIndex, months.length - 1)].month;
  const cropColors = assignCropColors(rotations);
  const hasRest = rotations.some((rotation) => rotation.blocks.some((block) => block.kind === "rest"));
  const dayUseName = (use: DayUse) => (use.kind === "crop" ? cropNames.cropName(use.cropKey) : translate("rest"));
  const blockName = ({ block }: ScheduledBlock) => (block.kind === "crop" ? cropNames.cropName(block.cropKey) : translate("rest"));
  const blockColor = ({ block }: ScheduledBlock) => (block.kind === "crop" ? cropColors.get(block.cropKey) ?? restBlockColor : restBlockColor);

  const reportLots: ReportLot[] = lots.map((lot) => {
    const schedule = schedules.get(lot.shapeId) ?? [];
    return {
      key: lot.shapeId,
      name: lotName(lot),
      color: lot.color,
      number: lot.number,
      rows: [
        {
          label: translatePrint("farmerRow"),
          cells: months.map(({ month }) => {
            const use = dayUsesForMonth(schedule, month)[14]?.use ?? null;
            const color = use?.kind === "crop" ? cropColors.get(use.cropKey) ?? restBlockColor : use ? restBlockColor : null;
            return { month, text: use ? dayUseName(use) : "", color: color ? `${color}40` : null };
          }),
        },
      ],
      lines: schedule.map((scheduled) =>
        translatePrint("line", {
          name: blockName(scheduled),
          start: format.dayMonthYear(scheduled.startDate),
          end: format.dayMonthYear(scheduled.endDate),
        }),
      ),
    };
  });

  return (
    <div className="farmer-calendar">
      <header className="calendar-step__header">
        <div>
          <h1 className="step-title">{translate("title")}</h1>
          <p className="step-hint">{translate("hint", { start: format.dayMonthYear(startDate) })}</p>
        </div>
        <PrintButton label={translatePrint("download")} />
      </header>
      <PrintableReport
        title={translatePrint("farmerTitle")}
        subtitle={translatePrint("subtitle", { start: format.dayMonthYear(startDate), today: format.dayMonthYear(today) })}
        months={months.map(({ month }) => month)}
        monthLabel={format.shortMonth}
        legend={[
          ...[...cropColors].map(([cropKey, color]) => ({ label: cropNames.cropName(cropKey), color: `${color}40` })),
          ...(hasRest ? [{ label: translate("rest"), color: `${restBlockColor}40` }] : []),
        ]}
        lots={reportLots}
      />

      {cropNames.status === "failed" && (
        <Notice tone="error" title={translate("catalogFailedTitle")} action={{ label: translate("retry"), onClick: cropNames.retry, icon: RotateCcw }}>
          {translate("catalogFailed")}
        </Notice>
      )}

      <MonthStrip
        months={months}
        selectedIndex={Math.min(selectedIndex, months.length - 1)}
        monthName={format.monthTitle}
        shortMonthName={format.shortMonth}
        onSelect={setSelectedIndex}
      />

      <div className="calendar-step__body">
        <div className="calendar-step__grid">
          <RotationDayGrid
            lots={lots}
            schedules={schedules}
            monthKey={selectedMonth}
            monthTitle={format.monthTitle(selectedMonth)}
            today={today}
            cropColors={cropColors}
            lotName={lotName}
            dayUseName={dayUseName}
            list={format.list}
          />
          <CropLegend
            crops={[...cropColors].map(([cropKey, color]) => ({ cropKey, color, name: cropNames.cropName(cropKey) }))}
            hasRest={hasRest}
          />
        </div>
        <LotDatesSummary lots={lots} schedules={schedules} lotName={lotName} blockName={blockName} blockColor={blockColor} />
      </div>

      <div className="plan-footer plan-footer--sticky">
        <button type="button" onClick={onEditPlan} className="button button--secondary">
          <ArrowLeft aria-hidden size={18} />
          {translate("editPlan")}
        </button>
        <button type="button" onClick={onAnalyze} className="button button--primary">
          <Satellite aria-hidden size={18} />
          {translate("analyze")}
        </button>
      </div>
    </div>
  );
}
