import { useState } from "react";
import type { ExportLot } from "../application/buildCalendarExport";
import { lotRiskSummaries, type CalendarExportSource, type CalendarExportSources } from "../application/exportSources";
import { monthsInPeriod, monthsUntilEnd, type ExportPeriod } from "../domain/exportPeriod";
import { preselectLots, toggleLotSelection, type ExportCalendar } from "../domain/lotSelection";

type SelectionState = { calendar: ExportCalendar; period: ExportPeriod; selectedLotIds: string[] };

function sourceOf(sources: CalendarExportSources, calendar: ExportCalendar): CalendarExportSource {
  return calendar === "recommended" && sources.recommended ? sources.recommended : sources.farmer;
}

function initialState(sources: CalendarExportSources, lots: ExportLot[], calendar: ExportCalendar): SelectionState {
  const source = sourceOf(sources, calendar);
  return { calendar, period: { kind: "all" }, selectedLotIds: preselectLots(lotRiskSummaries(lots, source.insights), calendar) };
}

export function useExportSelection(sources: CalendarExportSources, lots: ExportLot[], requestedCalendar: ExportCalendar) {
  const startingCalendar = requestedCalendar === "recommended" && !sources.recommended ? "farmer" : requestedCalendar;
  const [state, setState] = useState(() => initialState(sources, lots, startingCalendar));
  const source = sourceOf(sources, state.calendar);
  const planMonths = source.months;
  const fromMonth = state.period.kind === "range" ? state.period.fromMonth : planMonths[0];
  const toMonth = state.period.kind === "range" ? state.period.toMonth : planMonths[planMonths.length - 1];

  return {
    ...state,
    source,
    planMonths,
    fromMonth,
    toMonth,
    endMonths: monthsUntilEnd(planMonths, fromMonth),
    months: monthsInPeriod(planMonths, state.period),
    selectedLots: lots.filter((lot) => state.selectedLotIds.includes(lot.id)),
    chooseCalendar: (calendar: ExportCalendar) => setState(initialState(sources, lots, calendar)),
    choosePeriodKind: (kind: ExportPeriod["kind"]) =>
      setState((current) => ({ ...current, period: kind === "all" ? { kind } : { kind, fromMonth, toMonth } })),
    chooseFromMonth: (month: string) =>
      setState((current) => ({ ...current, period: { kind: "range", fromMonth: month, toMonth: toMonth < month ? month : toMonth } })),
    chooseToMonth: (month: string) => setState((current) => ({ ...current, period: { kind: "range", fromMonth, toMonth: month } })),
    toggleLot: (lotId: string) => setState((current) => ({ ...current, selectedLotIds: toggleLotSelection(current.selectedLotIds, lotId) })),
  };
}
