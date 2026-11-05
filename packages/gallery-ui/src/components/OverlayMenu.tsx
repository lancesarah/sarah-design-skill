"use client";

import { useLayoutEffect, useRef, type CSSProperties, type PointerEvent as ReactPointerEvent, type ReactNode, type RefObject } from "react";
import { createPortal } from "react-dom";

const EDGE = 8;
const GAP = 4;

export type MenuPoint = { x: number; y: number; token: number };

let menuToken = 0;

export function menuPoint(x: number, y: number): MenuPoint {
  menuToken += 1;
  return { x, y, token: menuToken };
}

/** The same menu, opened at the pointer. Stays 8px inside the viewport. */
export function placeAtPoint(
  point: { x: number; y: number },
  menu: { width: number; height: number },
  view: { width: number; height: number } = { width: window.innerWidth, height: window.innerHeight },
) {
  const left = Math.max(EDGE, Math.min(point.x, view.width - menu.width - EDGE));
  const top = Math.max(EDGE, Math.min(point.y, view.height - menu.height - EDGE));
  return { top: Math.round(top), left: Math.round(left) };
}

export function placeMenu(
  trigger: DOMRect,
  menu: { width: number; height: number },
  placement: "below" | "side" = "below",
  align: "start" | "end" = "start",
): { top: number; left: number } | null {
  if (trigger.width <= 0 || trigger.height <= 0) return null;

  const viewW = window.innerWidth;
  const viewH = window.innerHeight;
  let top = placement === "side" ? trigger.top : trigger.bottom + GAP;
  let left = placement === "side" ? trigger.right + GAP : align === "end" ? trigger.right - menu.width : trigger.left;

  const triggerInView = trigger.bottom > 0 && trigger.top < viewH && trigger.right > 0 && trigger.left < viewW;
  if (triggerInView) {
    if (placement === "below" && top + menu.height > viewH - EDGE) {
      const above = trigger.top - GAP - menu.height;
      if (above >= EDGE) top = above;
    }
    if (placement === "side" && left + menu.width > viewW - EDGE) {
      const before = trigger.left - GAP - menu.width;
      if (before >= EDGE) left = before;
    }
    if (top + menu.height > viewH - EDGE) top = Math.max(EDGE, viewH - EDGE - menu.height);
    if (top < EDGE) top = EDGE;
    if (left + menu.width > viewW - EDGE) left = Math.max(EDGE, viewW - EDGE - menu.width);
    if (left < EDGE) left = EDGE;
  }
  return { top: Math.round(top), left: Math.round(left) };
}

function paintMenu(node: HTMLElement, next: { top: number; left: number } | null) {
  if (!next) {
    node.style.visibility = "hidden";
    node.style.top = "-10000px";
    return;
  }
  node.style.visibility = "visible";
  node.style.top = `${next.top}px`;
  node.style.left = `${next.left}px`;
}

export function OverlayMenu({
  open,
  anchorRef,
  className,
  children,
  label,
  placement = "below",
  marker,
  onPointerDown,
  point,
  align = "start",
}: {
  open: boolean;
  anchorRef: RefObject<HTMLElement | null>;
  className?: string;
  children: ReactNode;
  label?: string;
  placement?: "below" | "side";
  marker?: string;
  onPointerDown?: (event: ReactPointerEvent<HTMLDivElement>) => void;
  /** Right-click and long-press open this menu at the pointer. */
  point?: { x: number; y: number } | null;
  /** End lines the menu's right edge up with the trigger, so it opens into the panel. */
  align?: "start" | "end";
}) {
  const menuRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!open) return;
    const place = () => {
      const menu = menuRef.current;
      if (!menu) return;
      const anchor = anchorRef.current;
      const trigger = anchor && anchor.isConnected ? anchor.getBoundingClientRect() : null;
      const size = { width: menu.offsetWidth, height: menu.offsetHeight };
      const next = point
        ? placeAtPoint(point, size)
        : trigger && trigger.width > 0 && trigger.height > 0
          ? placeMenu(trigger, size, placement, align)
          : null;
      paintMenu(menu, next);
    };
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(place);
    };
    place();
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", place);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", place);
    };
  }, [open, anchorRef, placement, children, point, align]);

  if (!open || typeof document === "undefined") return null;

  const style: CSSProperties = {
    position: "fixed",
    zIndex: 80,
  };

  return createPortal(
    <div
      ref={menuRef}
      className={["sds", "menu", className].filter(Boolean).join(" ")}
      role="menu"
      aria-label={label}
      data-menu={marker}
      style={style}
      onPointerDown={onPointerDown}
    >
      {children}
    </div>,
    document.body,
  );
}
