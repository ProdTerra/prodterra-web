"use client";

import { useTranslations } from "next-intl";
import { maximumPlanDays } from "../domain/blockLimits";
import type { ScheduledBlock } from "../domain/rotationSchedule";

type TimelineStripProps = {
  schedule: ScheduledBlock[];
  selectedBlockId: string | null;
  blockName: (scheduled: ScheduledBlock) => string;
  blockColor: (scheduled: ScheduledBlock) => string;
  remainingLabel: string;
  onSelect: (blockId: string) => void;
};

export function TimelineStrip({ schedule, selectedBlockId, blockName, blockColor, remainingLabel, onSelect }: TimelineStripProps) {
  const translate = useTranslations("rotationPlan.rotation");

  return (
    <div className="timeline-strip">
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
            style={{
              ["--block-color" as string]: blockColor(scheduled),
              flexGrow: scheduled.block.durationInDays,
            }}
          />
        ))}
        <span aria-hidden className="timeline-strip__free" style={{ flexGrow: Math.max(0, maximumPlanDays - schedule.reduce((sum, item) => sum + item.block.durationInDays, 0)) }} />
      </div>
      <p className="timeline-strip__remaining">{remainingLabel}</p>
    </div>
  );
}
