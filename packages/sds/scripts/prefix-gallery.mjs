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
