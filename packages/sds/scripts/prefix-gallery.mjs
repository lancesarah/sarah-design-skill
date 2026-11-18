import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const postcss = require("postcss");
const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "../../..");

function attach(selector) {
  if (selector.startsWith(".") || selector.startsWith("#") || selector.startsWith(":") || selector.startsWith("[")) {
    return selector;
  }
  return null;
}

function withWhere(scope, rest) {
  const same = attach(rest);
  const descendant = `${scope} :where(.sds) ${rest}`;
  return same ? `${descendant}, ${scope} :where(.sds)${same}` : descendant;
}

function prefixSelector(selector) {
  const sel = selector.trim();
  if (sel.startsWith(":root") || /^(html(?:\[[^\]]+\])?(?:\.[\w-]+)*)$/.test(sel)) return sel;
  const htmlLead = sel.match(/^(html(?:\[[^\]]+\])?(?:\.[\w-]+)*)\s+([\s\S]+)$/);
  if (htmlLead) {
    if (htmlLead[2].startsWith("body")) {
      return prefixSelector(htmlLead[2])
        .split(", ")
        .map((part) => `${htmlLead[1]} ${part}`)
        .join(", ");
    }
    return withWhere(htmlLead[1], htmlLead[2]);
  }
  const bodyLead = sel.match(/^(body(?:\.[\w-]+|\[[^\]]+\])*)\s+([\s\S]+)$/);
  if (bodyLead) return withWhere(bodyLead[1], bodyLead[2]);
  const same = attach(sel);
  const descendant = `:where(.sds) ${sel}`;
  return same ? `${descendant}, :where(.sds)${same}` : descendant;
}

function prefix(css) {
  const ast = postcss.parse(css);
  ast.walkRules((rule) => {
    if (rule.parent?.type === "atrule" && /keyframes/.test(rule.parent.name)) return;
    rule.selectors = rule.selectors.map(prefixSelector);
  });
  return ast.toString();
}

const gallery = prefix(readFileSync(resolve(root, "css/gallery.css"), "utf8"));
const table = prefix(readFileSync(resolve(root, "css/todos-alt.css"), "utf8"));
const banner = "/* Prefixed from css/gallery.css and css/todos-alt.css. :where(.sds) keeps these rules on gallery components. */\n";
writeFileSync(resolve(here, "../src/styles/gallery.css"), `${banner}${gallery}\n${table}\n`);

const page = prefix(readFileSync(resolve(root, "css/page.css"), "utf8"));
const pageBanner = "/* Prefixed from css/page.css. The page stack inside `.notes-page`. Loads after the gallery specimen it replaces. */\n";
writeFileSync(resolve(here, "../src/styles/page.css"), `${pageBanner}${page}\n`);

// Icon ink and depth: rules for every component, kept out of gallery.css so the catalog app could own them.
// The catalog loads them unlayered over the layered package, so they beat component rules there. Ink
// carries !important. Depth is scoped by `.sds` itself rather than :where(.sds), so it keeps beating
// `.sds.btn-secondary` in an app that loads everything in one layer.
const ink = prefix(readFileSync(resolve(root, "css/ink.css"), "utf8"));
writeFileSync(resolve(here, "../src/styles/ink.css"), `/* Prefixed from css/ink.css. */\n${ink}\n`);
const depth = prefix(readFileSync(resolve(root, "css/depth.css"), "utf8")).replaceAll(":where(.sds)", ".sds");
writeFileSync(resolve(here, "../src/styles/depth.css"), `/* Prefixed from css/depth.css, scoped by .sds so it outranks component rules. */\n${depth}\n`);

/** Inline relative `@import "./x.css";` in source order. Skipped files drop out with their imports. */
function inline(file, skip) {
  return readFileSync(file, "utf8").replace(/@import\s+"([^"]+\.css)";[^\S\n]*\n?/g, (_, path) => {
    const target = resolve(dirname(file), path);
    return skip.has(target) ? "" : `${inline(target, skip)}\n`;
  });
}

// Screen layout, everything the catalog's (screens) route imports. The card frame
// stays out (an app shell draws its own) and the page stack already ships in styles.css.
const screensEntry = resolve(root, "apps/catalog/app/(screens)/screens.css");
const screensSkip = new Set([resolve(root, "css/page-frame.css"), resolve(root, "css/page.css")]);
const screens = prefix(inline(screensEntry, screensSkip));
const screensBanner = "/* Prefixed from apps/catalog/app/(screens)/screens.css and the css/ files it imports, without page-frame.css. */\n";
writeFileSync(resolve(here, "../src/styles/screens.css"), `${screensBanner}${screens}\n`);

function readSymbols(file) {
  const icons = {};
  const sprite = readFileSync(file, "utf8");
  for (const match of sprite.matchAll(/<symbol id="(i-[^"]+)" viewBox="([^"]+)">([\s\S]*?)<\/symbol>/g)) {
    icons[match[1].slice(2)] = { viewBox: match[2], body: match[3] };
  }
  return icons;
}

const icons = readSymbols(resolve(root, "apps/catalog/public/icons.svg"));
writeFileSync(
  resolve(here, "../src/icons.tsx"),
  `"use client";

export const icons = ${JSON.stringify(icons, null, 2)} as const;

export type IconName = keyof typeof icons;

export function Icon({ name, size = 14, className }: { name: IconName; size?: number; className?: string }) {
  const icon = icons[name];
  return (
    <svg
      className={className ? \`i \${className}\` : "i"}
      width={size}
      height={size}
      viewBox={icon.viewBox}
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: icon.body }}
    />
  );
}
`,
);
console.log(`icons ${Object.keys(icons).length}`);
