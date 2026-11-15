import { useTranslations } from "next-intl";
import { missingAnswers, type LotRotation } from "../domain/rotationPlan";
import { usePlanFormat } from "./usePlanFormat";

export function useLotStatus(cropName: (cropKey: string) => string) {
  const translate = useTranslations("rotationPlan.lotStatus");
  const { list } = usePlanFormat();

  return function lotStatus(rotation: LotRotation): string {
    const missing = missingAnswers(rotation);
    if (missing.length > 0) {
      return translate("missing", { items: list(missing.map((item) => translate(item))) });
    }
    const uses = rotation.blocks.map((block) => (block.kind === "crop" ? cropName(block.cropKey) : translate("rest")));
    return list([...new Set(uses)]);
  };
}
