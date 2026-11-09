"use client";

import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { useSlidePill } from "../use-slide";

export type SegmentOption = {
  value: string;
  label: ReactNode;
  /** Same count as a tab: a separate figure, not part of the label. */
  count?: number;
  /** Paints the unselected hover specimen. Ignored once the sliding pill is mounted. */
  state?: "hover";
};

export type SegmentedControlProps = {
  value: string;
  onValueChange?: (value: string) => void;
  options: SegmentOption[];
  "aria-label": string;
  /** Frozen specimen. Paints selection without the sliding pill. */
  readOnly?: boolean;
  className?: string;
};

function segmentClass(state: SegmentOption["state"]) {
  return state === "hover" ? "segment is-hover" : "segment";
}

export function SegmentedControl({
  value,
  onValueChange,
  options,
  readOnly = false,
  className,
  "aria-label": ariaLabel,
}: SegmentedControlProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const pillRef = useRef<HTMLSpanElement>(null);
  const press = useRef<{ id: number; x: number } | null>(null);
  const dragged = useRef(false);
  const keysTimer = useRef(0);
  const [pressed, setPressed] = useState(false);

  useEffect(() => {
    if (process.env.NODE_ENV !== "production" && options.length > 3) {
      console.warn(`SegmentedControl shows at most three views. Received ${options.length}.`);
    }
  }, [options.length]);

  useEffect(() => {
    return () => window.clearTimeout(keysTimer.current);
  }, []);

  useSlidePill({
    scrollRef,
    trackRef,
    pillRef,
    itemSelector: ".segment",
    enabled: !readOnly,
    value,
  });

  function markKeys() {
    document.documentElement.classList.add("is-keys");
    window.clearTimeout(keysTimer.current);
    keysTimer.current = window.setTimeout(() => {
      document.documentElement.classList.remove("is-keys");
    }, 200);
  }

  function clearKeys() {
    window.clearTimeout(keysTimer.current);
    document.documentElement.classList.remove("is-keys");
  }

  function selectAt(clientX: number) {
    const track = trackRef.current;
    if (!track) return;
    let best: HTMLElement | null = null;
    let dist = Infinity;
    for (const el of track.querySelectorAll<HTMLElement>(".segment")) {
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
    const track = trackRef.current;
    const opt = (event.target as HTMLElement).closest?.(".segment");
    if (!track || !opt || !track.contains(opt)) return;
    clearKeys();
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
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft" && event.key !== "Home" && event.key !== "End") return;
    const track = trackRef.current;
    if (!track) return;
    const tabs = [...track.querySelectorAll<HTMLElement>(".segment")];
    let index = tabs.findIndex((tab) => tab === document.activeElement);
    if (index < 0) index = tabs.findIndex((tab) => tab.getAttribute("aria-selected") === "true");
    if (index < 0) index = 0;
    if (event.key === "ArrowRight") index = (index + 1) % tabs.length;
    if (event.key === "ArrowLeft") index = (index - 1 + tabs.length) % tabs.length;
    if (event.key === "Home") index = 0;
    if (event.key === "End") index = tabs.length - 1;
    markKeys();
    const next = tabs[index];
    next?.focus();
    if (next?.dataset.value) onValueChange?.(next.dataset.value);
    event.preventDefault();
  }

  const rootClass = ["sds", "segmented", className].filter(Boolean).join(" ");

  return (
    <div ref={scrollRef} className={rootClass}>
      <div
        ref={trackRef}
        className={readOnly ? "segment-track" : "segment-track has-slide"}
        role="tablist"
        aria-label={ariaLabel}
        data-pressed={pressed ? "" : undefined}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endPress}
        onPointerCancel={endPress}
        onClickCapture={onClickCapture}
        onKeyDown={onKeyDown}
      >
        {readOnly ? null : <span ref={pillRef} className="slide-pill" aria-hidden="true" />}
        {options.map((option) => {
          const selected = option.value === value;
          const label = (
            <span className="slide-content">
              {option.label}
              {option.count !== undefined ? (
                <span key={String(option.count)} className="count">
                  {option.count}
                </span>
              ) : null}
            </span>
          );
          if (readOnly) {
            return (
              <span
                key={option.value}
                className={segmentClass(option.state)}
                role="tab"
                aria-selected={selected}
                data-value={option.value}
              >
                {label}
              </span>
            );
          }
          return (
            <button
              key={option.value}
              type="button"
              className="segment"
              role="tab"
              aria-selected={selected}
              data-value={option.value}
              onClick={() => onValueChange?.(option.value)}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
