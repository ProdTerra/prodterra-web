import { useEffect, useState } from "react";
import { fetchElevationInMeters } from "../infrastructure/terrainApi";
import type { MapCoordinates } from "./SatelliteMap";

export type CenterElevation =
  | { status: "loading" }
  | { status: "found"; elevationInMeters: number }
  | { status: "unavailable" };

const debounceInMilliseconds = 400;

export function useCenterElevation(center: MapCoordinates): CenterElevation {
  const [elevation, setElevation] = useState<CenterElevation>({ status: "loading" });

  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setElevation({ status: "loading" });
      try {
        const elevationInMeters = await fetchElevationInMeters(center, controller.signal);
        setElevation(
          elevationInMeters === null
            ? { status: "unavailable" }
            : { status: "found", elevationInMeters },
        );
      } catch {
        if (!controller.signal.aborted) {
          setElevation({ status: "unavailable" });
        }
      }
    }, debounceInMilliseconds);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [center]);

  return elevation;
}
