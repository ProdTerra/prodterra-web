import { describe, expect, it } from "vitest";
import { combineLaneStatus, laneStatusesForMonth } from "./laneStatus";

describe("combineLaneStatus", () => {
  it("keeps the worst status and adds up the alarms", () => {
    expect(
      combineLaneStatus([
        { status: "watch", alarmCount: 1 },
        { status: "risk", alarmCount: 2 },
        { status: "ok", alarmCount: 0 },
      ]),
    ).toEqual({ status: "risk", alarmCount: 3 });
  });

  it("has nothing to show when no lot has a status", () => {
    expect(combineLaneStatus([])).toBeNull();
  });
});

describe("laneStatusesForMonth", () => {
  const lotMonths = [
    { lotId: "lot-1", cropKey: "potato", isRest: false, status: "risk" as const, alarmCount: 2 },
    { lotId: "lot-2", cropKey: "potato", isRest: false, status: "watch" as const, alarmCount: 1 },
    { lotId: "lot-3", cropKey: null, isRest: true, status: "ok" as const, alarmCount: 0 },
    { lotId: "lot-4", cropKey: null, isRest: false, status: null, alarmCount: 0 },
  ];

  it("gives each lot lane its own status", () => {
    const statuses = laneStatusesForMonth([{ id: "lot-1" }, { id: "lot-3" }, { id: "lot-4" }], false, lotMonths);
    expect(statuses).toEqual({ "lot-1": { status: "risk", alarmCount: 2 }, "lot-3": { status: "ok", alarmCount: 0 } });
  });

  it("joins the lots that share a crop or rest lane", () => {
    const statuses = laneStatusesForMonth([{ id: "crop:potato" }, { id: "rest" }], true, lotMonths);
    expect(statuses).toEqual({ "crop:potato": { status: "risk", alarmCount: 3 }, rest: { status: "ok", alarmCount: 0 } });
  });
});
