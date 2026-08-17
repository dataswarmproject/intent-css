<p align="center">
  <img src="assets/logo.svg" alt="Intent" width="220">
</p>

<p align="center">
  <strong>Say what it is. Not what it looks like.</strong><br>
  An intent-based styling system: semantic roles, relationship spacing, OKLCH theming,<br>
  and a design linter — built for humans and AI coding agents.
</p>

<p align="center">
  <a href="https://github.com/dataswarmproject/intent-css/actions/workflows/ci.yml"><img src="https://github.com/dataswarmproject/intent-css/actions/workflows/ci.yml/badge.svg" alt="CI"></a>
  <img src="https://img.shields.io/badge/license-FSL--1.1--MIT-5b52e0" alt="License: FSL-1.1-MIT">
  <img src="https://img.shields.io/badge/node-%E2%89%A5%2020-43853d" alt="Node >= 20">
  <img src="https://img.shields.io/badge/status-experimental-orange" alt="Status: experimental">
</p>

<p align="center">
  <a href="https://dataswarmproject.github.io/intent-css/">Live demo</a> ·
  <a href="#quickstart">Quickstart</a> ·
  <a href="#vocabulary">Vocabulary</a> ·
  <a href="#the-design-linter">Linter</a> ·
  <a href="#built-for-ai-coding-agents">AI workflow</a> ·
  <a href="#license--commercial-use">License</a>
</p>

---

Utility CSS solved *"naming things is hard"* — and created *"every design decision is
re-made inline, at every call site, forever."* Consistency became discipline.

Intent moves the decisions back into the system. Markup declares **what an element
is**; the theme decides what that means visually:

```html
<!-- utility CSS: nine visual decisions, repeated at every call site -->
<div class="bg-white dark:bg-zinc-900 rounded-xl shadow p-6 flex flex-col gap-3">

<!-- Intent: two decisions of meaning -->
<div class="card stack-related">
```

Because classes carry meaning, the compiler can do things utility CSS structurally
cannot: audit WCAG contrast at build time, flag two primary actions in one card,
catch `surface-rased` as a typo instead of silently ignoring it, and rebrand the
entire product by changing one hue.

## Why

**Roles, not values.** A closed vocabulary of 41 roles (`card`, `action-primary`,
`stack-related`, `note-warn`…). A class is either meaningful or it is an error —
there is no in-between, no `mt-[13px]`.

**Relationships, not magic numbers.** Spacing never picks pixels. Siblings are
`related`, `separate`, or `sectioned`; one base and one ratio derive every
distance. Change `density` and the whole UI tightens or breathes.

**Modern CSS, no legacy tail.** Container queries are the responsive model
(viewport breakpoints don't exist here). Light/dark ships through `light-dark()`
with zero variant classes. The palette is OKLCH math seeded by a single brand
hue. Output is organized in cascade layers.

**A linter for design.** Semantic classes make design mechanically reviewable.
`intent check` fails the build on unknown roles, conflicting roles, duplicate
primary actions, and any theme whose contrast fails WCAG — in both schemes.

## Quickstart

```sh
npm install intent-css
npx intent init     # writes intent.config.mjs + AGENTS.md
npx intent build    # scans your markup, generates intent.css
npx intent check    # design lint + contrast audit
```

```html
<link rel="stylesheet" href="intent.css">

<main class="adaptive">
  <section class="stack-sectioned">
    <header class="row-separate spread">
      <h1 class="text-title">Projects</h1>
      <button class="action-primary">New project</button>
    </header>
    <div class="grid-collection">
      <article class="card stack-related">
        <h2 class="text-heading">OctoLens</h2>
        <p class="muted">Discovery lens for GitHub.</p>
        <div class="row-related collapse">
          <button class="action-secondary">Open</button>
          <button class="action-quiet">Archive</button>
        </div>
      </article>
    </div>
  </section>
</main>
```

That page is responsive (the card's buttons stack when the *container* is narrow),
theme-complete (dark mode automatic), and audited (contrast guaranteed) — with no
CSS written and no breakpoints declared.

## Vocabulary

Forty-one roles across eight families. Roles sharing a family are mutually
exclusive on one element — the linter enforces it.

| Family | Roles |
| --- | --- |
| **Surfaces** | `surface` `surface-raised` `surface-sunken` `surface-overlay` `card` |
| **Actions** | `action-primary` `action-secondary` `action-quiet` `action-danger` |
| **Text** | `text-display` `text-title` `text-heading` `text-body` `text-caption` + `muted` `faint` |
| **Stacks & rows** | `stack-related` `stack-separate` `stack-sectioned` `row-related` `row-separate` |
| **Layout** | `grid-collection` `adaptive` `collapse` `wrap` `spread` `center` `full` `measure` |
| **Insets** | `inset-compact` `inset-related` `inset-separate` |
| **Notes** | `note-info` `note-success` `note-warn` `note-danger` |
| **Controls & misc** | `field` `divider` `interactive` `selected` `sr-only` |

Every role with a one-line meaning: `npx intent vocab` (or `--json` for tooling,
or [AGENTS.md](AGENTS.md) for the full annotated table).

## Theming

The whole system derives from a handful of seeds in `intent.config.mjs`:

```js
export default {
  content: ["src"],                    // where to scan for roles
  output: "public/intent.css",
  brand: { hue: 264, chroma: 0.16 },   // ONE hue seeds the entire palette
  radius: "0.75rem",
  density: 1,                          // 0.85 = compact UI, 1.15 = airy UI
  space: { base: 0.75, ratio: 1.5 },   // relationship distances
  type: { base: 1, ratio: 1.25 },      // modular type scale
  collapse: "30rem",                   // container width where rows stack
  contrast: { body: 4.5, muted: 4.5, decorative: 3 },
};
```

From `brand.hue`, Intent derives surfaces, text tiers, lines, links, action
states, soft tints, focus rings, and shadows — as OKLCH pairs emitted through
`light-dark()`, so dark mode is a property of the theme, not of your markup.
Semantic hues (info/success/warn/danger) are derived independently and can be
overridden. Hover states are computed *toward more contrast* for whichever label
color the surface received.

Change `hue: 264` to `hue: 152` and the product is green tomorrow — with every
contrast guarantee still holding, because the audit runs on the derived palette,
not on hand-picked values.

## The design linter

```
$ npx intent check

docs/index.html
    12  error  unknown-intent     "surface-rased" is not an Intent role — did you mean "surface-raised"?
    40  warn   duplicate-primary  2 "action-primary" in one <form> scope (lines 42, 51) — keep one primary action
    67  info   inline-style       inline style attribute — Intent cannot audit hard-coded values

Theme contrast audit (WCAG 2.x, light + dark)
  ✓ all 52 checks pass

intent check — 1 error, 1 warning, contrast ok (14 files)
```

| Rule | Severity | Catches |
| --- | --- | --- |
| `unknown-intent` | error | Typos and invented roles (with a nearest-match suggestion) |
| `conflicting-roles` | error | Two roles from one exclusive family on one element |
| `duplicate-primary` | warn | More than one `action-primary` in an action scope |
| `inline-style` | info | Values the design system cannot see or audit |
| contrast audit | error | Any theme token pair below its WCAG minimum, light *and* dark |

Exit code is `1` when errors or contrast failures exist — wire it into CI as a
design gate. The default theme ships passing its own audit at every brand hue.

## Built for AI coding agents

Utility CSS gives a model an infinite class space to hallucinate in. Intent
gives it a **closed contract** plus a **feedback loop**:

- **`AGENTS.md`** — `intent init` drops a styling contract into your repo,
  generated from the live vocabulary. Any coding agent that reads it knows the
  rules; there is nothing else to know.
- **`intent check --json`** — machine-readable diagnostics with file, line,
  rule, and severity. Agents fix errors and re-run until exit code 0.
- **`intent vocab --json`** — the full role vocabulary as data.
- **`llms.txt`** — a model-readable summary of the whole system.

The result: generated UI that cannot drift off the design system, because the
system is finite and the gate is mechanical.

## Browser support

Intent targets evergreen browsers as of mid-2024: `light-dark()` (Chrome/Edge 123,
Firefox 120, Safari 17.5), container queries, OKLCH, and cascade layers. There
are no fallbacks by design — this is a bet on the modern platform.

## CLI

```
intent init             scaffold intent.config.mjs + AGENTS.md
intent build            scan content, generate the stylesheet
intent build -w         …and rebuild on changes
intent build --all      emit the full vocabulary (no scanning)
intent check [--json]   design lint + WCAG contrast audit
intent vocab [--json]   print the role vocabulary
```

## Status & roadmap

Intent is a **v0.1 experiment** — the concepts are load-bearing, the API is not
yet frozen. Planned next: style queries for state-driven variants, anchor
positioning for popovers, view-transition roles, density modes per subtree,
first-class Vue/Svelte/React bindings, and editor tooling on top of
`vocab --json`.

## License & commercial use

Intent is source-available under the
[Functional Source License, v1.1, MIT change license](LICENSE.md) (FSL-1.1-MIT):

- **Free** for internal use, non-commercial education and research, and
  professional services built with it — including commercial products that
  merely *use* Intent for their own UI.
- **Not allowed:** offering Intent itself (or a substitute of it) as a
  commercial product or service.
- **Time-boxed:** each release automatically converts to plain **MIT two years
  after publication**.

For commercial licensing beyond the grant, contact
**dataswarmproject@gmail.com**.

## Contributing

Issues and pull requests are welcome — see [CONTRIBUTING.md](CONTRIBUTING.md)
(note the license grant terms). Run `npm test` before submitting; the CI gate is
`npm test` + `intent check` on the demo.

---

<p align="center"><sub>A <a href="https://github.com/dataswarmproject">DataSwarm Project</a> experiment · © 2026 DataSwarm Project</sub></p>
