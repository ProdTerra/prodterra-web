"use client";

import type { Polygon } from "geojson";
import { useId, useState } from "react";
import { satelliteSnapshotUrl } from "@/features/farm-mapping/infrastructure/satelliteSnapshot";
import { snapshotFraming, toSilhouettePoints } from "../domain/lotSilhouette";

const boxSize = 64;
const padding = 6;
const snapshotPixels = 256;

export function LotSilhouette({ geometry, color }: { geometry: Polygon; color: string }) {
  const maskId = useId();
  const [hasSnapshotFailed, setHasSnapshotFailed] = useState(false);
  const framing = snapshotFraming(geometry, boxSize, padding, snapshotPixels);
  const toPoints = (drawingPadding: number) =>
    toSilhouettePoints(geometry, boxSize, drawingPadding)
      .map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`)
      .join(" ");
  const points = toPoints(padding);
  const framedPoints = toPoints(framing.padding);

  if (hasSnapshotFailed) {
    return (
      <svg viewBox={`0 0 ${boxSize} ${boxSize}`} aria-hidden className="lot-silhouette">
        <polygon points={points} fill={color} fillOpacity={0.55} stroke={color} strokeWidth={2} strokeLinejoin="round" />
      </svg>
    );
  }

  return (
    <span aria-hidden className="lot-silhouette lot-silhouette--satellite">
      {/* eslint-disable-next-line @next/next/no-img-element -- Esri export images are not served through next/image. */}
      <img
        src={satelliteSnapshotUrl(framing.bounds, framing.sizeInPixels)}
        alt=""
        loading="lazy"
        decoding="async"
        onError={() => setHasSnapshotFailed(true)}
      />
      <svg viewBox={`0 0 ${boxSize} ${boxSize}`}>
        <mask id={maskId}>
          <rect width={boxSize} height={boxSize} fill="white" />
          <polygon points={framedPoints} fill="black" />
        </mask>
        <rect width={boxSize} height={boxSize} fill="rgb(22 26 21)" fillOpacity={0.5} mask={`url(#${maskId})`} />
        <polygon points={framedPoints} fill="none" stroke={color} strokeWidth={1.5} strokeLinejoin="round" />
      </svg>
    </span>
  );
}
