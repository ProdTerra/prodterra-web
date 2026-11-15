import { useFormatter, useTranslations } from "next-intl";
import { useId } from "react";

type PlantingMonthPickerProps = {
  value: string | null;
  today: Date;
  onChange: (value: string) => void;
};

const yearsBack = 2;
const monthsInYear = 12;

function splitValue(value: string | null): { year: number | null; month: number | null } {
  if (!value) {
    return { year: null, month: null };
  }
  const [year, month] = value.split("-").map(Number);
  return { year, month };
}

function toValue(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, "0")}`;
}

export function PlantingMonthPicker({ value, today, onChange }: PlantingMonthPickerProps) {
  const translate = useTranslations("farmMapping.crops");
  const format = useFormatter();
  const labelId = useId();
  const currentYear = today.getUTCFullYear();
  const currentMonth = today.getUTCMonth() + 1;
  const { year, month } = splitValue(value);
  const selectedYear = year ?? currentYear;
  const years = Array.from({ length: yearsBack + 1 }, (_, index) => currentYear - index);
  const lastMonth = selectedYear === currentYear ? currentMonth : monthsInYear;
  const months = Array.from({ length: lastMonth }, (_, index) => index + 1);
  const monthName = (monthNumber: number) =>
    format.dateTime(new Date(Date.UTC(currentYear, monthNumber - 1, 15)), { month: "long", timeZone: "UTC" });

  function handleYearChange(newYear: number) {
    const latestMonth = newYear === currentYear ? currentMonth : monthsInYear;
    onChange(toValue(newYear, Math.min(month ?? latestMonth, latestMonth)));
  }

  return (
    <fieldset className="question">
      <legend id={labelId} className="question__label">
        {translate("plantedOnQuestion")}
      </legend>
      <div className="month-picker">
        <select
          aria-label={translate("monthLabel")}
          value={month ?? ""}
          onChange={(event) => onChange(toValue(selectedYear, Number(event.target.value)))}
        >
          <option value="" disabled>
            {translate("monthPlaceholder")}
          </option>
          {months.map((monthNumber) => (
            <option key={monthNumber} value={monthNumber}>
              {monthName(monthNumber)}
            </option>
          ))}
        </select>
        <select
          aria-label={translate("yearLabel")}
          value={selectedYear}
          onChange={(event) => handleYearChange(Number(event.target.value))}
        >
          {years.map((yearOption) => (
            <option key={yearOption} value={yearOption}>
              {yearOption}
            </option>
          ))}
        </select>
      </div>
    </fieldset>
  );
}
