import { useTranslations } from "next-intl";
import type { Dispatch } from "react";
import type { RotationPlanAction } from "../application/rotationPlanState";
import { restBlockColor } from "../domain/cropColors";
import { canAddBlock, maximumPlanDays, totalDays } from "../domain/blockLimits";
import type { LotRotation, PreviousUse } from "../domain/rotationPlan";
import { scheduleBlocks } from "../domain/rotationSchedule";
import { AddBlockControls } from "./AddBlockControls";
import { ChoiceChips, type ChoiceOption } from "./ChoiceChips";
import { RotationBlockCard } from "./RotationBlockCard";
import { useDurationLabels } from "./useDurationLabels";
import type { useCropNames } from "./useCropNames";

type LotRotationEditorProps = {
  lotId: string;
  rotation: LotRotation;
  startDate: string;
  cropNames: ReturnType<typeof useCropNames>;
  cropColors: Map<string, string>;
  dispatch: Dispatch<RotationPlanAction>;
};

const restValue = "fallow";
const unknownValue = "unknown";
const yesValue = "yes";
const noValue = "no";

function toPreviousUse(value: string): PreviousUse {
  if (value === restValue || value === unknownValue) {
    return { kind: value };
  }
  return { kind: "crop", cropKey: value };
}

function previousUseValue(previousUse: PreviousUse | null): string | null {
  if (!previousUse) {
    return null;
  }
  return previousUse.kind === "crop" ? previousUse.cropKey : previousUse.kind;
}

export function LotRotationEditor({ lotId, rotation, startDate, cropNames, cropColors, dispatch }: LotRotationEditorProps) {
  const translate = useTranslations("rotationPlan.rotation");
  const durationLabels = useDurationLabels();
  const cropOptions: ChoiceOption[] = cropNames.crops.map((crop) => ({ value: crop.key, label: cropNames.localized(crop) }));
  const schedule = scheduleBlocks(startDate, rotation.blocks);
  const usedDays = totalDays(rotation.blocks);

  return (
    <div className="rotation-editor">
      <ChoiceChips
        label={translate("previousQuestion")}
        options={[...cropOptions, { value: restValue, label: translate("rest") }, { value: unknownValue, label: translate("unknown") }]}
        selectedValue={previousUseValue(rotation.previousUse)}
        onSelect={(value) => dispatch({ type: "previousUseChosen", lotId, previousUse: toPreviousUse(value) })}
      />
      <ChoiceChips
        label={translate("irrigationQuestion")}
        options={[
          { value: yesValue, label: translate("yes") },
          { value: noValue, label: translate("no") },
        ]}
        selectedValue={rotation.hasIrrigation === null ? null : rotation.hasIrrigation ? yesValue : noValue}
        onSelect={(value) => dispatch({ type: "irrigationChosen", lotId, hasIrrigation: value === yesValue })}
      />

      <section className="rotation-timeline" aria-labelledby={`${lotId}-timeline`}>
        <h3 id={`${lotId}-timeline`} className="question__label">
          {translate("timelineTitle")}
        </h3>
        <p className="field-hint">{translate("timelineHint")}</p>
        {rotation.blocks.length === 0 ? (
          <p className="rotation-timeline__empty">{translate("timelineEmpty")}</p>
        ) : (
          <ol className="rotation-timeline__blocks">
            {schedule.map((scheduled) => {
              const { block } = scheduled;
              const isCrop = block.kind === "crop";
              return (
                <RotationBlockCard
                  key={block.id}
                  scheduled={scheduled}
                  blocks={rotation.blocks}
                  name={isCrop ? cropNames.cropName(block.cropKey) : translate("rest")}
                  color={isCrop ? cropColors.get(block.cropKey) ?? restBlockColor : restBlockColor}
                  referenceInDays={isCrop ? cropNames.referenceOf(block.cropKey) : null}
                  onDurationChange={(durationInDays) => dispatch({ type: "blockDurationChanged", lotId, blockId: block.id, durationInDays })}
                  onReset={(referenceInDays) => dispatch({ type: "blockDurationReset", lotId, blockId: block.id, referenceInDays })}
                  onRemove={() => dispatch({ type: "blockRemoved", lotId, blockId: block.id })}
                />
              );
            })}
          </ol>
        )}
        <div className="plan-room">
          <span className="plan-room__bar" aria-hidden>
            <span style={{ width: `${Math.min(100, (usedDays / maximumPlanDays) * 100)}%` }} />
          </span>
          <span className="field-hint">
            {usedDays === 0 ? translate("roomEmpty") : translate("roomUsed", { used: durationLabels.months(usedDays) })}
          </span>
        </div>
        <AddBlockControls
          cropOptions={cropOptions}
          hasRoom={canAddBlock(rotation.blocks)}
          onAddCrop={(cropKey) =>
            dispatch({
              type: "blockAdded",
              lotId,
              blockId: crypto.randomUUID(),
              block: { kind: "crop", cropKey, referenceInDays: cropNames.referenceOf(cropKey) },
            })
          }
          onAddRest={() => dispatch({ type: "blockAdded", lotId, blockId: crypto.randomUUID(), block: { kind: "rest" } })}
        />
      </section>
    </div>
  );
}
