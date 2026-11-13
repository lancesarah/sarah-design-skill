"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Icon, type IconName } from "../icons";

export type TextIconProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  icon?: IconName;
  size?: "md" | "sm";
  tone?: "default" | "delete";
  state?: "hover";
};

export function TextIcon({
  icon = "share",
  size = "md",
  tone = "default",
  state,
  className,
  children,
  type = "button",
  ...rest
}: TextIconProps) {
  const classes = [
    "sds",
    "text-icon",
    size === "sm" ? "sm" : "",
    tone === "delete" ? "btn-delete" : "",
    state === "hover" ? "is-hover" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");
  return (
    <button type={type} className={classes} {...rest}>
      <Icon name={icon} size={size === "sm" || tone !== "default" ? 14 : 18} />
      {children as ReactNode}
    </button>
  );
}
