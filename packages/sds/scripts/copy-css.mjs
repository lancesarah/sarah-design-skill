import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";

mkdirSync("dist", { recursive: true });
copyFileSync("../../css/tokens.css", "dist/tokens.css");
copyFileSync("../../css/file-drop-zone.css", "dist/file-drop-zone.css");
copyFileSync("../../css/add-option.css", "dist/add-option.css");
copyFileSync("src/styles/screens.css", "dist/screens.css");
writeFileSync(
  "dist/styles.css",
  ["src/styles/styles.css", "src/styles/gallery.css", "src/styles/page.css", "src/styles/ink.css", "src/styles/depth.css"]
    .map((file) => readFileSync(file, "utf8"))
    .join("\n"),
);

copyFileSync("../../css/language-select.css", "dist/language-select.css");
