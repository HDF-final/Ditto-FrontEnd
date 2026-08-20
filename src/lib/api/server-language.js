import "server-only";

import { cookies } from "next/headers";
import { normalizeApiLanguage } from "./request-language";

const LANGUAGE_COOKIE_NAME = "ditto-language";

export async function getServerApiHeaders(initialHeaders = {}) {
  const hasExplicitLanguage = Object.keys(initialHeaders).some(
    (name) => name.toLowerCase() === "accept-language",
  );
  if (hasExplicitLanguage) return initialHeaders;

  const cookieStore = await cookies();
  const language = normalizeApiLanguage(
    cookieStore.get(LANGUAGE_COOKIE_NAME)?.value,
  );
  return {
    ...initialHeaders,
    "Accept-Language": language,
  };
}
