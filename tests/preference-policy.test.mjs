import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const fixturesPath = path.join(root, "src/lib/fixtures/countries.js");
const policyPath = path.join(
  root,
  "src/lib/preferences/preference-policy.js",
);

const fixturesSource = await readFile(fixturesPath, "utf8");
const fixturesUrl = `data:text/javascript;base64,${Buffer.from(fixturesSource).toString("base64")}`;
const policySource = (await readFile(policyPath, "utf8")).replace(
  '"@/lib/fixtures/countries"',
  `"${fixturesUrl}"`,
);
const {
  getPreferencesAfterCountryChange,
  normalizePreferences,
  resolveInitialPreferences,
  resolvePreferredLanguage,
} = await import(
  `data:text/javascript;base64,${Buffer.from(policySource).toString("base64")}`
);

test("browser language resolves by quality and supports regional tags", () => {
  assert.equal(resolvePreferredLanguage("fr;q=0.9, ja-JP;q=1, en;q=0.8"), "ja");
  assert.equal(resolvePreferredLanguage("zh-CN,ko;q=0.8"), "zh");
});

test("unsupported browser language falls back to Korean", () => {
  assert.equal(resolvePreferredLanguage("fr-FR,de;q=0.8"), "ko");
  assert.equal(resolvePreferredLanguage(undefined), "ko");
});

test("stored guest cookies override browser language", () => {
  assert.deepEqual(
    resolveInitialPreferences({
      countryCookie: "US",
      languageCookie: "ja",
      manualLanguageCookie: "1",
      acceptLanguage: "zh-CN,zh;q=0.9",
    }),
    {
      countryCode: "US",
      languageCode: "ja",
      languageWasManuallySelected: true,
    },
  );
});

test("missing or invalid cookies use KR and browser language", () => {
  assert.deepEqual(
    resolveInitialPreferences({
      countryCookie: "XX",
      languageCookie: "fr",
      manualLanguageCookie: "1",
      acceptLanguage: "en-US,en;q=0.9",
    }),
    {
      countryCode: "KR",
      languageCode: "en",
      languageWasManuallySelected: false,
    },
  );
});

test("country applies its default language before a manual language choice", () => {
  assert.deepEqual(
    getPreferencesAfterCountryChange(
      {
        countryCode: "KR",
        languageCode: "ko",
        languageWasManuallySelected: false,
      },
      "CN",
    ),
    {
      countryCode: "CN",
      languageCode: "zh",
      languageWasManuallySelected: false,
    },
  );
});

test("country preserves language after a manual language choice", () => {
  assert.deepEqual(
    getPreferencesAfterCountryChange(
      {
        countryCode: "KR",
        languageCode: "en",
        languageWasManuallySelected: true,
      },
      "JP",
    ),
    {
      countryCode: "JP",
      languageCode: "en",
      languageWasManuallySelected: true,
    },
  );
});

test("normalization never replaces valid settings with invalid values", () => {
  assert.deepEqual(
    normalizePreferences(
      { countryCode: "XX", languageCode: "fr" },
      {
        countryCode: "JP",
        languageCode: "ja",
        languageWasManuallySelected: true,
      },
    ),
    {
      countryCode: "JP",
      languageCode: "ja",
      languageWasManuallySelected: true,
    },
  );
});
