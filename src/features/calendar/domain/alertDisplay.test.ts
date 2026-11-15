import { describe, expect, it } from "vitest";
import { countAlarms, groupPestAlerts } from "./alertDisplay";
import type { PlanAlert } from "../infrastructure/plansApi";

describe("groupPestAlerts", () => {
  it("joins every pest alert of a lot into one entry that keeps the pest order", () => {
    const alerts: PlanAlert[] = [
      { type: "pest", level: "watch", pestKey: "late-blight" },
      { type: "irrigation", level: "watch", litersPerSquareMeter: 20 },
      { type: "pest", level: "watch", pestKey: "whitefly" },
    ];

    expect(groupPestAlerts(alerts)).toEqual([
      { type: "irrigation", level: "watch", litersPerSquareMeter: 20 },
      { type: "pests", level: "watch", pestKeys: ["late-blight", "whitefly"] },
    ]);
  });

  it("leaves alerts without pests as they are", () => {
    const alerts: PlanAlert[] = [{ type: "frost", level: "risk", minimumTemperatureInCelsius: 1 }];

    expect(groupPestAlerts(alerts)).toEqual(alerts);
  });

  it("counts all the pests of a lot as one alarm", () => {
    const alerts: PlanAlert[] = [
      { type: "pest", level: "watch", pestKey: "late-blight" },
      { type: "pest", level: "watch", pestKey: "whitefly" },
      { type: "drought", level: "risk", litersPerSquareMeter: 30 },
    ];

    expect(countAlarms(alerts)).toBe(2);
  });
});
