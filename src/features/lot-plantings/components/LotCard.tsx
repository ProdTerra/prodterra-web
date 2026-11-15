import { Check, CircleDashed } from "lucide-react";
import { useTranslations } from "next-intl";
import type { Lot } from "@/features/farm-mapping/application/farmMappingState";
import { LotSilhouette } from "./LotSilhouette";

type LotCardProps = {
  lot: Lot;
  name: string;
  area: string;
  summary: string | null;
  isComplete: boolean;
  isSelected: boolean;
  onSelect: () => void;
};

export function LotCard({ lot, name, area, summary, isComplete, isSelected, onSelect }: LotCardProps) {
  const translate = useTranslations("farmMapping.crops");

  return (
    <button type="button" aria-pressed={isSelected} onClick={onSelect} className="lot-card">
      <span className="lot-card__shape">
        <LotSilhouette geometry={lot.geometry} color={lot.color} />
        <span aria-hidden className="lot-badge lot-card__badge" style={{ ["--lot-color" as string]: lot.color }}>
          {lot.number}
        </span>
      </span>
      <span className="lot-card__name">{name}</span>
      <span className="lot-card__area">{area}</span>
      <span className="lot-card__status" data-complete={isComplete || undefined}>
        {isComplete ? <Check aria-hidden size={14} /> : <CircleDashed aria-hidden size={14} />}
        {summary ?? (isComplete ? translate("statusComplete") : translate("statusPending"))}
      </span>
    </button>
  );
}
