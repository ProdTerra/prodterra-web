import { useLocale, useTranslations } from "next-intl";
import type { LotPlantingsAction } from "../application/lotPlantingsState";
import type { CurrentUse, LotPlanting, PreviousUse } from "../domain/lotPlanting";
import type { CatalogCrop } from "../infrastructure/cropCatalogApi";
import { ChoiceChips, type ChoiceOption } from "./ChoiceChips";
import { PlantingMonthPicker } from "./PlantingMonthPicker";

const fallowValue = "fallow";
const unknownValue = "unknown";
const yesValue = "yes";
const noValue = "no";

type LotPlantingFormProps = {
  shapeId: string;
  planting: LotPlanting;
  crops: CatalogCrop[];
  today: Date;
  dispatch: (action: LotPlantingsAction) => void;
};

function toChoiceValue(use: CurrentUse | PreviousUse | null): string | null {
  if (!use) {
    return null;
  }
  return use.kind === "crop" ? use.cropKey : use.kind;
}

function toCurrentUse(value: string): CurrentUse {
  return value === fallowValue ? { kind: "fallow" } : { kind: "crop", cropKey: value };
}

function toPreviousUse(value: string): PreviousUse {
  return value === unknownValue ? { kind: "unknown" } : toCurrentUse(value);
}

export function LotPlantingForm({ shapeId, planting, crops, today, dispatch }: LotPlantingFormProps) {
  const translate = useTranslations("farmMapping.crops");
  const locale = useLocale();
  const cropOptions: ChoiceOption[] = crops
    .map((crop) => ({ value: crop.key, label: locale === "en" ? crop.name.en : crop.name.es }))
    .sort((first, second) => first.label.localeCompare(second.label, locale));
  const fallowOption = { value: fallowValue, label: translate("fallow") };

  return (
    <div className="planting-form">
      <ChoiceChips
        label={translate("currentQuestion")}
        options={[...cropOptions, fallowOption]}
        selectedValue={toChoiceValue(planting.currentUse)}
        onSelect={(value) => dispatch({ type: "currentUseChosen", shapeId, currentUse: toCurrentUse(value) })}
      />
      {planting.currentUse?.kind === "crop" && (
        <PlantingMonthPicker
          value={planting.plantedOn}
          today={today}
          onChange={(plantedOn) => dispatch({ type: "plantingMonthChosen", shapeId, plantedOn })}
        />
      )}
      <ChoiceChips
        label={translate("previousQuestion")}
        options={[...cropOptions, fallowOption, { value: unknownValue, label: translate("unknown") }]}
        selectedValue={toChoiceValue(planting.previousUse)}
        onSelect={(value) => dispatch({ type: "previousUseChosen", shapeId, previousUse: toPreviousUse(value) })}
      />
      <ChoiceChips
        label={translate("irrigationQuestion")}
        options={[
          { value: yesValue, label: translate("yes") },
          { value: noValue, label: translate("no") },
        ]}
        selectedValue={planting.hasIrrigation === null ? null : planting.hasIrrigation ? yesValue : noValue}
        onSelect={(value) => dispatch({ type: "irrigationChosen", shapeId, hasIrrigation: value === yesValue })}
      />
    </div>
  );
}
