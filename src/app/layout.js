import { cookies, headers } from "next/headers";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { AppFrame } from "@/components/layout/app-frame";
import { PreferenceStoreProvider } from "@/stores/use-preference-store";
import {
  PREFERENCE_COOKIE_NAMES,
  resolveInitialPreferences,
} from "@/lib/preferences/preference-policy";
import "./globals.css";

export async function generateMetadata() {
  const messages = await getMessages();

  return {
    title: {
      default: "DITTO | K-Culture Shopping Mate",
      template: "%s | DITTO",
    },
    description: messages.metadata.siteDescription,
  };
}

export default async function RootLayout({ children }) {
  const [cookieStore, requestHeaders, messages] = await Promise.all([
    cookies(),
    headers(),
    getMessages(),
  ]);
  const initialPreferences = resolveInitialPreferences({
    countryCookie: cookieStore.get(PREFERENCE_COOKIE_NAMES.country)?.value,
    languageCookie: cookieStore.get(PREFERENCE_COOKIE_NAMES.language)?.value,
    manualLanguageCookie: cookieStore.get(
      PREFERENCE_COOKIE_NAMES.manualLanguage,
    )?.value,
    acceptLanguage: requestHeaders.get("accept-language"),
  });

  return (
    <html
      lang={initialPreferences.languageCode}
      className="h-full antialiased"
      data-scroll-behavior="smooth"
    >
      <body className="flex min-h-full flex-col">
        <PreferenceStoreProvider initialPreferences={initialPreferences}>
          <NextIntlClientProvider
            locale={initialPreferences.languageCode}
            messages={messages}
            timeZone="Asia/Seoul"
          >
            <AppFrame>{children}</AppFrame>
          </NextIntlClientProvider>
        </PreferenceStoreProvider>
      </body>
    </html>
  );
}
