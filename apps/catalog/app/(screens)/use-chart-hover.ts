"use client";

import { useEffect, type RefObject } from "react";

function placePointTip(host: HTMLElement) {
  const tip = host.querySelector<HTMLElement>(":scope > .tip");
  if (!tip) return;
  const box = host.getBoundingClientRect();
  const gap = 12;
  const tipBox = tip.getBoundingClientRect();
  const tipWidth = tipBox.width || tip.offsetWidth;
  const tipHeight = tipBox.height || tip.offsetHeight;
  let left = box.right + gap;
  if (left + tipWidth > window.innerWidth - 12) left = box.left - gap - tipWidth;
  const top = Math.min(Math.max(8, box.top + box.height / 2 - tipHeight / 2), window.innerHeight - tipHeight - 8);
  tip.style.position = "fixed";
  tip.style.left = `${left}px`;
  tip.style.top = `${top}px`;
  tip.style.transform = "none";
}

function revealPointTip(host: HTMLElement) {
  const tip = host.querySelector<HTMLElement>(":scope > .tip");
  if (!tip) return;
  try {
    if (!tip.matches(":popover-open")) tip.showPopover();
  } catch {
    // The tip can already be opening as the pointer crosses the point.
  }
  placePointTip(host);
}

function hidePointTip(host: HTMLElement) {
  const tip = host.querySelector<HTMLElement>(":scope > .tip");
  if (!tip?.matches(":popover-open")) return;
  try {
    tip.hidePopover();
  } catch {
    // The tip can already be closed when the pointer leaves.
  }
}

/** Readings-style nearest-point hover, keyboard focus, and viewport-safe popovers. */
export function useChartHover(chartRef: RefObject<HTMLElement | null>, revision: unknown) {
  useEffect(() => {
    const root = chartRef.current;
    const guide = root?.querySelector<HTMLElement>(".readings-guide");
    if (!root) return;
    let current: HTMLElement | null = null;

    const hosts = () => [...root.querySelectorAll<HTMLElement>("[data-chart-point]")];
    const nearest = (clientX: number) => {
      let chosen: HTMLElement | null = null;
      let best = Infinity;
      for (const host of hosts()) {
        const box = host.getBoundingClientRect();
        const distance = Math.abs(box.left + box.width / 2 - clientX);
        if (distance < best) {
          best = distance;
          chosen = host;
        }
      }
      return chosen;
    };
    const show = (host: HTMLElement) => {
      if (current && current !== host) {
        current.classList.remove("is-active");
        hidePointTip(current);
      }
      current = host;
      host.classList.add("is-active");
      const chart = root.getBoundingClientRect();
      const box = host.getBoundingClientRect();
      if (guide) guide.style.left = `${box.left + box.width / 2 - chart.left}px`;
      if (guide) guide.hidden = false;
      revealPointTip(host);
    };
    const clear = () => {
      if (current) {
        current.classList.remove("is-active");
        hidePointTip(current);
        current = null;
      }
      if (guide) guide.hidden = true;
    };
    const onMove = (event: PointerEvent) => {
      const host = nearest(event.clientX);
      if (host) show(host);
    };
    const onLeave = (event: PointerEvent) => {
      const next = event.relatedTarget;
      if (next instanceof Node && root.contains(next)) return;
      clear();
    };
    const onFocusIn = (event: FocusEvent) => {
      const host = (event.target as Element | null)?.closest<HTMLElement>("[data-chart-point]");
      if (host && root.contains(host)) show(host);
    };
    const onFocusOut = (event: FocusEvent) => {
      const host = (event.target as Element | null)?.closest<HTMLElement>("[data-chart-point]");
      if (!host || !root.contains(host) || host.contains(event.relatedTarget as Node)) return;
      clear();
    };

    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") clear(); };
    window.addEventListener("scroll", clear, true);
    window.addEventListener("resize", clear);
    root.addEventListener("keydown", onKey);
    root.addEventListener("pointermove", onMove);
    root.addEventListener("pointerleave", onLeave);
    root.addEventListener("focusin", onFocusIn);
    root.addEventListener("focusout", onFocusOut);
    return () => {
      clear();
      window.removeEventListener("scroll", clear, true);
      window.removeEventListener("resize", clear);
      root.removeEventListener("keydown", onKey);
      root.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerleave", onLeave);
      root.removeEventListener("focusin", onFocusIn);
      root.removeEventListener("focusout", onFocusOut);
    };
  }, [chartRef, revision]);
}
