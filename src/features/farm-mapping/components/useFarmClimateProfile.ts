import type { Polygon } from "geojson";
import { useEffect, useState } from "react";
import { fetchLotClimateProfile, type LotClimateProfile } from "../infrastructure/climateProfileApi";

export type FarmClimateProfileState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ready"; profile: LotClimateProfile }
  | { status: "failed" };

export function useFarmClimateProfile(boundary: Polygon | null, isEnabled: boolean) {
  const [state, setState] = useState<FarmClimateProfileState>({ status: "idle" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!isEnabled || !boundary) {
      return;
    }
    const controller = new AbortController();
    queueMicrotask(() => setState({ status: "loading" }));
    fetchLotClimateProfile(boundary, controller.signal)
      .then((profile) => setState({ status: "ready", profile }))
      .catch(() => {
        if (!controller.signal.aborted) {
          setState({ status: "failed" });
        }
      });
    return () => controller.abort();
  }, [boundary, isEnabled, attempt]);

  return { state, retry: () => setAttempt((current) => current + 1) };
}
