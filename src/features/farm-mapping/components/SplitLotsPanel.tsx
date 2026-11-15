import { Minus, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import type { StripOrientation } from "../domain/splitFarm";

export const minimumSplitLots = 2;
export const maximumSplitLots = 20;

type SplitLotsPanelProps = {
  lotCount: number;
  orientation: StripOrientation;
  onChange: (lotCount: number, orientation: StripOrientation) => void;
  onDone: () => void;
};

const orientations: StripOrientation[] = ["vertical", "horizontal"];

export function SplitLotsPanel({ lotCount, orientation, onChange, onDone }: SplitLotsPanelProps) {
  const translate = useTranslations("farmMapping.split");

  return (
    <section aria-label={translate("title")} className="split-panel">
      <h2 className="split-panel__title">{translate("title")}</h2>

      <div className="split-panel__row">
        <span id="split-count-label">{translate("countLabel")}</span>
        <div role="group" aria-labelledby="split-count-label" className="stepper">
          <button
            type="button"
            aria-label={translate("fewer")}
            disabled={lotCount <= minimumSplitLots}
            onClick={() => onChange(lotCount - 1, orientation)}
            className="icon-button"
          >
            <Minus aria-hidden size={18} />
          </button>
          <output aria-live="polite" className="stepper__value">
            {lotCount}
          </output>
          <button
            type="button"
            aria-label={translate("more")}
            disabled={lotCount >= maximumSplitLots}
            onClick={() => onChange(lotCount + 1, orientation)}
            className="icon-button"
          >
            <Plus aria-hidden size={18} />
          </button>
        </div>
      </div>

      <div className="split-panel__row">
        <span id="split-orientation-label">{translate("orientationLabel")}</span>
        <div role="group" aria-labelledby="split-orientation-label" className="segmented">
          {orientations.map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={option === orientation}
              onClick={() => onChange(lotCount, option)}
            >
              {translate(option)}
            </button>
          ))}
        </div>
      </div>

      <p className="notice">{translate("hint")}</p>
      <button type="button" onClick={onDone} className="button button--primary">
        {translate("done")}
      </button>
    </section>
  );
}
