import { describe, expect, it } from "vitest";
import { initialsOf, validateAccountForm } from "./accountForm";

describe("validateAccountForm", () => {
  it("asks for a name, a valid email and a password of 8 or more characters when registering", () => {
    expect(validateAccountForm({ name: " ", email: "ana@", password: "1234567" }, "register")).toEqual([
      { field: "name", code: "nameRequired" },
      { field: "email", code: "invalidEmail" },
      { field: "password", code: "passwordTooShort" },
    ]);
  });

  it("only needs an email and any password to log in", () => {
    expect(validateAccountForm({ name: "", email: "ana@example.com", password: "x" }, "login")).toEqual([]);
  });
});

describe("initialsOf", () => {
  it("uses the first and last name initials", () => {
    expect(initialsOf("ana maría solano")).toBe("AS");
    expect(initialsOf("Brian")).toBe("B");
  });
});
