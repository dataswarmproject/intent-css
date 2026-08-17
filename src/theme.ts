import { bestOn, contrast, css, withAlpha } from "./color.js";
import type { FullConfig } from "./config.js";
import { spaceScale, typeScale } from "./scale.js";
import type { AuditCheck, AuditResult, ColorPair, Oklch, ResolvedTheme } from "./types.js";

const pair = (light: Oklch, dark: Oklch): ColorPair => ({ light, dark });
const ld = (light: string, dark: string): string => `light-dark(${light}, ${dark})`;

/**
 * Resolve a full theme from the config seeds. Every color is OKLCH so the whole
 * palette follows the brand hue; every pair is emitted through `light-dark()`.
 */
export function resolveTheme(config: FullConfig): ResolvedTheme {
  const { brand, semantic, neutralChroma } = config;
  const bh = brand.hue;
  const bc = brand.chroma ?? 0.16;
  const n = (l: number): Oklch => ({ l, c: neutralChroma, h: bh });

  const colors: Record<string, ColorPair> = {
    bg: pair(n(0.975), n(0.155)),
    surface: pair(n(0.99), n(0.19)),
    "surface-raised": pair(n(1), n(0.225)),
    "surface-sunken": pair(n(0.945), n(0.125)),
    "surface-overlay": pair(n(1), n(0.26)),
    line: pair(n(0.885), n(0.31)),
    "line-strong": pair(n(0.78), n(0.44)),
    text: pair(n(0.21), n(0.93)),
    "text-muted": pair(n(0.43), n(0.73)),
    "text-faint": pair(n(0.55), n(0.59)),
  };

  // Brand: doubles as link color, so it must clear body contrast on surfaces.
  const brandLight: Oklch = { l: 0.49, c: bc, h: bh };
  const brandDark: Oklch = { l: 0.74, c: Math.min(bc, 0.15), h: bh };
  colors.brand = pair(brandLight, brandDark);
  colors["brand-hover"] = pair({ ...brandLight, l: 0.44 }, { ...brandDark, l: 0.79 });
  colors["on-brand"] = pair(bestOn(brandLight), bestOn(brandDark));
  colors["brand-soft"] = pair({ l: 0.93, c: bc * 0.3, h: bh }, { l: 0.31, c: bc * 0.35, h: bh });
  colors["brand-soft-hover"] = pair({ l: 0.9, c: bc * 0.35, h: bh }, { l: 0.35, c: bc * 0.4, h: bh });
  colors["on-brand-soft"] = pair(
    { l: 0.3, c: Math.min(bc * 0.9, 0.13), h: bh },
    { l: 0.93, c: bc * 0.25, h: bh },
  );

  // Hover always moves toward MORE contrast for the text color the solid got:
  // dark label → hover brightens the solid, light label → hover darkens it.
  const hoverFor = (solid: Oklch, on: Oklch): Oklch => ({ ...solid, l: solid.l + (on.l < 0.5 ? 0.05 : -0.05) });

  for (const [name, hue] of Object.entries(semantic) as Array<[string, number]>) {
    const c = name === "danger" ? 0.16 : 0.13;
    const solid = pair(
      { l: name === "warn" ? 0.66 : 0.49, c, h: hue },
      { l: name === "warn" ? 0.78 : 0.7, c: Math.min(c, 0.14), h: hue },
    );
    const on = pair(bestOn(solid.light), bestOn(solid.dark));
    colors[name] = solid;
    colors[`${name}-hover`] = pair(hoverFor(solid.light, on.light), hoverFor(solid.dark, on.dark));
    colors[`on-${name}`] = on;
    colors[`${name}-soft`] = pair({ l: 0.945, c: 0.045, h: hue }, { l: 0.28, c: 0.055, h: hue });
    colors[`on-${name}-soft`] = pair({ l: 0.29, c: 0.09, h: hue }, { l: 0.93, c: 0.05, h: hue });
  }

  const space = spaceScale(config.space.base ?? 0.75, config.space.ratio ?? 1.5, config.density);
  const type = typeScale(config.type.base ?? 1, config.type.ratio ?? 1.25);

  const shadowInk: Oklch = { l: 0.13, c: neutralChroma * 2, h: bh };
  const vars: Record<string, string> = {
    "--in-radius": config.radius,
    "--in-radius-control": `calc(${config.radius} * 0.667)`,
    "--in-gap-compact": space.compact,
    "--in-gap-related": space.related,
    "--in-gap-separate": space.separate,
    "--in-gap-sectioned": space.sectioned,
    "--in-text-caption": type.caption,
    "--in-text-body": type.body,
    "--in-text-heading": type.heading,
    "--in-text-title": type.title,
    "--in-text-display": type.display,
    "--in-font-ui": config.fonts.ui,
    "--in-font-display": config.fonts.display,
    "--in-font-mono": config.fonts.mono,
    "--in-shadow": `0 1px 2px ${ld(withAlpha(shadowInk, 0.06), withAlpha(shadowInk, 0.5))}, 0 3px 10px ${ld(
      withAlpha(shadowInk, 0.05),
      withAlpha(shadowInk, 0.4),
    )}`,
    "--in-shadow-lg": `0 2px 4px ${ld(withAlpha(shadowInk, 0.07), withAlpha(shadowInk, 0.55))}, 0 12px 32px ${ld(
      withAlpha(shadowInk, 0.09),
      withAlpha(shadowInk, 0.5),
    )}`,
  };

  const { body, muted, decorative } = config.contrast;
  const audits: AuditCheck[] = [
    { fg: "text", bg: "bg", min: body, label: "body text / page background" },
    { fg: "text", bg: "surface", min: body, label: "body text / surface" },
    { fg: "text", bg: "surface-raised", min: body, label: "body text / raised surface" },
    { fg: "text", bg: "surface-sunken", min: body, label: "body text / sunken surface" },
    { fg: "text-muted", bg: "bg", min: muted, label: "muted text / page background" },
    { fg: "text-muted", bg: "surface", min: muted, label: "muted text / surface" },
    { fg: "text-muted", bg: "surface-raised", min: muted, label: "muted text / raised surface" },
    { fg: "text-faint", bg: "surface", min: decorative, label: "faint text / surface (decorative)" },
    { fg: "brand", bg: "surface", min: body, label: "links / surface" },
    { fg: "brand", bg: "bg", min: body, label: "links / page background" },
    { fg: "on-brand", bg: "brand", min: body, label: "primary action label" },
    { fg: "on-brand", bg: "brand-hover", min: body, label: "primary action label (hover)" },
    { fg: "on-brand-soft", bg: "brand-soft", min: body, label: "secondary action label" },
    { fg: "on-brand-soft", bg: "brand-soft-hover", min: body, label: "secondary action label (hover)" },
  ];
  for (const name of Object.keys(semantic)) {
    audits.push(
      { fg: `on-${name}`, bg: name, min: body, label: `${name} solid label` },
      { fg: `on-${name}`, bg: `${name}-hover`, min: body, label: `${name} solid label (hover)` },
      { fg: `on-${name}-soft`, bg: `${name}-soft`, min: body, label: `${name} note text` },
    );
  }

  return { colors, vars, audits, collapse: config.collapse, contrast: config.contrast };
}

/** Run every contrast audit in both schemes. */
export function auditTheme(theme: ResolvedTheme): AuditResult[] {
  const results: AuditResult[] = [];
  for (const check of theme.audits) {
    for (const scheme of ["light", "dark"] as const) {
      const fg = theme.colors[check.fg]?.[scheme];
      const bg = theme.colors[check.bg]?.[scheme];
      if (!fg || !bg) continue;
      const ratio = contrast(fg, bg);
      results.push({ ...check, scheme, ratio, pass: ratio >= check.min });
    }
  }
  return results;
}

/** Serialize all color tokens as `--in-*` custom properties using `light-dark()`. */
export function colorVars(theme: ResolvedTheme): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [name, value] of Object.entries(theme.colors)) {
    out[`--in-${name}`] = ld(css(value.light), css(value.dark));
  }
  return out;
}
