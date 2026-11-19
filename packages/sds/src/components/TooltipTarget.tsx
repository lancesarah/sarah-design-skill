"use client";

import { useId, type ReactNode } from "react";

type Placement = "above" | "below" | "right";

export function placeTooltip(host: HTMLElement, placement: Placement = "above") {
  const tip = host.querySelector<HTMLElement>(":scope > .tip");
  if (!tip) return;
  const rect = host.getBoundingClientRect();
  const gap = Number.parseFloat(getComputedStyle(host).getPropertyValue("--tip-gap")) || 8;
  tip.style.left = `${placement === "right" ? rect.right + gap : rect.left + rect.width / 2}px`;
  tip.style.top = `${placement === "right" ? rect.top + rect.height / 2 : placement === "below" ? rect.bottom + gap : rect.top - gap}px`;
  // Measure the visible, wrapped tooltip rather than its hidden popover box.
  const bounds = tip.getBoundingClientRect();
  if (bounds.width && bounds.height) {
    const edge = 8;
    const shiftX = bounds.left < edge ? edge - bounds.left : bounds.right > window.innerWidth - edge ? window.innerWidth - edge - bounds.right : 0;
    const shiftY = bounds.top < edge ? edge - bounds.top : bounds.bottom > window.innerHeight - edge ? window.innerHeight - edge - bounds.bottom : 0;
    tip.style.left = `${Number.parseFloat(tip.style.left) + shiftX}px`;
    tip.style.top = `${Number.parseFloat(tip.style.top) + shiftY}px`;
  }
  return tip;
}

export function showTooltip(host: HTMLElement, placement?: Placement) {
  const tip = placeTooltip(host, placement);
  if (tip?.isConnected && tip.showPopover && !tip.matches(":popover-open")) {
    tip.showPopover();
    placeTooltip(host, placement);
  }
}

export function hideTooltip(host: HTMLElement) {
  const tip = host.querySelector<HTMLElement>(":scope > .tip");
  if (tip?.hidePopover && tip.matches(":popover-open")) tip.hidePopover();
}

/** A tooltip on a text label, icon or control. Make the wrapper focusable only if it has no focusable child. */
export function TooltipTarget({ label, className, focusable, placement = "above", children }: {
  label: string;
  className?: string;
  focusable?: boolean;
  placement?: Placement;
  children: ReactNode;
}) {
  const id = useId();
  return <span
    className={["tip-host", "tooltip-target", className].filter(Boolean).join(" ")}
    data-tip-placement={placement}
    tabIndex={focusable ? 0 : undefined}
    aria-label={focusable ? label : undefined}
    aria-describedby={focusable ? id : undefined}
    onPointerEnter={event => showTooltip(event.currentTarget, placement)}
    onPointerLeave={event => hideTooltip(event.currentTarget)}
    onFocus={event => showTooltip(event.currentTarget, placement)}
    onBlur={event => hideTooltip(event.currentTarget)}
    onKeyDown={event => { if (event.key === "Escape") hideTooltip(event.currentTarget); }}
  >
    {children}
    <span id={id} className="tip" role="tooltip" popover="manual">{label}</span>
  </span>;
}
