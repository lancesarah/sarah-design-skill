"use client";

import { useLayoutEffect, useRef, type RefObject } from "react";

/** The same pill placement the HTML pages run in gallery.js. */
export function useHtmlSlide(trackRef: RefObject<HTMLElement | null>, pillRef: RefObject<HTMLElement | null>, selector: string, value: string) {
  const ready = useRef(false);

  useLayoutEffect(() => {
    const track = trackRef.current;
    const pill = pillRef.current;
    if (!track || !pill) return;
    const items = () => [...track.querySelectorAll<HTMLElement>(`:scope > ${selector}`)];
    const place = (animate: boolean) => {
      const chosen = items().find((el) => el.getAttribute("aria-selected") === "true");
      if (!chosen?.offsetWidth) {
        pill.style.opacity = "0";
        return;
      }
      const x = chosen.offsetLeft;
      const w = chosen.offsetWidth;
      const prev = parseFloat(pill.style.left) || 0;
      const snap =
        !ready.current ||
        !animate ||
        document.documentElement.classList.contains("is-keys") ||
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;
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
    place(ready.current);
    const ro = new ResizeObserver(() => place(false));
    ro.observe(track);
    for (const el of items()) ro.observe(el);
    return () => ro.disconnect();
  }, [pillRef, selector, trackRef, value]);
}
