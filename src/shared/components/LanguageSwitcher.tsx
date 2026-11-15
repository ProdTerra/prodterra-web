"use client";

import { useLocale, useTranslations } from "next-intl";
import { useTransition } from "react";
import { locales, type Locale } from "@/i18n/config";
import { setUserLocale } from "@/i18n/localeActions";

export function LanguageSwitcher() {
  const translate = useTranslations("languageSwitcher");
  const currentLocale = useLocale();
  const [isSwitching, startTransition] = useTransition();

  function switchLocale(locale: Locale) {
    startTransition(() => setUserLocale(locale));
  }

  return (
    <div role="group" aria-label={translate("label")} aria-busy={isSwitching} className="language-switcher">
      {locales.map((locale) => (
        <button
          key={locale}
          type="button"
          lang={locale}
          aria-label={translate(locale)}
          title={translate(locale)}
          aria-pressed={locale === currentLocale}
          disabled={isSwitching}
          onClick={() => switchLocale(locale)}
        >
          {locale.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
