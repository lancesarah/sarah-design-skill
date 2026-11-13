#!/usr/bin/env node
// Checks the code against the design-system skill. Exits 1 when a rule is broken.
// A line can opt out with a `design-check: allow` comment and a reason.

import { readFileSync, readdirSync, statSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "./build-usage.mjs";
import { stale } from "./sync-catalog.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const ts = createRequire(import.meta.url)("typescript");

const DIRS = ["css", "apps/catalog/app", "packages/sds/src"];
const SKIP_DIRS = new Set(["node_modules", "dist", ".next"]);
const TOKEN_FILES = /(^|\/)tokens\.css$/;
const DEV_ONLY = new Set(["apps/catalog/app/spacing-tool.css", "apps/catalog/app/spacing-tool.tsx", "apps/catalog/app/font-switch.tsx"]);
const GENERATED = new Set(["packages/sds/src/styles/gallery.css"]);
const GALLERY_SPECIMENS = new Set([
  "apps/catalog/app/gallery.tsx",
  "apps/catalog/app/specimens.tsx",
  "packages/sds/src/components/Foundations.tsx",
]);
const HEADERS = new Set(["PageLayout", "PageHeader"]);
const ALLOW = /design-check:\s*allow/;

const problems = [];
const report = (file, line, rule, message) => problems.push({ file, line, rule, message });

function walk(dir, files = []) {
  for (const name of readdirSync(dir)) {
    if (SKIP_DIRS.has(name)) continue;
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path, files);
    else if (/\.(css|tsx)$/.test(name) && !/\.test\.tsx$/.test(name)) files.push(path);
  }
  return files;
}

function checkUsage() {
  const out = join(root, "apps/catalog/app/docs-usage.ts");
  if (readFileSync(out, "utf8") !== build()) {
    report("apps/catalog/app/docs-usage.ts", 1, "Usage tab", "Out of date with the design-system skill. Run `npm run usage`.");
  }
}

const COLOR = /#[0-9a-fA-F]{3,8}\b|\b(rgba?|hsla?)\(/;

function checkCss(file, text) {
  if (TOKEN_FILES.test(file) || DEV_ONLY.has(file) || GENERATED.has(file)) return;
  const lines = text.replace(/\/\*[\s\S]*?\*\//g, (comment) => comment.replace(/[^\n]/g, " ")).split("\n");
  const raw = text.split("\n");
  lines.forEach((line, index) => {
    const colon = line.indexOf(":");
    if (colon < 0 || /[{,]\s*$/.test(line) || ALLOW.test(raw[index])) return;
    if (/^\s*(--|(-webkit-)?mask(-image)?\s*:)/.test(line)) return;
    if (COLOR.test(line.slice(colon + 1))) {
      report(file, index + 1, "Color", "Raw color. Use a role or token from tokens.css (foundations.md, Roles).");
    }
  });
}

function tagName(node) {
  return node.tagName.getText();
}

function attr(element, name) {
  return element.attributes.properties.find((prop) => ts.isJsxAttribute(prop) && prop.name.getText() === name);
}

function attrValue(element, name) {
  const found = attr(element, name);
  if (!found) return undefined;
  if (!found.initializer) return true;
  if (ts.isStringLiteral(found.initializer)) return found.initializer.text;
  return found.initializer.getText();
}

function opening(node) {
  return ts.isJsxElement(node) ? node.openingElement : ts.isJsxSelfClosingElement(node) ? node : undefined;
}

function buttonsIn(node, found = []) {
  const open = opening(node);
  if (open && tagName(open) === "Button") found.push(node);
  ts.forEachChild(node, (child) => {
    buttonsIn(child, found);
  });
  return found;
}

function hasIcon(button) {
  const open = opening(button);
  if (attrValue(open, "icon")) return true;
  let icon = false;
  const visit = (node) => {
    const element = opening(node);
    if (element && element !== open && /^(Icon|svg)$/.test(tagName(element))) icon = true;
    if (element && element !== open && /\btheme-switch-track\b/.test(String(attrValue(element, "className") ?? ""))) icon = true;
    ts.forEachChild(node, visit);
  };
  visit(button);
  return icon;
}

function checkTsx(file, text) {
  if (DEV_ONLY.has(file)) return;
  const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const lines = text.split("\n");
  const lineOf = (node) => source.getLineAndCharacterOfPosition(node.getStart()).line + 1;
  const allowed = (node) => ALLOW.test(lines[lineOf(node) - 1] ?? "") || ALLOW.test(lines[lineOf(node) - 2] ?? "");
  const confirms = /ConfirmDialog|<Confirm\b|confirm-dialog/.test(text);

  const visit = (node) => {
    const open = opening(node);
    if (open && HEADERS.has(tagName(open))) {
      const actions = attr(open, "actions");
      if (actions?.initializer) {
        const buttons = buttonsIn(actions.initializer);
        for (const button of buttons) {
          if (!hasIcon(button) && !allowed(button)) {
            report(file, lineOf(button), "Header", "A button in the header always has an icon beside its label (components.md, Header).");
          }
        }
        const primaries = buttons.filter((button) => {
          const variant = attrValue(opening(button), "variant");
          return variant === undefined || variant === "primary";
        });
        if (primaries.length > 1 && !allowed(primaries[1])) {
          report(file, lineOf(primaries[1]), "Primary button", "One primary per surface (components.md, Primary button).");
        }
      }
    }
    if (open && tagName(open) === "Button" && !GALLERY_SPECIMENS.has(file)) {
      const variant = attrValue(open, "variant");
      const onClick = attrValue(open, "onClick");
      const passesUp = typeof onClick === "string" && /^\{?\s*(props\.)?on[A-Z]\w*\s*\}?$/.test(onClick);
      if ((variant === "danger" || variant === "danger-light") && !confirms && !passesUp && !allowed(node)) {
        report(file, lineOf(node), "Delete confirmation", "A danger press opens Delete confirmation first (components.md, Danger button).");
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(source);

  if (GALLERY_SPECIMENS.has(file)) return;
  lines.forEach((line, index) => {
    if (ALLOW.test(line)) return;
    if (/["'`]#[0-9a-fA-F]{3,8}["'`]|:\s*["'`](rgba?|hsla?)\(/.test(line)) {
      report(file, index + 1, "Color", "Raw color in code. Use a token through CSS (foundations.md, Roles).");
    }
  });
}

checkUsage();
for (const { source, copy } of stale()) {
  report(copy, 1, "Catalog copy", `Out of date with ${source}. Run \`npm run sync\`.`);
}
for (const dir of DIRS) {
  for (const path of walk(join(root, dir))) {
    const file = relative(root, path);
    const text = readFileSync(path, "utf8");
    if (file.endsWith(".css")) checkCss(file, text);
    else checkTsx(file, text);
  }
}

if (!problems.length) {
  console.log("Design check passed.");
  process.exit(0);
}
const rules = new Map();
for (const problem of problems) rules.set(problem.rule, (rules.get(problem.rule) ?? 0) + 1);
for (const problem of problems) console.log(`${problem.file}:${problem.line}  ${problem.rule}  ${problem.message}`);
console.log(`\n${problems.length} problem${problems.length === 1 ? "" : "s"}: ${[...rules].map(([rule, count]) => `${rule} ${count}`).join(", ")}`);
process.exit(1);
