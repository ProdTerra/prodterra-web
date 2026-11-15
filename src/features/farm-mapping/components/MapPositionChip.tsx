import { useFormatter, useTranslations } from "next-intl";
import type { MapCoordinates } from "./SatelliteMap";
import { useCenterElevation } from "./useCenterElevation";

const coordinateDecimals = 5;

export function MapPositionChip({ center }: { center: MapCoordinates }) {
  const translate = useTranslations("farmMapping.position");
  const format = useFormatter();
  const elevation = useCenterElevation(center);
  const formatCoordinate = (value: number) =>
    format.number(value, {
      minimumFractionDigits: coordinateDecimals,
      maximumFractionDigits: coordinateDecimals,
    });

  return (
    <section aria-label={translate("label")} className="position-chip">
      <dl>
        <div>
          <dt>{translate("latitude")}</dt>
          <dd>{formatCoordinate(center.latitude)}</dd>
        </div>
        <div>
          <dt>{translate("longitude")}</dt>
          <dd>{formatCoordinate(center.longitude)}</dd>
        </div>
        <div>
          <dt>{translate("elevation")}</dt>
          <dd aria-live="polite">
            {elevation.status === "found" &&
              translate("meters", {
                value: format.number(elevation.elevationInMeters, { useGrouping: "always" }),
              })}
            {elevation.status === "loading" && translate("loading")}
            {elevation.status === "unavailable" && translate("unavailable")}
          </dd>
        </div>
      </dl>
      <p className="position-chip__source">{translate("source")}</p>
    </section>
  );
}
