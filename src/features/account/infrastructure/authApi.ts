import { apiUrl } from "@/features/farm-mapping/infrastructure/apiClient";
import type { AccountFieldError, AccountFormMode, AccountFormValues } from "../domain/accountForm";

export type AccountUser = { id: string; name: string; email: string };

export type AuthResult = { ok: true; user: AccountUser } | { ok: false; errors: AccountFieldError[] };

const unavailable: AuthResult = { ok: false, errors: [{ code: "unavailable" }] };

async function readErrors(response: Response): Promise<AccountFieldError[]> {
  try {
    const body = (await response.json()) as { errors?: AccountFieldError[] };
    return body.errors && body.errors.length > 0 ? body.errors : [{ code: "unavailable" }];
  } catch {
    return [{ code: "unavailable" }];
  }
}

export async function fetchCurrentUser(signal?: AbortSignal): Promise<AccountUser | null> {
  const response = await fetch(apiUrl("/auth/me"), { credentials: "include", signal });
  if (!response.ok) {
    return null;
  }
  return ((await response.json()) as { user: AccountUser }).user;
}

export type PasswordResetRequestResult = { ok: true } | { ok: false; errors: AccountFieldError[] };

async function postJson(path: string, body: Record<string, string>): Promise<Response> {
  return fetch(apiUrl(path), {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

async function toAuthResult(response: Response): Promise<AuthResult> {
  if (!response.ok) {
    return { ok: false, errors: await readErrors(response) };
  }
  return { ok: true, user: ((await response.json()) as { user: AccountUser }).user };
}

export async function submitAccountForm(
  mode: Exclude<AccountFormMode, "forgot">,
  values: AccountFormValues,
  locale: string,
): Promise<AuthResult> {
  const body = mode === "register" ? { ...values, locale } : { email: values.email, password: values.password };
  try {
    return await toAuthResult(await postJson(`/auth/${mode}`, body));
  } catch {
    return unavailable;
  }
}

export async function requestPasswordReset(email: string, locale: string): Promise<PasswordResetRequestResult> {
  try {
    const response = await postJson("/auth/password/forgot", { email, locale });
    return response.ok ? { ok: true } : { ok: false, errors: await readErrors(response) };
  } catch {
    return { ok: false, errors: [{ code: "unavailable" }] };
  }
}

export async function resetPassword(token: string, password: string, locale: string): Promise<AuthResult> {
  try {
    return await toAuthResult(await postJson("/auth/password/reset", { token, password, locale }));
  } catch {
    return unavailable;
  }
}

export function googleSignInUrl(returnTo: string, locale: string): string {
  const parameters = new URLSearchParams({ returnTo, locale });
  return apiUrl(`/auth/google?${parameters.toString()}`).toString();
}

export async function logOut(): Promise<void> {
  await fetch(apiUrl("/auth/logout"), { method: "POST", credentials: "include" });
}
