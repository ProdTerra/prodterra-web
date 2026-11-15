import { describe, expect, it } from "vitest";
import type { RotationEvaluation } from "../infrastructure/plansApi";
import { hasAltitudeWarning, toLotPlans } from "./evaluationView";

const evaluation: RotationEvaluation = {
  startDate: "2026-11-15",
  usesDemoData: false,
  crops: [],
  pests: [],
  lots: [
    {
      lotId: "a",
      climateAvailable: true,
      elevationInMeters: 2100,
      farmer: {
        blocks: [
          { kind: "crop", cropKey: "potato", durationInDays: 60, startsOn: "2026-11-15", endsOn: "2027-01-13", referenceCycleInDays: 120, reasons: [] },
          { kind: "rest", cropKey: null, durationInDays: 30, startsOn: "2027-01-14", endsOn: "2027-02-12", referenceCycleInDays: null, reasons: [] },
        ],
        months: [
          { month: "2026-11", cropKey: "potato", isRest: false, status: "ok", alerts: [] },
          { month: "2027-02", cropKey: null, isRest: true, status: "watch", alerts: [] },
        ],
        warnings: [],
      },
      recommended: null,
    },
  ],
};

describe("toLotPlans", () => {
  it("marks crop and rest months and puts sowing and harvest on their exact days", () => {
    const [plan] = toLotPlans(evaluation, "farmer");
    expect(plan.months.map((month) => month.phase)).toEqual(["crop", "rest"]);
    expect(plan.events).toEqual([
      { month: "2026-11", day: 15, kind: "sowing" },
      { month: "2027-01", day: 13, kind: "harvest" },
    ]);
  });

  it("leaves a lot empty when the variant is missing", () => {
    expect(toLotPlans(evaluation, "recommended")[0]).toEqual({ lotId: "a", months: [], events: [] });
  });
});

describe("hasAltitudeWarning", () => {
  const rotation = {
    blocks: [],
    months: [],
    warnings: [
      { type: "sameFamilyInARow" as const, blockIndex: 0, familyKey: "solanaceae" },
      { type: "altitudeOutOfRange" as const, blockIndex: 1, cropKey: "coffee" },
    ],
  };

  it("finds the altitude warning for the crop growing that month", () => {
    expect(hasAltitudeWarning(rotation, "coffee")).toBe(true);
    expect(hasAltitudeWarning(rotation, "potato")).toBe(false);
    expect(hasAltitudeWarning(rotation, null)).toBe(false);
    expect(hasAltitudeWarning(null, "coffee")).toBe(false);
  });
});
