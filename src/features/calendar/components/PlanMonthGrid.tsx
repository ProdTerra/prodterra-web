"use client";

import { Sprout, Wheat } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import type { LaneStatus } from "../domain/laneStatus";
import { segmentsInWeek, weeksOfMonth, type GridBlock, type GridLane } from "../domain/monthGrid";
import { statusIcons } from "./statusIcons";

export type GridLot = { id: string; number: number; name: string; color: string };

type PlanMonthGridProps = {
  monthKey: string;
  lanes: GridLane[];
  blocks: GridBlock[];
  today: string;
  selectedDate: string | null;
  isSingleLot: boolean;
  showsMarkers?: boolean;
  laneStatuses?: Record<string, LaneStatus>;
  blockName: (block: GridBlock) => string;
  blockColor: (block: GridBlock) => string;
  onSelectDate: (date: string) => void;
};

const weekdayReference = ["2024-01-01", "2024-01-02", "2024-01-03", "2024-01-04", "2024-01-05", "2024-01-06", "2024-01-07"];

function LaneStatusBadge({ laneStatus }: { laneStatus: LaneStatus }) {
  const translate = useTranslations("calendar.grid");
  const translateStatus = useTranslations("calendar.insights.status");
  const StatusIcon = statusIcons[laneStatus.status];
  return (
    <span
      className="lane-status"
      data-status={laneStatus.status}
      title={translate("laneStatus", { status: translateStatus(laneStatus.status), count: laneStatus.alarmCount })}
    >
      <StatusIcon size={12} />
      {laneStatus.alarmCount > 0 && laneStatus.alarmCount}
    </span>
  );
}

export function PlanMonthGrid(props: PlanMonthGridProps) {
  const { monthKey, lanes, blocks, today, selectedDate, isSingleLot, laneStatuses } = props;
  const hasLotNumbers = lanes.some((lane) => lane.lotNumber !== undefined);
  const showsLaneStatuses = !isSingleLot && laneStatuses !== undefined && lanes.some((lane) => laneStatuses[lane.id]);
  const showsLaneBadges = !isSingleLot && (hasLotNumbers || showsLaneStatuses);
  const translate = useTranslations("calendar.grid");
  const format = useFormatter();
  const weeks = weeksOfMonth(monthKey);
  const dayLabel = (date: string) =>
    format.dateTime(new Date(`${date}T00:00:00Z`), { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" });

  return (
    <div
      className="plan-grid"
      data-single-lot={isSingleLot || undefined}
      data-badges={showsLaneBadges || undefined}
      data-statuses={showsLaneStatuses || undefined}
      data-status-only={(showsLaneStatuses && !hasLotNumbers) || undefined}
      style={{ ["--lane-count" as string]: Math.max(lanes.length, 1) }}
    >
      <div className="plan-grid__weekdays" aria-hidden>
        {showsLaneBadges && <span />}
        {weekdayReference.map((date) => (
          <span key={date}>{format.dateTime(new Date(`${date}T00:00:00Z`), { weekday: "short", timeZone: "UTC" })}</span>
        ))}
      </div>
      {weeks.map((week) => {
        const weekLanes = lanes.map((lane) => segmentsInWeek(blocks.filter((block) => block.lotId === lane.id), week));
        return (
          <div key={week[0]} className="plan-grid__week">
            {showsLaneBadges && (
              <div className="plan-grid__lane-labels" aria-hidden>
                {lanes.map((lane) => (
                  <span key={lane.id} className="plan-grid__lane-label">
                    {lane.lotNumber !== undefined && (
                      <span className="lot-badge lot-badge--small" style={{ ["--lot-color" as string]: lane.lotColor }}>
                        {lane.lotNumber}
                      </span>
                    )}
                    {showsLaneStatuses && laneStatuses?.[lane.id] && <LaneStatusBadge laneStatus={laneStatuses[lane.id]} />}
                  </span>
                ))}
              </div>
            )}
            <div className="plan-grid__days">
              {week.map((date) => {
                const isOutside = !date.startsWith(monthKey);
                return (
                  <button
                    key={date}
                    type="button"
                    onClick={() => props.onSelectDate(date)}
                    aria-pressed={selectedDate === date}
                    aria-label={dayLabel(date)}
                    className="plan-grid__day"
                    data-outside={isOutside || undefined}
                    data-today={date === today || undefined}
                  >
                    <span className="plan-grid__day-number">{Number(date.slice(8, 10))}</span>
                  </button>
                );
              })}
              <div className="plan-grid__lanes" aria-hidden>
                {weekLanes.flatMap((segments, laneIndex) =>
                  segments.map(({ block, firstColumn, lastColumn, startsInWeek, endsInWeek }) => {
                    const showsLabel = startsInWeek || firstColumn === 0;
                    return (
                      <span
                        key={`${block.id}-${week[0]}`}
                        className="plan-grid__bar"
                        data-kind={block.kind}
                        data-starts={startsInWeek || undefined}
                        data-ends={endsInWeek || undefined}
                        style={{
                          gridColumn: `${firstColumn + 1} / ${lastColumn + 2}`,
                          gridRow: laneIndex + 1,
                          ["--bar-color" as string]: props.blockColor(block),
                        }}
                      >
                        {showsLabel && <span className="plan-grid__bar-label">{props.blockName(block)}</span>}
                      </span>
                    );
                  }),
                )}
                {props.showsMarkers !== false &&
                  weekLanes.flatMap((segments, laneIndex) =>
                  segments.flatMap(({ block, firstColumn, lastColumn, startsInWeek, endsInWeek }) =>
                    block.kind === "crop"
                      ? [
                          ...(startsInWeek ? [{ column: firstColumn, kind: "sowing" as const }] : []),
                          ...(endsInWeek ? [{ column: lastColumn, kind: "harvest" as const }] : []),
                        ].map((marker) => (
                          <span
                            key={`${block.id}-${marker.kind}`}
                            className="plan-grid__marker"
                            data-kind={marker.kind}
                            title={translate(marker.kind)}
                            style={{ gridColumn: marker.column + 1, gridRow: laneIndex + 1 }}
                          >
                            {marker.kind === "sowing" ? <Sprout size={12} /> : <Wheat size={12} />}
                          </span>
                        ))
                      : [],
                  ),
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
