import type { GeographicBounds } from "@/features/rotation-plan/domain/lotSilhouette";

const imageryExportEndpoint = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/export";

export function satelliteSnapshotUrl({ west, south, east, north }: GeographicBounds, sizeInPixels: number): string {
  const parameters = new URLSearchParams({
    bbox: [west, south, east, north].map((value) => value.toFixed(7)).join(","),
    bboxSR: "4326",
    imageSR: "4326",
    size: `${sizeInPixels},${sizeInPixels}`,
    format: "jpg",
    f: "image",
  });
  return `${imageryExportEndpoint}?${parameters.toString()}`;
}
