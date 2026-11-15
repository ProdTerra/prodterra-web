import { readArcgisApiKey } from "./arcgisApiKey";

const imageryStyleEndpoint =
  "https://basemapstyles-api.arcgis.com/arcgis/rest/services/styles/v2/styles/arcgis/imagery";

export function createSatelliteStyleUrl(language: string): string {
  const url = new URL(imageryStyleEndpoint);
  url.search = new URLSearchParams({ token: readArcgisApiKey(), language }).toString();
  return url.toString();
}
