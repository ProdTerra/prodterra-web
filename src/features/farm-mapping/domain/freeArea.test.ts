import { describe, expect, it } from "vitest";
import { hasRoomForAnotherLot } from "./freeArea";

describe("hasRoomForAnotherLot", () => {
  it("allows another lot while part of the farm is free", () => {
    expect(hasRoomForAnotherLot(2, [0.5, 0.5])).toBe(true);
  });

  it("does not allow another lot when the lots cover the whole farm", () => {
    expect(hasRoomForAnotherLot(9.31, [1.5517, 1.5517, 1.5516, 1.5517, 1.5516, 1.5517])).toBe(false);
  });

  it("ignores leftovers smaller than ten square meters", () => {
    expect(hasRoomForAnotherLot(1, [0.9992])).toBe(false);
  });
});
