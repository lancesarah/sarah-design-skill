import { defineConfig } from "tsup";

// A second build so `page` imports the main entry instead of bundling a copy of it.
// The main build's output is unchanged, and its clean step runs first.
export default defineConfig({
  entry: { page: "src/page.tsx" },
  format: ["esm"],
  dts: true,
  sourcemap: true,
  clean: false,
  external: ["react", "react-dom", "@lance-live/sds"],
});
