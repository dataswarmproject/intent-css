# Changelog

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
