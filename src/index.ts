/**
 * Intent (intent-css) — public API.
 *
 * The CLI (`intent build|check|vocab|init`) is the primary interface; this
 * module exposes the same building blocks for programmatic use and tooling.
 */

export { bestOn, contrast, css, hex, luminance, oklchToRgb, withAlpha } from "./color.js";
export { CONFIG_FILES, defaults, defineConfig, loadConfig, mergeConfig, type FullConfig } from "./config.js";
export { extractFromFiles, extractTokens } from "./extract.js";
export { collectFiles, LINTABLE } from "./files.js";
export { generateCss } from "./generate.js";
export { lintFiles, lintSource } from "./lint.js";
export { parseElements, walkElements, type ElementNode } from "./parse.js";
export { spaceScale, typeScale, type SpaceScale, type TypeScale } from "./scale.js";
export { auditTheme, colorVars, resolveTheme } from "./theme.js";
export { agentsMarkdown } from "./agents.js";
export {
  buildVocabulary,
  containerRoles,
  containerTags,
  groups,
  rolePrefixes,
  vocabulary,
  vocabularyNames,
  type Role,
} from "./vocabulary.js";
export type {
  AuditCheck,
  AuditResult,
  BrandSeed,
  ColorPair,
  Diagnostic,
  IntentConfig,
  Oklch,
  ResolvedTheme,
  Severity,
} from "./types.js";
export { VERSION } from "./cli.js";
