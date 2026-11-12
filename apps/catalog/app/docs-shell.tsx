"use client";

import { SearchField } from "@lance-live/gallery-ui";
import { useEffect, useState } from "react";
import { DocsContext, type DocsView } from "./docs-example";
import { GallerySections } from "./gallery";
import { Specimens, ThemeToggle } from "./specimens";

type Item = { id: string; label: string };
type Category = { label?: string; items: Item[] };
type Group = { id: string; label: string; categories: Category[] };

const NAV: Group[] = [
  {
    id: "foundations",
    label: "Foundations",
    categories: [
      {
        items: [
          { id: "color", label: "Color" },
          { id: "spacing", label: "Spacing" },
          { id: "type", label: "Typography" },
        ],
      },
    ],
  },
  {
    id: "components",
    label: "Components",
    categories: [
      {
        label: "Buttons",
        items: [
          { id: "button", label: "Button" },
          { id: "text-icon", label: "Text and icon" },
          { id: "chip", label: "Chip" },
          { id: "department", label: "Department tag" },
          { id: "segments", label: "Segmented control" },
        ],
      },
      {
        label: "Menus",
        items: [
          { id: "menu", label: "Drop down menu" },
          { id: "filter-menu", label: "Filter menu" },
          { id: "confirm", label: "Delete confirmation" },
        ],
      },
      {
        label: "Fields",
        items: [
          { id: "search", label: "Search" },
          { id: "checkbox", label: "Checkbox" },
          { id: "switch", label: "Switch" },
        ],
      },
      {
        label: "People",
        items: [
          { id: "avatar", label: "Avatar" },
          { id: "profile", label: "Profile" },
          { id: "lance", label: "Lance" },
          { id: "lance-side", label: "Lance sidebar" },
          { id: "messaging", label: "Messaging" },
          { id: "comment", label: "Comment" },
          { id: "message", label: "Message" },
          { id: "message-group", label: "Message group" },
          { id: "day", label: "Day" },
          { id: "typing", label: "Typing" },
          { id: "resolved", label: "Resolved" },
          { id: "ticket", label: "Ticket" },
          { id: "ticket-note", label: "Ticket note" },
          { id: "empty", label: "Empty" },
          { id: "meter", label: "Meter" },
          { id: "widget", label: "Widget" },
          { id: "widget-list", label: "Widget list" },
          { id: "widget-row", label: "Widget row" },
          { id: "todos-widget", label: "To-dos widget" },
          { id: "activity", label: "Activity" },
        ],
      },
      {
        label: "Feedback",
        items: [
          { id: "toast", label: "Toast" },
          { id: "tip", label: "Tooltip" },
          { id: "status", label: "Status" },
          { id: "urgency", label: "Urgency" },
        ],
      },
      {
        label: "Data",
        items: [
          { id: "datatable", label: "Data table" },
          { id: "task-table", label: "To-do table" },
        ],
      },
      {
        label: "Surfaces",
        items: [
          { id: "detail-panel", label: "Detail panel" },
          { id: "editor", label: "Editor popup" },
          { id: "pill-editor", label: "Pill editor" },
        ],
      },
      {
        label: "Navigation",
        items: [
          { id: "header", label: "Header" },
          { id: "sidebar", label: "Sidebar" },
          { id: "tabs", label: "Tabs" },
        ],
      },
      {
        label: "Icons",
        items: [{ id: "icons", label: "Icons" }],
      },
    ],
  },
];

const PAGES = new Map(NAV.flatMap((group) => group.categories.flatMap((category) => category.items.map((item) => [item.id, item.label] as const))));

export function readHash() {
  const raw = window.location.hash.replace(/^#/, "");
  const [page, section] = raw.split("/");
  if (!PAGES.has(page)) return { page: "button", section: undefined as string | undefined };
  return { page, section };
}

function Chevron() {
  return (
    <svg className="docs-chevron" width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
      <path d="M3.5 5.5 7 9l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.05" />
    </svg>
  );
}

export function DocsShell() {
  const [page, setPage] = useState("button");
  const [section, setSection] = useState<string | undefined>();
  const [open, setOpen] = useState<Record<string, boolean>>({ foundations: true, components: true });
  const [contents, setContents] = useState<{ id: string; label: string }[]>([]);
  const [current, setCurrent] = useState<string | undefined>();
  const [view, setView] = useState<DocsView>("examples");
  const [query, setQuery] = useState("");
  const needle = query.trim().toLowerCase();
  const nav = needle
    ? NAV.map((group) => ({
        ...group,
        categories: group.categories
          .map((category) => ({
            ...category,
            items: (category.label ?? "").toLowerCase().includes(needle) ? category.items : category.items.filter((item) => item.label.toLowerCase().includes(needle)),
          }))
          .filter((category) => category.items.length),
      })).filter((group) => group.categories.length)
    : NAV;

  useEffect(() => {
    const apply = () => {
      const next = readHash();
      if (!window.location.hash || !PAGES.has(window.location.hash.replace(/^#/, "").split("/")[0])) {
        history.replaceState(null, "", `#${next.page}`);
      }
      setPage(next.page);
      setSection(next.section);
    };
    apply();
    window.addEventListener("hashchange", apply);
    return () => window.removeEventListener("hashchange", apply);
  }, []);

  useEffect(() => {
    document.title = `${PAGES.get(page) ?? "Gallery"} - Gallery`;
  }, [page]);

  useEffect(() => {
    const main = document.getElementById("docs-main");
    const nodes = [...(main?.querySelectorAll<HTMLElement>("[data-example]") ?? [])];
    setContents(nodes.map((node) => ({ id: node.id, label: node.dataset.example ?? node.id })));
    if (!section) {
      window.scrollTo(0, 0);
      setCurrent(nodes[0]?.id);
      return;
    }
    document.getElementById(section)?.scrollIntoView();
    setCurrent(section);
  }, [page, section, view]);

  useEffect(() => {
    const nodes = [...document.querySelectorAll<HTMLElement>("[data-example]")];
    if (!nodes.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]?.target instanceof HTMLElement) setCurrent(visible[0].target.id);
      },
      { rootMargin: "-20% 0px -55% 0px" },
    );
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [page, section, view]);

  return (
    <div className="docs">
      <header className="docs-top">
        <a className="docs-mark" href="#button">
          Gallery
        </a>
        <ThemeToggle />
      </header>
      <div className="docs-body">
        <nav className="docs-nav" aria-label="Components">
          {/* Enter opens the first match. A search shows every group that matches, open or not. */}
          <div
            className="docs-search"
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                const first = nav[0]?.categories[0]?.items[0];
                if (first) window.location.hash = first.id;
              }
            }}
          >
            <SearchField placeholder="Search components" onValueChange={setQuery} />
          </div>
          {needle && !nav.length ? <p className="docs-search-empty">No components match.</p> : null}
          {nav.map((group) => (
            <div className="docs-group" data-open={needle || open[group.id] ? "true" : "false"} key={group.id}>
              <button
                className="docs-group-btn"
                type="button"
                aria-expanded={open[group.id] ? "true" : "false"}
                onClick={() => setOpen((prev) => ({ ...prev, [group.id]: !prev[group.id] }))}
              >
                <Chevron />
                {group.label}
              </button>
              {needle || open[group.id]
                ? group.categories.map((category) => (
                    <div key={category.label ?? group.id}>
                      {category.label ? <div className="docs-cat">{category.label}</div> : null}
                      {category.items.map((item) => (
                        <a key={item.id} className="docs-link" href={`#${item.id}`} aria-current={item.id === page ? "page" : undefined}>
                          {item.label}
                        </a>
                      ))}
                    </div>
                  ))
                : null}
            </div>
          ))}
        </nav>
        <main className="docs-main" id="docs-main">
          <DocsContext.Provider
            value={{
              page,
              view,
              setView: (next) => {
                if (next === view) return;
                history.replaceState(null, "", `#${page}`);
                setSection(undefined);
                setView(next);
              },
            }}
          >
            <Specimens page={page} />
            <GallerySections page={page} />
          </DocsContext.Provider>
        </main>
        <aside className="docs-contents">
          <h2>Contents</h2>
          {contents.map((item) => (
            <a key={item.id} href={`#${page}/${item.id}`} aria-current={item.id === current ? "true" : undefined}>
              {item.label}
            </a>
          ))}
        </aside>
      </div>
    </div>
  );
}
