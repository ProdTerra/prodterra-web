import { apiUrl } from "@/features/farm-mapping/infrastructure/apiClient";

export type CatalogCrop = {
  key: string;
  name: { es: string; en: string };
  familyKey: string;
  referenceCycleInDays: number | null;
};

export async function fetchCatalogCrops(signal: AbortSignal): Promise<CatalogCrop[]> {
  const response = await fetch(apiUrl("/catalog/crops"), { signal });
  if (!response.ok) {
    throw new Error(`Crop catalog request failed with status ${response.status}`);
  }
  return (await response.json()) as CatalogCrop[];
}
