"use client";

import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useId, useState } from "react";
import type { PreviousUse } from "../domain/rotationPlan";
import { CropPickerSheet, type PickerCrop } from "./CropPickerSheet";

const restValue = "fallow";
const unknownValue = "unknown";
const maximumQuickCrops = 4;

type PreviousUseFieldProps = {
  previousUse: PreviousUse | null;
  crops: PickerCrop[];
  suggestedKeys: string[];
  onChange: (previousUse: PreviousUse) => void;
};

function toPreviousUse(value: string): PreviousUse {
  if (value === restValue || value === unknownValue) {
    return { kind: value };
  }
  return { kind: "crop", cropKey: value };
}

function selectedValueOf(previousUse: PreviousUse | null): string | null {
  if (!previousUse) {
    return null;
  }
  return previousUse.kind === "crop" ? previousUse.cropKey : previousUse.kind;
}

export function PreviousUseField({ previousUse, crops, suggestedKeys, onChange }: PreviousUseFieldProps) {
  const translate = useTranslations("rotationPlan.rotation");
  const labelId = useId();
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const selectedValue = selectedValueOf(previousUse);
  const quickKeys = [...new Set([...(previousUse?.kind === "crop" ? [previousUse.cropKey] : []), ...suggestedKeys])].slice(0, maximumQuickCrops);
  const quickCrops = quickKeys.map((key) => crops.find((crop) => crop.key === key)).filter((crop): crop is PickerCrop => crop !== undefined);
  const options = [
    { value: unknownValue, label: translate("unknown") },
    { value: restValue, label: translate("rest") },
    ...quickCrops.map((crop) => ({ value: crop.key, label: crop.name })),
  ];

  function choose(value: string) {
    setIsPickerOpen(false);
    onChange(toPreviousUse(value));
  }

  return (
    <fieldset className="question">
      <legend id={labelId} className="question__label">
        {translate("previousQuestion")}
      </legend>
      <div className="choice-chips">
        <div role="radiogroup" aria-labelledby={labelId} className="choice-chips__group">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selectedValue === option.value}
            onClick={() => choose(option.value)}
            className="choice-chip"
          >
            {option.label}
          </button>
        ))}
        </div>
        <button type="button" onClick={() => setIsPickerOpen(true)} className="choice-chip choice-chip--more">
          <Plus aria-hidden size={16} />
          {translate("otherCrop")}
        </button>
      </div>
      <CropPickerSheet
        isOpen={isPickerOpen}
        title={translate("previousQuestion")}
        crops={crops}
        suggestedKeys={suggestedKeys}
        extras={[]}
        onChoose={choose}
        onClose={() => setIsPickerOpen(false)}
      />
    </fieldset>
  );
}
