import type { StyleSpecification } from "maplibre-gl";

const defaultTilesUrl =
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
const defaultAttribution = "Esri, Maxar, Earthstar Geographics";

export function createSatelliteStyle(): StyleSpecification {
  return {
    version: 8,
    sources: {
      satellite: {
        type: "raster",
        tiles: [process.env.NEXT_PUBLIC_SATELLITE_TILES_URL ?? defaultTilesUrl],
        tileSize: 256,
        maxzoom: 19,
        attribution: process.env.NEXT_PUBLIC_SATELLITE_ATTRIBUTION ?? defaultAttribution,
      },
    },
    layers: [{ id: "satellite", type: "raster", source: "satellite" }],
  };
}
