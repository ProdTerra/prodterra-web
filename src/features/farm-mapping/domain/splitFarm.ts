import bboxClip from "@turf/bbox-clip";
import type { BBox, Geometry, MultiPolygon, Polygon, Position } from "geojson";

export type SplitLayout = "along" | "across" | "grid";

type Axis = "x" | "y";

type LocalFrame = {
  originLongitude: number;
  originLatitude: number;
  metersPerDegreeLongitude: number;
  angleInRadians: number;
};

const metersPerDegreeLatitude = 110_574;
const metersPerDegreeLongitudeAtEquator = 111_320;
const cutSearchIterations = 40;

function rotate([x, y]: Position, angleInRadians: number): Position {
  const cosine = Math.cos(angleInRadians);
  const sine = Math.sin(angleInRadians);
  return [x * cosine - y * sine, x * sine + y * cosine];
}

function toLocal(frame: LocalFrame, [longitude, latitude]: Position): Position {
  const planar: Position = [
    (longitude - frame.originLongitude) * frame.metersPerDegreeLongitude,
    (latitude - frame.originLatitude) * metersPerDegreeLatitude,
  ];
  return rotate(planar, -frame.angleInRadians);
}

function toGeographic(frame: LocalFrame, point: Position): Position {
  const [x, y] = rotate(point, frame.angleInRadians);
  return [frame.originLongitude + x / frame.metersPerDegreeLongitude, frame.originLatitude + y / metersPerDegreeLatitude];
}

function mapPolygon(polygon: Polygon, transform: (point: Position) => Position): Polygon {
  return { type: "Polygon", coordinates: polygon.coordinates.map((ring) => ring.map(transform)) };
}

function ringArea(ring: Position[]): number {
  let doubledArea = 0;
  for (let index = 0; index < ring.length - 1; index += 1) {
    doubledArea += ring[index][0] * ring[index + 1][1] - ring[index + 1][0] * ring[index][1];
  }
  return Math.abs(doubledArea) / 2;
}

function planarArea(geometry: Polygon | MultiPolygon): number {
  const polygons = geometry.type === "Polygon" ? [geometry.coordinates] : geometry.coordinates;
  return polygons.reduce((total, [outer, ...holes]) => {
    const holesArea = holes.reduce((sum, hole) => sum + ringArea(hole), 0);
    return total + ringArea(outer) - holesArea;
  }, 0);
}

function boundsOf(points: Position[]): BBox {
  const xs = points.map(([x]) => x);
  const ys = points.map(([, y]) => y);
  return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
}

function convexHull(points: Position[]): Position[] {
  const sorted = [...points].sort(([ax, ay], [bx, by]) => ax - bx || ay - by);
  const cross = (origin: Position, a: Position, b: Position) =>
    (a[0] - origin[0]) * (b[1] - origin[1]) - (a[1] - origin[1]) * (b[0] - origin[0]);
  const buildChain = (candidates: Position[]) => {
    const chain: Position[] = [];
    for (const point of candidates) {
      while (chain.length >= 2 && cross(chain[chain.length - 2], chain[chain.length - 1], point) <= 0) {
        chain.pop();
      }
      chain.push(point);
    }
    chain.pop();
    return chain;
  };
  return [...buildChain(sorted), ...buildChain([...sorted].reverse())];
}

function normalizeAngle(angleInRadians: number): number {
  let angle = angleInRadians;
  while (angle > Math.PI / 2) angle -= Math.PI;
  while (angle <= -Math.PI / 2) angle += Math.PI;
  return angle;
}

function longAxisAngle(points: Position[]): number {
  const hull = convexHull(points);
  let bestAngle = 0;
  let smallestArea = Number.POSITIVE_INFINITY;
  for (let index = 0; index < hull.length; index += 1) {
    const start = hull[index];
    const end = hull[(index + 1) % hull.length];
    const edgeAngle = Math.atan2(end[1] - start[1], end[0] - start[0]);
    const [west, south, east, north] = boundsOf(hull.map((point) => rotate(point, -edgeAngle)));
    const boxArea = (east - west) * (north - south);
    if (boxArea < smallestArea) {
      smallestArea = boxArea;
      bestAngle = east - west >= north - south ? edgeAngle : edgeAngle + Math.PI / 2;
    }
  }
  return normalizeAngle(bestAngle);
}

function createLocalFrame(farm: Polygon): LocalFrame {
  const ring = farm.coordinates[0];
  const [west, south, east, north] = boundsOf(ring);
  const originLatitude = (south + north) / 2;
  const frame: LocalFrame = {
    originLongitude: (west + east) / 2,
    originLatitude,
    metersPerDegreeLongitude: metersPerDegreeLongitudeAtEquator * Math.cos((originLatitude * Math.PI) / 180),
    angleInRadians: 0,
  };
  const planarRing = ring.map((point) => toLocal(frame, point));
  return { ...frame, angleInRadians: longAxisAngle(planarRing) };
}

function isAreaGeometry(geometry: Geometry): geometry is Polygon | MultiPolygon {
  return geometry.type === "Polygon" || geometry.type === "MultiPolygon";
}

function clipToBox(polygon: Polygon, box: BBox): Polygon | MultiPolygon | null {
  const clipped = bboxClip(polygon, box).geometry;
  return isAreaGeometry(clipped) ? clipped : null;
}

function largestPolygon(geometry: Polygon | MultiPolygon): Polygon {
  if (geometry.type === "Polygon") {
    return geometry;
  }
  const parts: Polygon[] = geometry.coordinates.map((coordinates) => ({ type: "Polygon", coordinates }));
  return parts.reduce((largest, part) => (planarArea(part) > planarArea(largest) ? part : largest));
}

function boxUpTo(bounds: BBox, axis: Axis, start: number, end: number): BBox {
  const [west, south, east, north] = bounds;
  return axis === "x" ? [start, south, end, north] : [west, start, east, end];
}

function findCut(polygon: Polygon, bounds: BBox, axis: Axis, targetArea: number): number {
  const lowStart = axis === "x" ? bounds[0] : bounds[1];
  let low = lowStart;
  let high = axis === "x" ? bounds[2] : bounds[3];
  for (let iteration = 0; iteration < cutSearchIterations; iteration += 1) {
    const middle = (low + high) / 2;
    const clipped = clipToBox(polygon, boxUpTo(bounds, axis, lowStart, middle));
    const areaBeforeCut = clipped ? planarArea(clipped) : 0;
    if (areaBeforeCut < targetArea) {
      low = middle;
    } else {
      high = middle;
    }
  }
  return (low + high) / 2;
}

function cutIntoStrips(polygon: Polygon, count: number, axis: Axis): Polygon[] {
  const bounds = boundsOf(polygon.coordinates[0]);
  const totalArea = planarArea(polygon);
  const start = axis === "x" ? bounds[0] : bounds[1];
  const end = axis === "x" ? bounds[2] : bounds[3];
  const cuts = Array.from({ length: count - 1 }, (_, index) =>
    findCut(polygon, bounds, axis, (totalArea * (index + 1)) / count),
  );
  const edges = [start, ...cuts, end];
  return edges.slice(0, -1).map((stripStart, index) => {
    const clipped = clipToBox(polygon, boxUpTo(bounds, axis, stripStart, edges[index + 1]));
    if (!clipped) {
      throw new Error("Clipping a farm polygon produced a non-area geometry");
    }
    return largestPolygon(clipped);
  });
}

function northFirst(strips: Polygon[]): Polygon[] {
  return [...strips].reverse();
}

function gridShape(count: number, aspectRatio: number): { columns: number; rows: number } | null {
  let best: { columns: number; rows: number } | null = null;
  let bestMismatch = Number.POSITIVE_INFINITY;
  for (let rows = 2; rows <= Math.sqrt(count); rows += 1) {
    if (count % rows !== 0) continue;
    const columns = count / rows;
    for (const shape of [
      { columns, rows },
      { columns: rows, rows: columns },
    ]) {
      const mismatch = Math.abs(Math.log(shape.columns / shape.rows / aspectRatio));
      if (mismatch < bestMismatch) {
        bestMismatch = mismatch;
        best = shape;
      }
    }
  }
  return best;
}

function splitLocal(polygon: Polygon, count: number, layout: SplitLayout): Polygon[] {
  if (layout === "along") {
    return northFirst(cutIntoStrips(polygon, count, "y"));
  }
  if (layout === "across") {
    return cutIntoStrips(polygon, count, "x");
  }
  const [west, south, east, north] = boundsOf(polygon.coordinates[0]);
  const shape = gridShape(count, (east - west) / Math.max(north - south, Number.EPSILON));
  if (!shape) {
    return cutIntoStrips(polygon, count, "x");
  }
  const columns = cutIntoStrips(polygon, shape.columns, "x").map((column) =>
    northFirst(cutIntoStrips(column, shape.rows, "y")),
  );
  return Array.from({ length: shape.rows }, (_, row) => columns.map((column) => column[row])).flat();
}

export function splitFarm(farm: Polygon, lotCount: number, layout: SplitLayout): Polygon[] {
  if (lotCount <= 1) {
    return [farm];
  }
  const frame = createLocalFrame(farm);
  const localFarm = mapPolygon(farm, (point) => toLocal(frame, point));
  return splitLocal(localFarm, lotCount, layout).map((part) => mapPolygon(part, (point) => toGeographic(frame, point)));
}
