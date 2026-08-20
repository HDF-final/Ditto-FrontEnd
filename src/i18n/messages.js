import { DEFAULT_LOCALE, resolveLocale } from "@/i18n/config";

const messageLoaders = {
  ko: () => import("../../messages/ko.json").then((module) => module.default),
  zh: () => import("../../messages/zh.json").then((module) => module.default),
  ja: () => import("../../messages/ja.json").then((module) => module.default),
  en: () => import("../../messages/en.json").then((module) => module.default),
};

function mergeMessages(fallback, localized) {
  if (
    typeof fallback !== "object" ||
    fallback === null ||
    Array.isArray(fallback)
  ) {
    return localized ?? fallback;
  }

  return Object.fromEntries(
    Object.entries(fallback).map(([key, fallbackValue]) => [
      key,
      mergeMessages(fallbackValue, localized?.[key]),
    ]),
  );
}

export async function loadMessages(locale) {
  const resolvedLocale = resolveLocale(locale);
  const fallbackMessages = await messageLoaders[DEFAULT_LOCALE]();

  if (resolvedLocale === DEFAULT_LOCALE) {
    return fallbackMessages;
  }

  const localizedMessages = await messageLoaders[resolvedLocale]();
  return mergeMessages(fallbackMessages, localizedMessages);
}
