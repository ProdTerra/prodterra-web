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

export type PlanMonth = {
  month: string;
  cropKey: string | null;
  phase: "crop" | "rest" | "free";
  status: MonthStatus;
  alerts: PlanAlert[];
};

export type PlanEvent = { month: string; day: number; kind: "sowing" | "harvest" };

export type LotPlan = {
  lotId: string;
  months: PlanMonth[];
  events: PlanEvent[];
};

export type RotationWarning =
  | { type: "sameFamilyInARow"; blockIndex: number; familyKey: string }
  | { type: "shorterThanReference"; blockIndex: number; durationInDays: number; referenceCycleInDays: number }
  | { type: "altitudeOutOfRange"; blockIndex: number; cropKey: string };

export type EvaluatedBlock = {
  kind: "crop" | "rest";
  cropKey: string | null;
  durationInDays: number;
  startsOn: string;
  endsOn: string;
  referenceCycleInDays: number | null;
  reasons: RecommendationReason[];
};

export type EvaluatedMonth = {
  month: string;
  cropKey: string | null;
  isRest: boolean;
  status: MonthStatus;
  alerts: PlanAlert[];
};

export type EvaluatedRotation = { blocks: EvaluatedBlock[]; months: EvaluatedMonth[]; warnings: RotationWarning[] };

export type LotRotationEvaluation = {
  lotId: string;
  climateAvailable: boolean;
  elevationInMeters: number | null;
  farmer: EvaluatedRotation | null;
  recommended: EvaluatedRotation | null;
};

export type RotationEvaluation = {
  startDate: string;
  usesDemoData: boolean;
  crops: { key: string; name: { es: string; en: string }; familyKey: string }[];
  pests: { key: string; name: { es: string; en: string }; type: string }[];
  lots: LotRotationEvaluation[];
};

export type RotationEvaluationRequest = {
  startDate: string;
  lots: {
    lotId: string;
    boundary: Polygon;
    previousUse: { kind: "crop"; cropKey: string } | { kind: "fallow" } | { kind: "unknown" };
    hasIrrigation: boolean;
    blocks: ({ kind: "crop"; cropKey: string; durationInDays: number } | { kind: "rest"; durationInDays: number })[];
  }[];
};

export async function fetchRotationEvaluation(
  request: RotationEvaluationRequest,
  signal: AbortSignal,
): Promise<RotationEvaluation> {
  const response = await fetch(apiUrl("/plans/evaluate"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
    signal,
  });
  if (!response.ok) {
    throw new Error(`Rotation evaluation failed with status ${response.status}`);
  }
  return (await response.json()) as RotationEvaluation;
}
