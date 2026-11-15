import { describe, expect, it } from "vitest";
import { assignCropColors } from "./cropColors";
import type { LotRotation } from "./rotationPlan";

const rotationOf = (...cropKeys: string[]): LotRotation => ({
  previousUse: null,
  hasIrrigation: null,
  blocks: cropKeys.map((cropKey, index) => ({ id: String(index), kind: "crop", cropKey, durationInDays: 90 })),
});

describe("assignCropColors", () => {
  it("gives each crop the same color whatever the order of the blocks", () => {
    const first = assignCropColors([rotationOf("potato", "carrot")]);
    const swapped = assignCropColors([rotationOf("carrot", "potato")]);
    expect(first.get("carrot")).toBe(swapped.get("carrot"));
    expect(first.get("potato")).toBe(swapped.get("potato"));
    expect(first.get("carrot")).not.toBe(first.get("potato"));
  });
});
