"use server";

import { cookies } from "next/headers";
import { isLocale, localeCookieName, type Locale } from "./config";

const oneYearInSeconds = 60 * 60 * 24 * 365;

export async function setUserLocale(locale: Locale): Promise<void> {
  if (!isLocale(locale)) {
    return;
  }
  (await cookies()).set(localeCookieName, locale, {
    maxAge: oneYearInSeconds,
    sameSite: "lax",
    path: "/",
  });
}
