"use client";

import { useLayoutEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";

/** Every widget in its place on Home. A hidden widget keeps its place for when it comes back. */
export type Layout = { order: string[]; hidden: Set<string> };

const ITEM = "[data-widget-id]";
/** How close to the top or bottom of the page the pointer comes before the page scrolls. */
const EDGE = 64;
/** The pointer travels this far before a press becomes a drag, so a click still clicks. */
const SLOP = 4;

export const visibleIds = (layout: Layout) => layout.order.filter((id) => !layout.hidden.has(id));

/** Puts `id` before `target`, or after it, in the full order. With no target it goes last. */
export function place(layout: Layout, id: string, target: string | null, after = false): Layout {
  const order = layout.order.filter((item) => item !== id);
  const at = target === null ? order.length : order.indexOf(target) + (after ? 1 : 0);
  order.splice(at, 0, id);
  const hidden = new Set(layout.hidden);
  hidden.delete(id);
  return { order, hidden };
}

function scrollerOf(from: Element) {
  for (let el = from.parentElement; el; el = el.parentElement) {
    const { overflowY } = getComputedStyle(el);
    if ((overflowY === "auto" || overflowY === "scroll") && el.scrollHeight > el.clientHeight) return el;
  }
  return document.scrollingElement as HTMLElement;
}

const inside = (box: DOMRect, x: number, y: number) => x >= box.left && x <= box.right && y >= box.top && y <= box.bottom;

/**
 * Drag a widget to a new place on Home.
 * The other widgets move aside while the pointer travels. The widget lands in the slot it left open.
 * Escape puts everything back.
 */
export function useWidgetDrag(layout: Layout, commit: (layout: Layout) => void) {
  const boardRef = useRef<HTMLDivElement>(null);
  const [draft, setDraft] = useState<Layout | null>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  const rects = useRef(new Map<string, DOMRect>());
  const layoutRef = useRef(layout);
  layoutRef.current = layout;
  const commitRef = useRef(commit);
  commitRef.current = commit;

  const snapshot = () => {
    rects.current = new Map();
    boardRef.current?.querySelectorAll<HTMLElement>(ITEM).forEach((el) => rects.current.set(el.dataset.widgetId ?? "", el.getBoundingClientRect()));
  };

  useLayoutEffect(() => {
    const before = rects.current;
    rects.current = new Map();
    const board = boardRef.current;
    if (!before.size || !board || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const easing = getComputedStyle(board).getPropertyValue("--ease-out").trim() || "ease-out";
    board.querySelectorAll<HTMLElement>(ITEM).forEach((el) => {
      const was = before.get(el.dataset.widgetId ?? "");
      if (!was) return;
      const now = el.getBoundingClientRect();
      const dx = was.left - now.left;
      const dy = was.top - now.top;
      if (Math.abs(dx) < 1 && Math.abs(dy) < 1) return;
      el.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: "none" }], { duration: 300, easing });
    });
  }, [draft, layout]);

  const start = (event: ReactPointerEvent<HTMLElement>, id: string) => {
    if (event.button !== 0 || (event.target as Element).closest(".home-edit-remove")) return;
    const board = boardRef.current;
    if (!board) return;
    const source = event.currentTarget;
    const base = layoutRef.current;
    const scroller = scrollerOf(board);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const origin = { x: event.clientX, y: event.clientY };
    const pointer = { ...origin };
    let current = base;
    let ghost: HTMLElement | null = null;
    let grab = { x: 0, y: 0 };
    /** The widget it just traded places with. It may still sit under the pointer, so it does not trade back. */
    let traded: string | null = null;
    let frame = 0;

    const show = (next: Layout) => {
      if (next === current) return;
      snapshot();
      current = next;
      setDraft(next);
    };

    const aim = () => {
      const { x, y } = pointer;
      if (!inside(board.getBoundingClientRect(), x, y)) {
        traded = null;
        return;
      }
      const hit = [...board.querySelectorAll<HTMLElement>(ITEM)].find((el) => inside(el.getBoundingClientRect(), x, y))?.dataset.widgetId;
      if (!hit) return;
      if (hit === id) {
        traded = null;
        return;
      }
      if (hit === traded) return;
      const visible = visibleIds(current);
      show(place(current, id, hit, visible.indexOf(id) < visible.indexOf(hit)));
      traded = hit;
    };

    /** Aims once per frame, however many pointer events land in it, then scrolls near an edge. */
    const tick = () => {
      frame = 0;
      aim();
      if (!ghost) return;
      const view = scroller.getBoundingClientRect();
      const top = Math.max(view.top, 0);
      const bottom = Math.min(view.bottom, window.innerHeight);
      const { y } = pointer;
      const by = y < top + EDGE ? -(top + EDGE - y) / 3 : y > bottom - EDGE && y < bottom ? (y - (bottom - EDGE)) / 3 : 0;
      if (!by) return;
      scroller.scrollTop += by;
      frame = requestAnimationFrame(tick);
    };

    const lift = () => {
      const box = source.getBoundingClientRect();
      grab = { x: origin.x - box.left, y: origin.y - box.top };
      ghost = source.cloneNode(true) as HTMLElement;
      ghost.querySelector(".home-edit-remove")?.remove();
      ghost.classList.add("home-drag-ghost");
      ghost.setAttribute("aria-hidden", "true");
      ghost.removeAttribute("data-widget-id");
      ghost.style.width = `${box.width}px`;
      (board.closest(".home-page") ?? document.body).append(ghost);
      document.body.classList.add("is-widget-dragging");
      setDragging(id);
    };

    const onMove = (ev: PointerEvent) => {
      pointer.x = ev.clientX;
      pointer.y = ev.clientY;
      if (!ghost) {
        if (Math.hypot(pointer.x - origin.x, pointer.y - origin.y) < SLOP) return;
        lift();
      }
      ghost!.style.transform = `translate(${pointer.x - grab.x}px, ${pointer.y - grab.y}px)`;
      if (!frame) frame = requestAnimationFrame(tick);
    };

    const stop = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", drop);
      window.removeEventListener("pointercancel", cancel);
      window.removeEventListener("keydown", onKey, true);
      cancelAnimationFrame(frame);
      document.body.classList.remove("is-widget-dragging");
    };

    /** The ghost flies into the open slot once the page has its final order. */
    const settle = () => {
      const lifted = ghost;
      if (!lifted) return setDragging(null);
      const done = () => {
        lifted.remove();
        setDragging(null);
      };
      requestAnimationFrame(() => {
        const slot = board.querySelector<HTMLElement>(`[data-widget-id="${id}"]`);
        if (reduce) return done();
        slot?.getAnimations().forEach((run) => run.finish());
        const easing = getComputedStyle(board).getPropertyValue("--ease-out").trim() || "ease-out";
        const box = slot?.getBoundingClientRect();
        const end = box
          ? { transform: `translate(${box.left}px, ${box.top}px) scale(${box.width / lifted.offsetWidth})`, opacity: 1 }
          : { transform: lifted.style.transform, opacity: 0 };
        lifted.animate([{ transform: lifted.style.transform, opacity: 1 }, end], { duration: box ? 200 : 160, easing, fill: "forwards" }).onfinish = done;
      });
    };

    function drop() {
      if (ghost && frame) aim();
      stop();
      if (!ghost) return;
      const eat = (ev: MouseEvent) => ev.stopPropagation();
      window.addEventListener("click", eat, true);
      setTimeout(() => window.removeEventListener("click", eat, true), 0);
      snapshot();
      if (current !== base) commitRef.current(current);
      setDraft(null);
      settle();
    }

    function cancel() {
      stop();
      snapshot();
      setDraft(null);
      settle();
    }

    function onKey(ev: KeyboardEvent) {
      if (ev.key !== "Escape" || !ghost) return;
      ev.stopImmediatePropagation();
      cancel();
    }

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", drop);
    window.addEventListener("pointercancel", cancel);
    window.addEventListener("keydown", onKey, true);
  };

  return { boardRef, view: draft ?? layout, dragging, start };
}
