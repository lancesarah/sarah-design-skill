import { defineConfig } from "tsup";

// Additional entries import the main entry instead of bundling a copy of it.
// The main build's output is unchanged, and its clean step runs first.
export default defineConfig({
  entry: { page: "src/page.tsx", "add-option": "src/add-option.tsx", "file-drop-zone": "src/file-drop-zone.tsx", "language-select": "src/language-select.tsx", "settings-switch": "src/settings-switch.tsx", "text-entry": "src/text-entry.tsx", "settings-row-interaction": "src/settings-row-interaction.ts" },
  format: ["esm"],
  dts: true,
  sourcemap: true,
  clean: false,
  splitting: false,
  external: ["react", "react-dom", "@lance-live/sds"],
});
