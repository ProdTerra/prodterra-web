import { describe, expect, it } from "vitest";
import { amountInUnit, daysForAmount, naturalUnitOf } from "./durationUnits";

describe("duration units", () => {
  it("shows whole weeks in weeks and anything else in days", () => {
    expect(naturalUnitOf(70)).toBe("weeks");
    expect(naturalUnitOf(3)).toBe("days");
    expect(naturalUnitOf(73)).toBe("days");
  });

  it("counts months on the calendar from the block start", () => {
    expect(daysForAmount("months", 1, "2027-01-31")).toBe(28);
    expect(daysForAmount("months", 3, "2026-11-15")).toBe(92);
    expect(daysForAmount("weeks", 2, "2026-11-15")).toBe(14);
    expect(daysForAmount("days", 3, "2026-11-15")).toBe(3);
  });

  it("rounds the shown amount without changing the stored days", () => {
    expect(amountInUnit("weeks", 73, "2026-11-15")).toBe(10);
    expect(amountInUnit("months", 90, "2026-11-15")).toBe(3);
    expect(amountInUnit("days", 73, "2026-11-15")).toBe(73);
  });
});
