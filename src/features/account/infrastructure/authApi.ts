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

export async function submitAccountForm(mode: AccountFormMode, values: AccountFormValues): Promise<AuthResult> {
  const body = mode === "register" ? values : { email: values.email, password: values.password };
  try {
    const response = await fetch(apiUrl(`/auth/${mode}`), {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      return { ok: false, errors: await readErrors(response) };
    }
    return { ok: true, user: ((await response.json()) as { user: AccountUser }).user };
  } catch {
    return unavailable;
  }
}

export async function logOut(): Promise<void> {
  await fetch(apiUrl("/auth/logout"), { method: "POST", credentials: "include" });
}
