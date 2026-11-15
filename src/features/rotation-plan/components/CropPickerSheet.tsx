"use client";

import { CirclePause, CircleHelp, Search, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useId, useState } from "react";
import { useModalDialog } from "@/shared/components/useModalDialog";
import { searchCrops } from "../domain/cropSearch";
import { CropIcon } from "./CropIcon";

export type PickerCrop = { key: string; name: string; usualDays: string | null };
export type PickerExtra = { value: string; label: string; kind: "rest" | "unknown" };

type CropPickerSheetProps = {
  isOpen: boolean;
  title: string;
  crops: PickerCrop[];
  suggestedKeys: string[];
  extras: PickerExtra[];
  onChoose: (value: string) => void;
  onClose: () => void;
};

export function CropPickerSheet(props: CropPickerSheetProps) {
  const dialogProps = useModalDialog(props.isOpen, props.onClose);

  return (
    <dialog {...dialogProps} aria-label={props.title} className="dialog add-sheet">
      {props.isOpen && <CropPickerContent {...props} />}
    </dialog>
  );
}

function CropPickerContent({ title, crops, suggestedKeys, extras, onChoose, onClose }: CropPickerSheetProps) {
  const translate = useTranslations("rotationPlan.rotation");
  const searchId = useId();
  const [query, setQuery] = useState("");
  const isSearching = query.trim() !== "";
  const suggested = isSearching ? [] : crops.filter((crop) => suggestedKeys.includes(crop.key));
  const results = searchCrops(isSearching ? crops : crops.filter((crop) => !suggestedKeys.includes(crop.key)), query);

  const cropButton = (crop: PickerCrop) => (
    <li key={crop.key}>
      <button type="button" onClick={() => onChoose(crop.key)} className="add-sheet__option">
        <CropIcon cropKey={crop.key} size={28} />
        <span>{crop.name}</span>
        {crop.usualDays && <span className="add-sheet__usual">{crop.usualDays}</span>}
      </button>
    </li>
  );

  return (
    <div className="dialog__body add-sheet__body">
      <header className="auth-dialog__header">
        <h2 className="dialog__title">{title}</h2>
        <button type="button" onClick={onClose} aria-label={translate("close")} className="icon-button">
          <X aria-hidden size={20} />
        </button>
      </header>
      {extras.length > 0 && (
        <div className="add-sheet__extras">
          {extras.map((extra) => (
            <button key={extra.value} type="button" onClick={() => onChoose(extra.value)} className="add-sheet__option add-sheet__option--extra" data-kind={extra.kind}>
              {extra.kind === "rest" ? <CirclePause aria-hidden size={20} /> : <CircleHelp aria-hidden size={20} />}
              <span>{extra.label}</span>
            </button>
          ))}
        </div>
      )}
      <div className="add-sheet__search">
        <Search aria-hidden size={18} />
        <label htmlFor={searchId} className="visually-hidden">
          {translate("searchCrop")}
        </label>
        <input
          id={searchId}
          type="search"
          value={query}
          placeholder={translate("searchCrop")}
          autoComplete="off"
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>
      <div className="add-sheet__results">
        {suggested.length > 0 && (
          <section aria-label={translate("suggestedCrops")}>
            <h3 className="add-sheet__group">{translate("suggestedCrops")}</h3>
            <ul className="add-sheet__crops">{suggested.map(cropButton)}</ul>
          </section>
        )}
        <section aria-label={translate("allCrops")}>
          {suggested.length > 0 && <h3 className="add-sheet__group">{translate("allCrops")}</h3>}
          {results.length > 0 || !isSearching ? (
            <ul className="add-sheet__crops">{results.map(cropButton)}</ul>
          ) : (
            <p className="add-sheet__empty">{translate("noCropFound", { query: query.trim() })}</p>
          )}
        </section>
      </div>
    </div>
  );
}
