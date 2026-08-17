# Styling instructions — Intent (intent-css v0.2.0)

This project is styled with **Intent**: a closed vocabulary of semantic CSS
classes. Markup declares what an element *is*; the theme decides what it looks
like. These rules are mandatory for anyone — human or agent — editing UI here.

## Hard rules

1. Class attributes may only contain Intent roles from the vocabulary below.
   Never invent class names, never mix in utility classes from other
   frameworks, never add inline `style=` attributes, never create new CSS files.
2. Never hard-code colors, font sizes, margins, paddings, shadows, or radii.
   Every visual decision lives in `intent.config.mjs`; edit it only when the
   task is explicitly about changing the design system.
3. Spacing is expressed by wrapping siblings in `stack-*` / `row-*` roles and
   letting the gap state the relationship (related / separate / sectioned).
   Do not add margins or spacer elements.
4. Keep exactly one `action-primary` per action scope (card, form, nav,
   dialog). Demote everything else to `action-secondary` or `action-quiet`.
5. For responsive behavior, give a wrapper the `adaptive` role and add
   `collapse` to rows that should stack when the container is narrow.
   Do not write media queries.
6. Light and dark mode are automatic (`light-dark()` tokens). Never write
   scheme-specific variants or dark-mode classes.

## Verification loop — run after every markup change

```sh
npx intent build          # regenerate the stylesheet from the roles in use
npx intent check --json   # design lint + WCAG contrast audit (exit 1 = errors)
```

Fix every diagnostic with severity `"error"`. Treat `"warn"` as a reviewer
comment: resolve it unless the user explicitly asked for that pattern.
`npx intent vocab --json` returns this vocabulary in machine-readable form.

## Vocabulary

Roles sharing a group are mutually exclusive on one element.

| Role | Group | Meaning |
| --- | --- | --- |
| `surface` | surface | The default plane content sits on. |
| `surface-raised` | surface | A plane lifted above its parent (panels, menus). |
| `surface-sunken` | surface | A recessed plane (wells, code areas, empty states). |
| `surface-overlay` | surface | A floating plane above everything (dialogs, popovers). |
| `card` | surface | A self-contained raised block: surface, border, radius, padding in one role. |
| `action-primary` | action | THE action of a container. One per card/form/nav — the linter enforces it. |
| `action-secondary` | action | A supporting action, visually subordinate to the primary. |
| `action-quiet` | action | A low-emphasis action (toolbars, inline links that act). |
| `action-danger` | action | A destructive action. Pair with confirmation UX. |
| `text-hero` | text | The one statement that owns the page. Fluid — scales with the viewport. |
| `text-display` | text | Hero-level statement text. Rarely more than one per page. |
| `text-title` | text | Page or section title. |
| `text-heading` | text | Subsection or card heading. |
| `text-body` | text | Default reading text. |
| `text-caption` | text | Small supporting text: labels, metadata, footnotes. |
| `eyebrow` | text | A small tracked label that introduces a section. |
| `muted` | — | De-emphasized color, still fully readable (audited ≥ 4.5:1). |
| `faint` | — | Decorative-level color (audited ≥ 3:1). Not for essential copy. |
| `stack-related` | stack | Vertical flow of items that belong together (a label and its field). |
| `stack-separate` | stack | Vertical flow of distinct items (cards in a column). |
| `stack-sectioned` | stack | Vertical flow of independent page sections. |
| `row-related` | row | Horizontal flow of items that belong together (icon + label). |
| `row-separate` | row | Horizontal flow of distinct items (nav links, button groups). |
| `grid-collection` | — | A responsive grid of equivalent items (card grids) — no breakpoints needed. |
| `adaptive` | — | Marks a layout container; descendants respond to ITS width, not the viewport's. |
| `collapse` | — | On a row inside an `adaptive` container: becomes a stack when the container is narrow. |
| `wrap` | — | Lets a row wrap instead of overflowing. |
| `spread` | — | Pushes row/stack children apart (nav bars, card footers). |
| `center` | — | Centers children and text. |
| `full` | — | Takes the full width of the parent. |
| `measure` | — | Caps line length at a comfortable reading measure. |
| `inset-compact` | inset | Tight padding (chips, dense list rows). |
| `inset-related` | inset | Default padding for grouped content. |
| `inset-separate` | inset | Generous padding (cards, panels). |
| `note-info` | note | Neutral information callout. |
| `note-success` | note | Positive-outcome callout. |
| `note-warn` | note | Caution callout. |
| `note-danger` | note | Error or destructive-consequence callout. |
| `field` | — | A text input, select, or textarea. |
| `chip` | — | An inline pill for tags, counts, and metadata. |
| `divider` | — | A hairline separator. |
| `interactive` | — | Hover affordance for clickable surfaces (cards that link somewhere). |
| `selected` | — | Marks the chosen item in a set. |
| `sr-only` | — | Visually hidden, still read by screen readers. |

## Composition cheatsheet

```html
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
```
