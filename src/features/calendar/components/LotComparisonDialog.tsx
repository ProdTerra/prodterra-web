"use client";

import { Check, CircleAlert, Minus, TriangleAlert, X } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { useId } from "react";
import type { Lot } from "@/features/farm-mapping/application/farmMappingState";
import { Notice } from "@/shared/components/Notice";
import { useModalDialog } from "@/shared/components/useModalDialog";
import type {
  EvaluatedRotation,
  LotRotationEvaluation,
  RecommendationReason,
  RotationWarning,
} from "../infrastructure/plansApi";

type LotComparisonDialogProps = {
  lot: Lot | null;
  evaluation: LotRotationEvaluation | null;
  lotName: (lot: Lot) => string;
  cropName: (cropKey: string) => string;
  whole: (value: number) => string;
  onClose: () => void;
};

const daysPerWeek = 7;

function ReasonIcon({ reason }: { reason: RecommendationReason }) {
  if (reason.type === "unknownHistory") {
    return <Minus aria-hidden size={16} />;
  }
  return reason.positive ? <Check aria-hidden size={16} /> : <CircleAlert aria-hidden size={16} />;
}

function useComparisonText(cropName: (cropKey: string) => string) {
  const translate = useTranslations("calendar");
  const format = useFormatter();
  const date = (isoDate: string) =>
    format.dateTime(new Date(`${isoDate}T12:00:00Z`), { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

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

  function warningText(warning: RotationWarning, rotation: EvaluatedRotation): string {
    const crop = cropName(rotation.blocks[warning.blockIndex]?.cropKey ?? "");
    switch (warning.type) {
      case "shorterThanReference":
        return translate("comparison.warning.shorterThanReference", {
          crop,
          weeks: Math.round(warning.durationInDays / daysPerWeek),
          referenceWeeks: Math.round(warning.referenceCycleInDays / daysPerWeek),
        });
      default:
        return translate(`comparison.warning.${warning.type}`, { crop });
    }
  }

  return { translate, date, reasonText, warningText };
}

function RotationSummary({
  title,
  rotation,
  showReasons,
  cropName,
}: {
  title: string;
  rotation: EvaluatedRotation;
  showReasons: boolean;
  cropName: (cropKey: string) => string;
}) {
  const { translate, date, reasonText, warningText } = useComparisonText(cropName);
  const riskMonths = rotation.months.filter((month) => month.status === "risk").length;
  const watchMonths = rotation.months.filter((month) => month.status === "watch").length;

  return (
    <section className="lot-comparison__column">
      <h3>{title}</h3>
      <p className="lot-comparison__counts">
        {translate("comparison.riskMonths", { count: riskMonths })} · {translate("comparison.watchMonths", { count: watchMonths })}
      </p>
      <ol className="lot-comparison__blocks">
        {rotation.blocks.map((block, index) => (
          <li key={`${block.startsOn}-${index}`} data-kind={block.kind}>
            <strong>{block.cropKey ? cropName(block.cropKey) : translate("rest")}</strong>
            <span>{translate("comparison.dates", { start: date(block.startsOn), end: date(block.endsOn) })}</span>
            {showReasons && block.reasons.length > 0 && (
              <ul className="lot-plan__reasons">
                {block.reasons.slice(0, 3).map((reason) => (
                  <li key={reason.type} data-positive={reason.positive || undefined}>
                    <ReasonIcon reason={reason} />
                    {reasonText(reason)}
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ol>
      {!showReasons &&
        (rotation.warnings.length === 0 ? (
          <p className="lot-comparison__clean">
            <Check aria-hidden size={16} />
            {translate("comparison.noWarnings")}
          </p>
        ) : (
          <ul className="lot-comparison__warnings">
            {rotation.warnings.map((warning, index) => (
              <li key={`${warning.type}-${index}`}>
                <TriangleAlert aria-hidden size={16} />
                {warningText(warning, rotation)}
              </li>
            ))}
          </ul>
        ))}
    </section>
  );
}

export function LotComparisonDialog({ lot, evaluation, lotName, cropName, whole, onClose }: LotComparisonDialogProps) {
  const translate = useTranslations("calendar");
  const titleId = useId();
  const dialogProps = useModalDialog(lot !== null, onClose);

  return (
    <dialog {...dialogProps} aria-labelledby={titleId} className="dialog dialog--wide">
      {lot && evaluation && (
        <div className="dialog__body lot-plan">
          <header className="lot-plan__header">
            <div>
              <h2 id={titleId} className="dialog__title">
                {translate("comparison.title", { lot: lotName(lot) })}
              </h2>
              {evaluation.elevationInMeters !== null && (
                <p className="dialog__description">
                  {translate("lotPlan.elevation", { value: `${whole(evaluation.elevationInMeters)} m` })}
                </p>
              )}
            </div>
            <button type="button" onClick={onClose} aria-label={translate("lotPlan.close")} className="icon-button lot-plan__close">
              <X aria-hidden size={20} />
            </button>
          </header>
          {!evaluation.farmer || !evaluation.recommended ? (
            <Notice tone="error">{translate("lotPlan.noClimate")}</Notice>
          ) : (
            <div className="lot-comparison">
              <RotationSummary
                title={translate("variantFarmer")}
                rotation={evaluation.farmer}
                showReasons={false}
                cropName={cropName}
              />
              <RotationSummary
                title={translate("variantRecommended")}
                rotation={evaluation.recommended}
                showReasons
                cropName={cropName}
              />
            </div>
          )}
        </div>
      )}
    </dialog>
  );
}
