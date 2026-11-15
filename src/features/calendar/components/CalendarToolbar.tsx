"use client";

import { ChevronLeft, ChevronRight, Flag } from "lucide-react";
import { useTranslations } from "next-intl";
import { useId } from "react";
import type { GridLot } from "./PlanMonthGrid";

type CalendarToolbarProps = {
  monthTitle: string;
  canGoBack: boolean;
  canGoForward: boolean;
  lots: GridLot[];
  selectedLotId: string | null;
  showsAllLotsOption: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onGoToStart: () => void;
  onSelectLot: (lotId: string | null) => void;
};

const allLotsValue = "all";

export function CalendarToolbar(props: CalendarToolbarProps) {
  const translate = useTranslations("calendar.grid");
  const selectId = useId();

  return (
    <div className="calendar-toolbar">
      <div className="calendar-toolbar__month">
        <button type="button" onClick={props.onPrevious} disabled={!props.canGoBack} aria-label={translate("previousMonth")} className="icon-button">
          <ChevronLeft aria-hidden size={20} />
        </button>
        <h2 aria-live="polite" className="calendar-toolbar__title">
          {props.monthTitle}
        </h2>
        <button type="button" onClick={props.onNext} disabled={!props.canGoForward} aria-label={translate("nextMonth")} className="icon-button">
          <ChevronRight aria-hidden size={20} />
        </button>
        <button type="button" onClick={props.onGoToStart} className="button button--secondary button--small">
          <Flag aria-hidden size={16} />
          {translate("planStart")}
        </button>
      </div>
      <label htmlFor={selectId} className="calendar-toolbar__lot">
        <span>{translate("lotFilter")}</span>
        <select
          id={selectId}
          value={props.selectedLotId ?? allLotsValue}
          onChange={(event) => props.onSelectLot(event.target.value === allLotsValue ? null : event.target.value)}
        >
          {props.showsAllLotsOption && <option value={allLotsValue}>{translate("allLots")}</option>}
          {props.lots.map((lot) => (
            <option key={lot.id} value={lot.id}>
              {lot.name}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
