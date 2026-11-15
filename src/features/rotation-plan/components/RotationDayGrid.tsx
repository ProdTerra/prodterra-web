import { Sprout, Wheat } from "lucide-react";
import { useTranslations } from "next-intl";
import type { Lot } from "@/features/farm-mapping/application/farmMappingState";
import { dayUsesForMonth, daysInMonth, type DayUse, type ScheduledBlock } from "../domain/rotationSchedule";

type RotationDayGridProps = {
  lots: Lot[];
  schedules: Map<string, ScheduledBlock[]>;
  monthKey: string;
  monthTitle: string;
  today: string;
  cropColors: Map<string, string>;
  lotName: (lot: Lot) => string;
  dayUseName: (use: DayUse) => string;
  list: (items: string[]) => string;
};

const labeledDays = new Set([1, 5, 10, 15, 20, 25]);

function dayUseKey(use: DayUse): string {
  return use.kind === "crop" ? use.cropKey : "rest";
}

export function RotationDayGrid({ lots, schedules, monthKey, monthTitle, today, cropColors, lotName, dayUseName, list }: RotationDayGridProps) {
  const translate = useTranslations("rotationPlan.myCalendar");

  const dayCount = daysInMonth(monthKey);
  const dayNumbers = Array.from({ length: dayCount }, (_, index) => index + 1);

  return (
    <section aria-label={translate("gridLabel", { month: monthTitle })} className="day-grid">
      <div className="day-grid__scroll">
        <div className="day-grid__table" style={{ ["--day-count" as string]: dayCount }}>
          <div aria-hidden className="day-grid__header">
            <span className="day-grid__corner" />
            {dayNumbers.map((day) => (
              <span key={day} className="day-grid__day-number" data-labeled={labeledDays.has(day) || day === dayCount || undefined}>
                {day}
              </span>
            ))}
          </div>
          {lots.map((lot) => {
            const days = dayUsesForMonth(schedules.get(lot.shapeId) ?? [], monthKey);
            const uses = [...new Map(days.flatMap((day) => (day.use ? [[dayUseKey(day.use), day.use] as const] : []))).values()];
            const usesText = uses.length > 0 ? list(uses.map(dayUseName)) : translate("noPlan");
            return (
              <div key={lot.shapeId} role="group" aria-label={translate("rowSummary", { lot: lotName(lot), uses: usesText })} className="day-grid__row">
                <span className="day-grid__lot">
                  <span aria-hidden className="lot-badge" style={{ ["--lot-color" as string]: lot.color }}>
                    {lot.number}
                  </span>
                  <span className="day-grid__lot-text">
                    <span className="day-grid__lot-name">{lotName(lot)}</span>
                    <span className="day-grid__lot-crop">{usesText}</span>
                  </span>
                </span>
                {days.map(({ day, use, marker }) => (
                  <span
                    key={day}
                    aria-hidden
                    className="day-cell"
                    data-use={use?.kind ?? "empty"}
                    data-today={`${monthKey}-${String(day).padStart(2, "0")}` === today || undefined}
                    style={use?.kind === "crop" ? { ["--use-color" as string]: cropColors.get(use.cropKey) } : undefined}
                  >
                    {marker === "sowing" && <Sprout size={12} />}
                    {marker === "harvest" && <Wheat size={12} />}
                  </span>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
