import { readdirSync, statSync } from "node:fs";
import { extname, resolve } from "node:path";

const IGNORED_DIRS = new Set([
  "node_modules",
  "dist",
  "build",
  "out",
  "coverage",
  "vendor",
  ".next",
  ".nuxt",
  ".output",
  ".svelte-kit",
  ".astro",
]);

const SCANNABLE = new Set([
  ".html",
  ".htm",
  ".jsx",
  ".tsx",
  ".js",
  ".ts",
  ".mjs",
  ".vue",
  ".svelte",
  ".astro",
  ".md",
  ".mdx",
  ".php",
  ".erb",
  ".liquid",
  ".twig",
]);

/** Files the linter can parse as markup. */
export const LINTABLE = new Set([".html", ".htm", ".jsx", ".tsx", ".vue", ".svelte", ".astro"]);

/**
 * Resolve the `content` roots (files or directories) to a flat list of
 * scannable files. Dot-directories and build output are skipped.
 */
export function collectFiles(roots: string[], cwd: string, exclude: string[] = []): string[] {
  const excluded = new Set(exclude.map((p) => resolve(cwd, p)));
  const files: string[] = [];
  const seen = new Set<string>();

  const visit = (path: string): void => {
    if (seen.has(path) || excluded.has(path)) return;
    seen.add(path);
    let stat;
    try {
      stat = statSync(path);
    } catch {
      return;
    }
    if (stat.isFile()) {
      if (SCANNABLE.has(extname(path).toLowerCase())) files.push(path);
      return;
    }
    if (!stat.isDirectory()) return;
    let entries: string[];
    try {
      entries = readdirSync(path);
    } catch {
      return;
    }
    for (const entry of entries) {
      if (entry.startsWith(".") || IGNORED_DIRS.has(entry)) continue;
      visit(resolve(path, entry));
    }
  };

  for (const root of roots) visit(resolve(cwd, root));
  return files.sort();
}
