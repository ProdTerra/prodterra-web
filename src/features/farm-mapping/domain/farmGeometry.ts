import area from "@turf/area";
import { feature, featureCollection } from "@turf/helpers";
import intersect from "@turf/intersect";
import type { Polygon } from "geojson";

const squareMetersPerHectare = 10_000;
const allowedOutsideShare = 0.01;
const allowedOverlapInSquareMeters = 1;

export type NumberedLotGeometry = {
  lotNumber: number;
  geometry: Polygon;
};

export type LotValidation =
  | { isValid: true }
  | { isValid: false; reason: "outsideFarm" }
  | { isValid: false; reason: "overlapsLot"; overlappedLotNumber: number };

export function calculateAreaInHectares(polygon: Polygon): number {
  return area(polygon) / squareMetersPerHectare;
}

function sharedAreaInSquareMeters(first: Polygon, second: Polygon): number {
  const shared = intersect(featureCollection([feature(first), feature(second)]));
  return shared ? area(shared) : 0;
}

function isInsideFarm(lot: Polygon, farmBoundary: Polygon): boolean {
  const lotArea = area(lot);
  const outsideArea = lotArea - sharedAreaInSquareMeters(lot, farmBoundary);
  return outsideArea <= lotArea * allowedOutsideShare;
}

export function validateLot(
  lot: Polygon,
  farmBoundary: Polygon,
  existingLots: NumberedLotGeometry[],
): LotValidation {
  if (!isInsideFarm(lot, farmBoundary)) {
    return { isValid: false, reason: "outsideFarm" };
  }
  const overlappedLot = existingLots.find(
    (existingLot) =>
      sharedAreaInSquareMeters(lot, existingLot.geometry) > allowedOverlapInSquareMeters,
  );
  if (overlappedLot) {
    return { isValid: false, reason: "overlapsLot", overlappedLotNumber: overlappedLot.lotNumber };
  }
  return { isValid: true };
}
