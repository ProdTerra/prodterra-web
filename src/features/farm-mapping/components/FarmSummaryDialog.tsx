"use client";

import { ExternalLink, Mountain, Ruler, Sun } from "lucide-react";
import type { Polygon } from "geojson";
import { useFormatter, useTranslations } from "next-intl";
import { useId, type ReactNode } from "react";
import { useModalDialog } from "@/shared/components/useModalDialog";
import type { Lot } from "../application/farmMappingState";
import { summarizeClimate } from "../domain/climateSummary";
import { useAreaFormatter } from "./useAreaFormatter";
import { useFarmClimateProfile } from "./useFarmClimateProfile";

const nasademUrl = "https://planetarycomputer.microsoft.com/dataset/nasadem";
const nasaPowerUrl = "https://power.larc.nasa.gov";

type FarmSummaryDialogProps = {
  isOpen: boolean;
  farmBoundary: Polygon;
  farmAreaInHectares: number;
  lots: Lot[];
  onClose: () => void;
  onContinue: () => void;
};

type SummaryRow = { label: string; value: string };

function SummarySection({
  icon,
  title,
  rows,
  source,
}: {
  icon: ReactNode;
  title: string;
  rows: SummaryRow[];
  source: ReactNode;
}) {
  return (
    <section className="summary-section">
      <h3 className="summary-section__title">
        <span aria-hidden className="summary-section__icon">
          {icon}
        </span>
        {title}
      </h3>
      <dl className="summary-section__rows">
        {rows.map((row) => (
          <div key={row.label}>
            <dt>{row.label}</dt>
            <dd>{row.value}</dd>
          </div>
        ))}
      </dl>
      <p className="summary-section__source">{source}</p>
    </section>
  );
}

function SourceLink({ href, label, children }: { href: string; label: string; children: ReactNode }) {
  return (
    <>
      {children}{" "}
      <a href={href} target="_blank" rel="noreferrer" className="source-link">
        {label}
        <ExternalLink aria-hidden size={12} />
      </a>
    </>
  );
}

export function FarmSummaryDialog({
  isOpen,
  farmBoundary,
  farmAreaInHectares,
  lots,
  onClose,
  onContinue,
}: FarmSummaryDialogProps) {
  const translate = useTranslations("farmMapping.summary");
  const format = useFormatter();
  const formatArea = useAreaFormatter();
  const titleId = useId();
  const dialogProps = useModalDialog(isOpen, onClose);
  const { state, retry } = useFarmClimateProfile(farmBoundary, isOpen);

  const lotsArea = lots.reduce((total, lot) => total + lot.areaInHectares, 0);
  const formatMeters = (value: number) => `${format.number(value, { useGrouping: "always" })} m`;
  const formatDecimal = (value: number) => format.number(value, { maximumFractionDigits: 1 });
  const monthName = (month: number) =>
    format.dateTime(new Date(Date.UTC(2026, month - 1, 15)), { month: "long", timeZone: "UTC" });

  const landRows: SummaryRow[] = [
    { label: translate("farmArea"), value: formatArea(farmAreaInHectares) },
    { label: translate("lotCount"), value: format.number(lots.length) },
    { label: translate("freeArea"), value: formatArea(Math.max(farmAreaInHectares - lotsArea, 0)) },
  ];

  return (
    <dialog {...dialogProps} aria-labelledby={titleId} className="dialog dialog--wide">
      <div className="dialog__body">
        <h2 id={titleId} className="dialog__title">
          {translate("title")}
        </h2>
        <p className="dialog__description">{translate("intro")}</p>

        <SummarySection
          icon={<Ruler size={18} />}
          title={translate("landTitle")}
          rows={landRows}
          source={translate("landSource")}
        />

        {state.status === "loading" && (
          <p role="status" className="notice">
            {translate("loading")}
          </p>
        )}
        {state.status === "failed" && (
          <div role="alert" className="notice notice--error">
            <p>{translate("failed")}</p>
            <button type="button" onClick={retry} className="button button--quiet">
              {translate("retry")}
            </button>
          </div>
        )}
        {state.status === "ready" && (
          <>
            <SummarySection
              icon={<Mountain size={18} />}
              title={translate("elevationTitle")}
              rows={[
                { label: translate("elevationMean"), value: formatMeters(state.profile.elevation.meanInMeters) },
                {
                  label: translate("elevationRangeLabel"),
                  value: translate("elevationRange", {
                    minimum: formatMeters(state.profile.elevation.minimumInMeters),
                    maximum: formatMeters(state.profile.elevation.maximumInMeters),
                  }),
                },
              ]}
              source={
                <SourceLink href={nasademUrl} label={translate("openSource")}>
                  {translate("elevationSource")}
                </SourceLink>
              }
            />
            <ClimateSection
              months={state.profile.months}
              correction={state.profile.temperatureCorrectionInCelsius}
              monthName={monthName}
              formatDecimal={formatDecimal}
            />
            <p className="summary-note">{translate("estimateNote")}</p>
          </>
        )}

        <div className="dialog__actions">
          <button type="button" onClick={onClose} className="button button--outline">
            {translate("back")}
          </button>
          <button type="button" onClick={onContinue} className="button button--primary">
            {translate("continue")}
          </button>
        </div>
      </div>
    </dialog>
  );
}

function ClimateSection({
  months,
  correction,
  monthName,
  formatDecimal,
}: {
  months: Parameters<typeof summarizeClimate>[0];
  correction: number;
  monthName: (month: number) => string;
  formatDecimal: (value: number) => string;
}) {
  const translate = useTranslations("farmMapping.summary");
  const summary = summarizeClimate(months);
  const temperature = (month: number, value: number) =>
    translate("temperatureValue", { month: monthName(month), value: formatDecimal(value) });
  const rain = (month: number, value: number) =>
    translate("rainValue", { month: monthName(month), value: formatDecimal(value) });

  return (
    <SummarySection
      icon={<Sun size={18} />}
      title={translate("climateTitle")}
      rows={[
        { label: translate("coldestMonth"), value: temperature(summary.coldestMonth.month, summary.coldestMonth.valueInCelsius) },
        { label: translate("warmestMonth"), value: temperature(summary.warmestMonth.month, summary.warmestMonth.valueInCelsius) },
        { label: translate("coldestNight"), value: temperature(summary.coldestNight.month, summary.coldestNight.valueInCelsius) },
        { label: translate("driestMonth"), value: rain(summary.driestMonth.month, summary.driestMonth.millimetersPerDay) },
        { label: translate("wettestMonth"), value: rain(summary.wettestMonth.month, summary.wettestMonth.millimetersPerDay) },
        { label: translate("humidity"), value: translate("percentValue", { value: formatDecimal(summary.averageHumidityInPercent) }) },
        { label: translate("sunlight"), value: translate("sunlightValue", { value: formatDecimal(summary.averageSolarRadiation) }) },
      ]}
      source={
        <SourceLink href={nasaPowerUrl} label={translate("openSource")}>
          {translate("climateSource", { correction: formatDecimal(correction) })}
        </SourceLink>
      }
    />
  );
}
