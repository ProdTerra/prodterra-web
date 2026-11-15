import { describe, expect, it } from "vitest";
import { segmentsInWeek, weeksOfMonth, type GridBlock } from "./monthGrid";

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
