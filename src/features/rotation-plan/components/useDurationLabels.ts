import { useTranslations } from "next-intl";
import { toHalfMonths } from "../domain/durationMeasure";
import { usePlanFormat } from "./usePlanFormat";

export function useDurationLabels() {
  const translate = useTranslations("rotationPlan.rotation");
  const { decimal } = usePlanFormat();

  return {
    months: (durationInDays: number) => {
      const halfMonths = toHalfMonths(durationInDays);
      return translate("months", { halfMonths: String(halfMonths), months: decimal(halfMonths / 2) });
    },
  };
}
