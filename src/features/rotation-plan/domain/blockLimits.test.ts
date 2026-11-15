import { describe, expect, it } from "vitest";
import { canAddBlock, clampBlockDuration, durationForNewBlock, totalDays } from "./blockLimits";
import type { RotationBlock } from "./rotationPlan";

const rest = (durationInDays: number): RotationBlock => ({ id: String(durationInDays), kind: "rest", durationInDays });

describe("block limits", () => {
  it("keeps every block between 1 day and 2 years", () => {
    expect(clampBlockDuration(0)).toBe(1);
    expect(clampBlockDuration(3)).toBe(3);
    expect(clampBlockDuration(900)).toBe(730);
    expect(durationForNewBlock(120)).toBe(120);
  });

  it("lets a lot plan grow beyond 2 years, up to 100 blocks", () => {
    const fiveYears = Array.from({ length: 5 }, () => rest(365));
    expect(totalDays(fiveYears)).toBe(1825);
    expect(canAddBlock(fiveYears)).toBe(true);
    expect(canAddBlock(Array.from({ length: 100 }, () => rest(7)))).toBe(false);
  });
});
