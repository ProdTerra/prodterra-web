import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import type { MonthStatus } from "../infrastructure/plansApi";

type MonthStripProps = {
  months: { month: string; status?: MonthStatus }[];
  selectedIndex: number;
  monthName: (monthKey: string) => string;
  shortMonthName: (monthKey: string) => string;
  onSelect: (index: number) => void;
  showsHeader?: boolean;
};

export function MonthStrip({ months, selectedIndex, monthName, shortMonthName, onSelect, showsHeader = true }: MonthStripProps) {
  const translate = useTranslations("calendar");
  const selected = months[selectedIndex];

  return (
    <div className="month-strip">
      {showsHeader && (
      <div className="month-strip__current">
        <button
          type="button"
          aria-label={translate("previousMonth")}
          disabled={selectedIndex === 0}
          onClick={() => onSelect(selectedIndex - 1)}
          className="icon-button icon-button--outline"
        >
          <ChevronLeft aria-hidden size={20} />
        </button>
        <h2 aria-live="polite" className="month-strip__title">
          {selected ? monthName(selected.month) : ""}
        </h2>
        <button
          type="button"
          aria-label={translate("nextMonth")}
          disabled={selectedIndex === months.length - 1}
          onClick={() => onSelect(selectedIndex + 1)}
          className="icon-button icon-button--outline"
        >
          <ChevronRight aria-hidden size={20} />
        </button>
      </div>
      )}
      <div role="tablist" aria-label={translate("monthsLabel")} className="month-strip__chips">
        {months.map((month, index) => (
          <button
            key={month.month}
            type="button"
            role="tab"
            aria-selected={index === selectedIndex}
            aria-label={monthName(month.month)}
            data-status={month.status}
            onClick={() => onSelect(index)}
            className="month-chip"
          >
            {month.status && <span aria-hidden className="month-chip__dot" />}
            {shortMonthName(month.month)}
          </button>
        ))}
      </div>
    </div>
  );
}
