import { allMonths, toLotPlans, type PlanVariant } from "@/features/calendar/domain/evaluationView";
import type { GridBlock } from "@/features/calendar/domain/monthGrid";
import type { RotationEvaluation } from "@/features/calendar/infrastructure/plansApi";
import { summarizeLotRisk, type LotRiskSummary } from "../domain/lotSelection";
import type { CalendarInsights, ExportLot } from "./buildCalendarExport";

export type CalendarExportSource = { months: string[]; blocks: GridBlock[]; insights: CalendarInsights | null };

export type CalendarExportSources = { farmer: CalendarExportSource; recommended: CalendarExportSource | null };

function blocksOf(evaluation: RotationEvaluation, variant: PlanVariant): GridBlock[] {
  return evaluation.lots.flatMap((lot) =>
    (lot[variant]?.blocks ?? []).map((block, index) => ({
      id: `${lot.lotId}-${variant}-${index}`,
      lotId: lot.lotId,
      kind: block.kind,
      cropKey: block.cropKey,
      startDate: block.startsOn,
      endDate: block.endsOn,
    })),
  );
}

function recommendedInsights(evaluation: RotationEvaluation): CalendarInsights {
  return {
    climateByLot: Object.fromEntries(evaluation.lots.map((lot) => [lot.lotId, lot.climate])),
    monthsByLot: Object.fromEntries(evaluation.lots.map((lot) => [lot.lotId, lot.recommended?.months ?? []])),
  };
}

export function sourcesFromEvaluation(evaluation: RotationEvaluation): { farmer: CalendarExportSource; recommended: CalendarExportSource } {
  return {
    farmer: { months: allMonths(toLotPlans(evaluation, "farmer")), blocks: blocksOf(evaluation, "farmer"), insights: null },
    recommended: {
      months: allMonths(toLotPlans(evaluation, "recommended")),
      blocks: blocksOf(evaluation, "recommended"),
      insights: recommendedInsights(evaluation),
    },
  };
}

export function lotRiskSummaries(lots: ExportLot[], insights: CalendarInsights | null): LotRiskSummary[] {
  return lots.map((lot) =>
    summarizeLotRisk(
      { lotId: lot.id, lotNumber: lot.number },
      (insights?.monthsByLot[lot.id] ?? []).map((month) => month.status),
    ),
  );
}
