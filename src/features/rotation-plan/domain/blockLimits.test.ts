import { describe, expect, it } from "vitest";
import { canAddBlock, clampBlockDuration, durationForNewBlock, remainingDays } from "./blockLimits";
import type { RotationBlock } from "./rotationPlan";

const potato: RotationBlock = { id: "a", kind: "crop", cropKey: "potato", durationInDays: 120 };
const longRest: RotationBlock = { id: "b", kind: "rest", durationInDays: 600 };

describe("block limits", () => {
  it("keeps every block between 1 and 730 days and inside the 730-day plan", () => {
    expect(clampBlockDuration([potato], "a", 0)).toBe(1);
    expect(clampBlockDuration([potato], "a", 3)).toBe(3);
    expect(clampBlockDuration([potato], "a", 900)).toBe(730);
    expect(clampBlockDuration([potato, longRest], "a", 200)).toBe(130);
  });

  it("knows the room left and blocks adding only when the plan is full", () => {
    expect(remainingDays([potato, longRest])).toBe(10);
    expect(canAddBlock([potato, longRest])).toBe(true);
    expect(canAddBlock([potato, { ...longRest, durationInDays: 610 }])).toBe(false);
    expect(canAddBlock([potato])).toBe(true);
  });

  it("shortens a new block to the room left", () => {
    expect(durationForNewBlock([potato], 90)).toBe(90);
    expect(durationForNewBlock([{ ...longRest, durationInDays: 710 }], 90)).toBe(20);
  });
});
