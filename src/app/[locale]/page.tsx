import { hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { LanguageSwitcher } from "@/shared/components/LanguageSwitcher";

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  if (hasLocale(routing.locales, locale)) {
    setRequestLocale(locale);
  }
  return (
    <main>
      <LanguageSwitcher />
    </main>
  );
}
