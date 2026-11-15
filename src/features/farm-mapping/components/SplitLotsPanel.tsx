import { Check, Columns3, Grid2x2, Minus, Plus, Rows3, type LucideIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import type { SplitLayout } from "../domain/splitFarm";

export const minimumSplitLots = 2;
export const maximumSplitLots = 20;

type SplitLotsPanelProps = {
  lotCount: number;
  layout: SplitLayout;
  onChange: (lotCount: number, layout: SplitLayout) => void;
  onDone: () => void;
};

const layouts: SplitLayout[] = ["along", "across", "grid"];

const iconByLayout: Record<SplitLayout, LucideIcon> = {
  along: Rows3,
  across: Columns3,
  grid: Grid2x2,
};

export function SplitLotsPanel({ lotCount, layout, onChange, onDone }: SplitLotsPanelProps) {
  const translate = useTranslations("farmMapping.split");

  return (
    <section aria-labelledby="split-panel-title" className="split-panel">
      <header className="split-panel__header">
        <h2 id="split-panel-title" className="split-panel__title">
          {translate("title")}
        </h2>
        <button type="button" onClick={onDone} className="button button--primary button--small">
          <Check aria-hidden size={16} />
          {translate("done")}
        </button>
      </header>

      <div className="split-panel__count">
        <span id="split-count-label" className="split-panel__label">
          {translate("countLabel")}
        </span>
        <div role="group" aria-labelledby="split-count-label" className="stepper">
          <button
            type="button"
            aria-label={translate("fewer")}
            disabled={lotCount <= minimumSplitLots}
            onClick={() => onChange(lotCount - 1, layout)}
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
            onClick={() => onChange(lotCount + 1, layout)}
            className="icon-button"
          >
            <Plus aria-hidden size={18} />
          </button>
        </div>
      </div>

      <div className="split-panel__field">
        <span id="split-layout-label" className="split-panel__label">
          {translate("layoutLabel")}
        </span>
        <div role="group" aria-labelledby="split-layout-label" className="layout-options">
          {layouts.map((option) => {
            const Icon = iconByLayout[option];
            return (
              <button
                key={option}
                type="button"
                aria-pressed={option === layout}
                onClick={() => onChange(lotCount, option)}
              >
                <Icon aria-hidden size={20} />
                {translate(option)}
              </button>
            );
          })}
        </div>
      </div>

      <p className="split-panel__hint">{translate("hint")}</p>
    </section>
  );
}
