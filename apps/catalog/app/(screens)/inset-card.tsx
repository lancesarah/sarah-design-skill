"use client";

import { Icon } from "@lance-live/gallery-ui";
import { useLayoutEffect, useRef, type HTMLAttributes, type ReactNode } from "react";

const EASE_OUT = "cubic-bezier(0.23, 1, 0.32, 1)";
const OPEN_MS = 240;
const CLOSE_MS = 192;

/** Grey shell with a white inset. The title row and the chevron are the same on every card. */
export function InsetCard({
  title,
  actions,
  open = true,
  onOpenChange,
  bodyId,
  children,
  className,
  ...rest
}: {
  title: ReactNode;
  /** Sits immediately before the chevron. The chevron stays last. */
  actions?: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  bodyId?: string;
  children: ReactNode;
} & Omit<HTMLAttributes<HTMLElement>, "title">) {
  const clip = useRef<HTMLDivElement>(null);
  const skip = useRef(true);
  const shown = useRef(open ? 1 : 0);

  useLayoutEffect(() => {
    const el = clip.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const settle = () => {
      el.style.height = open ? "" : "0px";
      el.style.opacity = "";
      el.style.overflow = open ? "" : "hidden";
    };
    if (skip.current || reduce) {
      skip.current = false;
      shown.current = open ? 1 : 0;
      settle();
      return;
    }

    const from = el.getBoundingClientRect().height;
    const fromOpacity = shown.current;
    el.style.height = "auto";
    const to = open ? el.getBoundingClientRect().height : 0;
    const toOpacity = open ? 1 : 0;
    shown.current = toOpacity;
    if (from === to) {
      settle();
      return;
    }

    el.style.height = `${from}px`;
    el.style.overflow = "hidden";
    const anim = el.animate(
      [
        { height: `${from}px`, opacity: fromOpacity },
        { height: `${to}px`, opacity: toOpacity },
      ],
      { duration: open ? OPEN_MS : CLOSE_MS, easing: EASE_OUT, fill: "forwards" },
    );
    anim.id = "inset-card";
    let dropped = false;
    anim.onfinish = () => {
      if (dropped) return;
      settle();
      anim.cancel();
    };
    return () => {
      dropped = true;
      const height = el.getBoundingClientRect().height;
      shown.current = Number(getComputedStyle(el).opacity);
      anim.cancel();
      el.style.height = `${height}px`;
      el.style.opacity = String(shown.current);
      el.style.overflow = "hidden";
    };
  }, [open]);

  return (
    <article className={["inset-card", open ? "is-open" : "", className].filter(Boolean).join(" ")} {...rest}>
      <header className="inset-card-head">
        <div className="inset-card-title">{title}</div>
        <div className="inset-card-tools">
          {actions}
          <button
            className="inset-card-chevron"
            type="button"
            aria-expanded={open}
            aria-controls={bodyId}
            aria-label={open ? "Collapse" : "Expand"}
            onClick={() => onOpenChange?.(!open)}
          >
            <Icon name="chevron" size={14} />
          </button>
        </div>
      </header>
      <div className="inset-card-clip" ref={clip} inert={open ? undefined : true}>
        <div className="inset-card-body" id={bodyId}>
          {children}
        </div>
      </div>
    </article>
  );
}
