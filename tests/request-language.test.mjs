import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = await readFile(
  path.join(root, "src/lib/api/request-language.js"),
  "utf8",
);
const moduleUrl = `data:text/javascript;base64,${Buffer.from(source).toString("base64")}`;
const {
  applyApiLanguageHeader,
  getApiLanguageFromCookieString,
  normalizeApiLanguage,
} = await import(moduleUrl);

test("selected language cookie becomes the API request language", () => {
  assert.equal(
    getApiLanguageFromCookieString("ditto-country=JP; ditto-language=ja"),
    "ja",
  );
  assert.equal(
    getApiLanguageFromCookieString("ditto-language=zh; another=value"),
    "zh",
  );
});

test("missing, malformed, or unsupported language safely falls back to Korean", () => {
  assert.equal(getApiLanguageFromCookieString(""), "ko");
  assert.equal(getApiLanguageFromCookieString("ditto-language=fr"), "ko");
  assert.equal(getApiLanguageFromCookieString("ditto-language=%E0%A4%A"), "ko");
  assert.equal(normalizeApiLanguage(undefined), "ko");
});

test("common request header keeps an explicit caller language", () => {
  const values = new Map([["accept-language", "en"]]);
  const headers = {
    get(name) {
      return values.get(name.toLowerCase());
    },
    set(name, value) {
      values.set(name.toLowerCase(), value);
    },
  };

  applyApiLanguageHeader(headers, "ditto-language=ja");

  assert.equal(headers.get("Accept-Language"), "en");
});
