"use client";

import { Button, DepartmentChip, Empty, Icon, SearchField } from "@lance-live/gallery-ui";
import { useEffect, useRef, useState, type PointerEvent } from "react";
import { HOME_WIDGETS, WIDGET_CATEGORIES } from "./widget-catalog";

const ALL = "all";

/**
 * Docked on the bottom of the page while Home is in edit mode, so the widgets above stay in reach for their remove marks.
 * Categories on the left, live previews on the right. A preview adds its widget, or removes it when it is already on Home.
 */
export function WidgetGallery({
  shown,
  onToggle,
  onDrag,
  onDone,
}: {
  shown: Set<string>;
  onToggle: (id: string) => void;
  /** A press that travels drags the widget onto Home, to the place it is dropped. */
  onDrag: (event: PointerEvent<HTMLButtonElement>, id: string) => void;
  onDone: () => void;
}) {
  const [category, setCategory] = useState(ALL);
  const [query, setQuery] = useState("");
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") doneRef.current();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const words = query.trim().toLowerCase();
  const visible = HOME_WIDGETS.filter((widget) => (category === ALL || widget.category === category) && (!words || widget.title.toLowerCase().includes(words)));
  const heading = category === ALL ? "All widgets" : WIDGET_CATEGORIES.find((item) => item.id === category)?.department;

  return (
    <section className="home-gallery" aria-label="Widget gallery">
      <div className="home-gallery-body">
        <div className="home-gallery-side">
          <SearchField placeholder="Search widgets" onValueChange={setQuery} />
          <div className="home-gallery-cats" role="tablist" aria-label="Categories" aria-orientation="vertical">
            <button type="button" role="tab" className="home-gallery-cat" aria-selected={category === ALL} onClick={() => setCategory(ALL)}>
              <span className="home-gallery-cat-name">All widgets</span>
              <span className="home-gallery-cat-count">{HOME_WIDGETS.length}</span>
            </button>
            {WIDGET_CATEGORIES.map((item) => (
              <button key={item.id} type="button" role="tab" className="home-gallery-cat" aria-selected={category === item.id} onClick={() => setCategory(item.id)}>
                <DepartmentChip plain name={item.department} />
                <span className="home-gallery-cat-count">{HOME_WIDGETS.filter((widget) => widget.category === item.id).length}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="home-gallery-main" role="tabpanel" aria-label={heading}>
          <h3 className="home-gallery-title">{heading}</h3>
          {visible.length ? (
            <ul className="home-gallery-grid">
              {visible.map(({ id, title, Component }) => {
                const on = shown.has(id);
                return (
                  <li key={id} className="home-gallery-tile">
                    <div className="home-gallery-preview" inert aria-hidden="true">
                      <div className="home-gallery-scale">
                        <Component />
                      </div>
                    </div>
                    <span className="home-gallery-name">
                      <span>{title}</span>
                      {on ? <Icon name="check" size={14} /> : null}
                    </span>
                    <button type="button" className="home-gallery-pick" aria-pressed={on} aria-label={on ? `Remove ${title} from Home` : `Add ${title} to Home`} onClick={() => onToggle(id)} onPointerDown={(event) => onDrag(event, id)} />
                  </li>
                );
              })}
            </ul>
          ) : (
            <Empty icon="search" title="No widgets found">
              Try another word, or pick a category.
            </Empty>
          )}
        </div>
      </div>
      <footer className="home-gallery-foot">
        <p>Click a widget to add it, or drag it into place. A check means it is already on Home.</p>
        <Button onClick={onDone}>
          <Icon name="check" size={14} />
          Done
        </Button>
      </footer>
    </section>
  );
}
