import { CirclePause, Minus, Plus, RotateCcw, Sprout, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { daysPerStep, longestDurationFor, minimumBlockDays } from "../domain/blockLimits";
import type { RotationBlock } from "../domain/rotationPlan";
import type { ScheduledBlock } from "../domain/rotationSchedule";
import { useDurationLabels } from "./useDurationLabels";
import { usePlanFormat } from "./usePlanFormat";

type RotationBlockCardProps = {
  scheduled: ScheduledBlock;
  blocks: RotationBlock[];
  name: string;
  color: string;
  referenceInDays: number | null;
  onDurationChange: (durationInDays: number) => void;
  onReset: (referenceInDays: number) => void;
  onRemove: () => void;
};

export function RotationBlockCard({ scheduled, blocks, name, color, referenceInDays, onDurationChange, onReset, onRemove }: RotationBlockCardProps) {
  const translate = useTranslations("rotationPlan.rotation");
  const { shortDate } = usePlanFormat();
  const durationLabels = useDurationLabels();
  const { block } = scheduled;
  const isCrop = block.kind === "crop";
  const isAtMinimum = block.durationInDays <= minimumBlockDays;
  const isAtMaximum = block.durationInDays >= longestDurationFor(blocks, block.id);
  const isChanged = isCrop && referenceInDays !== null && referenceInDays !== block.durationInDays;
  const Icon = isCrop ? Sprout : CirclePause;

  return (
    <li className="rotation-block" data-kind={block.kind} style={{ ["--block-color" as string]: color }}>
      <span aria-hidden className="rotation-block__marker">
        <Icon size={16} />
      </span>
      <div className="rotation-block__body">
        <div className="rotation-block__head">
          <div className="rotation-block__title">
            <h4>{name}</h4>
            {isCrop && referenceInDays !== null && (
              <span className="rotation-block__badge" data-changed={isChanged || undefined}>
                {isChanged ? translate("changed") : translate("reference")}
              </span>
            )}
          </div>
          <button type="button" onClick={onRemove} aria-label={translate("removeBlock", { name })} className="icon-button">
            <Trash2 aria-hidden size={18} />
          </button>
        </div>
        <p className="rotation-block__dates">
          {translate("dates", { start: shortDate(scheduled.startDate), end: shortDate(scheduled.endDate) })}
        </p>
        <div className="rotation-block__duration">
          <div role="group" aria-label={translate("durationLabel", { name })} className="stepper">
            <button
              type="button"
              aria-label={translate("shorter")}
              disabled={isAtMinimum}
              onClick={() => onDurationChange(block.durationInDays - daysPerStep)}
              className="icon-button"
            >
              <Minus aria-hidden size={18} />
            </button>
            <span aria-live="polite" className="rotation-block__weeks">
              {durationLabels.weeks(block.durationInDays)}
            </span>
            <button
              type="button"
              aria-label={translate("longer")}
              disabled={isAtMaximum}
              onClick={() => onDurationChange(block.durationInDays + daysPerStep)}
              className="icon-button"
            >
              <Plus aria-hidden size={18} />
            </button>
          </div>
          <span className="rotation-block__months">{durationLabels.months(block.durationInDays)}</span>
          {isChanged && (
            <button type="button" onClick={() => onReset(referenceInDays)} className="button button--secondary button--small">
              <RotateCcw aria-hidden size={16} />
              {translate("resetDuration")}
            </button>
          )}
        </div>
        {isAtMinimum && <p className="field-hint">{translate("minimumReached")}</p>}
        {isAtMaximum && <p className="field-hint">{translate("maximumReached")}</p>}
      </div>
    </li>
  );
}
