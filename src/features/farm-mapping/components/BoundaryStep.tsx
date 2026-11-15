import { Check, MapPin, PenLine, Undo2, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Notice } from "@/shared/components/Notice";

type BoundaryStepProps = {
  isDrawing: boolean;
  canCloseShape: boolean;
  onCloseShape: () => void;
  onStartDrawing: () => void;
  onUndoLastPoint: () => void;
  onCancelDrawing: () => void;
  onChangeLocation: () => void;
};

export function BoundaryStep({
  isDrawing,
  canCloseShape,
  onCloseShape,
  onStartDrawing,
  onUndoLastPoint,
  onCancelDrawing,
  onChangeLocation,
}: BoundaryStepProps) {
  const translate = useTranslations("farmMapping.boundary");

  return (
    <div className="step-content">
      <h1 className="step-title">{translate("title")}</h1>
      <p className="step-hint">{translate("hint")}</p>

      {isDrawing && !canCloseShape && (
        <Notice tone="info" id="boundary-close-requirement">
          {translate("closeRequirement")}
        </Notice>
      )}

      <div className="step-actions">
        {isDrawing ? (
          <>
            <button
              type="button"
              onClick={onCloseShape}
              disabled={!canCloseShape}
              aria-describedby={canCloseShape ? undefined : "boundary-close-requirement"}
              className="button button--primary"
            >
              <Check aria-hidden size={18} />
              {translate("close")}
            </button>
            <button type="button" onClick={onUndoLastPoint} className="button button--outline">
              <Undo2 aria-hidden size={18} />
              {translate("undo")}
            </button>
            <button type="button" onClick={onCancelDrawing} className="button button--secondary">
              <X aria-hidden size={18} />
              {translate("cancel")}
            </button>
          </>
        ) : (
          <>
            <button type="button" onClick={onStartDrawing} className="button button--primary">
              <PenLine aria-hidden size={18} />
              {translate("start")}
            </button>
            <button type="button" onClick={onChangeLocation} className="button button--secondary">
              <MapPin aria-hidden size={18} />
              {translate("changeLocation")}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
