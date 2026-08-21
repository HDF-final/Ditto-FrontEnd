import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const locales = ["ko", "zh", "ja", "en"];

async function read(relativePath) {
  return readFile(path.join(root, relativePath), "utf8");
}

async function readJson(relativePath) {
  return JSON.parse(await read(relativePath));
}

function flattenMessages(value, prefix = "") {
  return Object.entries(value).flatMap(([key, child]) => {
    const pathKey = prefix ? `${prefix}.${key}` : key;
    return child && typeof child === "object" && !Array.isArray(child)
      ? flattenMessages(child, pathKey)
      : [[pathKey, child]];
  });
}

const catalogs = Object.fromEntries(
  await Promise.all(
    locales.map(async (locale) => [
      locale,
      await readJson(`messages/${locale}.json`),
    ]),
  ),
);

test("supported locales are exactly Korean, Chinese, Japanese, and English", async () => {
  const source = await read("src/i18n/config.js");
  const moduleUrl = `data:text/javascript;base64,${Buffer.from(source).toString("base64")}`;
  const { DEFAULT_LOCALE, SUPPORTED_LOCALES, resolveLocale } = await import(moduleUrl);

  assert.deepEqual([...SUPPORTED_LOCALES], locales);
  assert.equal(DEFAULT_LOCALE, "ko");
  assert.equal(resolveLocale("zh"), "zh");
  assert.equal(resolveLocale("fr"), "ko");
});

test("all locale catalogs expose the same message keys", () => {
  const koreanKeys = flattenMessages(catalogs.ko).map(([key]) => key).sort();

  for (const locale of locales.slice(1)) {
    const localizedKeys = flattenMessages(catalogs[locale])
      .map(([key]) => key)
      .sort();
    assert.deepEqual(localizedKeys, koreanKeys, `${locale} catalog keys differ`);
  }
});

test("localized catalogs do not accidentally retain Korean UI copy", () => {
  for (const locale of locales.slice(1)) {
    for (const [key, value] of flattenMessages(catalogs[locale])) {
      assert.equal(typeof value, "string", `${locale}.${key} must be a string`);
      assert.doesNotMatch(value, /[가-힣]/, `${locale}.${key} contains Korean copy`);
    }
  }
});

test("server request config and root layout use the preference locale", async () => {
  const [requestConfig, rootLayout] = await Promise.all([
    read("src/i18n/request.js"),
    read("src/app/layout.js"),
  ]);

  assert.match(requestConfig, /PREFERENCE_COOKIE_NAMES\.language/);
  assert.match(requestConfig, /resolvePreferredLanguage/);
  assert.match(rootLayout, /lang=\{initialPreferences\.languageCode\}/);
  assert.match(rootLayout, /NextIntlClientProvider/);
});

test("header exposes the primary product navigation items", async () => {
  const source = await read("src/components/layout/header-nav-links.js");
  const items = [...source.matchAll(/href: "([^"]+)", labelKey: "([^"]+)"/g)]
    .map(([, href, labelKey]) => ({ href, labelKey }));

  assert.deepEqual(items, [
    { href: "/ai-course", labelKey: "createCourse" },
    { href: "/#picks", labelKey: "courseRecommendations" },
    { href: "/#community", labelKey: "community" },
    { href: "/#newsletter", labelKey: "news" },
  ]);
});
