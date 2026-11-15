import type { Polygon } from "geojson";
import { apiUrl } from "@/features/farm-mapping/infrastructure/apiClient";

export type MonthStatus = "ok" | "watch" | "risk";

export type PlanAlert =
  | { type: "frost"; level: "risk"; minimumTemperatureInCelsius: number }
  | { type: "temperature"; level: "risk"; meanTemperatureInCelsius: number }
  | { type: "pest"; level: "watch"; pestKey: string }
  | { type: "irrigation"; level: "watch"; litersPerSquareMeter: number }
  | { type: "drought"; level: "risk"; litersPerSquareMeter: number };

export type RecommendationReason =
  | { type: "sameFamily"; familyKey: string; positive: false }
  | { type: "differentFamily"; positive: true }
  | { type: "sameNutrient"; nutrient: string; positive: false }
  | { type: "differentNutrient"; nutrient: string; positive: true }
  | { type: "highAfterHighDemand"; positive: false }
  | { type: "restAfterHighDemand"; positive: true }
  | { type: "afterRest"; positive: true }
  | { type: "unknownHistory"; positive: false }
  | { type: "altitudeOutOfRange"; positive: false }
  | { type: "climateFit"; suitableMonths: number; totalMonths: number; positive: boolean }
  | { type: "pestMonths"; months: number; positive: false }
  | { type: "waitForBetterMonth"; months: number; positive: true };

export type CropRecommendation = {
  cropKey: string;
  score: number;
  fitsAltitude: boolean;
  sowMonth: string;
  harvestMonth: string;
  reasons: RecommendationReason[];
};

export type PlanMonth = {
  month: string;
  cropKey: string | null;
  phase: "current" | "next" | "free";
  status: MonthStatus;
  alerts: PlanAlert[];
};

export type LotPlan = {
  lotId: string;
  currentCrop: { cropKey: string; plantedOn: string; harvestMonth: string; cycleIsEstimated: boolean } | null;
  nextCrop: CropRecommendation | null;
  recommendations: CropRecommendation[];
  months: PlanMonth[];
  elevationInMeters: number | null;
  climateAvailable: boolean;
};

export type FarmPlans = {
  startMonth: string;
  horizonInMonths: number;
  usesDemoData: boolean;
  crops: { key: string; name: { es: string; en: string }; familyKey: string }[];
  pests: { key: string; name: { es: string; en: string }; type: string }[];
  lots: LotPlan[];
};

export type LotPlanRequest = {
  lotId: string;
  boundary: Polygon;
  currentUse: { kind: "crop"; cropKey: string; plantedOn: string } | { kind: "fallow" };
  previousUse: { kind: "crop"; cropKey: string } | { kind: "fallow" } | { kind: "unknown" };
  hasIrrigation: boolean;
};

export async function fetchFarmPlans(lots: LotPlanRequest[], signal: AbortSignal): Promise<FarmPlans> {
  const response = await fetch(apiUrl("/plans"), {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ lots }),
    signal,
  });
  if (!response.ok) {
    throw new Error(`Plans request failed with status ${response.status}`);
  }
  return (await response.json()) as FarmPlans;
}
