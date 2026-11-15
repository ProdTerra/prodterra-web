import { describe, expect, it } from "vitest";
import type { PlanAlert } from "../infrastructure/plansApi";
import { splitQuietLots, summarizeMonth } from "./monthSummary";

const frost: PlanAlert = { type: "frost", level: "risk", minimumTemperatureInCelsius: 1 };
const drought: PlanAlert = { type: "drought", level: "risk", litersPerSquareMeter: 30 };
const pest: PlanAlert = { type: "pest", level: "watch", pestKey: "late-blight" };
const irrigation: PlanAlert = { type: "irrigation", level: "watch", litersPerSquareMeter: 20 };

describe("summarizeMonth", () => {
  it("counts risk and watch alarms and names the most severe alarm with its lot", () => {
    const summary = summarizeMonth([
      { lot: "Lote 1", alerts: [pest, drought] },
      { lot: "Lote 2", alerts: [irrigation, frost] },
      { lot: "Lote 3", alerts: [pest] },
    ]);
    expect(summary).toEqual({ riskCount: 2, watchCount: 3, mostSevere: { lot: "Lote 2", alert: frost } });
  });

  it("has no most severe alarm when the month is calm", () => {
    expect(summarizeMonth([{ lot: "Lote 1", alerts: [] }])).toEqual({ riskCount: 0, watchCount: 0, mostSevere: null });
  });
});

describe("splitQuietLots", () => {
  it("keeps lots with alarms or notes, most severe first, and sets the calm ones apart", () => {
    const calm = { name: "calm", alerts: [], altitudeWarningCrop: null };
    const watching = { name: "watching", alerts: [pest], altitudeWarningCrop: null };
    const highUp = { name: "highUp", alerts: [], altitudeWarningCrop: "Café" };
    const freezing = { name: "freezing", alerts: [irrigation, frost], altitudeWarningCrop: null };
    const { needsAttention, quiet } = splitQuietLots([calm, watching, highUp, freezing]);
    expect(needsAttention.map((state) => state.name)).toEqual(["freezing", "watching", "highUp"]);
    expect(quiet.map((state) => state.name)).toEqual(["calm"]);
  });
});
