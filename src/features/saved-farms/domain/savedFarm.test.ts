import { describe, expect, it } from "vitest";
import { validateFarmName } from "./savedFarm";

describe("validateFarmName", () => {
  it("asks for a name of up to 80 characters", () => {
    expect(validateFarmName("  ")).toBe("nameRequired");
    expect(validateFarmName("x".repeat(81))).toBe("nameTooLong");
    expect(validateFarmName(" Finca La Esperanza ")).toBeNull();
  });
});
