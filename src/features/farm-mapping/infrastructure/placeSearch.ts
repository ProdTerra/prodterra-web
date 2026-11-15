import { readArcgisApiKey } from "./arcgisApiKey";

export type PlaceResult = {
  placeId: string;
  label: string;
  longitude: number;
  latitude: number;
};

type GeocodeCandidate = {
  address: string;
  location: { x: number; y: number };
  attributes?: { PlaceName?: string; Subregion?: string; Region?: string };
};

type GeocodeResponse = {
  candidates?: GeocodeCandidate[];
  error?: { code: number; message: string };
};

const geocodeEndpoint =
  "https://geocode-api.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates";
const maximumResults = 5;

export async function searchPlaces(query: string, language: string): Promise<PlaceResult[]> {
  const url = new URL(geocodeEndpoint);
  url.search = new URLSearchParams({
    SingleLine: query,
    f: "json",
    maxLocations: String(maximumResults),
    langCode: language,
    forStorage: "false",
    outFields: "PlaceName,Place_addr,Type,Subregion,Region,Country",
    token: readArcgisApiKey(),
  }).toString();

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Place search failed with status ${response.status}`);
  }
  const body = (await response.json()) as GeocodeResponse;
  if (body.error) {
    throw new Error(`Place search failed with code ${body.error.code}: ${body.error.message}`);
  }
  return withoutRepeatedLabels((body.candidates ?? []).map(toPlaceResult));
}

function describeCandidate(candidate: GeocodeCandidate): string {
  const { PlaceName, Subregion, Region } = candidate.attributes ?? {};
  const parts = [PlaceName, Subregion, Region].filter((part): part is string => Boolean(part));
  const uniqueParts = parts.filter((part, index) => parts.indexOf(part) === index);
  return uniqueParts.length > 0 ? uniqueParts.join(", ") : candidate.address;
}

function toPlaceResult(candidate: GeocodeCandidate, index: number): PlaceResult {
  return {
    placeId: String(index),
    label: describeCandidate(candidate),
    longitude: candidate.location.x,
    latitude: candidate.location.y,
  };
}

function withoutRepeatedLabels(places: PlaceResult[]): PlaceResult[] {
  const seenLabels = new Set<string>();
  return places.filter((place) => {
    if (seenLabels.has(place.label)) {
      return false;
    }
    seenLabels.add(place.label);
    return true;
  });
}
