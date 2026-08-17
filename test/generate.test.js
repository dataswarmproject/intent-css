import assert from "node:assert/strict";
import { test } from "node:test";
import { mergeConfig } from "../dist/config.js";
import { generateCss } from "../dist/generate.js";
import { resolveTheme } from "../dist/theme.js";
import { vocabulary } from "../dist/vocabulary.js";

const theme = resolveTheme(mergeConfig());

test("used-mode emits only the roles in use plus reset and tokens", () => {
  const cssText = generateCss(theme, new Set(["card", "action-primary"]), "0.0.0-test");
  assert.match(cssText, /\.card \{/);
  assert.match(cssText, /\.action-primary \{/);
  assert.doesNotMatch(cssText, /\.note-info/);
  assert.match(cssText, /@layer intent\.reset, intent\.tokens, intent\.roles;/);
  assert.match(cssText, /color-scheme: light dark/);
  assert.match(cssText, /--in-brand: light-dark\(/);
});

test("collapse emits its container query", () => {
  const cssText = generateCss(theme, new Set(["row-related", "collapse", "adaptive"]), "0.0.0-test");
  assert.match(cssText, /@container \(max-width: 30rem\)/);
  assert.match(cssText, /container-type: inline-size/);
});

test("the container breakpoint follows config", () => {
  const custom = resolveTheme(mergeConfig({ collapse: "40rem" }));
  const cssText = generateCss(custom, new Set(["collapse"]), "0.0.0-test");
  assert.match(cssText, /@container \(max-width: 40rem\)/);
});

test("all-mode emits the entire vocabulary", () => {
  const cssText = generateCss(theme, "all", "0.0.0-test");
  for (const role of vocabulary) {
    if (role.css.trim().length === 0) continue;
    assert.ok(cssText.includes(`.${role.name}`), `missing .${role.name}`);
  }
});

test("prefers-reduced-motion guard is always present", () => {
  const cssText = generateCss(theme, new Set(), "0.0.0-test");
  assert.match(cssText, /prefers-reduced-motion: reduce/);
});
