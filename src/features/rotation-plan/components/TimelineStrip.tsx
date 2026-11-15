"use client";

import { useFormatter, useTranslations } from "next-intl";
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

const averageDaysPerMonth = 30.44;
const shortestSpanInMonths = 12;

function monthTick(startDate: string, monthsAhead: number): Date {
  const start = fromIsoDate(startDate);
  return new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + monthsAhead, 1));
}

function tickStepInMonths(spanInMonths: number): number {
  if (spanInMonths <= 24) {
    return 6;
  }
  return spanInMonths <= 60 ? 12 : 24;
}

export function stripSpanInMonths(usedDays: number): number {
  const usedMonths = usedDays / averageDaysPerMonth;
  const step = tickStepInMonths(Math.max(shortestSpanInMonths, usedMonths));
  return Math.max(shortestSpanInMonths, Math.ceil(usedMonths / step) * step);
}

export function TimelineStrip({ startDate, schedule, selectedBlockId, blockName, blockColor, onSelect }: TimelineStripProps) {
  const translate = useTranslations("rotationPlan.rotation");
  const format = useFormatter();
  const usedDays = schedule.reduce((sum, item) => sum + item.block.durationInDays, 0);
  const spanInMonths = stripSpanInMonths(usedDays);
  const spanInDays = spanInMonths * averageDaysPerMonth;
  const step = tickStepInMonths(spanInMonths);
  const ticks = Array.from({ length: spanInMonths / step + 1 }, (_, index) => index * step);
  const tickLabel = (months: number) =>
    months === 0
      ? translate("axisStart")
      : months % 12 === 0
        ? translate("axisYears", { years: months / 12 })
        : translate("axisMonths", { months });

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
          {usedDays < spanInDays && (
            <span aria-hidden className="timeline-strip__free" style={{ flexGrow: spanInDays - usedDays }} />
          )}
        </div>
        <div aria-hidden className="timeline-strip__ticks">
          {ticks.map((months) => (
            <span key={months} style={{ left: `${(months / spanInMonths) * 100}%` }} />
          ))}
        </div>
      </div>
      <div aria-hidden className="timeline-strip__axis">
        {ticks.map((months) => (
          <span key={months} style={{ left: `${(months / spanInMonths) * 100}%` }}>
            <strong>{tickLabel(months)}</strong>
            {format.dateTime(monthTick(startDate, months), { month: "short", year: "numeric", timeZone: "UTC" })}
          </span>
        ))}
      </div>
    </figure>
  );
}
