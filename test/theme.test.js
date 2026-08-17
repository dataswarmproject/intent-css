import assert from "node:assert/strict";
import { test } from "node:test";
import { mergeConfig } from "../dist/config.js";
import { auditTheme, colorVars, resolveTheme } from "../dist/theme.js";

test("the default theme passes its own contrast audit in both schemes", () => {
  const theme = resolveTheme(mergeConfig());
  const results = auditTheme(theme);
  const failures = results.filter((r) => !r.pass);
  assert.equal(
    failures.length,
    0,
    "failed checks:\n" +
      failures.map((f) => `  ${f.label} [${f.scheme}] ${f.fg}/${f.bg} = ${f.ratio.toFixed(2)} < ${f.min}`).join("\n"),
  );
  assert.ok(results.length >= 40, `expected a substantive audit, got ${results.length} checks`);
});

test("a rebranded hue still passes the audit", () => {
  for (const hue of [25, 85, 152, 205, 320]) {
    const theme = resolveTheme(mergeConfig({ brand: { hue } }));
    const failures = auditTheme(theme).filter((r) => !r.pass);
    assert.equal(failures.length, 0, `hue ${hue}: ${failures.map((f) => `${f.label} [${f.scheme}]`).join(", ")}`);
  }
});

test("every color token serializes through light-dark()", () => {
  const vars = colorVars(resolveTheme(mergeConfig()));
  assert.ok(Object.keys(vars).length >= 30);
  for (const [name, value] of Object.entries(vars)) {
    assert.match(name, /^--in-/);
    assert.match(value, /^light-dark\(oklch\(.+\), oklch\(.+\)\)$/, `${name}: ${value}`);
  }
});

test("semantic tokens exist for every status", () => {
  const { colors } = resolveTheme(mergeConfig());
  for (const name of ["info", "success", "warn", "danger"]) {
    for (const token of [name, `${name}-hover`, `on-${name}`, `${name}-soft`, `on-${name}-soft`]) {
      assert.ok(colors[token], `missing token ${token}`);
    }
  }
});
