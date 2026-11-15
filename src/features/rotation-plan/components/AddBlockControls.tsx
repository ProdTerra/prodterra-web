import { CirclePause, Plus, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Notice } from "@/shared/components/Notice";
import { ChoiceChips, type ChoiceOption } from "./ChoiceChips";

type AddBlockControlsProps = {
  cropOptions: ChoiceOption[];
  hasRoom: boolean;
  onAddCrop: (cropKey: string) => void;
  onAddRest: () => void;
};

export function AddBlockControls({ cropOptions, hasRoom, onAddCrop, onAddRest }: AddBlockControlsProps) {
  const translate = useTranslations("rotationPlan.rotation");
  const [isPickingCrop, setIsPickingCrop] = useState(false);

  if (!hasRoom) {
    return (
      <Notice tone="info" title={translate("noRoomTitle")}>
        {translate("noRoom")}
      </Notice>
    );
  }

  if (isPickingCrop) {
    return (
      <div className="crop-picker">
        <ChoiceChips
          label={translate("cropPickerLabel")}
          options={cropOptions}
          selectedValue={null}
          onSelect={(cropKey) => {
            setIsPickingCrop(false);
            onAddCrop(cropKey);
          }}
        />
        <button type="button" onClick={() => setIsPickingCrop(false)} className="button button--secondary button--small crop-picker__cancel">
          <X aria-hidden size={16} />
          {translate("cancelPicker")}
        </button>
      </div>
    );
  }

  return (
    <div className="add-block">
      <button type="button" onClick={() => setIsPickingCrop(true)} className="button button--outline">
        <Plus aria-hidden size={18} />
        {translate("addCrop")}
      </button>
      <button type="button" onClick={onAddRest} className="button button--secondary">
        <CirclePause aria-hidden size={18} />
        {translate("addRest")}
      </button>
    </div>
  );
}
