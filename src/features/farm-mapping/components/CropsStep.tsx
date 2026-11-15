import { useTranslations } from "next-intl";
import type { Lot } from "../application/farmMappingState";

type CropsStepProps = {
  lots: Lot[];
  onEditLots: () => void;
};

export function CropsStep({ lots, onEditLots }: CropsStepProps) {
  const translate = useTranslations("farmMapping.crops");

  return (
    <div className="step-content">
      <h1 className="step-title">{translate("title")}</h1>
      <p className="step-hint">{translate("hint", { count: lots.length })}</p>
      <div className="step-actions">
        <button type="button" onClick={onEditLots} className="button button--quiet">
          {translate("editLots")}
        </button>
      </div>
    </div>
  );
}
