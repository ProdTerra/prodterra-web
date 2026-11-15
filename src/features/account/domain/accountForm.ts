export type AccountField = "name" | "email" | "password" | "confirmPassword";

export type AccountErrorCode =
  | "nameRequired"
  | "nameTooLong"
  | "invalidEmail"
  | "passwordRequired"
  | "passwordTooShort"
  | "passwordTooLong"
  | "emailTaken"
  | "invalidCredentials"
  | "tooManyAttempts"
  | "passwordMismatch"
  | "invalidResetLink"
  | "googleUnavailable"
  | "googleCancelled"
  | "googleFailed"
  | "unavailable";

export const googleSignInErrorCodes = ["googleUnavailable", "googleCancelled", "googleFailed"] as const;
export type GoogleSignInErrorCode = (typeof googleSignInErrorCodes)[number];

export function readGoogleSignInError(value: string | null): GoogleSignInErrorCode | null {
  return googleSignInErrorCodes.find((code) => code === value) ?? null;
}

export type AccountFieldError = { field?: AccountField; code: AccountErrorCode };

export type AccountFormMode = "login" | "register" | "forgot";

export type AccountFormValues = { name: string; email: string; password: string };

export type NewPasswordValues = { password: string; confirmPassword: string };

const maximumNameLength = 80;
const minimumPasswordLength = 8;
const maximumPasswordLength = 128;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function nameError(name: string): AccountFieldError | null {
  const trimmed = name.trim();
  if (trimmed.length === 0) {
    return { field: "name", code: "nameRequired" };
  }
  return trimmed.length > maximumNameLength ? { field: "name", code: "nameTooLong" } : null;
}

function passwordError(password: string, mode: AccountFormMode): AccountFieldError | null {
  if (mode === "forgot") {
    return null;
  }
  if (password.length === 0) {
    return { field: "password", code: mode === "login" ? "passwordRequired" : "passwordTooShort" };
  }
  if (mode === "login") {
    return null;
  }
  if (password.length < minimumPasswordLength) {
    return { field: "password", code: "passwordTooShort" };
  }
  return password.length > maximumPasswordLength ? { field: "password", code: "passwordTooLong" } : null;
}

export function validateAccountForm(values: AccountFormValues, mode: AccountFormMode): AccountFieldError[] {
  const errors: (AccountFieldError | null)[] = [
    mode === "register" ? nameError(values.name) : null,
    emailPattern.test(values.email.trim()) ? null : { field: "email", code: "invalidEmail" },
    passwordError(values.password, mode),
  ];
  return errors.filter((error): error is AccountFieldError => error !== null);
}

export function validateNewPassword({ password, confirmPassword }: NewPasswordValues): AccountFieldError[] {
  const errors: (AccountFieldError | null)[] = [
    passwordError(password, "register"),
    confirmPassword === password ? null : { field: "confirmPassword", code: "passwordMismatch" },
  ];
  return errors.filter((error): error is AccountFieldError => error !== null);
}

export function initialsOf(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  const letters = words.length > 1 ? [words[0][0], words[words.length - 1][0]] : [words[0]?.[0] ?? "?"];
  return letters.join("").toUpperCase();
}
