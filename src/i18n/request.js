import { cookies, headers } from "next/headers";
import { getRequestConfig } from "next-intl/server";
import {
  PREFERENCE_COOKIE_NAMES,
  resolvePreferredLanguage,
} from "@/lib/preferences/preference-policy";
import { resolveLocale } from "@/i18n/config";
import { loadMessages } from "@/i18n/messages";

export default getRequestConfig(async () => {
  const [cookieStore, requestHeaders] = await Promise.all([
    cookies(),
    headers(),
  ]);
  const locale = resolveLocale(
    cookieStore.get(PREFERENCE_COOKIE_NAMES.language)?.value ||
      resolvePreferredLanguage(requestHeaders.get("accept-language")),
  );

  return {
    locale,
    messages: await loadMessages(locale),
    timeZone: "Asia/Seoul",
  };
});
