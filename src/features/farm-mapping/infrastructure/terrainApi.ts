import type { MapCoordinates } from "../components/SatelliteMap";

const defaultApiUrl = "http://localhost:4000";
const notFoundStatus = 404;

type ElevationResponse = { elevationInMeters: number };

export async function fetchElevationInMeters(
  coordinates: MapCoordinates,
  signal: AbortSignal,
): Promise<number | null> {
  const url = new URL("/terrain/elevation", process.env.NEXT_PUBLIC_API_URL ?? defaultApiUrl);
  url.search = new URLSearchParams({
    latitude: coordinates.latitude.toFixed(6),
    longitude: coordinates.longitude.toFixed(6),
  }).toString();

  const response = await fetch(url, { signal });
  if (response.status === notFoundStatus) {
    return null;
  }
  if (!response.ok) {
    throw new Error(`Elevation request failed with status ${response.status}`);
  }
  const body = (await response.json()) as ElevationResponse;
  return body.elevationInMeters;
}
