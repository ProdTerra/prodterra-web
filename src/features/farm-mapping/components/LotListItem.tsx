import { Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import type { Lot } from "../application/farmMappingState";
import { lotDisplayName } from "../application/lotDisplayName";
import { useAreaFormatter } from "./useAreaFormatter";

type LotListItemProps = {
  lot: Lot;
  onRename: (name: string) => void;
  onRemove: () => void;
};

export function LotListItem({ lot, onRename, onRemove }: LotListItemProps) {
  const translate = useTranslations("farmMapping.lots");
  const formatArea = useAreaFormatter();
  const defaultName = translate("defaultName", { number: lot.number });
  const displayName = lotDisplayName(lot, () => defaultName);
  const inputId = `lot-name-${lot.shapeId}`;

  return (
    <li className="lot-item">
      <span aria-hidden className="lot-item__swatch" style={{ backgroundColor: lot.color }} />
      <label htmlFor={inputId} className="visually-hidden">
        {translate("nameLabel", { number: lot.number })}
      </label>
      <input
        id={inputId}
        value={lot.customName}
        placeholder={defaultName}
        onChange={(event) => onRename(event.target.value)}
        className="lot-item__name"
      />
      <span className="lot-item__area">
        {formatArea(lot.areaInHectares)}
      </span>
      <button
        type="button"
        onClick={onRemove}
        aria-label={translate("removeLot", { name: displayName })}
        className="icon-button"
      >
        <Trash2 aria-hidden size={18} />
      </button>
    </li>
  );
}
