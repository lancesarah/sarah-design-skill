"use client";

import { useRef, useState, type KeyboardEvent, type MouseEvent, type PointerEvent as ReactPointerEvent } from "react";
import { useSlidePill } from "../use-slide";

export type TabItem = { value: string; label: string; count?: number };

export type TabsProps = {
  items: TabItem[];
  value: string;
  onValueChange?: (value: string) => void;
  /** Grey bar behind the tabs. */
  bar?: boolean;
  readOnly?: boolean;
  className?: string;
  /** Names the tab list for assistive tech. */
  label?: string;
};

export function Tabs({ items, value, onValueChange, bar = false, readOnly = false, className, label }: TabsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const pillRef = useRef<HTMLSpanElement>(null);
  const press = useRef<{ id: number; x: number } | null>(null);
  const dragged = useRef(false);
  const [pressed, setPressed] = useState(false);

  useSlidePill({
    scrollRef,
    trackRef,
    pillRef,
    itemSelector: ".tab",
    enabled: !readOnly,
    value,
  });

  function selectAt(clientX: number) {
    const track = trackRef.current;
    if (!track) return;
    let best: HTMLElement | null = null;
    let dist = Infinity;
    for (const el of track.querySelectorAll<HTMLElement>(":scope > .tab")) {
      if ((el as HTMLButtonElement).disabled) continue;
      const rect = el.getBoundingClientRect();
      const d = clientX < rect.left ? rect.left - clientX : clientX > rect.right ? clientX - rect.right : 0;
      if (d < dist) {
        dist = d;
        best = el;
      }
    }
    const next = best?.dataset.value;
    if (!next || next === value) return;
    onValueChange?.(next);
  }

  function onPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (readOnly || event.button !== 0) return;
    const opt = (event.target as HTMLElement).closest?.(".tab");
    if (!trackRef.current || !opt || !trackRef.current.contains(opt)) return;
    press.current = { id: event.pointerId, x: event.clientX };
    dragged.current = false;
    setPressed(true);
  }

  function onPointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (!press.current || press.current.id !== event.pointerId) return;
    if (Math.abs(event.clientX - press.current.x) < 4) return;
    dragged.current = true;
    selectAt(event.clientX);
  }

  function endPress(event: ReactPointerEvent<HTMLDivElement>) {
    if (!press.current || event.pointerId !== press.current.id) return;
    press.current = null;
    setPressed(false);
  }

  function onClickCapture(event: MouseEvent<HTMLDivElement>) {
    if (!dragged.current) return;
    dragged.current = false;
    event.preventDefault();
    event.stopPropagation();
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (readOnly) return;
    if (!["ArrowRight", "ArrowLeft", "Home", "End"].includes(event.key)) return;
    const tabs = [...(trackRef.current?.querySelectorAll<HTMLElement>(".tab") ?? [])];
    let index = tabs.findIndex((tab) => tab.getAttribute("aria-selected") === "true");
    if (event.key === "ArrowRight") index = (index + 1) % tabs.length;
    if (event.key === "ArrowLeft") index = (index - 1 + tabs.length) % tabs.length;
    if (event.key === "Home") index = 0;
    if (event.key === "End") index = tabs.length - 1;
    document.documentElement.classList.add("is-keys");
    window.setTimeout(() => document.documentElement.classList.remove("is-keys"), 200);
    onValueChange?.(tabs[index]?.dataset.value ?? value);
    tabs[index]?.focus();
    event.preventDefault();
  }

  const tabs = (
    <div className={["sds", "tabs-frame", "scroll-fade", "scroll-fade-x", className].filter(Boolean).join(" ")}>
    <div ref={scrollRef} className="sds tabs-scroll">
      <div
        ref={trackRef}
        className={readOnly ? "tabs" : "tabs has-slide"}
        role="tablist"
        aria-label={label}
        data-pressed={pressed ? "" : undefined}
        onKeyDown={onKeyDown}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endPress}
        onPointerCancel={endPress}
        onClickCapture={onClickCapture}
      >
        {readOnly ? null : <span ref={pillRef} className="slide-pill" aria-hidden="true" />}
        {items.map((item) => {
          const selected = item.value === value;
          const body = (
            <span className="slide-content">
              {item.label}
              {item.count !== undefined ? (
                <span key={String(item.count)} className="count">
                  {item.count}
                </span>
              ) : null}
            </span>
          );
          if (readOnly) {
            return (
              <span key={item.value} className="tab" aria-selected={selected} data-value={item.value}>
                {body}
              </span>
            );
          }
          return (
            <button
              key={item.value}
              className="tab"
              type="button"
              role="tab"
              aria-selected={selected}
              data-value={item.value}
              onClick={() => onValueChange?.(item.value)}
            >
              {body}
            </button>
          );
        })}
      </div>
    </div>
    </div>
  );

  if (!bar) return tabs;
  return <div className="sds tabs-bar">{tabs}</div>;
}
