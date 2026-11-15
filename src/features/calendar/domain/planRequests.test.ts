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
  it("uses the first block of each rotation as the current use from the start month", () => {
    const requests = toPlanRequests(lots, {
      startDate: "2026-11-14",
      lots: {
        a: { previousUse: { kind: "unknown" }, hasIrrigation: false, blocks: [{ id: "1", kind: "crop", cropKey: "potato", durationInDays: 120 }] },
        b: { previousUse: { kind: "crop", cropKey: "cabbage" }, hasIrrigation: true, blocks: [{ id: "2", kind: "rest", durationInDays: 28 }] },
      },
    });
    expect(requests).toEqual([
      { lotId: "a", boundary: geometry, currentUse: { kind: "crop", cropKey: "potato", plantedOn: "2026-11" }, previousUse: { kind: "unknown" }, hasIrrigation: false },
      { lotId: "b", boundary: geometry, currentUse: { kind: "fallow" }, previousUse: { kind: "crop", cropKey: "cabbage" }, hasIrrigation: true },
    ]);
  });

  it("returns nothing while a lot is incomplete", () => {
    expect(toPlanRequests(lots, { startDate: "2026-11-14", lots: {} })).toBeNull();
  });
});
