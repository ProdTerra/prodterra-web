"use client";

import { Droplets, ExternalLink, Mountain, Ruler, Sun, Thermometer } from "lucide-react";
import type { Polygon } from "geojson";
import { useFormatter, useTranslations } from "next-intl";
import { useId, type ReactNode } from "react";
import { useModalDialog } from "@/shared/components/useModalDialog";
import type { Lot } from "../application/farmMappingState";
import { describeHumidity, describeTemperature } from "../domain/climateDescriptors";
import { summarizeClimate } from "../domain/climateSummary";
import type { LotClimateProfile } from "../infrastructure/climateProfileApi";
import { RainByMonthChart } from "./RainByMonthChart";
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

function StatTile({ icon, label, value, detail }: { icon: ReactNode; label: string; value: string; detail: string }) {
  return (
    <div className="stat-tile">
      <span className="stat-tile__label">
        <span aria-hidden className="stat-tile__icon">
          {icon}
        </span>
        {label}
      </span>
      <span className="stat-tile__value">{value}</span>
      <span className="stat-tile__detail">{detail}</span>
    </div>
  );
}

function SourceLink({ href, label }: { href: string; label: string }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className="source-link">
      {label}
      <ExternalLink aria-hidden size={12} />
    </a>
  );
}

function useSummaryFormatters() {
  const format = useFormatter();
  return {
    meters: (value: number) => `${format.number(value, { useGrouping: "always" })} m`,
    decimal: (value: number) => format.number(value, { maximumFractionDigits: 1 }),
    whole: (value: number) => format.number(Math.round(value)),
    monthName: (month: number) =>
      format.dateTime(new Date(Date.UTC(2026, month - 1, 15)), { month: "long", timeZone: "UTC" }),
  };
}

function ClimateOverview({ profile, landTile }: { profile: LotClimateProfile; landTile: ReactNode }) {
  const translate = useTranslations("farmMapping.summary");
  const formatters = useSummaryFormatters();
  const summary = summarizeClimate(profile.months);
  const temperatureBand = describeTemperature(summary.coldestMonth.valueInCelsius, summary.warmestMonth.valueInCelsius);
  const humidityBand = describeHumidity(summary.averageHumidityInPercent);

  return (
    <>
      <div className="stat-tiles">
        {landTile}
        <StatTile
          icon={<Mountain size={16} />}
          label={translate("elevationTile")}
          value={formatters.meters(profile.elevation.meanInMeters)}
          detail={translate("elevationDetail", {
            minimum: formatters.meters(profile.elevation.minimumInMeters),
            maximum: formatters.meters(profile.elevation.maximumInMeters),
          })}
        />
        <StatTile
          icon={<Thermometer size={16} />}
          label={translate("temperatureTile")}
          value={translate("temperatureValue", {
            minimum: formatters.whole(summary.coldestMonth.valueInCelsius),
            maximum: formatters.whole(summary.warmestMonth.valueInCelsius),
          })}
          detail={translate("temperatureDetail", { value: formatters.whole(summary.coldestNight.valueInCelsius) })}
        />
      </div>

      <ul className="climate-tags">
        <li>
          <Thermometer aria-hidden size={14} />
          {translate(`temperatureBand.${temperatureBand}`)}
        </li>
        <li>
          <Droplets aria-hidden size={14} />
          {translate(`humidityBand.${humidityBand}`, { value: formatters.whole(summary.averageHumidityInPercent) })}
        </li>
        <li>
          <Sun aria-hidden size={14} />
          {translate("sunlight", { value: formatters.decimal(summary.averageSolarRadiation) })}
        </li>
      </ul>

      <RainByMonthChart
        months={profile.months}
        driestMonth={summary.driestMonth.month}
        wettestMonth={summary.wettestMonth.month}
        monthName={formatters.monthName}
      />
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
  const formatArea = useAreaFormatter();
  const formatters = useSummaryFormatters();
  const titleId = useId();
  const dialogProps = useModalDialog(isOpen, onClose);
  const { state, retry } = useFarmClimateProfile(farmBoundary, isOpen);
  const landTile = (
    <StatTile
      icon={<Ruler size={16} />}
      label={translate("landTile")}
      value={formatArea(farmAreaInHectares)}
      detail={translate("landDetail", { count: lots.length })}
    />
  );

  return (
    <dialog {...dialogProps} aria-labelledby={titleId} className="dialog dialog--wide">
      <div className="dialog__body summary">
        <header>
          <h2 id={titleId} className="dialog__title">
            {translate("title")}
          </h2>
          <p className="dialog__description">{translate("intro")}</p>
        </header>

        {state.status !== "ready" && <div className="stat-tiles">{landTile}</div>}

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
        {state.status === "ready" && <ClimateOverview profile={state.profile} landTile={landTile} />}

        <details className="summary-sources">
          <summary>{translate("sourcesTitle")}</summary>
          <ul>
            <li>{translate("landSource")}</li>
            <li>
              {translate("elevationSource")} <SourceLink href={nasademUrl} label={translate("openSource")} />
            </li>
            {state.status === "ready" && (
              <li>
                {translate("climateSource", {
                  correction: formatters.decimal(state.profile.temperatureCorrectionInCelsius),
                })}{" "}
                <SourceLink href={nasaPowerUrl} label={translate("openSource")} />
              </li>
            )}
            <li>{translate("estimateNote")}</li>
          </ul>
        </details>

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
