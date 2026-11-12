#!/usr/bin/env node
// Copies the stylesheets in css/ into the design-system skill's catalog.
// css/ is the source. The skill keeps its own copy so it works in projects without this repo.

import { copyFileSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

export const CATALOG = ["tokens.css", "gallery.css", "todos-alt.css"].map((name) => ({
  source: `css/${name}`,
  copy: `.cursor/skills/design-system/catalog/${name}`,
}));

export function stale() {
  return CATALOG.filter(({ source, copy }) => readFileSync(join(root, source), "utf8") !== readFileSync(join(root, copy), "utf8"));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  for (const { source, copy } of CATALOG) copyFileSync(join(root, source), join(root, copy));
  console.log(`Synced ${CATALOG.length} files from css/ into the skill catalog.`);
}
