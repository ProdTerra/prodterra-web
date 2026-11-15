import { ArrowLeft, ArrowRight, CalendarDays, Copy, RotateCcw } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, type Dispatch } from "react";
import type { Lot } from "@/features/farm-mapping/application/farmMappingState";
import { lotDisplayName } from "@/features/farm-mapping/application/lotDisplayName";
import { useAreaFormatter } from "@/features/farm-mapping/components/useAreaFormatter";
import { Dialog } from "@/shared/components/Dialog";
import { Notice } from "@/shared/components/Notice";
import type { RotationPlanAction } from "../application/rotationPlanState";
import { assignCropColors } from "../domain/cropColors";
import { isLotRotationComplete, rotationOf, type RotationPlan } from "../domain/rotationPlan";
import { LotCard } from "./LotCard";
import { LotRotationEditor } from "./LotRotationEditor";
import { useCropNames } from "./useCropNames";
import { useLotStatus } from "./useLotStatus";
import { usePlanFormat } from "./usePlanFormat";

type RotationScreenProps = {
  lots: Lot[];
  plan: RotationPlan;
  startDate: string;
  dispatch: Dispatch<RotationPlanAction>;
  onChangeStartDate: () => void;
  onEditLots: () => void;
  onContinue: () => void;
};

export function RotationScreen({ lots, plan, startDate, dispatch, onChangeStartDate, onEditLots, onContinue }: RotationScreenProps) {
  const translate = useTranslations("rotationPlan.rotation");
  const translateLots = useTranslations("farmMapping.lots");
  const formatArea = useAreaFormatter();
  const { shortDate } = usePlanFormat();
  const cropNames = useCropNames();
  const lotStatus = useLotStatus();
  const [selectedLotId, setSelectedLotId] = useState(lots[0]?.shapeId ?? null);
  const [isCopyConfirmOpen, setIsCopyConfirmOpen] = useState(false);
  const lotIds = lots.map((lot) => lot.shapeId);
  const nameOf = (lot: Lot) => lotDisplayName(lot, (number) => translateLots("defaultName", { number }));
  const isComplete = (lot: Lot) => isLotRotationComplete(rotationOf(plan, lot.shapeId));
  const completedCount = lots.filter(isComplete).length;
  const isAllComplete = completedCount === lots.length;
  const selectedLot = lots.find((lot) => lot.shapeId === selectedLotId) ?? lots[0];
  const cropColors = assignCropColors(lots.map((lot) => rotationOf(plan, lot.shapeId)));

  function goToNextLot() {
    const startIndex = lots.indexOf(selectedLot);
    const ordered = [...lots.slice(startIndex + 1), ...lots.slice(0, startIndex)];
    const next = ordered.find((lot) => !isComplete(lot)) ?? ordered[0];
    setSelectedLotId(next.shapeId);
  }

  function copyToAllLots() {
    setIsCopyConfirmOpen(false);
    dispatch({ type: "rotationCopiedToAllLots", fromLotId: selectedLot.shapeId, lotIds });
  }

  return (
    <div className="rotation-step">
      <header className="rotation-step__header">
        <div>
          <h1 className="step-title">{translate("title")}</h1>
          <p className="step-hint">{translate("hint")}</p>
        </div>
        <div className="start-pill">
          <CalendarDays aria-hidden size={18} />
          <span>{translate("startsOn", { date: shortDate(startDate) })}</span>
          <button type="button" onClick={onChangeStartDate} className="button button--secondary button--small">
            {translate("changeStart")}
          </button>
        </div>
      </header>

      <section aria-label={translate("lotsLabel")} className="lot-cards">
        {lots.map((lot) => (
          <LotCard
            key={lot.shapeId}
            lot={lot}
            name={nameOf(lot)}
            area={formatArea(lot.areaInHectares)}
            status={lotStatus(rotationOf(plan, lot.shapeId))}
            isComplete={isComplete(lot)}
            isSelected={lot.shapeId === selectedLot.shapeId}
            onSelect={() => setSelectedLotId(lot.shapeId)}
          />
        ))}
      </section>

      <section aria-labelledby="rotation-editor-title" className="crops-step__form">
        <h2 id="rotation-editor-title" className="crops-step__form-title">
          <span aria-hidden className="lot-badge" style={{ ["--lot-color" as string]: selectedLot.color }}>
            {selectedLot.number}
          </span>
          {translate("editorTitle", { name: nameOf(selectedLot) })}
        </h2>

        {cropNames.status === "loading" && <Notice tone="loading">{translate("catalogLoading")}</Notice>}
        {cropNames.status === "failed" && (
          <Notice tone="error" title={translate("catalogFailedTitle")} action={{ label: translate("retry"), onClick: cropNames.retry, icon: RotateCcw }}>
            {translate("catalogFailed")}
          </Notice>
        )}
        {cropNames.status === "ready" && (
          <LotRotationEditor
            key={selectedLot.shapeId}
            lotId={selectedLot.shapeId}
            rotation={rotationOf(plan, selectedLot.shapeId)}
            startDate={startDate}
            cropNames={cropNames}
            cropColors={cropColors}
            dispatch={dispatch}
          />
        )}

        {lots.length > 1 && (
          <div className="step-actions rotation-step__lot-actions">
            <button type="button" onClick={() => setIsCopyConfirmOpen(true)} className="button button--secondary" disabled={!isComplete(selectedLot)}>
              <Copy aria-hidden size={18} />
              {translate("copyToAll")}
            </button>
            <button type="button" onClick={goToNextLot} className="button button--outline">
              {translate("nextLot")}
              <ArrowRight aria-hidden size={18} />
            </button>
          </div>
        )}
      </section>

      <button type="button" onClick={onEditLots} className="button button--secondary rotation-step__back">
        <ArrowLeft aria-hidden size={18} />
        {translate("editLots")}
      </button>

      <div className="plan-footer plan-footer--sticky">
        <p id="rotation-progress" className="plan-footer__status" data-complete={isAllComplete || undefined}>
          {isAllComplete ? translate("allDone") : translate("progress", { done: completedCount, total: lots.length })}
          {!isAllComplete && <span>{translate("continueBlocked")}</span>}
        </p>
        <button
          type="button"
          onClick={onContinue}
          disabled={!isAllComplete}
          aria-describedby="rotation-progress"
          className="button button--primary"
        >
          <CalendarDays aria-hidden size={18} />
          {translate("seeCalendar")}
        </button>
      </div>

      <Dialog
        isOpen={isCopyConfirmOpen}
        tone="info"
        title={translate("copyDialog.title")}
        description={translate("copyDialog.description", { name: nameOf(selectedLot) })}
        confirmLabel={translate("copyDialog.confirm")}
        cancelLabel={translate("copyDialog.cancel")}
        onConfirm={copyToAllLots}
        onCancel={() => setIsCopyConfirmOpen(false)}
      />
    </div>
  );
}
