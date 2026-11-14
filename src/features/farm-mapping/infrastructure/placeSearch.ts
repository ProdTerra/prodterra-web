export type PlaceResult = {
  placeId: string;
  label: string;
  longitude: number;
  latitude: number;
};

type NominatimPlace = {
  place_id: number;
  display_name: string;
  lon: string;
  lat: string;
};

const searchEndpoint = "https://nominatim.openstreetmap.org/search";
const maximumResults = 5;

export async function searchPlaces(query: string, language: string): Promise<PlaceResult[]> {
  const url = new URL(searchEndpoint);
  url.search = new URLSearchParams({
    q: query,
    format: "jsonv2",
    limit: String(maximumResults),
    "accept-language": language,
  }).toString();

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Place search failed with status ${response.status}`);
  }
  const places = (await response.json()) as NominatimPlace[];
  return places.map((place) => ({
    placeId: String(place.place_id),
    label: place.display_name,
    longitude: Number(place.lon),
    latitude: Number(place.lat),
  }));
}
