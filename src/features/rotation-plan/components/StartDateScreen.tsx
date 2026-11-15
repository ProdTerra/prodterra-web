import { ArrowLeft, ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Notice } from "@/shared/components/Notice";
import { firstOfNextMonth, latestStartDate, nextMonday, validateStartDate } from "../domain/planDates";
import { ChoiceChips } from "./ChoiceChips";
import { MonthCalendar } from "./MonthCalendar";
import { usePlanFormat } from "./usePlanFormat";

type StartDateScreenProps = {
  initialDate: string | null;
  today: string;
  onEditLots: () => void;
  onConfirm: (startDate: string) => void;
};

type Rejection = "past" | "tooFar" | "invalidFormat";

export function StartDateScreen({ initialDate, today, onEditLots, onConfirm }: StartDateScreenProps) {
  const translate = useTranslations("rotationPlan.startDate");
  const { longDate, dayMonthYear } = usePlanFormat();
  const latestDate = latestStartDate(today);
  const isInitialValid = initialDate !== null && validateStartDate(initialDate, today).isValid;
  const [selectedDate, setSelectedDate] = useState(isInitialValid ? initialDate : today);
  const [rejection, setRejection] = useState<Rejection | null>(null);
  const [calendarKey, setCalendarKey] = useState(0);
  const quickChoices = [
    { value: today, label: translate("today") },
    { value: nextMonday(today), label: translate("nextMonday") },
    { value: firstOfNextMonth(today), label: translate("nextMonthStart") },
  ];

  function choose(isoDate: string) {
    setSelectedDate(isoDate);
    setRejection(null);
  }

  function chooseQuickly(isoDate: string) {
    choose(isoDate);
    setCalendarKey((current) => current + 1);
  }

  return (
    <div className="start-date">
      <header>
        <h1 className="step-title">{translate("title")}</h1>
        <p className="step-hint">{translate("hint")}</p>
      </header>

      <div className="start-date__body">
        <div className="start-date__summary">
          <ChoiceChips
            label={translate("quickLabel")}
            options={quickChoices}
            selectedValue={quickChoices.find((choice) => choice.value === selectedDate)?.value ?? null}
            onSelect={chooseQuickly}
          />
          <p role="status" className="start-date__chosen">
            {translate.rich("chosen", { date: longDate(selectedDate), strong: (chunks) => <strong>{chunks}</strong> })}
          </p>
          <p className="start-date__range">{translate("range", { latest: dayMonthYear(latestDate) })}</p>
        </div>

        <div className="start-date__calendar">
          <MonthCalendar
            key={calendarKey}
            selectedDate={selectedDate}
            today={today}
            latestDate={latestDate}
            onSelect={choose}
            onReject={setRejection}
          />
          {rejection && (
            <Notice tone="warning" title={translate("unavailableTitle")}>
              {rejection === "past" ? translate("pastDay") : translate("tooFarDay", { latest: dayMonthYear(latestDate) })}
            </Notice>
          )}
        </div>
      </div>

      <div className="plan-footer plan-footer--sticky">
        <button type="button" onClick={onEditLots} className="button button--secondary">
          <ArrowLeft aria-hidden size={18} />
          {translate("editLots")}
        </button>
        <button type="button" onClick={() => onConfirm(selectedDate)} className="button button--primary">
          {translate("continue")}
          <ArrowRight aria-hidden size={18} />
        </button>
      </div>
    </div>
  );
}
