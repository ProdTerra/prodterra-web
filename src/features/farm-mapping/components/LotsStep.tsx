import { Check, Plus, Undo2 } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import type { DrawnShape, Lot } from "../application/farmMappingState";
import { LotListItem } from "./LotListItem";

type LotsStepProps = {
  farmBoundary: DrawnShape;
  lots: Lot[];
  isDrawing: boolean;
  canCloseShape: boolean;
  onCloseShape: () => void;
  onStartDrawing: () => void;
  onStopDrawing: () => void;
  onUndoLastPoint: () => void;
  onRenameLot: (shapeId: string, name: string) => void;
  onRemoveLot: (shapeId: string) => void;
  onRedrawFarm: () => void;
};

export function LotsStep({
  farmBoundary,
  lots,
  isDrawing,
  canCloseShape,
  onCloseShape,
  onStartDrawing,
  onStopDrawing,
  onUndoLastPoint,
  onRenameLot,
  onRemoveLot,
  onRedrawFarm,
}: LotsStepProps) {
  const translate = useTranslations("farmMapping.lots");
  const format = useFormatter();
  const formatHectares = (area: number) =>
    translate("hectares", { area: format.number(area, { maximumFractionDigits: 2 }) });
  const lotsArea = lots.reduce((total, lot) => total + lot.areaInHectares, 0);
  const unassignedArea = Math.max(farmBoundary.areaInHectares - lotsArea, 0);

  return (
    <div className="step-content">
      <h1 className="step-title">{translate("title")}</h1>
      <p className="step-hint">{translate("hint")}</p>

      <div className="farm-area">
        <span className="farm-area__label">{translate("farmArea")}</span>
        <span className="farm-area__value">{formatHectares(farmBoundary.areaInHectares)}</span>
        <span className="farm-area__detail">
          {translate("lotCount", { count: lots.length })}
          {lots.length > 0 && <>, {translate("unassigned", { area: format.number(unassignedArea, { maximumFractionDigits: 2 }) })}</>}
        </span>
      </div>

      {lots.length === 0 ? (
        <p className="notice">{translate("empty")}</p>
      ) : (
        <ul className="lot-list">
          {lots.map((lot) => (
            <LotListItem
              key={lot.shapeId}
              lot={lot}
              onRename={(name) => onRenameLot(lot.shapeId, name)}
              onRemove={() => onRemoveLot(lot.shapeId)}
            />
          ))}
        </ul>
      )}

      {isDrawing && !canCloseShape && (
        <p id="lot-close-requirement" className="notice">
          {translate("closeRequirement")}
        </p>
      )}

      <div className="step-actions">
        {isDrawing ? (
          <>
            <button
              type="button"
              onClick={onCloseShape}
              disabled={!canCloseShape}
              aria-describedby={canCloseShape ? undefined : "lot-close-requirement"}
              className="button button--primary"
            >
              <Check aria-hidden size={18} />
              {translate("closeLot")}
            </button>
            <button type="button" onClick={onUndoLastPoint} className="button button--outline">
              <Undo2 aria-hidden size={18} />
              {translate("undoPoint")}
            </button>
            <button type="button" onClick={onStopDrawing} className="button button--quiet">
              {translate("finishLots")}
            </button>
          </>
        ) : (
          <>
            <button type="button" onClick={onStartDrawing} className="button button--primary">
              <Plus aria-hidden size={18} />
              {translate("addLot")}
            </button>
            <button type="button" onClick={onRedrawFarm} className="button button--quiet">
              {translate("redrawFarm")}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
