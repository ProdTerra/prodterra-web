import { useFormatter, useTranslations } from "next-intl";
import { toAreaMeasure } from "../domain/areaMeasure";

export function useAreaFormatter() {
  const translate = useTranslations("farmMapping.area");
  const format = useFormatter();

  return function formatArea(areaInHectares: number): string {
    const measure = toAreaMeasure(areaInHectares);
    const value = format.number(measure.value, { useGrouping: "always" });
    return measure.unit === "squareMeters"
      ? translate("squareMeters", { value })
      : translate("hectares", { value });
  };
}
