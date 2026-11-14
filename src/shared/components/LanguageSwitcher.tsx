"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

export function LanguageSwitcher() {
  const translate = useTranslations("languageSwitcher");
  const currentLocale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div role="group" aria-label={translate("label")} className="language-switcher">
      {routing.locales.map((locale) => (
        <button
          key={locale}
          type="button"
          lang={locale}
          aria-pressed={locale === currentLocale}
          onClick={() => router.replace(pathname, { locale })}
        >
          {translate(locale)}
        </button>
      ))}
    </div>
  );
}
