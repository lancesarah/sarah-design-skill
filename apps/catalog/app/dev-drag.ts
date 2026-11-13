"use client";

import { useEffect, type RefObject } from "react";

/** Past this distance a press is a drag, and the click it would have made is dropped. */
const THRESHOLD = 4;
const EDGE = 8;

type Spot = { left: number; top: number };

function place(node: HTMLElement, spot: Spot) {
  const box = node.getBoundingClientRect();
  const left = Math.min(Math.max(EDGE, spot.left), window.innerWidth - box.width - EDGE);
  const top = Math.min(Math.max(EDGE, spot.top), window.innerHeight - box.height - EDGE);
  node.style.left = `${left}px`;
  node.style.top = `${top}px`;
  node.style.bottom = "auto";
  node.style.transform = "none";
  return { left, top };
}

function unplace(node: HTMLElement) {
  node.style.left = "";
  node.style.top = "";
  node.style.bottom = "";
  node.style.transform = "";
}

/** Lets a fixed dev control be dragged anywhere on screen. The spot is saved under `key`. Double-clicking its frame, not a button, puts it back. */
export function useDevDrag(ref: RefObject<HTMLElement | null>, key: string) {
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const storeKey = `dev-drag:${key}`;

    let saved: Spot | null = null;
    try {
      saved = JSON.parse(localStorage.getItem(storeKey) ?? "null");
    } catch {
      saved = null;
    }
    if (saved) place(node, saved);

    let start: { x: number; y: number; left: number; top: number; id: number } | null = null;
    let dragging = false;

    const down = (event: PointerEvent) => {
      if (event.button !== 0) return;
      const box = node.getBoundingClientRect();
      start = { x: event.clientX, y: event.clientY, left: box.left, top: box.top, id: event.pointerId };
      dragging = false;
    };

    const move = (event: PointerEvent) => {
      if (!start || event.pointerId !== start.id) return;
      const dx = event.clientX - start.x;
      const dy = event.clientY - start.y;
      if (!dragging && Math.hypot(dx, dy) < THRESHOLD) return;
      if (!dragging) {
        dragging = true;
        try {
          node.setPointerCapture(event.pointerId);
        } catch {
          /* the pointer can already be gone; the drag still follows its moves */
        }
        node.dataset.dragging = "";
      }
      saved = place(node, { left: start.left + dx, top: start.top + dy });
    };

    const up = (event: PointerEvent) => {
      if (!start || event.pointerId !== start.id) return;
      start = null;
      if (!dragging) return;
      delete node.dataset.dragging;
      try {
        localStorage.setItem(storeKey, JSON.stringify(saved));
      } catch {
        /* storage can be blocked; the control still moves for this visit */
      }
    };

    const click = (event: MouseEvent) => {
      if (!dragging) return;
      dragging = false;
      event.preventDefault();
      event.stopPropagation();
    };

    const reset = (event: MouseEvent) => {
      if (event.target instanceof Element && event.target.closest("button")) return;
      saved = null;
      unplace(node);
      try {
        localStorage.removeItem(storeKey);
      } catch {
        /* storage can be blocked */
      }
    };

    const fit = () => {
      if (saved) saved = place(node, saved);
    };

    node.addEventListener("pointerdown", down);
    node.addEventListener("pointermove", move);
    node.addEventListener("pointerup", up);
    node.addEventListener("pointercancel", up);
    node.addEventListener("click", click, true);
    node.addEventListener("dblclick", reset);
    window.addEventListener("resize", fit);
    const grows = new ResizeObserver(fit);
    grows.observe(node);
    return () => {
      grows.disconnect();
      node.removeEventListener("pointerdown", down);
      node.removeEventListener("pointermove", move);
      node.removeEventListener("pointerup", up);
      node.removeEventListener("pointercancel", up);
      node.removeEventListener("click", click, true);
      node.removeEventListener("dblclick", reset);
      window.removeEventListener("resize", fit);
    };
  }, [ref, key]);
}
