# Contributing to Intent

Thanks for your interest! Intent is an early experiment — issues, ideas, and
focused pull requests are all welcome.

## Development setup

```sh
git clone https://github.com/dataswarmproject/intent-css.git
cd intent-css
npm install
npm test          # tsc build + node --test suite
npm run demo      # rebuild docs/intent.css from docs/index.html
npm run check     # dogfood: design lint + contrast audit on the demo
```

Node.js ≥ 20. No runtime dependencies — please keep it that way; the only
devDependencies are `typescript` and `@types/node`.

## Project layout

```
src/
  color.ts       OKLCH ↔ sRGB math, WCAG contrast, bestOn()
  scale.ts       spacing + type scales (base × ratio)
  config.ts      defaults, config loading/merging
  theme.ts       seed → full token set + contrast audit definitions
  vocabulary.ts  the role registry (the heart of the system)
  extract.ts     role scanning in source files
  parse.ts       tolerant HTML/JSX element-tree scanner
  lint.ts        design rules (unknown-intent, duplicate-primary, …)
  generate.ts    CSS emission (layers, tokens, roles)
  agents.ts      AGENTS.md generator (from the live vocabulary)
  cli.ts         intent init/build/check/vocab
docs/            demo site — also the GitHub Pages root and the dogfood target
test/            node:test suite (runs against dist/)
```

## Ground rules

- **The default theme must pass its own audit.** `npm test` enforces this at
  several brand hues; a palette change that fails contrast is a bug.
- **The vocabulary is a design act.** New roles need a clear semantic meaning
  and a one-line summary; "I needed this one utility" is usually a sign the
  role is missing a relationship, not a value.
- **No AI-authorship noise.** Keep commit messages, comments, and docs about
  the change itself.
- Add or update tests for behavior changes; keep `intent check` green on the
  demo.

## License and contribution terms

Intent is licensed under the [Functional Source License 1.1, MIT change
license](LICENSE.md). By submitting a contribution you confirm that:

1. you have the right to license your contribution;
2. your contribution is provided under the project's license; and
3. you grant DataSwarm Project a perpetual, worldwide, irrevocable,
   sublicensable right to use, modify, distribute, and **relicense** your
   contribution, including under other license terms.

Clause 3 keeps the project's licensing options (including future commercial
offerings and the scheduled MIT conversion) intact. If you cannot agree to it,
please open an issue instead of a pull request — ideas are just as valuable.
