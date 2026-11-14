import { hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { FarmMappingScreen } from "@/features/farm-mapping/components/FarmMappingScreen";
import { routing } from "@/i18n/routing";

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  if (hasLocale(routing.locales, locale)) {
    setRequestLocale(locale);
  }
  return <FarmMappingScreen />;
}
