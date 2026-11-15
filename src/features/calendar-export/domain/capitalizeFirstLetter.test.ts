import { describe, expect, it } from "vitest";
import { capitalizeFirstLetter } from "./capitalizeFirstLetter";

describe("capitalizeFirstLetter", () => {
  it("capitalizes only the first letter", () => {
    expect(capitalizeFirstLetter("diciembre de 2026")).toBe("Diciembre de 2026");
  });

  it("keeps an empty text empty", () => {
    expect(capitalizeFirstLetter("")).toBe("");
  });
});
