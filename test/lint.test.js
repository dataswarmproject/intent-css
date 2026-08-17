import assert from "node:assert/strict";
import { test } from "node:test";
import { lintSource } from "../dist/lint.js";

const rules = (diags) => diags.map((d) => d.rule);

test("clean markup produces no diagnostics", () => {
  const diags = lintSource(
    "page.html",
    `<main class="adaptive">
       <article class="card stack-related">
         <h2 class="text-heading">Hi</h2>
         <div class="row-related collapse">
           <button class="action-primary">Save</button>
           <button class="action-quiet">Cancel</button>
         </div>
       </article>
     </main>`,
  );
  assert.deepEqual(diags, []);
});

test("unknown-intent catches typos with a suggestion", () => {
  const diags = lintSource("page.html", `<div class="surface-rased">x</div>`);
  assert.deepEqual(rules(diags), ["unknown-intent"]);
  assert.match(diags[0].message, /surface-raised/);
  assert.equal(diags[0].severity, "error");
});

test("conflicting-roles rejects two roles from one group", () => {
  const diags = lintSource("page.html", `<button class="action-primary action-quiet">x</button>`);
  assert.deepEqual(rules(diags), ["conflicting-roles"]);
});

test("duplicate-primary warns on two primaries in one card scope", () => {
  const diags = lintSource(
    "page.html",
    `<article class="card">
       <button class="action-primary">A</button>
       <div><button class="action-primary">B</button></div>
     </article>`,
  );
  assert.deepEqual(rules(diags), ["duplicate-primary"]);
  assert.equal(diags[0].severity, "warn");
});

test("nested action scopes are judged independently", () => {
  const diags = lintSource(
    "page.html",
    `<form>
       <button class="action-primary">Submit</button>
       <article class="card"><button class="action-primary">Card CTA</button></article>
     </form>`,
  );
  assert.deepEqual(diags, []);
});

test("inline styles are reported as info", () => {
  const diags = lintSource("page.html", `<div class="card" style="margin-top: 13px">x</div>`);
  assert.deepEqual(rules(diags), ["inline-style"]);
  assert.equal(diags[0].severity, "info");
});

test("JSX className and fragments parse", () => {
  const diags = lintSource(
    "App.tsx",
    `export const App = () => (<>
       <section className="card">
         <button className="action-primary">A</button>
         <button className="action-primary">B</button>
       </section>
     </>);`,
  );
  assert.deepEqual(rules(diags), ["duplicate-primary"]);
});

test("script and comment content is not linted", () => {
  const diags = lintSource(
    "page.html",
    `<!-- <div class="surface-rased">x</div> -->
     <script>const cls = "<div class='action-primaryy'>";</script>
     <div class="surface">ok</div>`,
  );
  assert.deepEqual(diags, []);
});
