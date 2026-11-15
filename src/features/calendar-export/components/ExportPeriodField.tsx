import { useTranslations } from "next-intl";
import { ChoiceChips } from "@/features/rotation-plan/components/ChoiceChips";
import { capitalizeFirstLetter } from "../domain/capitalizeFirstLetter";
import type { ExportPeriod } from "../domain/exportPeriod";

type ExportPeriodFieldProps = {
  periodKind: ExportPeriod["kind"];
  planMonths: string[];
  endMonths: string[];
  fromMonth: string;
  toMonth: string;
  monthCount: number;
  monthTitle: (monthKey: string) => string;
  onChooseKind: (kind: ExportPeriod["kind"]) => void;
  onChooseFrom: (month: string) => void;
  onChooseTo: (month: string) => void;
};

export function ExportPeriodField(props: ExportPeriodFieldProps) {
  const translate = useTranslations("calendarExport.period");

  return (
    <div className="export-dialog__section">
      <ChoiceChips
        label={translate("label")}
        options={[
          { value: "all", label: translate("all") },
          { value: "range", label: translate("range") },
        ]}
        selectedValue={props.periodKind}
        onSelect={(value) => props.onChooseKind(value === "range" ? "range" : "all")}
      />
      {props.periodKind === "range" && (
        <div className="export-dialog__months">
          <label>
            <span>{translate("from")}</span>
            <select value={props.fromMonth} onChange={(event) => props.onChooseFrom(event.target.value)}>
              {props.planMonths.map((month) => (
                <option key={month} value={month}>
                  {capitalizeFirstLetter(props.monthTitle(month))}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>{translate("to")}</span>
            <select value={props.toMonth} onChange={(event) => props.onChooseTo(event.target.value)}>
              {props.endMonths.map((month) => (
                <option key={month} value={month}>
                  {capitalizeFirstLetter(props.monthTitle(month))}
                </option>
              ))}
            </select>
          </label>
        </div>
      )}
      <p className="export-dialog__hint">{translate("pages", { months: props.monthCount })}</p>
    </div>
  );
}
