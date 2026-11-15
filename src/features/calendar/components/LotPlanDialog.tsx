"use client";

import { Check, CircleAlert, Minus, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Notice } from "@/shared/components/Notice";
import { useId } from "react";
import type { Lot } from "@/features/farm-mapping/application/farmMappingState";
import { useModalDialog } from "@/shared/components/useModalDialog";
import type { LotPlan, RecommendationReason } from "../infrastructure/plansApi";

type LotPlanDialogProps = {
  lot: Lot | null;
  plan: LotPlan | null;
  lotName: (lot: Lot) => string;
  cropName: (cropKey: string) => string;
  monthName: (monthKey: string) => string;
  whole: (value: number) => string;
  onClose: () => void;
};

function ReasonIcon({ reason }: { reason: RecommendationReason }) {
  if (reason.type === "unknownHistory") {
    return <Minus aria-hidden size={16} />;
  }
  return reason.positive ? <Check aria-hidden size={16} /> : <CircleAlert aria-hidden size={16} />;
}

export function LotPlanDialog({ lot, plan, lotName, cropName, monthName, whole, onClose }: LotPlanDialogProps) {
  const translate = useTranslations("calendar");
  const titleId = useId();
  const dialogProps = useModalDialog(lot !== null, onClose);

  function reasonText(reason: RecommendationReason): string {
    switch (reason.type) {
      case "sameNutrient":
      case "differentNutrient":
        return translate(`reason.${reason.type}`, { nutrient: translate(`nutrient.${reason.nutrient}` as "nutrient.N") });
      case "climateFit":
        return translate("reason.climateFit", { suitable: reason.suitableMonths, total: reason.totalMonths });
      case "pestMonths":
        return translate("reason.pestMonths", { months: reason.months });
      case "waitForBetterMonth":
        return translate("reason.waitForBetterMonth", { months: reason.months });
      default:
        return translate(`reason.${reason.type}`);
    }
  }

  return (
    <dialog {...dialogProps} aria-labelledby={titleId} className="dialog dialog--wide">
      {lot && plan && (
        <div className="dialog__body lot-plan">
          <header className="lot-plan__header">
            <span aria-hidden className="lot-badge" style={{ ["--lot-color" as string]: lot.color }}>
              {lot.number}
            </span>
            <div>
              <h2 id={titleId} className="dialog__title">
                {translate("lotPlan.title", { lot: lotName(lot) })}
              </h2>
              {plan.elevationInMeters !== null && (
                <p className="dialog__description">
                  {translate("lotPlan.elevation", { value: `${whole(plan.elevationInMeters)} m` })}
                </p>
              )}
            </div>
            <button type="button" onClick={onClose} aria-label={translate("lotPlan.close")} className="icon-button lot-plan__close">
              <X aria-hidden size={20} />
            </button>
          </header>

          {!plan.climateAvailable ? (
            <Notice tone="error">{translate("lotPlan.noClimate")}</Notice>
          ) : (
            <>
              <section className="lot-plan__section">
                <h3>{translate("lotPlan.now")}</h3>
                <p className="lot-plan__headline">
                  {plan.currentCrop
                    ? translate("lotPlan.nowCrop", {
                        crop: cropName(plan.currentCrop.cropKey),
                        month: monthName(plan.currentCrop.harvestMonth),
                      })
                    : translate("lotPlan.nowFallow")}
                </p>
                {plan.currentCrop?.cycleIsEstimated && <Notice tone="warning">{translate("lotPlan.estimatedCycle")}</Notice>}
              </section>

              {plan.nextCrop && (
                <section className="lot-plan__section lot-plan__section--highlight">
                  <h3>{translate("lotPlan.next")}</h3>
                  <p className="lot-plan__headline">
                    {translate("lotPlan.nextCrop", {
                      crop: cropName(plan.nextCrop.cropKey),
                      sow: monthName(plan.nextCrop.sowMonth),
                      harvest: monthName(plan.nextCrop.harvestMonth),
                    })}
                  </p>
                  <h4>{translate("lotPlan.why")}</h4>
                  <ul className="lot-plan__reasons">
                    {plan.nextCrop.reasons.map((reason) => (
                      <li key={reason.type} data-positive={reason.positive || undefined}>
                        <ReasonIcon reason={reason} />
                        {reasonText(reason)}
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {plan.recommendations.length > 1 && (
                <section className="lot-plan__section">
                  <h3>{translate("lotPlan.alternatives")}</h3>
                  <ul className="lot-plan__alternatives">
                    {plan.recommendations.slice(1).map((recommendation) => (
                      <li key={recommendation.cropKey}>{cropName(recommendation.cropKey)}</li>
                    ))}
                  </ul>
                </section>
              )}
            </>
          )}
        </div>
      )}
    </dialog>
  );
}
