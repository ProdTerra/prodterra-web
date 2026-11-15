"use client";

import { CirclePause, Sprout, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useId } from "react";
import { useModalDialog } from "@/shared/components/useModalDialog";

export type AddBlockChoice = { kind: "rest" } | { kind: "crop"; cropKey: string };

type AddBlockSheetProps = {
  isOpen: boolean;
  crops: { key: string; name: string; usualDays: string | null }[];
  onChoose: (choice: AddBlockChoice) => void;
  onClose: () => void;
};

export function AddBlockSheet({ isOpen, crops, onChoose, onClose }: AddBlockSheetProps) {
  const translate = useTranslations("rotationPlan.rotation");
  const titleId = useId();
  const dialogProps = useModalDialog(isOpen, onClose);

  return (
    <dialog {...dialogProps} aria-labelledby={titleId} className="dialog add-sheet">
      <div className="dialog__body add-sheet__body">
        <header className="auth-dialog__header">
          <h2 id={titleId} className="dialog__title">
            {translate("sheetTitle")}
          </h2>
          <button type="button" onClick={onClose} aria-label={translate("close")} className="icon-button">
            <X aria-hidden size={20} />
          </button>
        </header>
        <button type="button" onClick={() => onChoose({ kind: "rest" })} className="add-sheet__option add-sheet__option--rest">
          <CirclePause aria-hidden size={20} />
          <span>{translate("rest")}</span>
        </button>
        <ul className="add-sheet__crops">
          {crops.map((crop) => (
            <li key={crop.key}>
              <button
                type="button"
                onClick={() => onChoose({ kind: "crop", cropKey: crop.key })}
                className="add-sheet__option"
              >
                <Sprout aria-hidden size={20} />
                <span>{crop.name}</span>
                {crop.usualDays && <span className="add-sheet__usual">{crop.usualDays}</span>}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </dialog>
  );
}
