import assert from "node:assert/strict";
import { test } from "node:test";
import { bestOn, contrast, css, hex, withAlpha } from "../dist/color.js";

test("white and black round-trip through OKLCH", () => {
  assert.equal(hex({ l: 1, c: 0, h: 0 }), "#ffffff");
  assert.equal(hex({ l: 0, c: 0, h: 0 }), "#000000");
});

test("contrast of black on white is 21:1", () => {
  const ratio = contrast({ l: 1, c: 0, h: 0 }, { l: 0, c: 0, h: 0 });
  assert.ok(Math.abs(ratio - 21) < 0.01, `expected ~21, got ${ratio}`);
});

test("contrast is symmetric", () => {
  const a = { l: 0.3, c: 0.1, h: 264 };
  const b = { l: 0.9, c: 0.02, h: 264 };
  assert.equal(contrast(a, b), contrast(b, a));
});

test("bestOn picks dark text on light backgrounds and light text on dark ones", () => {
  assert.ok(bestOn({ l: 0.95, c: 0.02, h: 264 }).l < 0.5);
  assert.ok(bestOn({ l: 0.25, c: 0.05, h: 264 }).l > 0.5);
});

test("css serialization is valid oklch()", () => {
  assert.equal(css({ l: 0.5, c: 0.16, h: 264 }), "oklch(50% 0.16 264)");
  assert.equal(withAlpha({ l: 0.13, c: 0.024, h: 264 }, 0.06), "oklch(13% 0.024 264 / 0.06)");
});
