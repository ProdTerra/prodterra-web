import area from "@turf/area";
import bbox from "@turf/bbox";
import bboxClip from "@turf/bbox-clip";
import type { BBox, Geometry, MultiPolygon, Polygon } from "geojson";

export type StripOrientation = "vertical" | "horizontal";

const cutSearchIterations = 40;

type Bounds = { west: number; south: number; east: number; north: number };

function toBounds(polygon: Polygon): Bounds {
  const [west, south, east, north] = bbox(polygon);
  return { west, south, east, north };
}

function stripBox(bounds: Bounds, orientation: StripOrientation, start: number, end: number): BBox {
  return orientation === "vertical"
    ? [start, bounds.south, end, bounds.north]
    : [bounds.west, start, bounds.east, end];
}

function isAreaGeometry(geometry: Geometry): geometry is Polygon | MultiPolygon {
  return geometry.type === "Polygon" || geometry.type === "MultiPolygon";
}

function largestPolygon(geometry: Polygon | MultiPolygon): Polygon {
  if (geometry.type === "Polygon") {
    return geometry;
  }
  const parts: Polygon[] = geometry.coordinates.map((coordinates) => ({ type: "Polygon", coordinates }));
  return parts.reduce((largest, part) => (area(part) > area(largest) ? part : largest));
}

function clippedArea(farm: Polygon, box: BBox): number {
  return area(bboxClip(farm, box).geometry);
}

function findCut(
  farm: Polygon,
  bounds: Bounds,
  orientation: StripOrientation,
  targetArea: number,
): number {
  const [lowStart, highStart] =
    orientation === "vertical" ? [bounds.west, bounds.east] : [bounds.south, bounds.north];
  let low = lowStart;
  let high = highStart;
  for (let iteration = 0; iteration < cutSearchIterations; iteration += 1) {
    const middle = (low + high) / 2;
    const areaBeforeCut = clippedArea(farm, stripBox(bounds, orientation, lowStart, middle));
    if (areaBeforeCut < targetArea) {
      low = middle;
    } else {
      high = middle;
    }
  }
  return (low + high) / 2;
}

export function splitIntoEqualStrips(
  farm: Polygon,
  lotCount: number,
  orientation: StripOrientation,
): Polygon[] {
  const bounds = toBounds(farm);
  const totalArea = area(farm);
  const start = orientation === "vertical" ? bounds.west : bounds.south;
  const end = orientation === "vertical" ? bounds.east : bounds.north;

  const cuts = Array.from({ length: lotCount - 1 }, (_, index) =>
    findCut(farm, bounds, orientation, (totalArea * (index + 1)) / lotCount),
  );
  const edges = [start, ...cuts, end];

  const stripsFromStart = edges.slice(0, -1).map((stripStart, index) => {
    const clipped = bboxClip(farm, stripBox(bounds, orientation, stripStart, edges[index + 1])).geometry;
    if (!isAreaGeometry(clipped)) {
      throw new Error("Clipping a farm polygon produced a non-area geometry");
    }
    return largestPolygon(clipped);
  });
  return orientation === "horizontal" ? stripsFromStart.reverse() : stripsFromStart;
}
