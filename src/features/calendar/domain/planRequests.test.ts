import type { Polygon } from "geojson";
import { describe, expect, it } from "vitest";
import type { Lot } from "@/features/farm-mapping/application/farmMappingState";
import { toPlanRequests } from "./planRequests";

const geometry: Polygon = {
  type: "Polygon",
  coordinates: [[[-83.892, 9.918], [-83.891, 9.918], [-83.891, 9.919], [-83.892, 9.918]]],
};

const lots: Lot[] = [
  { shapeId: "a", geometry, areaInHectares: 1, number: 1, color: "#8DB255", customName: "" },
  { shapeId: "b", geometry, areaInHectares: 1, number: 2, color: "#59B7D9", customName: "" },
];

describe("toPlanRequests", () => {
  it("turns each lot and its answers into a plan request", () => {
    const requests = toPlanRequests(lots, {
      a: { currentUse: { kind: "crop", cropKey: "potato" }, plantedOn: "2026-08", previousUse: { kind: "unknown" }, hasIrrigation: false },
      b: { currentUse: { kind: "fallow" }, plantedOn: null, previousUse: { kind: "crop", cropKey: "cabbage" }, hasIrrigation: true },
    });
    expect(requests).toEqual([
      { lotId: "a", boundary: geometry, currentUse: { kind: "crop", cropKey: "potato", plantedOn: "2026-08" }, previousUse: { kind: "unknown" }, hasIrrigation: false },
      { lotId: "b", boundary: geometry, currentUse: { kind: "fallow" }, previousUse: { kind: "crop", cropKey: "cabbage" }, hasIrrigation: true },
    ]);
  });

  it("returns nothing while a lot is missing answers", () => {
    expect(
      toPlanRequests(lots, {
        a: { currentUse: { kind: "crop", cropKey: "potato" }, plantedOn: null, previousUse: { kind: "unknown" }, hasIrrigation: false },
      }),
    ).toBeNull();
  });
});
