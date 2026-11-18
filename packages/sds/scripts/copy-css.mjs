import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";

mkdirSync("dist", { recursive: true });
copyFileSync("../../css/tokens.css", "dist/tokens.css");
copyFileSync("src/styles/screens.css", "dist/screens.css");
writeFileSync(
  "dist/styles.css",
  ["src/styles/styles.css", "src/styles/gallery.css", "src/styles/page.css", "src/styles/ink.css", "src/styles/depth.css"]
    .map((file) => readFileSync(file, "utf8"))
    .join("\n"),
);
