import { vocabulary } from "./vocabulary.js";

/**
 * AGENTS.md content — the styling contract for AI coding agents working in a
 * project that uses Intent. `intent init` writes this next to the config so
 * any agent (or teammate) picks up the rules automatically. Generated from the
 * live vocabulary so it can never drift from the implementation.
 */
export function agentsMarkdown(version: string): string {
  const rows = vocabulary
    .map((role) => `| \`${role.name}\` | ${role.group ?? "—"} | ${role.summary} |`)
    .join("\n");

  return `# Styling instructions — Intent (intent-css v${version})

This project is styled with **Intent**: a closed vocabulary of semantic CSS
classes. Markup declares what an element *is*; the theme decides what it looks
like. These rules are mandatory for anyone — human or agent — editing UI here.

## Hard rules

1. Class attributes may only contain Intent roles from the vocabulary below.
   Never invent class names, never mix in utility classes from other
   frameworks, never add inline \`style=\` attributes, never create new CSS files.
2. Never hard-code colors, font sizes, margins, paddings, shadows, or radii.
   Every visual decision lives in \`intent.config.mjs\`; edit it only when the
   task is explicitly about changing the design system.
3. Spacing is expressed by wrapping siblings in \`stack-*\` / \`row-*\` roles and
   letting the gap state the relationship (related / separate / sectioned).
   Do not add margins or spacer elements.
4. Keep exactly one \`action-primary\` per action scope (card, form, nav,
   dialog). Demote everything else to \`action-secondary\` or \`action-quiet\`.
5. For responsive behavior, give a wrapper the \`adaptive\` role and add
   \`collapse\` to rows that should stack when the container is narrow.
   Do not write media queries.
6. Light and dark mode are automatic (\`light-dark()\` tokens). Never write
   scheme-specific variants or dark-mode classes.

## Verification loop — run after every markup change

\`\`\`sh
npx intent build          # regenerate the stylesheet from the roles in use
npx intent check --json   # design lint + WCAG contrast audit (exit 1 = errors)
\`\`\`

Fix every diagnostic with severity \`"error"\`. Treat \`"warn"\` as a reviewer
comment: resolve it unless the user explicitly asked for that pattern.
\`npx intent vocab --json\` returns this vocabulary in machine-readable form.

## Vocabulary

Roles sharing a group are mutually exclusive on one element.

| Role | Group | Meaning |
| --- | --- | --- |
${rows}

## Composition cheatsheet

\`\`\`html
<main class="adaptive">
  <section class="stack-sectioned">
    <header class="row-separate spread">
      <h1 class="text-title">Page title</h1>
      <button class="action-primary">New item</button>
    </header>

    <div class="grid-collection">
      <article class="card stack-related">
        <h2 class="text-heading">Card heading</h2>
        <p class="muted">Supporting copy.</p>
        <div class="row-related collapse">
          <button class="action-secondary">Open</button>
          <button class="action-quiet">Dismiss</button>
        </div>
      </article>
    </div>
  </section>
</main>
\`\`\`
`;
}
