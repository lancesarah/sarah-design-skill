"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Icon, type IconName } from "../icons";

export type ChipProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  icon?: boolean;
  filter?: { name: string; value: string };
  state?: "hover";
  glyph?: IconName;
};

export function Chip({ icon = false, filter, state, glyph = "plus", className, children, type = "button", ...rest }: ChipProps) {
  const iconOnly = Boolean(icon && !children);
  const classes = ["sds", "chip", iconOnly ? "chip-icon" : "", filter ? "chip-filter" : "", state === "hover" ? "is-hover" : "", className]
    .filter(Boolean)
    .join(" ");
  return (
    <button type={type} className={classes} {...rest}>
      {filter ? (
        <>
          <span className="chip-k">{filter.name}</span>: {filter.value} <Icon name={glyph} size={10} className="x" />
        </>
      ) : (
        <>
          {icon || glyph !== "plus" ? <Icon name={glyph} size={14} /> : null}
          {children as ReactNode}
        </>
      )}
    </button>
  );
}
