"use client";

import { Icon } from "@lance-live/gallery-ui";
import type { HTMLAttributes, ReactNode } from "react";

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
  return (
    <article className={["inset-card", className].filter(Boolean).join(" ")} {...rest}>
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
      {open ? (
        <div className="inset-card-body" id={bodyId}>
          {children}
        </div>
      ) : null}
    </article>
  );
}
