import type { Oklch } from "./types.js";

const clamp01 = (x: number): number => Math.min(1, Math.max(0, x));

/** OKLCH → linear sRGB. Out-of-gamut components are clipped, which is acceptable at the chromas Intent generates. */
export function oklchToLinearSrgb({ l, c, h }: Oklch): [number, number, number] {
  const hr = (h * Math.PI) / 180;
  const a = c * Math.cos(hr);
  const b = c * Math.sin(hr);

  const l_ = l + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = l - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = l - 0.0894841775 * a - 1.291485548 * b;

  const L = l_ ** 3;
  const M = m_ ** 3;
  const S = s_ ** 3;

  return [
    4.0767416621 * L - 3.3077115913 * M + 0.2309699292 * S,
    -1.2684380046 * L + 2.6097574011 * M - 0.3413193965 * S,
    -0.0041960863 * L - 0.7034186147 * M + 1.707614701 * S,
  ];
}

const gamma = (x: number): number => (x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(x, 1 / 2.4) - 0.055);

/** OKLCH → 8-bit sRGB triplet. */
export function oklchToRgb(color: Oklch): [number, number, number] {
  const [r, g, b] = oklchToLinearSrgb(color);
  return [
    Math.round(clamp01(gamma(clamp01(r))) * 255),
    Math.round(clamp01(gamma(clamp01(g))) * 255),
    Math.round(clamp01(gamma(clamp01(b))) * 255),
  ];
}

/** OKLCH → #rrggbb. */
export function hex(color: Oklch): string {
  return "#" + oklchToRgb(color).map((v) => v.toString(16).padStart(2, "0")).join("");
}

/** WCAG 2.x relative luminance of the sRGB rendering of the color. */
export function luminance(color: Oklch): number {
  const [r, g, b] = oklchToLinearSrgb(color).map(clamp01);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG 2.x contrast ratio between two colors: 1 (none) to 21 (black on white). */
export function contrast(a: Oklch, b: Oklch): number {
  const la = luminance(a);
  const lb = luminance(b);
  const hi = Math.max(la, lb);
  const lo = Math.min(la, lb);
  return (hi + 0.05) / (lo + 0.05);
}

/** The readable text color for a solid background: near-white or near-black in the same hue, whichever contrasts more. */
export function bestOn(bg: Oklch): Oklch {
  const light: Oklch = { l: 0.985, c: Math.min(bg.c * 0.12, 0.02), h: bg.h };
  const dark: Oklch = { l: 0.22, c: Math.min(bg.c * 0.3, 0.05), h: bg.h };
  return contrast(light, bg) >= contrast(dark, bg) ? light : dark;
}

const fmt = (n: number, digits = 4): string => Number(n.toFixed(digits)).toString();

/** CSS `oklch()` serialization. */
export function css(color: Oklch): string {
  return `oklch(${fmt(color.l * 100, 2)}% ${fmt(color.c)} ${fmt(color.h, 2)})`;
}

/** CSS `oklch()` with alpha. */
export function withAlpha(color: Oklch, alpha: number): string {
  return `oklch(${fmt(color.l * 100, 2)}% ${fmt(color.c)} ${fmt(color.h, 2)} / ${fmt(alpha)})`;
}
