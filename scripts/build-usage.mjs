#!/usr/bin/env node
// Builds the gallery's Usage tab from the design-system skill.
// `node scripts/build-usage.mjs` writes apps/catalog/app/docs-usage.ts.
// `node scripts/build-usage.mjs --check` exits 1 when that file is out of date.

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const skill = join(root, ".cursor/skills/design-system");
const out = join(root, "apps/catalog/app/docs-usage.ts");
const shell = join(root, "apps/catalog/app/docs-shell.tsx");

const FILES = {
  components: "references/components.md",
  patterns: "references/patterns.md",
  foundations: "references/foundations.md",
  guardRails: "references/guard-rails.md",
  polish: "references/polish.md",
  skill: "SKILL.md",
};

const c = (heading, label) => ({ file: "components", heading, label });

/** Gallery page id → the skill sections that hold its rules. */
export const SOURCES = {
  color: [
    { file: "foundations", heading: "Roles" },
    { file: "foundations", heading: "Hover on a neutral surface" },
  ],
  spacing: [
    { file: "foundations", heading: "Space" },
    { file: "guardRails", heading: "Two kinds of space" },
  ],
  type: [
    { file: "skill", heading: "Type" },
    { file: "foundations", heading: "Type" },
  ],
  button: [
    c("Primary button", "Primary"),
    c("Secondary button", "Secondary"),
    c("Tertiary button", "Tertiary"),
    c("Danger button", "Danger"),
    c("Icon button", "Icon button"),
  ],
  "text-icon": [c("Text button")],
  chip: [c("Chip"), c("Filter chip", "Filter chip")],
  department: [c("Department tag")],
  segments: [c("Segments")],
  menu: [c("Menu")],
  "filter-menu": [{ file: "patterns", heading: "Filter row" }],
  confirm: [c("Delete confirmation")],
  search: [c("Search")],
  checkbox: [c("Checkbox")],
  switch: [c("Switch")],
  avatar: [c("Avatar")],
  profile: [c("Person")],
  lance: [c("Lance composer")],
  "lance-side": [c("Lance panel")],
  messaging: [c("Message composer")],
  comment: [c("Comment")],
  message: [c("Message")],
  "message-group": [c("Message group")],
  day: [c("Day")],
  typing: [c("Typing")],
  resolved: [c("Resolved")],
  ticket: [c("Ticket")],
  "ticket-note": [c("Ticket note")],
  empty: [c("Empty")],
  meter: [c("Meter")],
  "share-bar": [c("Share bar")],
  widget: [c("Widget")],
  "widget-summary": [c("Widget summary")],
  "widget-list": [c("Widget list")],
  "widget-row": [c("Widget row")],
  "room-mark": [c("Room mark")],
  "todos-widget": [c("To-dos widget")],
  activity: [c("Activity")],
  toast: [c("Toast")],
  tip: [c("Tooltip")],
  status: [c("Status")],
  urgency: [c("Urgency")],
  datatable: [c("Table")],
  "task-table": [{ file: "patterns", heading: "Task row" }, c("Table", "Table")],
  "detail-panel": [c("Detail panel")],
  editor: [c("Editor popup"), c("Pill editor", "Pill editor")],
  "pill-editor": [c("Pill editor")],
  header: [c("Header")],
  sidebar: [c("Sidebar"), c("Pin", "Pin")],
  tabs: [c("Tabs")],
  icons: [{ file: "polish", heading: "Icons" }, { file: "guardRails", heading: "One icon construction" }],
};

const cache = new Map();
function read(file) {
  if (!cache.has(file)) cache.set(file, readFileSync(join(skill, FILES[file]), "utf8").split("\n"));
  return cache.get(file);
}

function section(file, heading) {
  const lines = read(file);
  const start = lines.findIndex((line) => /^#{2,3} /.test(line) && line.replace(/^#+ /, "").trim() === heading);
  if (start < 0) throw new Error(`No "${heading}" heading in ${FILES[file]}`);
  const level = lines[start].match(/^#+/)[0].length;
  const body = [];
  for (const line of lines.slice(start + 1)) {
    const match = line.match(/^(#+) /);
    if (match && match[1].length <= level) break;
    body.push(line);
  }
  return body;
}

function clean(text) {
  return text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

function blocks(lines) {
  const result = [];
  let paragraph = [];
  const flush = () => {
    if (paragraph.length) result.push({ kind: "text", text: clean(paragraph.join(" ")) });
    paragraph = [];
  };
  for (const raw of lines) {
    const line = raw.trimEnd();
    if (!line.trim()) {
      flush();
    } else if (/^\s*\|/.test(line)) {
      flush();
      const cells = line.split("|").slice(1, -1).map((cell) => clean(cell));
      if (cells.every((cell) => /^:?-+:?$/.test(cell))) continue;
      result.push({ kind: "row", cells });
    } else if (/^\s*- /.test(line)) {
      flush();
      result.push({ kind: "item", text: clean(line.replace(/^\s*- (\[ \] )?/, "")) });
    } else if (/^\s*\d+\. /.test(line)) {
      flush();
      result.push({ kind: "item", text: clean(line.replace(/^\s*\d+\. /, "")) });
    } else {
      paragraph.push(line.trim());
    }
  }
  flush();
  return result;
}

function sentence(text) {
  return /[.!?”"]$/.test(text) ? text : `${text}.`;
}

function usageFor(page) {
  const usage = { when: [], whenNot: [], rules: [] };
  for (const source of SOURCES[page]) {
    const prefix = source.label ? `${source.label}: ` : "";
    let header = true;
    for (const block of blocks(section(source.file, source.heading))) {
      if (block.kind === "row") {
        if (header) {
          header = false;
          continue;
        }
        const [name, ...rest] = block.cells.filter(Boolean);
        usage.rules.push(prefix + sentence([name, rest.map(sentence).join(" ")].filter(Boolean).join(": ").replace(/\.\s*$/, "")));
        continue;
      }
      header = true;
      if (/^Forced by:/i.test(block.text)) continue;
      const field = block.kind === "item" && block.text.match(/^(When not|When):\s*(.*)$/);
      if (field) {
        (field[1] === "When" ? usage.when : usage.whenNot).push(prefix + field[2]);
      } else {
        usage.rules.push(prefix + block.text);
      }
    }
  }
  return usage;
}

function pages() {
  return [...readFileSync(shell, "utf8").matchAll(/\{ id: "([^"]+)", label/g)].map((match) => match[1]);
}

export function build() {
  const missing = pages().filter((page) => !SOURCES[page]);
  if (missing.length) throw new Error(`No usage source for gallery page: ${missing.join(", ")}. Add it to SOURCES in scripts/build-usage.mjs.`);
  const data = Object.fromEntries(Object.keys(SOURCES).map((page) => [page, usageFor(page)]));
  return [
    "// Generated by scripts/build-usage.mjs from .cursor/skills/design-system. Edit the skill, then run `npm run usage`.",
    "",
    "export type Usage = {",
    "  when: string[];",
    "  whenNot: string[];",
    "  rules: string[];",
    "};",
    "",
    `export const USAGE: Record<string, Usage> = ${JSON.stringify(data, null, 2)};`,
    "",
  ].join("\n");
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const next = build();
  let current = "";
  try {
    current = readFileSync(out, "utf8");
  } catch {}
  if (process.argv.includes("--check")) {
    if (current !== next) {
      console.error("docs-usage.ts is out of date with the design-system skill. Run `npm run usage`.");
      process.exit(1);
    }
    console.log("Usage tab matches the design-system skill.");
  } else if (current !== next) {
    writeFileSync(out, next);
    console.log("Wrote apps/catalog/app/docs-usage.ts");
  }
}
