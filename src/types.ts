/** A color in the OKLCH space. `l` is 0–1, `c` is chroma (≈0–0.4), `h` is hue in degrees. */
export interface Oklch {
  l: number;
  c: number;
  h: number;
}

/** One OKLCH hue (plus optional chroma) seeds an entire palette. */
export interface BrandSeed {
  hue: number;
  chroma?: number;
}

/** User-facing configuration (intent.config.mjs). Every field is optional. */
export interface IntentConfig {
  /** Files or directories to scan for intent classes. Default: ["."] */
  content?: string[];
  /** Path of the generated stylesheet. Default: "intent.css" */
  output?: string;
  /** Emit only the roles found in `content`, or the full vocabulary. Default: "used" */
  emit?: "used" | "all";
  /** Brand seed — the whole palette derives from this hue. */
  brand?: BrandSeed;
  /** Hue overrides for the semantic colors. */
  semantic?: { info?: number; success?: number; warn?: number; danger?: number };
  /** Chroma of the neutral ramp (0 = pure gray). Default: 0.012 */
  neutralChroma?: number;
  /** Spacing scale: base step in rem and geometric ratio. */
  space?: { base?: number; ratio?: number };
  /** Type scale: body size in rem and modular ratio. */
  type?: { base?: number; ratio?: number };
  /** Corner radius for surfaces; controls derive from it. Default: "0.75rem" */
  radius?: string;
  /** Global spacing multiplier (0.8 = compact UI, 1.2 = airy UI). Default: 1 */
  density?: number;
  fonts?: { ui?: string; display?: string; mono?: string };
  /** Container width at which `collapse` rows become stacks. Default: "30rem" */
  collapse?: string;
  /** Minimum WCAG contrast ratios enforced by the theme audit. */
  contrast?: { body?: number; muted?: number; decorative?: number };
}

/** A color token resolved for both schemes. */
export interface ColorPair {
  light: Oklch;
  dark: Oklch;
}

/** A contrast requirement between two color tokens. */
export interface AuditCheck {
  fg: string;
  bg: string;
  min: number;
  label: string;
}

/** The outcome of one audit check in one scheme. */
export interface AuditResult extends AuditCheck {
  scheme: "light" | "dark";
  ratio: number;
  pass: boolean;
}

/** Fully resolved theme: every color token, every CSS variable, every audit. */
export interface ResolvedTheme {
  colors: Record<string, ColorPair>;
  vars: Record<string, string>;
  audits: AuditCheck[];
  collapse: string;
  contrast: { body: number; muted: number; decorative: number };
}

export type Severity = "error" | "warn" | "info";

/** A design-linter finding. */
export interface Diagnostic {
  file: string;
  line: number;
  rule: string;
  severity: Severity;
  message: string;
}
