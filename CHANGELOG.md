# Changelog

## 0.2.0 — 2026-08-17

Three vocabulary additions driven by building the project site with the
framework itself, plus a redesigned site.

- **`text-hero`** — a fluid statement size above `text-display`; the type scale
  gains a `hero` step that clamps between `display` and ratio⁶ across viewports.
- **`eyebrow`** — a small tracked uppercase label that introduces a section
  (joins the `text` exclusivity group).
- **`chip`** — an inline pill for tags, counts, and metadata.
- New `--in-text-hero` token; vocabulary grows 41 → 44 roles.
- The site (docs/) is now a specimen gallery: every component exhibited live,
  built exclusively from Intent roles and gated by `intent check` in CI.

## 0.1.0 — 2026-08-17

Initial public release.

- **Vocabulary** — 41 semantic roles across eight families (surfaces, actions,
  text, stacks/rows, layout, insets, notes, controls), with exclusivity groups.
- **Theme engine** — one OKLCH brand hue seeds the full palette; every color
  token is a light/dark pair emitted through `light-dark()`; hover states are
  derived toward more contrast; spacing and type derive from base × ratio.
- **Compiler** — `intent build` scans HTML/JSX/Vue/Svelte/Astro/MD sources and
  emits a layered stylesheet (`intent.reset` / `intent.tokens` / `intent.roles`)
  with only the roles in use; `--all` emits the full vocabulary; `-w` watches.
- **Design linter** — `intent check` reports `unknown-intent` (with
  nearest-match suggestions), `conflicting-roles`, `duplicate-primary`, and
  `inline-style`; exit code 1 gates CI.
- **Contrast audit** — 52 WCAG checks over the derived palette in both schemes;
  the default theme passes at every brand hue, enforced by tests.
- **AI-agent workflow** — `intent init` scaffolds `AGENTS.md` (generated from
  the live vocabulary), `check --json` and `vocab --json` provide the machine
  loop, `llms.txt` describes the system to models.
- **Container-query responsiveness** — `adaptive` + `collapse` replace viewport
  breakpoints.
- Zero runtime dependencies; Node ≥ 20.
