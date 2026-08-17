#!/usr/bin/env node
try {
  const { run } = await import("../dist/cli.js");
  await run(process.argv.slice(2));
} catch (error) {
  if (error?.code === "ERR_MODULE_NOT_FOUND" && String(error?.message ?? "").includes("dist")) {
    console.error("intent: build output missing — run `npm run build` in the intent-css package first.");
  } else {
    console.error(error?.stack ?? String(error));
  }
  process.exit(1);
}
