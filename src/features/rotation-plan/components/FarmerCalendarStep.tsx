"use client";

import { ArrowLeft, RotateCcw, Satellite } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { CalendarToolbar } from "@/features/calendar/components/CalendarToolbar";
import { DayDetail } from "@/features/calendar/components/DayDetail";
import { PlanMonthGrid, type GridLot } from "@/features/calendar/components/PlanMonthGrid";
import { buildMonthLayout, type GridBlock } from "@/features/calendar/domain/monthGrid";
import type { Lot } from "@/features/farm-mapping/application/farmMappingState";
import { lotDisplayName } from "@/features/farm-mapping/application/lotDisplayName";
import { Notice } from "@/shared/components/Notice";
import { CalendarExportButton } from "@/features/calendar-export/components/CalendarExportButton";
import { assignCropColors, restBlockColor } from "../domain/cropColors";
import { localToday } from "../domain/planDates";
import { isLotRotationComplete, rotationOf } from "../domain/rotationPlan";
import { planMonths, scheduleBlocks } from "../domain/rotationSchedule";
import { CropLegend } from "./CropLegend";
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
  const translateGrid = useTranslations("calendar.grid");
  const plan = useSavedRotationPlan(lots.map((lot) => lot.shapeId));
  const cropNames = useCropNames();
  const format = usePlanFormat();
  const [today] = useState(() => localToday(new Date()));
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedLotId, setSelectedLotId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
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
  const gridLots: GridLot[] = lots.map((lot) => ({ id: lot.shapeId, number: lot.number, name: lotName(lot), color: lot.color }));
  const visibleLots = selectedLotId ? gridLots.filter((lot) => lot.id === selectedLotId) : gridLots;
  const gridBlocks: GridBlock[] = lots.flatMap((lot) =>
    (schedules.get(lot.shapeId) ?? []).map(({ block, startDate: blockStart, endDate }) => ({
      id: block.id,
      lotId: lot.shapeId,
      kind: block.kind,
      cropKey: block.kind === "crop" ? block.cropKey : null,
      startDate: blockStart,
      endDate,
    })),
  );
  const gridBlockName = (block: GridBlock) => (block.cropKey ? cropNames.cropName(block.cropKey) : translate("rest"));
  const gridBlockColor = (block: GridBlock) => (block.cropKey ? cropColors.get(block.cropKey) ?? restBlockColor : restBlockColor);
  const monthIndex = Math.min(selectedIndex, months.length - 1);
  const layout = buildMonthLayout(visibleLots, gridBlocks, selectedMonth);
  const layoutIsGrouped = Boolean(layout?.isGrouped);
  const layoutBlockName = (block: GridBlock) =>
    layout.isGrouped ? `${gridBlockName(block)} · ${translateGrid("lotCount", { count: block.lotCount ?? 0 })}` : gridBlockName(block);

  return (
    <div className="farmer-calendar">
      <header className="calendar-step__header">
        <div>
          <h1 className="step-title">{translate("title")}</h1>
          <p className="step-hint">{translate("hint", { start: format.dayMonthYear(startDate) })}</p>
        </div>
        <CalendarExportButton
          lots={gridLots}
          sources={{ farmer: { months: months.map(({ month }) => month), blocks: gridBlocks, insights: null }, recommended: null }}
          initialCalendar="farmer"
          cropName={cropNames.cropName}
          pestName={(pestKey) => pestKey}
        />
      </header>
      {cropNames.status === "failed" && (
        <Notice tone="error" title={translate("catalogFailedTitle")} action={{ label: translate("retry"), onClick: cropNames.retry, icon: RotateCcw }}>
          {translate("catalogFailed")}
        </Notice>
      )}

      <CalendarToolbar
        monthTitle={format.monthTitle(selectedMonth)}
        canGoBack={monthIndex > 0}
        canGoForward={monthIndex < months.length - 1}
        lots={gridLots}
        selectedLotId={selectedLotId}
        onPrevious={() => setSelectedIndex(monthIndex - 1)}
        onNext={() => setSelectedIndex(monthIndex + 1)}
        onGoToStart={() => {
          setSelectedIndex(0);
          setSelectedDate(startDate);
        }}
        onSelectLot={setSelectedLotId}
      />

      <div className="calendar-layout">
        <PlanMonthGrid
          monthKey={selectedMonth}
          lanes={layout.lanes}
          blocks={layout.blocks}
          today={today}
          selectedDate={selectedDate}
          isSingleLot={visibleLots.length === 1}
          showsMarkers={!layoutIsGrouped}
          blockName={layoutBlockName}
          blockColor={gridBlockColor}
          onSelectDate={setSelectedDate}
        />
        <div className="calendar-side">
          <div className="calendar-card">
            <DayDetail date={selectedDate} lots={visibleLots} blocks={gridBlocks} blockName={gridBlockName} blockColor={gridBlockColor} />
          </div>
          <div className="calendar-card">
            <CropLegend
              crops={[...cropColors].map(([cropKey, color]) => ({ cropKey, color, name: cropNames.cropName(cropKey) }))}
              hasRest={hasRest}
            />
          </div>
        </div>
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
