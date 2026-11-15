import { describe, expect, it } from "vitest";
import { initialsOf, validateAccountForm, readGoogleSignInError, validateNewPassword } from "./accountForm";

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

describe("validateNewPassword", () => {
  it("asks for at least 8 characters and the same password twice", () => {
    expect(validateNewPassword({ password: "corta", confirmPassword: "corta" })).toEqual([{ field: "password", code: "passwordTooShort" }]);
    expect(validateNewPassword({ password: "cartago-2026", confirmPassword: "cartago-2025" })).toEqual([
      { field: "confirmPassword", code: "passwordMismatch" },
    ]);
    expect(validateNewPassword({ password: "cartago-2026", confirmPassword: "cartago-2026" })).toEqual([]);
  });
});

describe("readGoogleSignInError", () => {
  it("accepts only the Google sign in errors the API sends", () => {
    expect(readGoogleSignInError("googleCancelled")).toBe("googleCancelled");
    expect(readGoogleSignInError("<script>")).toBeNull();
    expect(readGoogleSignInError(null)).toBeNull();
  });
});
