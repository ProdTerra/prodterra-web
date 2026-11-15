import { describe, expect, it } from "vitest";
import { dayUsesForMonth, planMonths, scheduleBlocks } from "./rotationSchedule";
import type { RotationBlock } from "./rotationPlan";

const blocks: RotationBlock[] = [
  { id: "a", kind: "crop", cropKey: "potato", durationInDays: 120 },
  { id: "b", kind: "rest", durationInDays: 28 },
];

describe("scheduleBlocks", () => {
  it("chains blocks one after another from the start date", () => {
    expect(scheduleBlocks("2026-11-14", blocks).map(({ startDate, endDate }) => [startDate, endDate])).toEqual([
      ["2026-11-14", "2027-03-13"],
      ["2027-03-14", "2027-04-10"],
    ]);
  });
});

describe("farmer calendar", () => {
  it("covers every month from the start to the last block end", () => {
    expect(planMonths("2026-11-14", [scheduleBlocks("2026-11-14", blocks)])).toEqual([
      "2026-11", "2026-12", "2027-01", "2027-02", "2027-03", "2027-04",
    ]);
  });

  it("marks sowing, harvest, rest and empty days", () => {
    const schedule = scheduleBlocks("2026-11-14", blocks);
    const march = dayUsesForMonth(schedule, "2027-03");
    expect(march[12]).toEqual({ day: 13, use: { kind: "crop", cropKey: "potato" }, marker: "harvest" });
    expect(march[13]).toEqual({ day: 14, use: { kind: "rest" }, marker: null });
    const november = dayUsesForMonth(schedule, "2026-11");
    expect(november[12].use).toBeNull();
    expect(november[13].marker).toBe("sowing");
  });
});
