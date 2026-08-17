/**
 * The Intent vocabulary: a small, closed set of semantic roles.
 *
 * This is deliberately finite — a bounded vocabulary is what makes markup
 * reviewable by the linter and reliable for AI coding agents (there is nothing
 * to hallucinate: a class is either a role or an error).
 */

export interface Role {
  name: string;
  /** Exclusivity group — an element may carry at most one role per group. */
  group?: string;
  /** One-line meaning, surfaced in docs, `intent vocab`, and AGENTS.md. */
  summary: string;
  /** Rule block(s) for this role. */
  css: string;
  /** Global rules the role depends on (emitted once, e.g. container queries). */
  extra?: string;
}

const ACTION_BASE = `display: inline-flex; align-items: center; justify-content: center; gap: var(--in-gap-compact);
  padding: 0.55em 1.1em; border: 1px solid transparent; border-radius: var(--in-radius-control);
  font-weight: 600; font-size: var(--in-text-body); line-height: 1.2; text-decoration: none;
  cursor: pointer; user-select: none;
  transition: background-color 120ms ease, border-color 120ms ease, color 120ms ease, translate 120ms ease;`;

const note = (name: string): string => `.note-${name} {
  display: flex; align-items: flex-start; gap: var(--in-gap-related);
  padding: var(--in-gap-related); border-radius: var(--in-radius-control);
  background: var(--in-${name}-soft); color: var(--in-on-${name}-soft);
  border-inline-start: 3px solid var(--in-${name});
}`;

/** Build the vocabulary. `collapse` parameterizes the container-query breakpoint. */
export function buildVocabulary(opts: { collapse: string }): Role[] {
  return [
    // ── Surfaces ─────────────────────────────────────────────────────────
    {
      name: "surface",
      group: "surface",
      summary: "The default plane content sits on.",
      css: `.surface { background: var(--in-surface); color: var(--in-text); }`,
    },
    {
      name: "surface-raised",
      group: "surface",
      summary: "A plane lifted above its parent (panels, menus).",
      css: `.surface-raised { background: var(--in-surface-raised); color: var(--in-text); border: 1px solid var(--in-line); box-shadow: var(--in-shadow); }`,
    },
    {
      name: "surface-sunken",
      group: "surface",
      summary: "A recessed plane (wells, code areas, empty states).",
      css: `.surface-sunken { background: var(--in-surface-sunken); color: var(--in-text); }`,
    },
    {
      name: "surface-overlay",
      group: "surface",
      summary: "A floating plane above everything (dialogs, popovers).",
      css: `.surface-overlay { background: var(--in-surface-overlay); color: var(--in-text); border: 1px solid var(--in-line); box-shadow: var(--in-shadow-lg); }`,
    },
    {
      name: "card",
      group: "surface",
      summary: "A self-contained raised block: surface, border, radius, padding in one role.",
      css: `.card { background: var(--in-surface-raised); color: var(--in-text); border: 1px solid var(--in-line); border-radius: var(--in-radius); padding: var(--in-gap-separate); box-shadow: var(--in-shadow); }`,
    },

    // ── Actions ──────────────────────────────────────────────────────────
    {
      name: "action-primary",
      group: "action",
      summary: "THE action of a container. One per card/form/nav — the linter enforces it.",
      css: `.action-primary { ${ACTION_BASE} background: var(--in-brand); color: var(--in-on-brand); }
.action-primary:hover { background: var(--in-brand-hover); }
.action-primary:active { translate: 0 1px; }
.action-primary:disabled { opacity: 0.55; cursor: not-allowed; }`,
    },
    {
      name: "action-secondary",
      group: "action",
      summary: "A supporting action, visually subordinate to the primary.",
      css: `.action-secondary { ${ACTION_BASE} background: var(--in-brand-soft); color: var(--in-on-brand-soft); }
.action-secondary:hover { background: var(--in-brand-soft-hover); }
.action-secondary:active { translate: 0 1px; }
.action-secondary:disabled { opacity: 0.55; cursor: not-allowed; }`,
    },
    {
      name: "action-quiet",
      group: "action",
      summary: "A low-emphasis action (toolbars, inline links that act).",
      css: `.action-quiet { ${ACTION_BASE} background: transparent; color: var(--in-brand); }
.action-quiet:hover { background: var(--in-brand-soft); color: var(--in-on-brand-soft); }
.action-quiet:active { translate: 0 1px; }
.action-quiet:disabled { opacity: 0.55; cursor: not-allowed; }`,
    },
    {
      name: "action-danger",
      group: "action",
      summary: "A destructive action. Pair with confirmation UX.",
      css: `.action-danger { ${ACTION_BASE} background: var(--in-danger); color: var(--in-on-danger); }
.action-danger:hover { background: var(--in-danger-hover); }
.action-danger:active { translate: 0 1px; }
.action-danger:disabled { opacity: 0.55; cursor: not-allowed; }`,
    },

    // ── Text roles ───────────────────────────────────────────────────────
    {
      name: "text-display",
      group: "text",
      summary: "Hero-level statement text. Rarely more than one per page.",
      css: `.text-display { font-family: var(--in-font-display); font-size: var(--in-text-display); font-weight: 750; line-height: 1.05; letter-spacing: -0.02em; text-wrap: balance; }`,
    },
    {
      name: "text-title",
      group: "text",
      summary: "Page or section title.",
      css: `.text-title { font-family: var(--in-font-display); font-size: var(--in-text-title); font-weight: 700; line-height: 1.12; letter-spacing: -0.015em; text-wrap: balance; }`,
    },
    {
      name: "text-heading",
      group: "text",
      summary: "Subsection or card heading.",
      css: `.text-heading { font-size: var(--in-text-heading); font-weight: 650; line-height: 1.25; letter-spacing: -0.01em; }`,
    },
    {
      name: "text-body",
      group: "text",
      summary: "Default reading text.",
      css: `.text-body { font-size: var(--in-text-body); font-weight: 400; line-height: 1.55; }`,
    },
    {
      name: "text-caption",
      group: "text",
      summary: "Small supporting text: labels, metadata, footnotes.",
      css: `.text-caption { font-size: var(--in-text-caption); font-weight: 500; line-height: 1.35; letter-spacing: 0.01em; }`,
    },
    {
      name: "muted",
      summary: "De-emphasized color, still fully readable (audited ≥ 4.5:1).",
      css: `.muted { color: var(--in-text-muted); }`,
    },
    {
      name: "faint",
      summary: "Decorative-level color (audited ≥ 3:1). Not for essential copy.",
      css: `.faint { color: var(--in-text-faint); }`,
    },

    // ── Layout: relationships, not pixels ────────────────────────────────
    {
      name: "stack-related",
      group: "stack",
      summary: "Vertical flow of items that belong together (a label and its field).",
      css: `.stack-related { display: flex; flex-direction: column; gap: var(--in-gap-related); }`,
    },
    {
      name: "stack-separate",
      group: "stack",
      summary: "Vertical flow of distinct items (cards in a column).",
      css: `.stack-separate { display: flex; flex-direction: column; gap: var(--in-gap-separate); }`,
    },
    {
      name: "stack-sectioned",
      group: "stack",
      summary: "Vertical flow of independent page sections.",
      css: `.stack-sectioned { display: flex; flex-direction: column; gap: var(--in-gap-sectioned); }`,
    },
    {
      name: "row-related",
      group: "row",
      summary: "Horizontal flow of items that belong together (icon + label).",
      css: `.row-related { display: flex; align-items: center; gap: var(--in-gap-related); }`,
    },
    {
      name: "row-separate",
      group: "row",
      summary: "Horizontal flow of distinct items (nav links, button groups).",
      css: `.row-separate { display: flex; align-items: center; gap: var(--in-gap-separate); }`,
    },
    {
      name: "grid-collection",
      summary: "A responsive grid of equivalent items (card grids) — no breakpoints needed.",
      css: `.grid-collection { display: grid; gap: var(--in-gap-separate); grid-template-columns: repeat(auto-fill, minmax(min(17rem, 100%), 1fr)); }`,
    },
    {
      name: "adaptive",
      summary: "Marks a layout container; descendants respond to ITS width, not the viewport's.",
      css: `.adaptive { container-type: inline-size; }`,
    },
    {
      name: "collapse",
      summary: "On a row inside an `adaptive` container: becomes a stack when the container is narrow.",
      css: ``,
      extra: `@container (max-width: ${opts.collapse}) {
  .row-related.collapse, .row-separate.collapse { flex-direction: column; align-items: stretch; }
}`,
    },
    {
      name: "wrap",
      summary: "Lets a row wrap instead of overflowing.",
      css: `.wrap { flex-wrap: wrap; }`,
    },
    {
      name: "spread",
      summary: "Pushes row/stack children apart (nav bars, card footers).",
      css: `.spread { justify-content: space-between; }`,
    },
    {
      name: "center",
      summary: "Centers children and text.",
      css: `.center { align-items: center; justify-content: center; text-align: center; }`,
    },
    {
      name: "full",
      summary: "Takes the full width of the parent.",
      css: `.full { width: 100%; }`,
    },
    {
      name: "measure",
      summary: "Caps line length at a comfortable reading measure.",
      css: `.measure { max-width: 65ch; }`,
    },

    // ── Insets ───────────────────────────────────────────────────────────
    {
      name: "inset-compact",
      group: "inset",
      summary: "Tight padding (chips, dense list rows).",
      css: `.inset-compact { padding: var(--in-gap-compact); }`,
    },
    {
      name: "inset-related",
      group: "inset",
      summary: "Default padding for grouped content.",
      css: `.inset-related { padding: var(--in-gap-related); }`,
    },
    {
      name: "inset-separate",
      group: "inset",
      summary: "Generous padding (cards, panels).",
      css: `.inset-separate { padding: var(--in-gap-separate); }`,
    },

    // ── Feedback ─────────────────────────────────────────────────────────
    { name: "note-info", group: "note", summary: "Neutral information callout.", css: note("info") },
    { name: "note-success", group: "note", summary: "Positive-outcome callout.", css: note("success") },
    { name: "note-warn", group: "note", summary: "Caution callout.", css: note("warn") },
    { name: "note-danger", group: "note", summary: "Error or destructive-consequence callout.", css: note("danger") },

    // ── Controls & misc ──────────────────────────────────────────────────
    {
      name: "field",
      summary: "A text input, select, or textarea.",
      css: `.field { display: block; width: 100%; background: var(--in-surface); color: var(--in-text); border: 1px solid var(--in-line-strong); border-radius: var(--in-radius-control); padding: 0.55em 0.8em; transition: border-color 120ms ease, box-shadow 120ms ease; }
.field::placeholder { color: var(--in-text-faint); }
.field:focus-visible { outline: none; border-color: var(--in-brand); box-shadow: 0 0 0 3px var(--in-brand-soft); }`,
    },
    {
      name: "divider",
      summary: "A hairline separator.",
      css: `.divider { border: 0; border-top: 1px solid var(--in-line); width: 100%; }`,
    },
    {
      name: "interactive",
      summary: "Hover affordance for clickable surfaces (cards that link somewhere).",
      css: `.interactive { cursor: pointer; transition: translate 120ms ease, box-shadow 120ms ease, border-color 120ms ease; }
.interactive:hover { translate: 0 -1px; box-shadow: var(--in-shadow-lg); border-color: var(--in-line-strong); }`,
    },
    {
      name: "selected",
      summary: "Marks the chosen item in a set.",
      css: `.selected { border-color: var(--in-brand); background: var(--in-brand-soft); color: var(--in-on-brand-soft); }`,
    },
    {
      name: "sr-only",
      summary: "Visually hidden, still read by screen readers.",
      css: `.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; border: 0; }`,
    },
  ];
}

/** Canonical role list (breakpoint-independent metadata). */
export const vocabulary: Role[] = buildVocabulary({ collapse: "30rem" });

/** Every valid role name. */
export const vocabularyNames: ReadonlySet<string> = new Set(vocabulary.map((r) => r.name));

/** Exclusivity groups: an element may use at most one role from each. */
export const groups: Readonly<Record<string, string[]>> = vocabulary.reduce<Record<string, string[]>>(
  (acc, role) => {
    if (role.group) (acc[role.group] ??= []).push(role.name);
    return acc;
  },
  {},
);

/** Prefixes that signal "this was meant to be an Intent role" for typo detection. */
export const rolePrefixes: readonly string[] = [
  "surface",
  "action-",
  "text-",
  "stack-",
  "row-",
  "note-",
  "inset-",
  "grid-",
];

/** Roles/tags that establish an "action scope" for the one-primary-action rule. */
export const containerRoles: ReadonlySet<string> = new Set(["card", "surface-raised", "surface-overlay"]);
export const containerTags: ReadonlySet<string> = new Set(["form", "nav", "dialog", "header", "footer", "fieldset", "aside"]);
