import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { mondayFirstOffset, monthDates, shiftMonth } from "../domain/monthGrid";
import { addDays, validateStartDate, type StartDateValidation } from "../domain/planDates";
import { monthKeyOf } from "../domain/rotationSchedule";
import { usePlanFormat } from "./usePlanFormat";

type RejectedReason = Extract<StartDateValidation, { isValid: false }>["reason"];

type MonthCalendarProps = {
  selectedDate: string;
  today: string;
  latestDate: string;
  onSelect: (isoDate: string) => void;
  onReject: (reason: RejectedReason) => void;
};

const daysByKey: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
const firstWeekMonday = "2026-11-16";

function clampDate(isoDate: string, earliest: string, latest: string): string {
  if (isoDate < earliest) {
    return earliest;
  }
  return isoDate > latest ? latest : isoDate;
}

export function MonthCalendar({ selectedDate, today, latestDate, onSelect, onReject }: MonthCalendarProps) {
  const translate = useTranslations("rotationPlan.startDate");
  const { monthTitle, longDate, weekdayShort } = usePlanFormat();
  const [focusedDate, setFocusedDate] = useState(selectedDate);
  const [visibleMonth, setVisibleMonth] = useState(monthKeyOf(selectedDate));
  const gridRef = useRef<HTMLDivElement>(null);
  const shouldMoveFocus = useRef(false);
  const weekdays = Array.from({ length: 7 }, (_, index) => weekdayShort(addDays(firstWeekMonday, index)));
  const dates = monthDates(visibleMonth);
  const tabbableDate = monthKeyOf(focusedDate) === visibleMonth ? focusedDate : dates.find((date) => date >= today) ?? dates[0];

  useEffect(() => {
    if (shouldMoveFocus.current) {
      shouldMoveFocus.current = false;
      gridRef.current?.querySelector<HTMLButtonElement>(`[data-date="${focusedDate}"]`)?.focus();
    }
  }, [focusedDate]);

  function moveFocus(isoDate: string) {
    const next = clampDate(isoDate, today, latestDate);
    shouldMoveFocus.current = true;
    setFocusedDate(next);
    setVisibleMonth(monthKeyOf(next));
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key in daysByKey) {
      event.preventDefault();
      moveFocus(addDays(focusedDate, daysByKey[event.key]));
    } else if (event.key === "PageUp" || event.key === "PageDown") {
      event.preventDefault();
      const monthShift = event.key === "PageUp" ? -1 : 1;
      moveFocus(`${shiftMonth(monthKeyOf(focusedDate), monthShift)}-${focusedDate.slice(8, 10) > "28" ? "28" : focusedDate.slice(8, 10)}`);
    }
  }

  function handleDayClick(isoDate: string) {
    const validation = validateStartDate(isoDate, today);
    setFocusedDate(isoDate);
    if (validation.isValid) {
      onSelect(isoDate);
    } else {
      onReject(validation.reason);
    }
  }

  return (
    <div className="month-calendar">
      <div className="month-calendar__header">
        <button
          type="button"
          aria-label={translate("previousMonth")}
          disabled={visibleMonth <= monthKeyOf(today)}
          onClick={() => setVisibleMonth(shiftMonth(visibleMonth, -1))}
          className="icon-button icon-button--outline"
        >
          <ChevronLeft aria-hidden size={20} />
        </button>
        <h2 aria-live="polite" className="month-calendar__title">
          {monthTitle(visibleMonth)}
        </h2>
        <button
          type="button"
          aria-label={translate("nextMonth")}
          disabled={visibleMonth >= monthKeyOf(latestDate)}
          onClick={() => setVisibleMonth(shiftMonth(visibleMonth, 1))}
          className="icon-button icon-button--outline"
        >
          <ChevronRight aria-hidden size={20} />
        </button>
      </div>
      <div aria-hidden className="month-calendar__weekdays">
        {weekdays.map((weekday) => (
          <span key={weekday}>{weekday}</span>
        ))}
      </div>
      <div ref={gridRef} role="group" aria-label={translate("calendarLabel")} onKeyDown={handleKeyDown} className="month-calendar__days">
        {dates.map((isoDate, index) => {
          const isAvailable = validateStartDate(isoDate, today).isValid;
          return (
            <button
              key={isoDate}
              type="button"
              data-date={isoDate}
              tabIndex={isoDate === tabbableDate ? 0 : -1}
              aria-pressed={isoDate === selectedDate}
              aria-disabled={!isAvailable || undefined}
              aria-label={isAvailable ? longDate(isoDate) : translate("unavailableDay", { date: longDate(isoDate) })}
              aria-current={isoDate === today ? "date" : undefined}
              onClick={() => handleDayClick(isoDate)}
              className="month-calendar__day"
              style={index === 0 ? { gridColumnStart: mondayFirstOffset(visibleMonth) + 1 } : undefined}
            >
              {Number(isoDate.slice(8, 10))}
            </button>
          );
        })}
      </div>
    </div>
  );
}
