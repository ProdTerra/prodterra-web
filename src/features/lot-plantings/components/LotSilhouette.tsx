import type { Polygon } from "geojson";
import { toSilhouettePoints } from "../domain/lotSilhouette";

const boxSize = 64;
const padding = 6;

export function LotSilhouette({ geometry, color }: { geometry: Polygon; color: string }) {
  const points = toSilhouettePoints(geometry, boxSize, padding)
    .map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`)
    .join(" ");

  return (
    <svg viewBox={`0 0 ${boxSize} ${boxSize}`} aria-hidden className="lot-silhouette">
      <polygon points={points} fill={color} fillOpacity={0.55} stroke={color} strokeWidth={2} strokeLinejoin="round" />
    </svg>
  );
}
