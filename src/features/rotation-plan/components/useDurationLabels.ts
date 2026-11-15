import { useTranslations } from "next-intl";
import { toHalfMonths, toWeeks } from "../domain/durationMeasure";
import { usePlanFormat } from "./usePlanFormat";

export function useDurationLabels() {
  const translate = useTranslations("rotationPlan.rotation");
  const { decimal } = usePlanFormat();

  return {
    weeks: (durationInDays: number) => translate("weeks", { weeks: toWeeks(durationInDays) }),
    months: (durationInDays: number) => {
      const halfMonths = toHalfMonths(durationInDays);
      return translate("months", { halfMonths: String(halfMonths), months: decimal(halfMonths / 2) });
    },
  };
}
