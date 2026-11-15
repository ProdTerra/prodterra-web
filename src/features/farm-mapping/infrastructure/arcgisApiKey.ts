export class MissingArcgisKeyError extends Error {
  constructor() {
    super("NEXT_PUBLIC_ARCGIS_API_KEY is not set. Copy .env.example to .env.local and add the key.");
  }
}

export function readArcgisApiKey(): string {
  const apiKey = process.env.NEXT_PUBLIC_ARCGIS_API_KEY;
  if (!apiKey) {
    throw new MissingArcgisKeyError();
  }
  return apiKey;
}
