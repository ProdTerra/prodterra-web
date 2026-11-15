const imageryStyleEndpoint =
  "https://basemapstyles-api.arcgis.com/arcgis/rest/services/styles/v2/styles/arcgis/imagery";

export class MissingBasemapKeyError extends Error {
  constructor() {
    super("NEXT_PUBLIC_ARCGIS_API_KEY is not set. Copy .env.example to .env.local and add the key.");
  }
}

export function createSatelliteStyleUrl(language: string): string {
  const apiKey = process.env.NEXT_PUBLIC_ARCGIS_API_KEY;
  if (!apiKey) {
    throw new MissingBasemapKeyError();
  }
  const url = new URL(imageryStyleEndpoint);
  url.search = new URLSearchParams({ token: apiKey, language }).toString();
  return url.toString();
}
