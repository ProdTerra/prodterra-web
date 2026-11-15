import { afterEach, describe, expect, it, vi } from "vitest";
import { searchPlaces } from "./placeSearch";

const geocodeResponse = {
  candidates: [
    {
      address: "Cartago, Llano Grande",
      location: { x: -83.91, y: 9.939 },
      attributes: { PlaceName: "Llano Grande", Subregion: "Cartago", Region: "Cartago" },
    },
    {
      address: "Cartago, Alvorado, Pacayas, Llano Grande",
      location: { x: -83.821, y: 9.915 },
      attributes: { PlaceName: "Llano Grande", Subregion: "Alvorado", Region: "Cartago" },
    },
    {
      address: "Cartago, Llano Grande, Llano Grande",
      location: { x: -83.909, y: 9.939 },
      attributes: { PlaceName: "Llano Grande", Subregion: "Cartago", Region: "Cartago" },
    },
    {
      address: "Somewhere without attributes",
      location: { x: 1, y: 2 },
    },
  ],
};

describe("searchPlaces", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("asks the ArcGIS geocoder in the user's language and lists each place once", async () => {
    vi.stubEnv("NEXT_PUBLIC_ARCGIS_API_KEY", "test-key");
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(geocodeResponse)));
    vi.stubGlobal("fetch", fetchMock);

    const places = await searchPlaces("Llano Grande", "es");

    const requestedUrl = new URL(String(fetchMock.mock.calls[0][0]));
    expect(requestedUrl.origin + requestedUrl.pathname).toBe(
      "https://geocode-api.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates",
    );
    expect(requestedUrl.searchParams.get("SingleLine")).toBe("Llano Grande");
    expect(requestedUrl.searchParams.get("langCode")).toBe("es");
    expect(requestedUrl.searchParams.get("token")).toBe("test-key");
    expect(requestedUrl.searchParams.get("forStorage")).toBe("false");
    expect(places).toEqual([
      { placeId: "0", label: "Llano Grande, Cartago", longitude: -83.91, latitude: 9.939 },
      { placeId: "1", label: "Llano Grande, Alvorado, Cartago", longitude: -83.821, latitude: 9.915 },
      { placeId: "3", label: "Somewhere without attributes", longitude: 1, latitude: 2 },
    ]);
  });

  it("fails when the geocoder answers with an error, even with status 200", async () => {
    vi.stubEnv("NEXT_PUBLIC_ARCGIS_API_KEY", "test-key");
    const errorBody = { error: { code: 498, message: "Invalid token." } };
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify(errorBody))));

    await expect(searchPlaces("Cartago", "es")).rejects.toThrow("498");
  });
});
