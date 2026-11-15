export type MapTile = { zoom: number; column: number; row: number };

const degreesToRadians = Math.PI / 180;

export function tileAt({ longitude, latitude }: { longitude: number; latitude: number }, zoom: number): MapTile {
  const tilesPerSide = 2 ** zoom;
  const latitudeInRadians = latitude * degreesToRadians;
  const column = Math.floor(((longitude + 180) / 360) * tilesPerSide);
  const row = Math.floor(((1 - Math.log(Math.tan(latitudeInRadians) + 1 / Math.cos(latitudeInRadians)) / Math.PI) / 2) * tilesPerSide);
  return { zoom, column, row };
}
