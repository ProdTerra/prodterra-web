import { describe, expect, it } from "vitest";
import { addDays, firstOfNextMonth, latestStartDate, nextMonday, validateStartDate } from "./planDates";

const today = "2026-11-14";

describe("validateStartDate", () => {
  it("accepts today and any day up to one year ahead", () => {
    expect(validateStartDate(today, today)).toEqual({ isValid: true });
    expect(validateStartDate("2027-11-14", today)).toEqual({ isValid: true });
  });

  it("rejects past days, days beyond one year and badly written dates", () => {
    expect(validateStartDate("2026-11-13", today)).toEqual({ isValid: false, reason: "past" });
    expect(validateStartDate("2027-11-15", today)).toEqual({ isValid: false, reason: "tooFar" });
    expect(validateStartDate("2026-02-30", today)).toEqual({ isValid: false, reason: "invalidFormat" });
  });
});

describe("date helpers", () => {
  it("adds days across months and years in UTC", () => {
    expect(addDays("2026-12-25", 10)).toBe("2027-01-04");
    expect(latestStartDate(today)).toBe("2027-11-14");
  });

  it("finds the quick choices", () => {
    expect(nextMonday(today)).toBe("2026-11-16");
    expect(nextMonday("2026-11-16")).toBe("2026-11-23");
    expect(firstOfNextMonth("2026-12-03")).toBe("2027-01-01");
  });
});
