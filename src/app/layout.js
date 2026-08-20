import { cookies, headers } from "next/headers";
import { AppFrame } from "@/components/layout/app-frame";
import { PreferenceStoreProvider } from "@/stores/use-preference-store";
import {
  PREFERENCE_COOKIE_NAMES,
  resolveInitialPreferences,
} from "@/lib/preferences/preference-policy";
import "./globals.css";

export const metadata = {
  title: {
    default: "DITTO | K-Culture Shopping Mate",
    template: "%s | DITTO",
  },
  description:
    "국가별 K-컬처 트렌드부터 AI 맞춤 코스와 실내 길찾기까지 연결하는 관광 플랫폼",
};

export default async function RootLayout({ children }) {
  const [cookieStore, requestHeaders] = await Promise.all([
    cookies(),
    headers(),
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
          <AppFrame>{children}</AppFrame>
        </PreferenceStoreProvider>
      </body>
    </html>
  );
}
