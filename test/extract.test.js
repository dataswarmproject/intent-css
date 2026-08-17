import assert from "node:assert/strict";
import { test } from "node:test";
import { extractTokens } from "../dist/extract.js";
import { vocabularyNames } from "../dist/vocabulary.js";

test("finds roles in plain HTML", () => {
  const used = extractTokens(`<div class="card stack-related"><b class="muted">x</b></div>`, vocabularyNames);
  assert.deepEqual([...used].sort(), ["card", "muted", "stack-related"]);
});

test("finds roles in JSX with template literals", () => {
  const source = "const b = <button className={`action-primary ${extra}`}>Go</button>;";
  const used = extractTokens(source, vocabularyNames);
  assert.deepEqual([...used], ["action-primary"]);
});

test("ignores unknown classes", () => {
  const used = extractTokens(`<p class="bg-blue-500 mt-4">plain copy</p>`, vocabularyNames);
  assert.deepEqual([...used], []);
});

test("the scan is deliberately permissive: a role word anywhere marks the role as used", () => {
  // Tailwind-style tradeoff — a prose false positive costs a few bytes of CSS,
  // while a missed dynamic class would cost a broken style.
  const used = extractTokens(`prose mentioning card somewhere`, vocabularyNames);
  assert.deepEqual([...used], ["card"]);
});
