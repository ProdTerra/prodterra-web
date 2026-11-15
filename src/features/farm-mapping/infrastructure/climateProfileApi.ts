import type { Polygon } from "geojson";
import type { MonthlyClimate } from "../domain/climateSummary";
import { apiUrl } from "./apiClient";

export type LotClimateProfile = {
  elevation: { meanInMeters: number; minimumInMeters: number; maximumInMeters: number };
  climateGridElevationInMeters: number;
  temperatureCorrectionInCelsius: number;
  months: MonthlyClimate[];
};

export async function fetchLotClimateProfile(boundary: Polygon, signal: AbortSignal): Promise<LotClimateProfile> {
  const response = await fetch(apiUrl("/lots/climate-profile"), {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ boundary }),
    signal,
  });
  if (!response.ok) {
    throw new Error(`Climate profile request failed with status ${response.status}`);
  }
  return (await response.json()) as LotClimateProfile;
}
