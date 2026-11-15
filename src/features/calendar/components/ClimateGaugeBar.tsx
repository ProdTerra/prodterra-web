import type { ClimateGauge } from "../domain/climateGauge";

export function ClimateGaugeBar({ gauge, label }: { gauge: ClimateGauge; label: string }) {
  return (
    <span className="climate-gauge" role="img" aria-label={label}>
      <span className="climate-gauge__normal" style={{ left: `${gauge.lowPercent}%`, width: `${gauge.highPercent - gauge.lowPercent}%` }} />
      <span className="climate-gauge__value" style={{ left: `${gauge.valuePercent}%` }} />
    </span>
  );
}
