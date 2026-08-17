/**
 * A tolerant element-tree scanner for HTML and JSX-like markup.
 *
 * This is not a spec HTML parser — it only needs to recover nesting and class
 * attributes well enough for design linting, across .html, .jsx/.tsx, .vue,
 * .svelte, and .astro files, without any dependencies.
 */

export interface ElementNode {
  tag: string;
  classes: string[];
  line: number;
  hasStyleAttr: boolean;
  children: ElementNode[];
}

const VOID_TAGS = new Set([
  "area", "base", "br", "col", "embed", "hr", "img", "input",
  "link", "meta", "param", "source", "track", "wbr",
]);

const TAG_RE = /<(\/)?([A-Za-z][A-Za-z0-9.:_-]*)((?:"[^"]*"|'[^']*'|\{[^{}]*\}|[^>"'{}])*?)(\/)?>/g;

const CLASS_RE =
  /(?:^|\s)(?:class|className)\s*=\s*(?:"([^"]*)"|'([^']*)'|\{\s*"([^"]*)"\s*\}|\{\s*'([^']*)'\s*\}|\{\s*`([^`]*)`\s*\})/;

/** Blank a span of text but keep newlines so line numbers stay correct. */
const blank = (text: string): string => text.replace(/[^\n]/g, " ");

function stripNonMarkup(source: string): string {
  return source
    .replace(/<!--[\s\S]*?-->/g, blank)
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, (m) => {
      const open = m.indexOf(">") + 1;
      const close = m.lastIndexOf("</");
      return m.slice(0, open) + blank(m.slice(open, close)) + m.slice(close);
    })
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, (m) => {
      const open = m.indexOf(">") + 1;
      const close = m.lastIndexOf("</");
      return m.slice(0, open) + blank(m.slice(open, close)) + m.slice(close);
    })
    .replace(/<>/g, "<x-fragment>")
    .replace(/<\/>/g, "</x-fragment>");
}

function classesFrom(attrs: string): string[] {
  const match = CLASS_RE.exec(attrs);
  if (!match) return [];
  const raw = match[1] ?? match[2] ?? match[3] ?? match[4] ?? match[5] ?? "";
  return raw
    .replace(/\$\{[^}]*\}/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

/** Parse a source string into element trees (roots). Never throws on malformed input. */
export function parseElements(source: string): ElementNode[] {
  const text = stripNonMarkup(source);

  const lineStarts: number[] = [0];
  for (let i = 0; i < text.length; i++) if (text[i] === "\n") lineStarts.push(i + 1);
  const lineOf = (index: number): number => {
    let lo = 0;
    let hi = lineStarts.length - 1;
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if (lineStarts[mid]! <= index) lo = mid;
      else hi = mid - 1;
    }
    return lo + 1;
  };

  const roots: ElementNode[] = [];
  const stack: ElementNode[] = [];
  const top = (): ElementNode | undefined => stack[stack.length - 1];

  for (const match of text.matchAll(TAG_RE)) {
    const [, closing, rawTag, attrs = "", selfClosed] = match;
    const tag = rawTag!.toLowerCase();
    if (tag === "!doctype") continue;

    if (closing) {
      for (let i = stack.length - 1; i >= 0; i--) {
        if (stack[i]!.tag === tag) {
          stack.length = i;
          break;
        }
      }
      continue;
    }

    const node: ElementNode = {
      tag,
      classes: classesFrom(attrs),
      line: lineOf(match.index!),
      hasStyleAttr: /(^|\s)style\s*=/.test(attrs),
      children: [],
    };
    (top()?.children ?? roots).push(node);
    if (!VOID_TAGS.has(tag) && !selfClosed) stack.push(node);
  }

  return roots;
}

/** Depth-first walk over every element. */
export function walkElements(roots: ElementNode[], visit: (node: ElementNode) => void): void {
  const queue = [...roots];
  while (queue.length > 0) {
    const node = queue.shift()!;
    visit(node);
    queue.unshift(...node.children);
  }
}
