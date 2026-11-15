import { tileAt } from "../domain/mapTiles";

type MapCoordinates = { longitude: number; latitude: number };

export type WaybackRelease = { releaseNumber: number; date: string; tileUrl: string };

type WaybackConfigEntry = { itemTitle?: string; itemURL?: string };

const configUrl = "https://s3-us-west-2.amazonaws.com/config.maptiles.arcgis.com/waybackconfig.json";
const tilemapUrl = "https://wayback.maptiles.arcgis.com/arcgis/rest/services/World_Imagery/MapServer/tilemap";
const datePattern = /(\d{4}-\d{2}-\d{2})/;
const detailZoom = 17;
export const waybackMaximumZoom = 18;
const maximumVersions = 12;

let releasesRequest: Promise<WaybackRelease[]> | null = null;

function toRelease([key, entry]: [string, WaybackConfigEntry]): WaybackRelease | null {
  const date = entry.itemTitle?.match(datePattern)?.[1];
  if (!date || !entry.itemURL) {
    return null;
  }
  const tileUrl = entry.itemURL.replace("{level}", "{z}").replace("{row}", "{y}").replace("{col}", "{x}");
  return { releaseNumber: Number(key), date, tileUrl };
}

export function fetchWaybackReleases(): Promise<WaybackRelease[]> {
  releasesRequest ??= fetch(configUrl)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Wayback config failed with status ${response.status}`);
      }
      return response.json() as Promise<Record<string, WaybackConfigEntry>>;
    })
    .then((config) =>
      Object.entries(config)
        .map(toRelease)
        .filter((release): release is WaybackRelease => release !== null)
        .sort((first, second) => second.date.localeCompare(first.date)),
    )
    .catch((error: unknown) => {
      releasesRequest = null;
      throw error;
    });
  return releasesRequest;
}

async function lastChangeBefore(releaseNumber: number, point: MapCoordinates): Promise<number | null> {
  const { zoom, column, row } = tileAt(point, detailZoom);
  const response = await fetch(`${tilemapUrl}/${releaseNumber}/${zoom}/${row}/${column}`);
  if (!response.ok) {
    return null;
  }
  const body = (await response.json()) as { data?: number[]; select?: number[] };
  return body.data?.[0] === 1 ? (body.select?.[0] ?? releaseNumber) : null;
}

export async function releasesWithChangesAt(point: MapCoordinates): Promise<WaybackRelease[]> {
  const releases = await fetchWaybackReleases();
  const found: WaybackRelease[] = [];
  let searchIndex = 0;
  while (searchIndex < releases.length && found.length < maximumVersions) {
    const changedIn = await lastChangeBefore(releases[searchIndex].releaseNumber, point);
    const changedIndex = releases.findIndex((release) => release.releaseNumber === changedIn);
    if (changedIndex < 0) {
      break;
    }
    found.push(releases[changedIndex]);
    searchIndex = changedIndex + 1;
  }
  return found;
}
