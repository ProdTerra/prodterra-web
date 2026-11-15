import { Sprout, Wheat } from "lucide-react";
import { useTranslations } from "next-intl";
import type { Lot } from "@/features/farm-mapping/application/farmMappingState";
import { daysInMonth } from "../domain/calendar";
import type { LotPlan, PlanEvent } from "../infrastructure/plansApi";

type LotDayGridProps = {
  lots: Lot[];
  plans: LotPlan[];
  monthKey: string;
  todayKey: string;
  todayDay: number;
  lotName: (lot: Lot) => string;
  cropName: (cropKey: string) => string;
  monthName: (monthKey: string) => string;
  onOpenLot: (lotId: string) => void;
};

const labeledDays = new Set([1, 5, 10, 15, 20, 25]);

function eventOn(plan: LotPlan, monthKey: string, day: number): PlanEvent["kind"] | null {
  return plan.events.find((event) => event.month === monthKey && event.day === day)?.kind ?? null;
}

export function LotDayGrid({ lots, plans, monthKey, todayKey, todayDay, lotName, cropName, monthName, onOpenLot }: LotDayGridProps) {
  const translate = useTranslations("calendar");
  const dayCount = daysInMonth(monthKey);
  const days = Array.from({ length: dayCount }, (_, index) => index + 1);

  return (
    <section aria-label={translate("lotsGridLabel", { month: monthName(monthKey) })} className="day-grid">
      <div className="day-grid__scroll">
        <div className="day-grid__table" style={{ ["--day-count" as string]: dayCount }}>
          <div aria-hidden className="day-grid__header">
            <span className="day-grid__corner" />
            {days.map((day) => (
              <span key={day} className="day-grid__day-number" data-labeled={labeledDays.has(day) || day === dayCount || undefined}>
                {day}
              </span>
            ))}
          </div>
          {lots.map((lot) => {
            const plan = plans.find((candidate) => candidate.lotId === lot.shapeId);
            const planMonth = plan?.months.find((month) => month.month === monthKey);
            const status = planMonth?.status ?? "ok";
            const cropLabel = planMonth?.cropKey
              ? cropName(planMonth.cropKey)
              : translate(planMonth?.phase === "rest" ? "rest" : "free");
            return (
              <button
                key={lot.shapeId}
                type="button"
                onClick={() => onOpenLot(lot.shapeId)}
                aria-label={`${translate("rowSummary", { lot: lotName(lot), crop: cropLabel, status })}. ${translate("openLotPlan", { lot: lotName(lot) })}`}
                className="day-grid__row"
              >
                <span className="day-grid__lot">
                  <span aria-hidden className="lot-badge" style={{ ["--lot-color" as string]: lot.color }}>
                    {lot.number}
                  </span>
                  <span className="day-grid__lot-text">
                    <span className="day-grid__lot-name">{lotName(lot)}</span>
                    <span className="day-grid__lot-crop" data-phase={planMonth?.phase}>
                      {cropLabel}
                    </span>
                  </span>
                </span>
                {days.map((day) => {
                  const event = plan ? eventOn(plan, monthKey, day) : null;
                  return (
                    <span
                      key={day}
                      aria-hidden
                      className="day-cell"
                      data-status={planMonth ? status : undefined}
                      data-today={(monthKey === todayKey && day === todayDay) || undefined}
                    >
                      {event && (event === "sowing" ? <Sprout size={12} /> : <Wheat size={12} />)}
                    </span>
                  );
                })}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
