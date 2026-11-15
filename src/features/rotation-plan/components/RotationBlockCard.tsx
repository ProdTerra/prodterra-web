"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ChevronDown, CirclePause, GripVertical, RotateCcw, Sprout } from "lucide-react";
import { useTranslations } from "next-intl";
import { useId } from "react";
import type { ScheduledBlock } from "../domain/rotationSchedule";
import { BlockActionsMenu } from "./BlockActionsMenu";
import { DurationField } from "./DurationField";
import { usePlanFormat } from "./usePlanFormat";

const restPresetsInDays = [3, 7, 14, 30];

type RotationBlockCardProps = {
  scheduled: ScheduledBlock;
  name: string;
  color: string;
  referenceInDays: number | null;
  longestInDays: number;
  isExpanded: boolean;
  isFirst: boolean;
  isLast: boolean;
  canDuplicate: boolean;
  onToggle: () => void;
  onDurationChange: (durationInDays: number) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDuplicate: () => void;
  onRemove: () => void;
};

export function RotationBlockCard(props: RotationBlockCardProps) {
  const { scheduled, name, color, referenceInDays, isExpanded } = props;
  const translate = useTranslations("rotationPlan.rotation");
  const { shortDate } = usePlanFormat();
  const editorId = useId();
  const { block } = scheduled;
  const isCrop = block.kind === "crop";
  const isChanged = isCrop && referenceInDays !== null && referenceInDays !== block.durationInDays;
  const Icon = isCrop ? Sprout : CirclePause;
  const days = (count: number) => translate("dayCount", { days: count });
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id });
  const dates = { start: shortDate(scheduled.startDate), end: shortDate(scheduled.endDate) };

  return (
    <li
      ref={setNodeRef}
      id={`block-${block.id}`}
      className="rotation-block"
      data-kind={block.kind}
      data-expanded={isExpanded || undefined}
      data-dragging={isDragging || undefined}
      style={{
        ["--block-color" as string]: color,
        transform: CSS.Translate.toString(transform),
        transition: transition,
      }}
    >
      <div className="rotation-block__head">
        <button
          type="button"
          {...attributes}
          {...listeners}
          aria-label={translate("dragBlock", { name })}
          className="icon-button rotation-block__handle"
        >
          <GripVertical aria-hidden size={18} />
        </button>
        <button type="button" aria-expanded={isExpanded} aria-controls={editorId} onClick={props.onToggle} className="rotation-block__summary">
          <span aria-hidden className="rotation-block__marker">
            <Icon size={16} />
          </span>
          <span className="rotation-block__text">
            <span className="rotation-block__title">
              <strong>{name}</strong>
              <span className="rotation-block__duration">{days(block.durationInDays)}</span>
            </span>
            <span>{translate(isCrop ? "cropDates" : "restDates", dates)}</span>
          </span>
          <ChevronDown aria-hidden size={18} className="rotation-block__chevron" />
        </button>
        <BlockActionsMenu
          name={name}
          canMoveUp={!props.isFirst}
          canMoveDown={!props.isLast}
          canDuplicate={props.canDuplicate}
          onMoveUp={props.onMoveUp}
          onMoveDown={props.onMoveDown}
          onDuplicate={props.onDuplicate}
          onRemove={props.onRemove}
        />
      </div>
      {isExpanded && (
        <div id={editorId} className="rotation-block__editor">
          <DurationField
            name={name}
            question={translate(isCrop ? "cropDurationQuestion" : "restDurationQuestion")}
            durationInDays={block.durationInDays}
            startDate={scheduled.startDate}
            longestInDays={props.longestInDays}
            onChange={props.onDurationChange}
            action={
              isChanged && (
                <button type="button" onClick={() => props.onDurationChange(Math.min(referenceInDays, props.longestInDays))} className="button button--secondary button--small">
                  <RotateCcw aria-hidden size={16} />
                  {translate("useUsual", { duration: days(referenceInDays) })}
                </button>
              )
            }
          />
          {!isCrop && (
            <div className="chip-row">
              {restPresetsInDays.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  aria-pressed={block.durationInDays === preset}
                  disabled={preset > props.longestInDays}
                  onClick={() => props.onDurationChange(preset)}
                  className="chip"
                >
                  {days(preset)}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </li>
  );
}
