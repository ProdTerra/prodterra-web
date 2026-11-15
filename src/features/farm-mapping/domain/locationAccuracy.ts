const approximateThresholdInMeters = 200;
const farmZoom = 17;
const widestZoom = 10;
const metersSeenAtFarmZoom = 150;

export function isApproximateLocation(accuracyInMeters: number): boolean {
  return accuracyInMeters > approximateThresholdInMeters;
}

export function zoomForAccuracy(accuracyInMeters: number): number {
  if (!isApproximateLocation(accuracyInMeters)) {
    return farmZoom;
  }
  const zoom = farmZoom - Math.log2(accuracyInMeters / metersSeenAtFarmZoom);
  return Math.max(widestZoom, Math.min(farmZoom, Math.round(zoom)));
}
