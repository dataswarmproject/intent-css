import { readFileSync } from "node:fs";

const TOKEN = /[A-Za-z][A-Za-z0-9-]*/g;
const MAX_FILE_BYTES = 2 * 1024 * 1024;

/**
 * Collect every known role name appearing in a source text. Tokenization is
 * deliberately dumb (Tailwind-style): it works identically in HTML, JSX, Vue,
 * Svelte, template literals, and Markdown. False positives only cost a few
 * bytes of CSS; false negatives are impossible for statically written classes.
 */
export function extractTokens(text: string, known: ReadonlySet<string>): Set<string> {
  const used = new Set<string>();
  for (const match of text.matchAll(TOKEN)) {
    if (known.has(match[0])) used.add(match[0]);
  }
  return used;
}

/** Union of used role names across files. */
export function extractFromFiles(files: string[], known: ReadonlySet<string>): Set<string> {
  const used = new Set<string>();
  for (const file of files) {
    let text: string;
    try {
      text = readFileSync(file, "utf8");
    } catch {
      continue;
    }
    if (text.length > MAX_FILE_BYTES) continue;
    for (const token of extractTokens(text, known)) used.add(token);
    if (used.size === known.size) break;
  }
  return used;
}
