"use client";

import { Sprout, Wheat } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import type { GridBlock } from "../domain/monthGrid";
import type { GridLot } from "./PlanMonthGrid";

const millisecondsPerDay = 86_400_000;

function daysBetween(fromDate: string, toDate: string): number {
  return Math.round((Date.parse(`${toDate}T00:00:00Z`) - Date.parse(`${fromDate}T00:00:00Z`)) / millisecondsPerDay);
}

type DayDetailProps = {
  date: string | null;
  lots: GridLot[];
  blocks: GridBlock[];
  blockName: (block: GridBlock) => string;
  blockColor: (block: GridBlock) => string;
};

export function DayDetail({ date, lots, blocks, blockName, blockColor }: DayDetailProps) {
  const translate = useTranslations("calendar.grid");
  const format = useFormatter();

  if (!date) {
    return <p className="day-detail__empty">{translate("pickDay")}</p>;
  }

  return (
    <section className="day-detail" aria-labelledby="day-detail-title">
      <h3 id="day-detail-title" className="day-detail__title">
        {format.dateTime(new Date(`${date}T00:00:00Z`), { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" })}
      </h3>
      <ul className="day-detail__lots">
        {lots.map((lot) => {
          const block = blocks.find((candidate) => candidate.lotId === lot.id && candidate.startDate <= date && candidate.endDate >= date);
          const day = block ? daysBetween(block.startDate, date) + 1 : 0;
          const total = block ? daysBetween(block.startDate, block.endDate) + 1 : 0;
          return (
            <li key={lot.id} className="day-detail__lot">
              <span aria-hidden className="lot-badge lot-badge--small" style={{ ["--lot-color" as string]: lot.color }}>
                {lot.number}
              </span>
              <span className="day-detail__text">
                <strong>{lot.name}</strong>
                {block ? (
                  <span>
                    <span aria-hidden className="day-detail__swatch" data-kind={block.kind} style={{ ["--bar-color" as string]: blockColor(block) }} />
                    {translate("dayOfBlock", { name: blockName(block), day, total })}
                  </span>
                ) : (
                  <span>{translate("free")}</span>
                )}
                {block?.kind === "crop" && block.startDate === date && (
                  <span className="day-detail__event">
                    <Sprout aria-hidden size={14} />
                    {translate("sowingToday")}
                  </span>
                )}
                {block?.kind === "crop" && block.endDate === date && (
                  <span className="day-detail__event">
                    <Wheat aria-hidden size={14} />
                    {translate("harvestToday")}
                  </span>
                )}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
