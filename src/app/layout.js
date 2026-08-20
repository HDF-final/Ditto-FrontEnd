import { cookies, headers } from "next/headers";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { AppFrame } from "@/components/layout/app-frame";
import { PwaRegister } from "@/components/layout/pwa-register";
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
    applicationName: "DITTO",
    appleWebApp: {
      capable: true,
      statusBarStyle: "default",
      title: "DITTO",
    },
    formatDetection: {
      telephone: false,
    },
    other: {
      "mobile-web-app-capable": "yes",
    },
  };
}

export const viewport = {
  themeColor: "#5c2ef5",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

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
      <body className="min-h-dvh bg-[#e8e2f6] lg:min-h-full lg:bg-background">
        <PreferenceStoreProvider initialPreferences={initialPreferences}>
          <NextIntlClientProvider
            locale={initialPreferences.languageCode}
            messages={messages}
            timeZone="Asia/Seoul"
          >
            <div className="app-shell">
              <AppFrame>{children}</AppFrame>
            </div>
          </NextIntlClientProvider>
        </PreferenceStoreProvider>
        <PwaRegister />
      </body>
    </html>
  );
}
