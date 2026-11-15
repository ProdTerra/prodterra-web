import type { Metadata } from "next";
import { Instrument_Sans } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getTranslations } from "next-intl/server";
import { AuthDialog } from "@/features/account/components/AuthDialog";
import { SessionProvider } from "@/features/account/components/SessionProvider";
import "./globals.css";
import "./account.css";

const instrumentSans = Instrument_Sans({
  variable: "--font-instrument-sans",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const translate = await getTranslations("metadata");
  return {
    title: translate("title"),
    description: translate("description"),
  };
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const locale = await getLocale();

  return (
    <html lang={locale} className={`${instrumentSans.variable} h-full antialiased`}>
      <body className="min-h-full">
        <NextIntlClientProvider>
          <SessionProvider>
            {children}
            <AuthDialog />
          </SessionProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
