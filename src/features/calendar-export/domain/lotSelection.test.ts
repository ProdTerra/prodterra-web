import { describe, expect, it } from "vitest";
import { maximumLotsPerPdf, preselectLots, summarizeLotRisk, toggleLotSelection, type LotRiskSummary } from "./lotSelection";

function lot(number: number, riskMonths = 0, watchMonths = 0): LotRiskSummary {
  return { lotId: `lot-${number}`, lotNumber: number, riskMonths, watchMonths };
}

describe("preselectLots", () => {
  it("selects every lot when there are five or fewer", () => {
    const lots = [lot(1), lot(2), lot(3), lot(4), lot(5)];
    expect(preselectLots(lots, "recommended")).toEqual(["lot-1", "lot-2", "lot-3", "lot-4", "lot-5"]);
    expect(preselectLots(lots, "farmer")).toEqual(["lot-1", "lot-2", "lot-3", "lot-4", "lot-5"]);
  });

  it("selects the first five lots of the farmer calendar", () => {
    const lots = [lot(1), lot(2), lot(3), lot(4), lot(5), lot(6, 9)];
    expect(preselectLots(lots, "farmer")).toEqual(["lot-1", "lot-2", "lot-3", "lot-4", "lot-5"]);
  });

  it("selects the five riskiest lots of the recommended calendar, ties broken by watch months then lot number", () => {
    const lots = [lot(1), lot(2, 1, 0), lot(3, 3, 0), lot(4, 1, 2), lot(5, 0, 4), lot(6, 0, 4), lot(7, 0, 1)];
    expect(preselectLots(lots, "recommended")).toEqual(["lot-3", "lot-4", "lot-2", "lot-5", "lot-6"]);
  });

  it("never selects more than the maximum", () => {
    const lots = Array.from({ length: 12 }, (_, index) => lot(index + 1, index));
    expect(preselectLots(lots, "recommended")).toHaveLength(maximumLotsPerPdf);
  });
});

describe("toggleLotSelection", () => {
  it("removes a selected lot", () => {
    expect(toggleLotSelection(["lot-1", "lot-2"], "lot-1")).toEqual(["lot-2"]);
  });

  it("adds a lot while under the maximum", () => {
    expect(toggleLotSelection(["lot-1"], "lot-2")).toEqual(["lot-1", "lot-2"]);
  });

  it("does not add a lot at the maximum", () => {
    const full = ["lot-1", "lot-2", "lot-3", "lot-4", "lot-5"];
    expect(toggleLotSelection(full, "lot-6")).toEqual(full);
  });
});

describe("summarizeLotRisk", () => {
  it("counts the risk and watch months of a lot", () => {
    expect(summarizeLotRisk({ lotId: "lot-1", lotNumber: 1 }, ["ok", "risk", "watch", "risk", "watch", "watch"])).toEqual({
      lotId: "lot-1",
      lotNumber: 1,
      riskMonths: 2,
      watchMonths: 3,
    });
  });
});
