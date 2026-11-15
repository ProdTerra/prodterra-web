import { describe, expect, it } from "vitest";
import { monthsInPeriod, monthsUntilEnd } from "./exportPeriod";

const planMonths = ["2026-01", "2026-02", "2026-03", "2026-04", "2026-05"];

describe("monthsInPeriod", () => {
  it("returns every plan month for the whole plan", () => {
    expect(monthsInPeriod(planMonths, { kind: "all" })).toEqual(planMonths);
  });

  it("returns the months between from and to, both included", () => {
    expect(monthsInPeriod(planMonths, { kind: "range", fromMonth: "2026-02", toMonth: "2026-04" })).toEqual(["2026-02", "2026-03", "2026-04"]);
  });

  it("returns one month when from and to are the same", () => {
    expect(monthsInPeriod(planMonths, { kind: "range", fromMonth: "2026-03", toMonth: "2026-03" })).toEqual(["2026-03"]);
  });

  it("returns nothing when from is after to", () => {
    expect(monthsInPeriod(planMonths, { kind: "range", fromMonth: "2026-04", toMonth: "2026-02" })).toEqual([]);
  });
});

describe("monthsUntilEnd", () => {
  it("lists the months a range can end on", () => {
    expect(monthsUntilEnd(planMonths, "2026-04")).toEqual(["2026-04", "2026-05"]);
  });
});
