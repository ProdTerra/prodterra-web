"use client";

import { useFormatter, useTranslations } from "next-intl";
import { maximumPlanDays } from "../domain/blockLimits";
import { fromIsoDate } from "../domain/planDates";
import type { ScheduledBlock } from "../domain/rotationSchedule";

type TimelineStripProps = {
  startDate: string;
  schedule: ScheduledBlock[];
  selectedBlockId: string | null;
  blockName: (scheduled: ScheduledBlock) => string;
  blockColor: (scheduled: ScheduledBlock) => string;
  onSelect: (blockId: string) => void;
};

const monthsBetweenTicks = 6;
const totalMonths = 24;

function monthTick(startDate: string, monthsAhead: number): Date {
  const start = fromIsoDate(startDate);
  return new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + monthsAhead, 1));
}

export function TimelineStrip({ startDate, schedule, selectedBlockId, blockName, blockColor, onSelect }: TimelineStripProps) {
  const translate = useTranslations("rotationPlan.rotation");
  const format = useFormatter();
  const usedDays = schedule.reduce((sum, item) => sum + item.block.durationInDays, 0);
  const ticks = Array.from({ length: totalMonths / monthsBetweenTicks + 1 }, (_, index) => index * monthsBetweenTicks);

  return (
    <figure className="timeline-strip">
      <figcaption className="timeline-strip__caption">{translate("stripCaption")}</figcaption>
      <div className="timeline-strip__track">
        <div className="timeline-strip__bar">
          {schedule.map((scheduled) => (
            <button
              key={scheduled.block.id}
              type="button"
              aria-label={translate("stripBlock", { name: blockName(scheduled) })}
              aria-pressed={scheduled.block.id === selectedBlockId}
              onClick={() => onSelect(scheduled.block.id)}
              className="timeline-strip__segment"
              data-kind={scheduled.block.kind}
              style={{ ["--block-color" as string]: blockColor(scheduled), flexGrow: scheduled.block.durationInDays }}
            >
              <span aria-hidden>{blockName(scheduled)}</span>
            </button>
          ))}
          {usedDays < maximumPlanDays && (
            <span aria-hidden className="timeline-strip__free" style={{ flexGrow: maximumPlanDays - usedDays }} />
          )}
        </div>
        <div aria-hidden className="timeline-strip__ticks">
          {ticks.map((months) => (
            <span key={months} style={{ left: `${(months / totalMonths) * 100}%` }} />
          ))}
        </div>
      </div>
      <div aria-hidden className="timeline-strip__axis">
        {ticks.map((months) => (
          <span key={months} style={{ left: `${(months / totalMonths) * 100}%` }}>
            <strong>{translate("axisMark", { months })}</strong>
            {format.dateTime(monthTick(startDate, months), { month: "short", year: "numeric", timeZone: "UTC" })}
          </span>
        ))}
      </div>
    </figure>
  );
}
