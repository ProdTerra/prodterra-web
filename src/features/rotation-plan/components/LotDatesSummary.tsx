import { useTranslations } from "next-intl";
import type { Lot } from "@/features/farm-mapping/application/farmMappingState";
import type { ScheduledBlock } from "../domain/rotationSchedule";
import { usePlanFormat } from "./usePlanFormat";

type LotDatesSummaryProps = {
  lots: Lot[];
  schedules: Map<string, ScheduledBlock[]>;
  lotName: (lot: Lot) => string;
  blockName: (scheduled: ScheduledBlock) => string;
  blockColor: (scheduled: ScheduledBlock) => string;
};

export function LotDatesSummary({ lots, schedules, lotName, blockName, blockColor }: LotDatesSummaryProps) {
  const translate = useTranslations("rotationPlan.myCalendar");
  const { shortDate } = usePlanFormat();

  return (
    <section aria-labelledby="lot-dates-title" className="lot-dates">
      <h2 id="lot-dates-title" className="lot-dates__title">
        {translate("summaryTitle")}
      </h2>
      {lots.map((lot) => (
        <div key={lot.shapeId} className="lot-dates__lot">
          <h3>
            <span aria-hidden className="lot-badge lot-badge--small" style={{ ["--lot-color" as string]: lot.color }}>
              {lot.number}
            </span>
            {lotName(lot)}
          </h3>
          <ul>
            {(schedules.get(lot.shapeId) ?? []).map((scheduled) => (
              <li key={scheduled.block.id}>
                <span
                  aria-hidden
                  className="crop-legend__swatch"
                  data-use={scheduled.block.kind === "rest" ? "rest" : undefined}
                  style={{ ["--use-color" as string]: blockColor(scheduled) }}
                />
                {translate("summaryItem", {
                  use: blockName(scheduled),
                  start: shortDate(scheduled.startDate),
                  end: shortDate(scheduled.endDate),
                })}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
}
