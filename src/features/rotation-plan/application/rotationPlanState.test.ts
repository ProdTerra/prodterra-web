import { describe, expect, it } from "vitest";
import { emptyRotationPlan, rotationOf, type RotationPlan } from "../domain/rotationPlan";
import { rotationPlanReducer, type RotationPlanAction } from "./rotationPlanState";

function apply(actions: RotationPlanAction[], start: RotationPlan = emptyRotationPlan): RotationPlan {
  return actions.reduce(rotationPlanReducer, start);
}

const potatoThenRest = apply([
  { type: "startDateChosen", startDate: "2026-11-14" },
  { type: "previousUseChosen", lotId: "a", previousUse: { kind: "unknown" } },
  { type: "irrigationChosen", lotId: "a", hasIrrigation: true },
  { type: "blockAdded", lotId: "a", blockId: "b1", block: { kind: "crop", cropKey: "potato", referenceInDays: 120 } },
  { type: "blockAdded", lotId: "a", blockId: "b2", block: { kind: "rest" } },
]);

describe("rotationPlanReducer", () => {
  it("adds crops with their reference cycle and rests with four weeks", () => {
    expect(rotationOf(potatoThenRest, "a").blocks).toEqual([
      { id: "b1", kind: "crop", cropKey: "potato", durationInDays: 120 },
      { id: "b2", kind: "rest", durationInDays: 28 },
    ]);
  });

  it("uses 90 days when the crop has no reference cycle", () => {
    const plan = apply([{ type: "blockAdded", lotId: "a", blockId: "x", block: { kind: "crop", cropKey: "chayote", referenceInDays: null } }]);
    expect(rotationOf(plan, "a").blocks[0].durationInDays).toBe(90);
  });

  it("changes, resets and removes a block within the limits", () => {
    const changed = apply([{ type: "blockDurationChanged", lotId: "a", blockId: "b1", durationInDays: 5 }], potatoThenRest);
    expect(rotationOf(changed, "a").blocks[0].durationInDays).toBe(14);
    const reset = apply([{ type: "blockDurationReset", lotId: "a", blockId: "b1", referenceInDays: 120 }], changed);
    expect(rotationOf(reset, "a").blocks[0].durationInDays).toBe(120);
    const removed = apply([{ type: "blockRemoved", lotId: "a", blockId: "b2" }], reset);
    expect(rotationOf(removed, "a").blocks.map((block) => block.id)).toEqual(["b1"]);
  });

  it("does not add a block when the plan has no room left", () => {
    const full = apply([{ type: "blockDurationChanged", lotId: "a", blockId: "b1", durationInDays: 702 }], potatoThenRest);
    const attempt = apply([{ type: "blockAdded", lotId: "a", blockId: "b3", block: { kind: "rest" } }], full);
    expect(rotationOf(attempt, "a").blocks).toHaveLength(2);
  });

  it("copies one lot's answers to every lot with fresh block ids", () => {
    const copied = apply([{ type: "rotationCopiedToAllLots", fromLotId: "a", lotIds: ["a", "c"] }], potatoThenRest);
    expect(rotationOf(copied, "c").blocks.map((block) => block.id)).toEqual(["c:b1", "c:b2"]);
    expect(rotationOf(copied, "c").hasIrrigation).toBe(true);
    expect(rotationOf(copied, "a")).toEqual(rotationOf(potatoThenRest, "a"));
  });

  it("keeps the start date while some planned lots remain", () => {
    const kept = apply([{ type: "lotsChanged", lotIds: [...Object.keys(potatoThenRest.lots), "z"] }], potatoThenRest);
    expect(kept.startDate).toBe("2026-11-14");
    expect(kept.lots).toEqual(potatoThenRest.lots);
  });

  it("starts a new plan without the old start date when none of the planned lots remain", () => {
    const pruned = apply([{ type: "lotsChanged", lotIds: ["z"] }], potatoThenRest);
    expect(pruned).toEqual({ startDate: null, lots: {} });
  });

  it("restores a saved plan", () => {
    expect(apply([{ type: "planRestored", plan: potatoThenRest }])).toEqual(potatoThenRest);
  });
});
