import type { Polygon } from "geojson";

export type SilhouettePoint = [x: number, y: number];

const degreesToRadians = Math.PI / 180;

export function toSilhouettePoints(lot: Polygon, boxSize: number, padding: number): SilhouettePoint[] {
  const ring = lot.coordinates[0].slice(0, -1);
  const meanLatitude = ring.reduce((sum, [, latitude]) => sum + latitude, 0) / ring.length;
  const longitudeScale = Math.cos(meanLatitude * degreesToRadians);
  const projected = ring.map(([longitude, latitude]) => [longitude * longitudeScale, latitude] as const);

  const xs = projected.map(([x]) => x);
  const ys = projected.map(([, y]) => y);
  const minimumX = Math.min(...xs);
  const maximumY = Math.max(...ys);
  const width = Math.max(...xs) - minimumX;
  const height = maximumY - Math.min(...ys);
  const drawableSize = boxSize - padding * 2;
  const scale = drawableSize / Math.max(width, height);
  const offsetX = padding + (drawableSize - width * scale) / 2;
  const offsetY = padding + (drawableSize - height * scale) / 2;

  return projected.map(([x, y]) => [offsetX + (x - minimumX) * scale, offsetY + (maximumY - y) * scale]);
}

export type GeographicBounds = { west: number; south: number; east: number; north: number };

export function silhouetteBounds(lot: Polygon, boxSize: number, padding: number): GeographicBounds {
  const ring = lot.coordinates[0].slice(0, -1);
  const meanLatitude = ring.reduce((sum, [, latitude]) => sum + latitude, 0) / ring.length;
  const longitudeScale = Math.cos(meanLatitude * degreesToRadians);
  const longitudes = ring.map(([longitude]) => longitude);
  const latitudes = ring.map(([, latitude]) => latitude);
  const minimumLongitude = Math.min(...longitudes);
  const maximumLongitude = Math.max(...longitudes);
  const minimumLatitude = Math.min(...latitudes);
  const maximumLatitude = Math.max(...latitudes);
  const largestSide = Math.max((maximumLongitude - minimumLongitude) * longitudeScale, maximumLatitude - minimumLatitude);
  const halfSide = (largestSide * boxSize) / (boxSize - padding * 2) / 2;
  const centerLongitude = (minimumLongitude + maximumLongitude) / 2;
  const centerLatitude = (minimumLatitude + maximumLatitude) / 2;
  return {
    west: centerLongitude - halfSide / longitudeScale,
    east: centerLongitude + halfSide / longitudeScale,
    south: centerLatitude - halfSide,
    north: centerLatitude + halfSide,
  };
}
