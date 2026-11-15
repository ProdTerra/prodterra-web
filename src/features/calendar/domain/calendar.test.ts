import { describe, expect, it } from "vitest";
import type { LotPlan, PlanMonth } from "../infrastructure/plansApi";
import { alarmsForMonth, daysInMonth, statusByMonth, worstStatus } from "./calendar";

function month(monthKey: string, overrides: Partial<PlanMonth> = {}): PlanMonth {
  return { month: monthKey, cropKey: "potato", phase: "current", status: "ok", alerts: [], ...overrides };
}

function lot(lotId: string, months: PlanMonth[]): LotPlan {
  return { lotId, currentCrop: null, nextCrop: null, recommendations: [], months, elevationInMeters: 2150, climateAvailable: true };
}

const plans = [
  lot("lot-1", [
    month("2026-11", { status: "watch", alerts: [{ type: "pest", level: "watch", pestKey: "late-blight" }] }),
    month("2026-12"),
  ]),
  lot("lot-2", [
    month("2026-11", {
      status: "risk",
      alerts: [
        { type: "irrigation", level: "watch", litersPerSquareMeter: 40 },
        { type: "frost", level: "risk", minimumTemperatureInCelsius: 1.2 },
      ],
    }),
    month("2026-12", { status: "watch", alerts: [{ type: "irrigation", level: "watch", litersPerSquareMeter: 20 }] }),
  ]),
];

describe("daysInMonth", () => {
  it("knows the length of each month including leap years", () => {
    expect(daysInMonth("2026-11")).toBe(30);
    expect(daysInMonth("2027-02")).toBe(28);
    expect(daysInMonth("2028-02")).toBe(29);
  });
});

describe("worstStatus", () => {
  it("keeps the most serious status", () => {
    expect(worstStatus(["ok", "watch", "ok"])).toBe("watch");
    expect(worstStatus(["watch", "risk"])).toBe("risk");
    expect(worstStatus([])).toBe("ok");
  });
});

describe("statusByMonth", () => {
  it("summarizes every month with the worst status across lots", () => {
    expect(statusByMonth(plans)).toEqual([
      { month: "2026-11", status: "risk" },
      { month: "2026-12", status: "watch" },
    ]);
  });
});

describe("alarmsForMonth", () => {
  it("lists the month alarms with risks first and frost before other risks", () => {
    expect(alarmsForMonth(plans, "2026-11").map((alarm) => [alarm.lotId, alarm.alert.type])).toEqual([
      ["lot-2", "frost"],
      ["lot-1", "pest"],
      ["lot-2", "irrigation"],
    ]);
  });

  it("returns nothing for a calm month", () => {
    expect(alarmsForMonth([plans[0]], "2026-12")).toEqual([]);
  });
});
