import { readFileSync } from "node:fs";
import { extname, relative } from "node:path";
import { LINTABLE } from "./files.js";
import { parseElements, walkElements, type ElementNode } from "./parse.js";
import type { Diagnostic } from "./types.js";
import { containerRoles, containerTags, groups, rolePrefixes, vocabularyNames } from "./vocabulary.js";

function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  const prev = new Array<number>(b.length + 1);
  const curr = new Array<number>(b.length + 1);
  for (let j = 0; j <= b.length; j++) prev[j] = j;
  for (let i = 1; i <= a.length; i++) {
    curr[0] = i;
    for (let j = 1; j <= b.length; j++) {
      curr[j] = Math.min(prev[j]! + 1, curr[j - 1]! + 1, prev[j - 1]! + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    for (let j = 0; j <= b.length; j++) prev[j] = curr[j]!;
  }
  return prev[b.length]!;
}

function nearestRole(name: string): string | null {
  let best: string | null = null;
  let bestDistance = 3;
  for (const candidate of vocabularyNames) {
    const distance = levenshtein(name, candidate);
    if (distance < bestDistance) {
      bestDistance = distance;
      best = candidate;
    }
  }
  return best;
}

const isContainer = (node: ElementNode): boolean =>
  containerTags.has(node.tag) || node.classes.some((c) => containerRoles.has(c));

/** Collect `action-primary` elements in a subtree without crossing into nested action scopes. */
function primariesWithin(node: ElementNode, acc: ElementNode[]): void {
  for (const child of node.children) {
    if (child.classes.includes("action-primary")) acc.push(child);
    if (!isContainer(child)) primariesWithin(child, acc);
  }
}

/** Run every design-lint rule against one source string. */
export function lintSource(file: string, source: string): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];
  const roots = parseElements(source);

  walkElements(roots, (node) => {
    // unknown-intent: a class that was clearly meant to be a role but is not one.
    for (const cls of node.classes) {
      if (vocabularyNames.has(cls)) continue;
      if (!rolePrefixes.some((p) => cls.startsWith(p))) continue;
      const suggestion = nearestRole(cls);
      diagnostics.push({
        file,
        line: node.line,
        rule: "unknown-intent",
        severity: "error",
        message:
          `"${cls}" is not an Intent role` +
          (suggestion ? ` — did you mean "${suggestion}"?` : ". Run `intent vocab` for the full vocabulary."),
      });
    }

    // conflicting-roles: at most one role per exclusivity group on an element.
    for (const [group, members] of Object.entries(groups)) {
      const found = node.classes.filter((c) => members.includes(c));
      if (found.length > 1) {
        diagnostics.push({
          file,
          line: node.line,
          rule: "conflicting-roles",
          severity: "error",
          message: `an element can play one ${group} role, found ${found.length}: ${found.map((c) => `"${c}"`).join(", ")}`,
        });
      }
    }

    // duplicate-primary: an action scope holds at most one primary action.
    if (isContainer(node)) {
      const primaries: ElementNode[] = [];
      primariesWithin(node, primaries);
      if (primaries.length > 1) {
        diagnostics.push({
          file,
          line: node.line,
          rule: "duplicate-primary",
          severity: "warn",
          message: `${primaries.length} "action-primary" in one <${node.tag}> scope (lines ${primaries
            .map((p) => p.line)
            .join(", ")}) — keep one primary action, demote the rest to "action-secondary"`,
        });
      }
    }

    // inline-style: values the design system cannot see or audit.
    if (node.hasStyleAttr) {
      diagnostics.push({
        file,
        line: node.line,
        rule: "inline-style",
        severity: "info",
        message: "inline style attribute — Intent cannot audit hard-coded values; prefer roles and theme tokens",
      });
    }
  });

  return diagnostics;
}

/** Lint every parseable markup file in the list. */
export function lintFiles(files: string[], cwd: string): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];
  for (const file of files) {
    if (!LINTABLE.has(extname(file).toLowerCase())) continue;
    let source: string;
    try {
      source = readFileSync(file, "utf8");
    } catch {
      continue;
    }
    diagnostics.push(...lintSource(relative(cwd, file) || file, source));
  }
  return diagnostics;
}
