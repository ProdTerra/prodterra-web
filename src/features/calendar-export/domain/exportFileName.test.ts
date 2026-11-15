import { describe, expect, it } from "vitest";
import { exportFileName } from "./exportFileName";

describe("exportFileName", () => {
  it("names the file after the calendar and the first and last month", () => {
    expect(exportFileName("tu-calendario", ["2026-01", "2026-02", "2026-03"])).toBe("prodterra-tu-calendario-2026-01-2026-03.pdf");
  });

  it("repeats the month for a single month", () => {
    expect(exportFileName("recommended", ["2026-05"])).toBe("prodterra-recommended-2026-05-2026-05.pdf");
  });
});
