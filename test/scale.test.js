import assert from "node:assert/strict";
import { test } from "node:test";
import { spaceScale, typeScale } from "../dist/scale.js";

test("space scale derives four distances from one base and ratio", () => {
  const s = spaceScale(0.75, 1.5, 1);
  assert.equal(s.compact, "0.5rem");
  assert.equal(s.related, "0.75rem");
  assert.equal(s.separate, "1.688rem");
  assert.equal(s.sectioned, "3.797rem");
});

test("density scales every space step", () => {
  const s = spaceScale(0.75, 1.5, 2);
  assert.equal(s.related, "1.5rem");
  assert.equal(s.compact, "1rem");
});

test("type scale is modular", () => {
  const t = typeScale(1, 1.25);
  assert.equal(t.caption, "0.8rem");
  assert.equal(t.body, "1rem");
  assert.equal(t.heading, "1.563rem");
  assert.equal(t.title, "1.953rem");
  assert.equal(t.display, "2.441rem");
});

test("hero step is fluid between display and ratio^6", () => {
  const t = typeScale(1, 1.25);
  assert.equal(t.hero, "clamp(2.441rem, 6.5vw + 0.6rem, 3.815rem)");
});
