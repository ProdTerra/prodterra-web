import { describe, expect, it } from "vitest";
import { canShowAllLots, effectiveLotSelection, groupByUse, segmentsInWeek, weeksOfMonth, type GridBlock } from "./monthGrid";

describe("weeksOfMonth", () => {
  it("lays a month out in weeks that start on Monday, including the days around it", () => {
    const weeks = weeksOfMonth("2026-11");
    expect(weeks[0]).toEqual(["2026-10-26", "2026-10-27", "2026-10-28", "2026-10-29", "2026-10-30", "2026-10-31", "2026-11-01"]);
    expect(weeks.at(-1)?.[6]).toBe("2026-12-06");
    expect(weeks).toHaveLength(6);
  });
});

describe("segmentsInWeek", () => {
  const potato: GridBlock = { id: "a", lotId: "lot-1", kind: "crop", cropKey: "potato", startDate: "2026-11-20", endDate: "2027-03-19" };
  const rest: GridBlock = { id: "b", lotId: "lot-1", kind: "rest", cropKey: null, startDate: "2027-03-20", endDate: "2027-04-02" };

  it("cuts a block into the days it covers in each week and says where it starts and ends", () => {
    const week = ["2026-11-16", "2026-11-17", "2026-11-18", "2026-11-19", "2026-11-20", "2026-11-21", "2026-11-22"];
    expect(segmentsInWeek([potato, rest], week)).toEqual([
      { block: potato, firstColumn: 4, lastColumn: 6, startsInWeek: true, endsInWeek: false },
    ]);
    const middle = ["2026-11-23", "2026-11-24", "2026-11-25", "2026-11-26", "2026-11-27", "2026-11-28", "2026-11-29"];
    expect(segmentsInWeek([potato], middle)).toEqual([
      { block: potato, firstColumn: 0, lastColumn: 6, startsInWeek: false, endsInWeek: false },
    ]);
  });

  it("puts two blocks of the same lot side by side in the week where one ends and the next starts", () => {
    const week = ["2027-03-15", "2027-03-16", "2027-03-17", "2027-03-18", "2027-03-19", "2027-03-20", "2027-03-21"];
    expect(segmentsInWeek([potato, rest], week).map(({ block, firstColumn, lastColumn }) => [block.id, firstColumn, lastColumn])).toEqual([
      ["a", 0, 4],
      ["b", 5, 6],
    ]);
  });
});

describe("groupByUse", () => {
  const block = (id: string, lotId: string, cropKey: string | null, startDate: string, endDate: string): GridBlock => ({
    id,
    lotId,
    kind: cropKey ? "crop" : "rest",
    cropKey,
    startDate,
    endDate,
  });
  const days = ["2027-01-04", "2027-01-05", "2027-01-06", "2027-01-07"];

  it("makes one lane per crop or rest, with runs split where the number of lots changes", () => {
    const grouped = groupByUse(
      [
        block("a", "lot-1", "potato", "2026-11-20", "2027-03-19"),
        block("b", "lot-2", "potato", "2027-01-06", "2027-05-01"),
        block("c", "lot-3", null, "2027-01-01", "2027-01-05"),
      ],
      days,
    );
    expect(grouped.lanes).toEqual(["crop:potato", "rest"]);
    expect(grouped.blocks.map(({ lotId, startDate, endDate, lotCount }) => [lotId, startDate, endDate, lotCount])).toEqual([
      ["crop:potato", "2027-01-04", "2027-01-05", 1],
      ["crop:potato", "2027-01-06", "2027-01-07", 2],
      ["rest", "2027-01-04", "2027-01-05", 1],
    ]);
  });
});

describe("effectiveLotSelection", () => {
  const lotsOf = (count: number) => Array.from({ length: count }, (_, index) => ({ id: `lot-${index + 1}` }));

  it("shows all lots when there are 5 or fewer and none is chosen", () => {
    expect(effectiveLotSelection(lotsOf(5), null)).toBeNull();
    expect(canShowAllLots(5)).toBe(true);
  });

  it("starts on the first lot when there are more than 5", () => {
    expect(effectiveLotSelection(lotsOf(6), null)).toBe("lot-1");
    expect(canShowAllLots(6)).toBe(false);
  });

  it("keeps the chosen lot, and ignores a lot that no longer exists", () => {
    expect(effectiveLotSelection(lotsOf(8), "lot-3")).toBe("lot-3");
    expect(effectiveLotSelection(lotsOf(8), "lot-99")).toBe("lot-1");
    expect(effectiveLotSelection(lotsOf(2), "lot-99")).toBeNull();
  });
});
