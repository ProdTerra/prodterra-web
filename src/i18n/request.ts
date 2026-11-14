import { cookies, headers } from "next/headers";
import { getRequestConfig } from "next-intl/server";
import { defaultLocale, isLocale, localeCookieName, type Locale } from "./config";

function localeFromAcceptLanguage(acceptLanguage: string | null): Locale | null {
  const preferredLanguage = acceptLanguage?.split(",")[0]?.split("-")[0]?.trim();
  return isLocale(preferredLanguage) ? preferredLanguage : null;
}

async function resolveLocale(): Promise<Locale> {
  const cookieLocale = (await cookies()).get(localeCookieName)?.value;
  if (isLocale(cookieLocale)) {
    return cookieLocale;
  }
  return localeFromAcceptLanguage((await headers()).get("accept-language")) ?? defaultLocale;
}

export default getRequestConfig(async () => {
  const locale = await resolveLocale();
  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
