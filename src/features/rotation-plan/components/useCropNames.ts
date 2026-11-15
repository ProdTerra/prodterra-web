import { useLocale } from "next-intl";
import type { CatalogCrop } from "../infrastructure/cropCatalogApi";
import { useCropCatalog } from "./useCropCatalog";

export function useCropNames() {
  const locale = useLocale();
  const { state, retry } = useCropCatalog();
  const crops: CatalogCrop[] = state.status === "ready" ? state.crops : [];
  const localized = (crop: CatalogCrop) => (locale === "en" ? crop.name.en : crop.name.es);

  return {
    status: state.status,
    retry,
    crops: [...crops].sort((first, second) => localized(first).localeCompare(localized(second), locale)),
    cropName: (cropKey: string) => {
      const crop = crops.find((candidate) => candidate.key === cropKey);
      return crop ? localized(crop) : cropKey;
    },
    localized,
    referenceOf: (cropKey: string) => crops.find((candidate) => candidate.key === cropKey)?.referenceCycleInDays ?? null,
  };
}
