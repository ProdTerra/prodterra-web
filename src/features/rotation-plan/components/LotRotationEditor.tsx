import { closestCenter, DndContext, KeyboardSensor, PointerSensor, TouchSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, type Dispatch } from "react";
import type { RotationPlanAction } from "../application/rotationPlanState";
import { restBlockColor } from "../domain/cropColors";
import { canAddBlock, longestDurationFor } from "../domain/blockLimits";
import type { LotRotation, PreviousUse, RotationBlock } from "../domain/rotationPlan";
import { scheduleBlocks, type ScheduledBlock } from "../domain/rotationSchedule";
import { AddBlockSheet, type AddBlockChoice } from "./AddBlockSheet";
import { ChoiceChips, type ChoiceOption } from "./ChoiceChips";
import { RotationBlockCard } from "./RotationBlockCard";
import { TimelineStrip } from "./TimelineStrip";
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

type RemovedBlock = { block: RotationBlock; index: number; name: string };

export function LotRotationEditor({ lotId, rotation, startDate, cropNames, cropColors, dispatch }: LotRotationEditorProps) {
  const translate = useTranslations("rotationPlan.rotation");
  const [expandedBlockId, setExpandedBlockId] = useState<string | null>(null);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [removedBlock, setRemovedBlock] = useState<RemovedBlock | null>(null);
  const cropOptions: ChoiceOption[] = cropNames.crops.map((crop) => ({ value: crop.key, label: cropNames.localized(crop) }));
  const { blocks } = rotation;
  const schedule = scheduleBlocks(startDate, blocks);
  const hasRoom = canAddBlock(blocks);
  const blockName = ({ block }: ScheduledBlock) => (block.kind === "crop" ? cropNames.cropName(block.cropKey) : translate("rest"));
  const blockColor = ({ block }: ScheduledBlock) => (block.kind === "crop" ? cropColors.get(block.cropKey) ?? restBlockColor : restBlockColor);
  const dayCount = (days: number) => translate("dayCount", { days });
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function dropBlock({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) {
      return;
    }
    const toIndex = blocks.findIndex((block) => block.id === over.id);
    run({ type: "blockMovedTo", lotId, blockId: String(active.id), toIndex });
  }

  function run(action: RotationPlanAction) {
    setRemovedBlock(null);
    dispatch(action);
  }

  function addChosenBlock(choice: AddBlockChoice) {
    const blockId = crypto.randomUUID();
    const block =
      choice.kind === "rest"
        ? ({ kind: "rest" } as const)
        : ({ kind: "crop", cropKey: choice.cropKey, referenceInDays: cropNames.referenceOf(choice.cropKey) } as const);
    run({ type: "blockAdded", lotId, blockId, block });
    setIsPickerOpen(false);
    setExpandedBlockId(blockId);
  }

  function removeBlock(scheduled: ScheduledBlock, index: number) {
    dispatch({ type: "blockRemoved", lotId, blockId: scheduled.block.id });
    setRemovedBlock({ block: scheduled.block, index, name: blockName(scheduled) });
  }

  function selectFromStrip(blockId: string) {
    setExpandedBlockId(blockId);
    document.getElementById(`block-${blockId}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  return (
    <div className="rotation-editor">
      <ChoiceChips
        label={translate("previousQuestion")}
        options={[...cropOptions, { value: restValue, label: translate("rest") }, { value: unknownValue, label: translate("unknown") }]}
        selectedValue={previousUseValue(rotation.previousUse)}
        onSelect={(value) => run({ type: "previousUseChosen", lotId, previousUse: toPreviousUse(value) })}
      />
      <ChoiceChips
        label={translate("irrigationQuestion")}
        options={[
          { value: yesValue, label: translate("yes") },
          { value: noValue, label: translate("no") },
        ]}
        selectedValue={rotation.hasIrrigation === null ? null : rotation.hasIrrigation ? yesValue : noValue}
        onSelect={(value) => run({ type: "irrigationChosen", lotId, hasIrrigation: value === yesValue })}
      />

      <section className="rotation-timeline" aria-labelledby={`${lotId}-timeline`}>
        <h3 id={`${lotId}-timeline`} className="question__label rotation-timeline__title">
          {translate("timelineTitle")}
        </h3>
        <TimelineStrip
          startDate={startDate}
          schedule={schedule}
          selectedBlockId={expandedBlockId}
          blockName={blockName}
          blockColor={blockColor}
          onSelect={selectFromStrip}
        />
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={dropBlock}>
          <SortableContext items={blocks.map((block) => block.id)} strategy={verticalListSortingStrategy}>
            <ol className="rotation-timeline__blocks">
              {schedule.map((scheduled, index) => (
                <RotationBlockCard
                  key={scheduled.block.id}
                  scheduled={scheduled}
                  name={blockName(scheduled)}
                  color={blockColor(scheduled)}
                  referenceInDays={scheduled.block.kind === "crop" ? cropNames.referenceOf(scheduled.block.cropKey) : null}
                  longestInDays={longestDurationFor(blocks, scheduled.block.id)}
                  isExpanded={expandedBlockId === scheduled.block.id}
                  isFirst={index === 0}
                  isLast={index === blocks.length - 1}
                  canDuplicate={hasRoom}
                  onToggle={() => setExpandedBlockId((current) => (current === scheduled.block.id ? null : scheduled.block.id))}
                  onDurationChange={(durationInDays) => run({ type: "blockDurationChanged", lotId, blockId: scheduled.block.id, durationInDays })}
                  onMoveUp={() => run({ type: "blockMoved", lotId, blockId: scheduled.block.id, direction: "up" })}
                  onMoveDown={() => run({ type: "blockMoved", lotId, blockId: scheduled.block.id, direction: "down" })}
                  onDuplicate={() => run({ type: "blockDuplicated", lotId, blockId: scheduled.block.id, newBlockId: crypto.randomUUID() })}
                  onRemove={() => removeBlock(scheduled, index)}
                />
              ))}
            </ol>
          </SortableContext>
        </DndContext>
        {hasRoom && (
          <button type="button" onClick={() => setIsPickerOpen(true)} className="button button--outline rotation-timeline__add">
            <Plus aria-hidden size={18} />
            {translate(blocks.length === 0 ? "addFirst" : "addNext")}
          </button>
        )}
        {removedBlock && (
          <div role="status" className="undo-bar">
            <span>{translate("removed", { name: removedBlock.name })}</span>
            <button
              type="button"
              onClick={() => {
                dispatch({ type: "blockRestored", lotId, block: removedBlock.block, index: removedBlock.index });
                setRemovedBlock(null);
              }}
              className="button button--secondary button--small"
            >
              {translate("undo")}
            </button>
          </div>
        )}
      </section>

      <AddBlockSheet
        isOpen={isPickerOpen}
        crops={cropNames.crops.map((crop) => {
          const usual = cropNames.referenceOf(crop.key);
          return { key: crop.key, name: cropNames.localized(crop), usualDays: usual ? dayCount(usual) : null };
        })}
        onChoose={addChosenBlock}
        onClose={() => setIsPickerOpen(false)}
      />
    </div>
  );
}
