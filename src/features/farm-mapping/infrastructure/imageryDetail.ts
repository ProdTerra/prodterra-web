import { tileAt } from "../domain/mapTiles";

type MapCoordinates = { longitude: number; latitude: number };

const imageryTilemapUrl = "https://services.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/tilemap";
const shallowestCheckedLevel = 18;
export const deepestServedLevel = 23;
export const defaultImageryLevel = 19;

const deepestLevelByArea = new Map<string, Promise<number>>();

async function hasTileAt(point: MapCoordinates, level: number): Promise<boolean> {
  const { zoom, column, row } = tileAt(point, level);
  const response = await fetch(`${imageryTilemapUrl}/${zoom}/${row}/${column}/1/1`);
  if (!response.ok) {
    throw new Error(`Imagery tilemap failed with status ${response.status}`);
  }
  const body = (await response.json()) as { data?: number[] };
  return body.data?.[0] === 1;
}

async function findDeepestLevel(point: MapCoordinates): Promise<number> {
  let deepest = shallowestCheckedLevel - 1;
  for (let level = shallowestCheckedLevel; level <= deepestServedLevel; level += 1) {
    if (!(await hasTileAt(point, level))) {
      break;
    }
    deepest = level;
  }
  return deepest;
}

export function deepestImageryLevelAt(point: MapCoordinates): Promise<number> {
  const { zoom, column, row } = tileAt(point, 17);
  const key = `${zoom}/${row}/${column}`;
  let request = deepestLevelByArea.get(key);
  if (!request) {
    request = findDeepestLevel(point).catch(() => {
      deepestLevelByArea.delete(key);
      return defaultImageryLevel;
    });
    deepestLevelByArea.set(key, request);
  }
  return request;
}
