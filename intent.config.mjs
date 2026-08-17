// Intent build for the project site (docs/ is the GitHub Pages root).
// The site's entire art direction lives in these seeds — the markup only
// declares roles. This file doubles as a reference for theming.
export default {
  content: ["docs"],
  output: "docs/intent.css",

  brand: { hue: 264, chroma: 0.17 },

  // Gallery typography: tiny precise captions, enormous statements.
  type: { base: 1, ratio: 1.32 },
  // Golden-ratio spacing: intimate groups, monumental sections.
  space: { base: 0.75, ratio: 1.618 },
  radius: "0.625rem",
  collapse: "34rem",

  fonts: {
    display: `"Schibsted Grotesk", system-ui, sans-serif`,
    ui: `"Inter", system-ui, -apple-system, sans-serif`,
    mono: `"JetBrains Mono", ui-monospace, monospace`,
  },
};
