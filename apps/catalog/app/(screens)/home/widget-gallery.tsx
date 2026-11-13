"use client";

import { Button, DepartmentChip, EditorDialog, Empty, Icon, SearchField } from "@lance-live/gallery-ui";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { HOME_WIDGETS, WIDGET_CATEGORIES } from "./widget-catalog";

const ALL = "all";

/** Builds a preview once its tile comes within a screen of view, then keeps it, so 42 live widgets are never mounted at once. */
function LazyPreview({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || seen) return;
    const observer = new IntersectionObserver(([entry]) => entry?.isIntersecting && setSeen(true), { rootMargin: "100% 0px" });
    observer.observe(el);
    return () => observer.disconnect();
  }, [seen]);
  return (
    <div ref={ref} className="home-gallery-preview" inert aria-hidden="true">
      {seen ? <div className="home-gallery-scale">{children}</div> : null}
    </div>
  );
}

/**
 * The primary in Home's edit mode, and the gallery it opens over the whole screen, built on the editor dialog.
 * The departments are its tabs and the search sits on top. Every widget shows as a live preview under its department.
 * Pressing one adds it to Home, or takes it off when it is already there. The gallery stays open until Done.
 */
export function AddWidgets({ shown, onToggle }: { shown: Set<string>; onToggle: (id: string) => void }) {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState(ALL);
  const [query, setQuery] = useState("");
  const buttonRef = useRef<HTMLButtonElement>(null);

  const close = () => {
    setOpen(false);
    setQuery("");
    buttonRef.current?.focus();
  };

  // Edit mode also leaves on Escape, from window. This runs first and keeps that Escape for the gallery alone.
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.stopImmediatePropagation();
      setOpen(false);
      setQuery("");
      buttonRef.current?.focus();
    };
    document.addEventListener("keydown", onKey, true);
    return () => document.removeEventListener("keydown", onKey, true);
  }, [open]);

  const words = query.trim().toLowerCase();
  const groups = WIDGET_CATEGORIES.filter((item) => category === ALL || item.id === category)
    .map((item) => ({ ...item, widgets: HOME_WIDGETS.filter((widget) => widget.category === item.id && (!words || widget.title.toLowerCase().includes(words))) }))
    .filter((group) => group.widgets.length);
  return (
    <>
      <Button ref={buttonRef} aria-haspopup="dialog" aria-expanded={open} onClick={() => setOpen(true)}>
        <Icon name="plus" size={14} />
        Add Widgets
      </Button>
      {open ? (
        <EditorDialog
          kicker="Add widgets"
          title="Add widgets"
          className="home-add-dialog"
          tabs={{
            label: "Departments",
            value: category,
            onValueChange: setCategory,
            items: [
              { value: ALL, label: "All", count: HOME_WIDGETS.length },
              ...WIDGET_CATEGORIES.map((item) => ({ value: item.id, label: item.department, count: HOME_WIDGETS.filter((widget) => widget.category === item.id).length })),
            ],
          }}
          onClose={close}
          footer={
            <Button onClick={close}>
              <Icon name="check" size={14} />
              Done
            </Button>
          }
        >
          <div className="home-add-search">
            <SearchField placeholder="Search widgets" defaultValue={query} onValueChange={setQuery} />
          </div>
          {groups.length ? (
            groups.map((group) => (
              <section key={group.id} className="home-add-group" aria-label={group.department}>
                <h3 className="home-add-label">
                  <DepartmentChip plain name={group.department} />
                  <span className="home-add-count">{group.widgets.length}</span>
                </h3>
                <ul className="home-gallery-grid">
                  {group.widgets.map(({ id, title, Component }) => {
                    const on = shown.has(id);
                    return (
                      <li key={id} className="home-gallery-tile">
                        <span className="home-gallery-name">
                          <span>{title}</span>
                          {on ? <Icon name="check" size={14} /> : null}
                        </span>
                        <LazyPreview>
                          <Component />
                        </LazyPreview>
                        <button type="button" className="home-gallery-pick" aria-pressed={on} aria-label={on ? `Remove ${title} from Home` : `Add ${title} to Home`} onClick={() => onToggle(id)} />
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))
          ) : (
            <Empty icon="search" title="No widgets found">
              Try another word, or pick another department.
            </Empty>
          )}
        </EditorDialog>
      ) : null}
    </>
  );
}
