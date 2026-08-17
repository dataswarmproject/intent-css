import { existsSync, mkdirSync, watch, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, relative, resolve } from "node:path";
import { parseArgs } from "node:util";
import { agentsMarkdown } from "./agents.js";
import { loadConfig } from "./config.js";
import { extractFromFiles } from "./extract.js";
import { collectFiles } from "./files.js";
import { generateCss } from "./generate.js";
import { lintFiles } from "./lint.js";
import { auditTheme, resolveTheme } from "./theme.js";
import type { AuditResult, Diagnostic } from "./types.js";
import { groups, vocabulary, vocabularyNames } from "./vocabulary.js";

const pkg = createRequire(import.meta.url)("../package.json") as { version: string };
export const VERSION: string = pkg.version;

const useColor = process.stdout.isTTY === true && process.env.NO_COLOR === undefined;
const paint =
  (code: string) =>
  (text: string): string =>
    useColor ? `\u001b[${code}m${text}\u001b[0m` : text;
const bold = paint("1");
const dim = paint("2");
const red = paint("31");
const green = paint("32");
const yellow = paint("33");
const cyan = paint("36");

interface Flags {
  config?: string;
  out?: string;
  all?: boolean;
  json?: boolean;
  watch?: boolean;
  force?: boolean;
  help?: boolean;
  version?: boolean;
}

export async function run(argv: string[]): Promise<void> {
  const { values, positionals } = parseArgs({
    args: argv,
    options: {
      config: { type: "string", short: "c" },
      out: { type: "string", short: "o" },
      all: { type: "boolean" },
      json: { type: "boolean" },
      watch: { type: "boolean", short: "w" },
      force: { type: "boolean" },
      help: { type: "boolean", short: "h" },
      version: { type: "boolean", short: "v" },
    },
    allowPositionals: true,
  });
  const flags = values as Flags;
  const command = positionals[0] ?? (flags.version ? "version" : "help");

  switch (command) {
    case "build":
      await build(flags);
      break;
    case "check":
      await check(flags);
      break;
    case "vocab":
      vocab(flags);
      break;
    case "init":
      init(flags);
      break;
    case "version":
      console.log(VERSION);
      break;
    case "help":
      help();
      break;
    default:
      console.error(`intent: unknown command "${command}"\n`);
      help();
      process.exitCode = 1;
  }
}

async function buildOnce(flags: Flags): Promise<void> {
  const cwd = process.cwd();
  const started = performance.now();
  const { config, path } = await loadConfig(cwd, flags.config);
  const theme = resolveTheme(config);
  const outPath = resolve(cwd, flags.out ?? config.output);
  const files = collectFiles(config.content, cwd, [outPath]);
  const emitAll = flags.all === true || config.emit === "all";
  const used = emitAll ? ("all" as const) : extractFromFiles(files, vocabularyNames);
  const cssText = generateCss(theme, used, VERSION);
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, cssText);
  const ms = Math.round(performance.now() - started);
  const roleCount = used === "all" ? vocabulary.length : used.size;
  console.log(
    `${green("✓")} ${bold("intent build")} ${dim(path ? relative(cwd, path) : "(default config)")}\n` +
      `  scanned ${files.length} files · ${roleCount}/${vocabulary.length} roles in use · ` +
      `${relative(cwd, outPath)} (${(cssText.length / 1024).toFixed(1)} kB, ${ms} ms)`,
  );
}

async function build(flags: Flags): Promise<void> {
  await buildOnce(flags);
  if (!flags.watch) return;

  const cwd = process.cwd();
  const { config } = await loadConfig(cwd, flags.config);
  console.log(dim("  watching for changes — press ctrl+c to stop"));
  let timer: ReturnType<typeof setTimeout> | null = null;
  const trigger = (_event: string, filename: string | null): void => {
    if (filename && filename.endsWith(".css")) return; // ignore our own output
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      buildOnce(flags).catch((error: unknown) => console.error(red(String(error))));
    }, 150);
  };
  for (const root of config.content) {
    try {
      watch(resolve(cwd, root), { recursive: true }, trigger);
    } catch {
      // recursive watch may be unavailable on exotic filesystems; skip silently
    }
  }
  await new Promise(() => {}); // keep the process alive
}

async function check(flags: Flags): Promise<void> {
  const cwd = process.cwd();
  const { config } = await loadConfig(cwd, flags.config);
  const theme = resolveTheme(config);
  const outPath = resolve(cwd, config.output);
  const files = collectFiles(config.content, cwd, [outPath]);
  const diagnostics = lintFiles(files, cwd);
  const audit = auditTheme(theme);

  const errors = diagnostics.filter((d) => d.severity === "error").length;
  const warnings = diagnostics.filter((d) => d.severity === "warn").length;
  const auditFailures = audit.filter((a) => !a.pass).length;
  const ok = errors === 0 && auditFailures === 0;

  if (flags.json) {
    console.log(
      JSON.stringify(
        {
          ok,
          errors,
          warnings,
          auditFailures,
          diagnostics,
          audit: audit.map((a) => ({ ...a, ratio: Number(a.ratio.toFixed(2)) })),
        },
        null,
        2,
      ),
    );
    process.exitCode = ok ? 0 : 1;
    return;
  }

  printDiagnostics(diagnostics);
  printAudit(audit, auditFailures);
  const parts = [
    errors > 0 ? red(`${errors} error${errors === 1 ? "" : "s"}`) : green("0 errors"),
    warnings > 0 ? yellow(`${warnings} warning${warnings === 1 ? "" : "s"}`) : dim("0 warnings"),
    auditFailures > 0 ? red(`${auditFailures} contrast failure${auditFailures === 1 ? "" : "s"}`) : green("contrast ok"),
  ];
  console.log(`\n${bold("intent check")} — ${parts.join(", ")} ${dim(`(${files.length} files)`)}`);
  process.exitCode = ok ? 0 : 1;
}

function printDiagnostics(diagnostics: Diagnostic[]): void {
  const byFile = new Map<string, Diagnostic[]>();
  for (const d of diagnostics) {
    const list = byFile.get(d.file) ?? [];
    list.push(d);
    byFile.set(d.file, list);
  }
  for (const [file, list] of byFile) {
    console.log(`\n${bold(file)}`);
    for (const d of list.sort((a, b) => a.line - b.line)) {
      const badge = d.severity === "error" ? red("error") : d.severity === "warn" ? yellow("warn ") : dim("info ");
      console.log(`  ${dim(String(d.line).padStart(4))}  ${badge}  ${cyan(d.rule)}  ${d.message}`);
    }
  }
}

function printAudit(audit: AuditResult[], failures: number): void {
  console.log(`\n${bold("Theme contrast audit")} ${dim("(WCAG 2.x, light + dark)")}`);
  if (failures === 0) {
    console.log(`  ${green("✓")} all ${audit.length} checks pass`);
    return;
  }
  for (const a of audit.filter((x) => !x.pass)) {
    console.log(
      `  ${red("✗")} ${a.label} ${dim(`[${a.scheme}]`)} — ${a.fg} on ${a.bg}: ` +
        `${red(a.ratio.toFixed(2) + ":1")} ${dim(`(needs ${a.min}:1)`)}`,
    );
  }
  console.log(`  ${dim(`${audit.length - failures}/${audit.length} checks pass`)}`);
}

function vocab(flags: Flags): void {
  if (flags.json) {
    console.log(
      JSON.stringify(
        {
          name: "intent-css",
          version: VERSION,
          roles: vocabulary.map(({ name, group, summary }) => ({ name, group: group ?? null, summary })),
          exclusiveGroups: groups,
        },
        null,
        2,
      ),
    );
    return;
  }
  console.log(`${bold("Intent vocabulary")} ${dim(`v${VERSION} — ${vocabulary.length} roles`)}\n`);
  const width = Math.max(...vocabulary.map((r) => r.name.length)) + 2;
  for (const role of vocabulary) {
    console.log(`  ${cyan(role.name.padEnd(width))}${dim((role.group ?? "").padEnd(10))}${role.summary}`);
  }
  console.log(`\n${dim("Roles sharing a group are mutually exclusive. `intent vocab --json` for machine-readable output.")}`);
}

const CONFIG_TEMPLATE = `// Intent configuration — https://github.com/dataswarmproject/intent-css
// One OKLCH hue seeds the entire palette; relationships derive all spacing.
export default {
  content: ["."],                      // files/folders scanned for roles
  output: "intent.css",                // generated stylesheet
  brand: { hue: 264, chroma: 0.16 },   // try 152 (green), 25 (red), 85 (amber)
  // radius: "0.75rem",
  // density: 1,                       // 0.85 = compact UI, 1.15 = airy UI
  // space: { base: 0.75, ratio: 1.5 },
  // type: { base: 1, ratio: 1.25 },
};
`;

function init(flags: Flags): void {
  const cwd = process.cwd();
  const writes: Array<[string, string]> = [
    ["intent.config.mjs", CONFIG_TEMPLATE],
    ["AGENTS.md", agentsMarkdown(VERSION)],
  ];
  for (const [name, content] of writes) {
    const path = resolve(cwd, name);
    if (existsSync(path) && flags.force !== true) {
      console.log(`${yellow("•")} ${name} already exists — skipped (use --force to overwrite)`);
      continue;
    }
    writeFileSync(path, content);
    console.log(`${green("✓")} wrote ${name}`);
  }
  console.log(
    `\nNext steps:\n` +
      `  1. ${cyan("npx intent build")}          generate intent.css\n` +
      `  2. add ${cyan('<link rel="stylesheet" href="intent.css">')} to your page\n` +
      `  3. write markup with roles — ${cyan("npx intent vocab")} lists them\n` +
      `  4. ${cyan("npx intent check")}          design lint + contrast audit`,
  );
}

function help(): void {
  console.log(`${bold("intent")} ${dim(`v${VERSION}`)} — the intent-based styling system

${bold("Usage")}
  intent <command> [flags]

${bold("Commands")}
  init             scaffold intent.config.mjs + AGENTS.md in the current folder
  build            scan content, generate the stylesheet
  check            design lint + WCAG contrast audit (exit 1 on errors)
  vocab            print the role vocabulary
  version          print the version

${bold("Flags")}
  -c, --config <file>   explicit config path
  -o, --out <file>      override the output path (build)
  -w, --watch           rebuild on file changes (build)
      --all             emit the full vocabulary, skip scanning (build)
      --json            machine-readable output (check, vocab)
      --force           overwrite existing files (init)
  -h, --help            this help
  -v, --version         print the version

${dim("Docs: https://github.com/dataswarmproject/intent-css")}`);
}
