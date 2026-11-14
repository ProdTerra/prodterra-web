import { PenLine, Undo2, X } from "lucide-react";
import { useTranslations } from "next-intl";

type BoundaryStepProps = {
  isDrawing: boolean;
  onStartDrawing: () => void;
  onUndoLastPoint: () => void;
  onCancelDrawing: () => void;
  onChangeLocation: () => void;
};

export function BoundaryStep({
  isDrawing,
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

      <div className="step-actions">
        {isDrawing ? (
          <>
            <button type="button" onClick={onUndoLastPoint} className="button button--outline">
              <Undo2 aria-hidden size={18} />
              {translate("undo")}
            </button>
            <button type="button" onClick={onCancelDrawing} className="button button--quiet">
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
            <button type="button" onClick={onChangeLocation} className="button button--quiet">
              {translate("changeLocation")}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
