import { describe, expect, it } from "vitest";
import type { EvaluatedRotation, RotationEvaluation } from "@/features/calendar/infrastructure/plansApi";
import { lotRiskSummaries, sourcesFromEvaluation } from "./exportSources";

function rotation(cropKey: string, statuses: ("ok" | "watch" | "risk")[]): EvaluatedRotation {
  return {
    blocks: [
      { kind: "crop", cropKey, durationInDays: 59, startsOn: "2026-01-01", endsOn: "2026-02-28", referenceCycleInDays: null, reasons: [] },
    ],
    months: statuses.map((status, index) => ({ month: `2026-0${index + 1}`, cropKey, isRest: false, status, alerts: [] })),
    warnings: [],
  };
}

const climate = [
  {
    month: 1,
    meanTemperatureInCelsius: 15,
    minimumTemperatureInCelsius: 9,
    maximumTemperatureInCelsius: 21,
    relativeHumidityInPercent: 70,
    precipitationInMillimetersPerDay: 3,
    solarRadiationInKilowattHoursPerSquareMeterPerDay: 5,
  },
];

const evaluation: RotationEvaluation = {
  startDate: "2026-01-01",
  usesDemoData: false,
  crops: [],
  pests: [],
  lots: [
    { lotId: "lot-1", climateAvailable: true, elevationInMeters: 1500, climate, farmer: rotation("potato", ["ok", "risk"]), recommended: rotation("onion", ["watch", "ok"]) },
    { lotId: "lot-2", climateAvailable: false, elevationInMeters: null, farmer: null, recommended: null },
  ],
};

describe("sourcesFromEvaluation", () => {
  const sources = sourcesFromEvaluation(evaluation);

  it("turns each variant's blocks into grid blocks of its lot", () => {
    expect(sources.farmer.blocks).toEqual([
      { id: "lot-1-farmer-0", lotId: "lot-1", kind: "crop", cropKey: "potato", startDate: "2026-01-01", endDate: "2026-02-28" },
    ]);
    expect(sources.recommended.blocks[0]).toMatchObject({ lotId: "lot-1", cropKey: "onion" });
  });

  it("lists the months of each variant", () => {
    expect(sources.farmer.months).toEqual(["2026-01", "2026-02"]);
    expect(sources.recommended.months).toEqual(["2026-01", "2026-02"]);
  });

  it("gives climate and months only to the recommended calendar", () => {
    expect(sources.farmer.insights).toBeNull();
    expect(sources.recommended.insights?.climateByLot["lot-1"]).toBe(climate);
    expect(sources.recommended.insights?.monthsByLot["lot-1"]?.map((month) => month.status)).toEqual(["watch", "ok"]);
    expect(sources.recommended.insights?.monthsByLot["lot-2"]).toEqual([]);
  });
});

describe("lotRiskSummaries", () => {
  const lots = [
    { id: "lot-1", number: 1, name: "Uno", color: "#000000" },
    { id: "lot-2", number: 2, name: "Dos", color: "#000000" },
  ];

  it("counts risk and watch months from the insights", () => {
    const insights = sourcesFromEvaluation({ ...evaluation, lots: [{ ...evaluation.lots[0], recommended: rotation("onion", ["risk", "watch", "risk"]) }] }).recommended.insights;
    expect(lotRiskSummaries(lots, insights)).toEqual([
      { lotId: "lot-1", lotNumber: 1, riskMonths: 2, watchMonths: 1 },
      { lotId: "lot-2", lotNumber: 2, riskMonths: 0, watchMonths: 0 },
    ]);
  });

  it("counts nothing without insights", () => {
    expect(lotRiskSummaries(lots, null).map((summary) => summary.riskMonths)).toEqual([0, 0]);
  });
});
