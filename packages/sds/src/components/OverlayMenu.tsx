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

function verticalSpace(trigger: DOMRect, height: number) {
  const below = Math.max(0, window.innerHeight - trigger.bottom - GAP - EDGE);
  const above = Math.max(0, trigger.top - GAP - EDGE);
  const opensAbove = height > below && above > below;
  return { opensAbove, available: opensAbove ? above : below };
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
    if (placement === "below") {
      const { opensAbove, available } = verticalSpace(trigger, menu.height);
      if (opensAbove) top = trigger.top - GAP - Math.min(menu.height, available);
    }
    if (placement === "side" && left + menu.width > viewW - EDGE) {
      const before = trigger.left - GAP - menu.width;
      if (before >= EDGE) left = before;
    }
    if (placement === "side" && top + menu.height > viewH - EDGE) top = Math.max(EDGE, viewH - EDGE - menu.height);
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
  role = "menu",
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
  role?: "menu" | "dialog";
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
      menu.style.width = "";
      menu.style.maxWidth = "";
      if (!point && trigger && trigger.width > menu.offsetWidth) {
        const width = `${Math.round(trigger.width)}px`;
        menu.style.width = width;
        menu.style.maxWidth = width;
      }
      menu.style.maxHeight = "";
      menu.style.overflowY = "";
      const size = { width: menu.offsetWidth, height: menu.offsetHeight };
      if (!point && trigger && placement === "below") {
        menu.style.maxHeight = `${verticalSpace(trigger, size.height).available}px`;
        menu.style.boxSizing = "border-box";
        menu.style.overflowY = "auto";
      }
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
    // Modal hosts can disable body pointer events. The portaled menu is still interactive.
    pointerEvents: "auto",
  };

  return createPortal(
    <div
      ref={menuRef}
      className={["sds", "menu", className].filter(Boolean).join(" ")}
      role={role}
      aria-label={label}
      data-menu={marker}
      style={style}
      onPointerDown={onPointerDown}
      onWheel={event => event.stopPropagation()}
      onTouchMove={event => event.stopPropagation()}
    >
      {children}
    </div>,
    document.body,
  );
}
