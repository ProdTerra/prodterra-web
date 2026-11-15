import { apiUrl } from "@/features/farm-mapping/infrastructure/apiClient";
import type { SavedFarm, SavedFarmSnapshot, SavedFarmSummary } from "../domain/savedFarm";

export type SavedFarmsFailure = "notAuthenticated" | "notFound" | "unavailable";

export class SavedFarmsError extends Error {
  constructor(readonly reason: SavedFarmsFailure) {
    super(`Saved farms request failed: ${reason}`);
  }
}

function failureOf(status: number): SavedFarmsFailure {
  if (status === 401) {
    return "notAuthenticated";
  }
  return status === 404 ? "notFound" : "unavailable";
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(apiUrl(path), {
      ...init,
      credentials: "include",
      headers: init.body ? { "Content-Type": "application/json" } : undefined,
    });
  } catch {
    throw new SavedFarmsError("unavailable");
  }
  if (!response.ok) {
    throw new SavedFarmsError(failureOf(response.status));
  }
  return response.status === 204 ? (undefined as T) : ((await response.json()) as T);
}

export function listSavedFarms(): Promise<SavedFarmSummary[]> {
  return request<SavedFarmSummary[]>("/farms");
}

export function getSavedFarm(farmId: string): Promise<SavedFarm> {
  return request<SavedFarm>(`/farms/${encodeURIComponent(farmId)}`);
}

export function saveFarm(farmId: string | null, name: string, snapshot: SavedFarmSnapshot): Promise<SavedFarm> {
  const body = JSON.stringify({ name, snapshot });
  return farmId
    ? request<SavedFarm>(`/farms/${encodeURIComponent(farmId)}`, { method: "PUT", body })
    : request<SavedFarm>("/farms", { method: "POST", body });
}

export function deleteSavedFarm(farmId: string): Promise<void> {
  return request<void>(`/farms/${encodeURIComponent(farmId)}`, { method: "DELETE" });
}
