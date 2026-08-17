import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import type { IntentConfig } from "./types.js";

export const CONFIG_FILES = ["intent.config.mjs", "intent.config.js", "intent.config.json"] as const;

export const defaults = {
  content: ["."],
  output: "intent.css",
  emit: "used" as "used" | "all",
  brand: { hue: 264, chroma: 0.16 },
  semantic: { info: 235, success: 152, warn: 75, danger: 25 },
  neutralChroma: 0.012,
  space: { base: 0.75, ratio: 1.5 },
  type: { base: 1, ratio: 1.25 },
  radius: "0.75rem",
  density: 1,
  fonts: {
    ui: `system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`,
    display: "inherit",
    mono: `ui-monospace, "Cascadia Code", "Source Code Pro", Menlo, monospace`,
  },
  collapse: "30rem",
  contrast: { body: 4.5, muted: 4.5, decorative: 3 },
};

export type FullConfig = typeof defaults;

const stripUndefined = <T extends object>(obj: T): Partial<T> =>
  Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined)) as Partial<T>;

/** Merge a user config over the defaults. */
export function mergeConfig(user: IntentConfig = {}): FullConfig {
  const u = stripUndefined(user);
  return {
    ...defaults,
    ...u,
    brand: { ...defaults.brand, ...stripUndefined(u.brand ?? {}) },
    semantic: { ...defaults.semantic, ...stripUndefined(u.semantic ?? {}) },
    space: { ...defaults.space, ...stripUndefined(u.space ?? {}) },
    type: { ...defaults.type, ...stripUndefined(u.type ?? {}) },
    fonts: { ...defaults.fonts, ...stripUndefined(u.fonts ?? {}) },
    contrast: { ...defaults.contrast, ...stripUndefined(u.contrast ?? {}) },
  } as FullConfig;
}

/** Locate and load intent.config.{mjs,js,json}; fall back to defaults. */
export async function loadConfig(
  cwd: string,
  explicit?: string,
): Promise<{ config: FullConfig; path: string | null }> {
  let file: string | null = null;
  if (explicit) {
    file = resolve(cwd, explicit);
    if (!existsSync(file)) throw new Error(`Config file not found: ${file}`);
  } else {
    for (const candidate of CONFIG_FILES) {
      const p = resolve(cwd, candidate);
      if (existsSync(p)) {
        file = p;
        break;
      }
    }
  }
  if (!file) return { config: mergeConfig(), path: null };

  let user: IntentConfig;
  if (file.endsWith(".json")) {
    user = JSON.parse(readFileSync(file, "utf8")) as IntentConfig;
  } else {
    // Cache-bust so `--watch` picks up config edits.
    const mod = (await import(`${pathToFileURL(file).href}?t=${Date.now()}`)) as { default?: IntentConfig };
    user = mod.default ?? {};
  }
  return { config: mergeConfig(user), path: file };
}

/** Identity helper that gives config files type checking in editors. */
export function defineConfig(config: IntentConfig): IntentConfig {
  return config;
}
