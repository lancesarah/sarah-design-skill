import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";

mkdirSync("dist", { recursive: true });
copyFileSync("src/styles/tokens.css", "dist/tokens.css");
writeFileSync(
  "dist/styles.css",
  `${readFileSync("src/styles/styles.css", "utf8")}\n${readFileSync("src/styles/gallery.css", "utf8")}`,
);
