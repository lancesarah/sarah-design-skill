"use client";

import { useEffect, useLayoutEffect, useRef, type RefObject } from "react";

const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Sliding fill shared by the segmented control and the primary tabs.
 * The edge facing the new option leads. A resize during that glide does not
 * snap it back. When a label or count changes, each option eases to the new
 * width. If the row does not fit, it scrolls, with a soft fade on the side
 * that still has more.
 */
export function useSlidePill({
  scrollRef,
  trackRef,
  pillRef,
  itemSelector,
  enabled,
  value,
}: {
  scrollRef: RefObject<HTMLElement | null>;
  trackRef: RefObject<HTMLElement | null>;
  pillRef: RefObject<HTMLElement | null>;
  itemSelector: string;
  enabled: boolean;
  value: string;
}) {
  const ready = useRef(false);
  const gliding = useRef(false);
  const glideTimer = useRef(0);
  const placed = useRef<string | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(glideTimer.current), []);

  useLayoutEffect(() => {
    if (!enabled) return;
    const scroll = scrollRef.current;
    const track = trackRef.current;
    const pill = pillRef.current;
    if (!scroll || !track || !pill) return;

    const items = () => [...track.querySelectorAll<HTMLElement>(`:scope > ${itemSelector}`)];

    const measure = () => {
      const els = items();
      const first = els[0];
      if (!first) return;
      const cs = getComputedStyle(first);
      const pad = (parseFloat(cs.paddingLeft) || 0) + (parseFloat(cs.paddingRight) || 0);
      for (const el of els) {
        const content = el.querySelector<HTMLElement>(":scope > .slide-content");
        if (!content?.offsetWidth) continue;
        const width = `${Math.ceil(content.offsetWidth + pad)}px`;
        if (el.style.width !== width) el.style.width = width;
      }
    };

    const place = (animate: boolean) => {
      const chosen = items().find((el) => el.getAttribute("aria-selected") === "true");
      if (!chosen?.offsetWidth) {
        pill.style.opacity = "0";
        return;
      }
      const x = chosen.offsetLeft;
      const w = chosen.offsetWidth;
      const prev = parseFloat(pill.style.left) || 0;
      const keys = document.documentElement.classList.contains("is-keys");
      const snap = !ready.current || (!animate && !gliding.current) || keys || reduced();
      if (!snap && x !== prev) pill.dataset.dir = x > prev ? "right" : "left";
      if (snap) pill.style.transition = "none";
      pill.style.opacity = "1";
      pill.style.top = `${chosen.offsetTop}px`;
      pill.style.height = `${chosen.offsetHeight}px`;
      pill.style.left = `${x}px`;
      pill.style.right = `${track.clientWidth - x - w}px`;
      if (snap) {
        ready.current = true;
        void pill.offsetWidth;
        pill.style.transition = "";
      }
    };

    const fades = () => {
      const max = scroll.scrollWidth - scroll.clientWidth;
      const overflow = max > 1;
      const start = overflow && scroll.scrollLeft > 1;
      const end = overflow && scroll.scrollLeft < max - 1;
      scroll.toggleAttribute("data-overflow", overflow);
      scroll.style.setProperty("--slide-fade-l", start ? "24px" : "0px");
      scroll.style.setProperty("--slide-fade-r", end ? "24px" : "0px");
      const edge = scroll.parentElement;
      if (edge?.classList.contains("scroll-fade")) {
        edge.classList.toggle("is-fade-start", start);
        edge.classList.toggle("is-fade-end", end);
      }
    };

    const reveal = (smooth: boolean) => {
      const chosen = items().find((el) => el.getAttribute("aria-selected") === "true");
      if (!chosen || scroll.scrollWidth <= scroll.clientWidth + 1) return;
      const fade = 16;
      const viewLeft = scroll.scrollLeft;
      const viewRight = viewLeft + scroll.clientWidth;
      const itemLeft = chosen.offsetLeft;
      const itemRight = itemLeft + chosen.offsetWidth;
      let next = viewLeft;
      if (itemLeft - fade < viewLeft) next = Math.max(0, itemLeft - fade);
      else if (itemRight + fade > viewRight) next = Math.min(scroll.scrollWidth - scroll.clientWidth, itemRight + fade - scroll.clientWidth);
      if (Math.abs(next - viewLeft) < 1) return;
      scroll.scrollTo({ left: next, behavior: smooth && !reduced() ? "smooth" : "auto" });
    };

    const first = placed.current === undefined;
    const changed = placed.current !== value;
    placed.current = value;
    if (changed && !first) {
      gliding.current = true;
      window.clearTimeout(glideTimer.current);
      glideTimer.current = window.setTimeout(() => {
        gliding.current = false;
      }, 240);
    }

    measure();
    place(!first && changed);
    fades();
    reveal(!first && changed);
    const arm = requestAnimationFrame(() => scroll.setAttribute("data-ready", ""));

    let frame = 0;
    const ro = new ResizeObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        measure();
        place(false);
        fades();
      });
    });
    scroll.addEventListener("scroll", fades, { passive: true });
    ro.observe(scroll);
    ro.observe(track);
    for (const el of items()) {
      ro.observe(el);
      const content = el.querySelector(".slide-content");
      if (content) ro.observe(content);
    }

    return () => {
      scroll.removeEventListener("scroll", fades);
      ro.disconnect();
      cancelAnimationFrame(frame);
      cancelAnimationFrame(arm);
    };
  }, [enabled, itemSelector, pillRef, scrollRef, trackRef, value]);
}
