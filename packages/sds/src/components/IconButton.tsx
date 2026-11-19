"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { Icon, type IconName } from "../icons";

export type IconButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> & {
  icon: IconName;
  /** Required: the button has no visible label. */
  "aria-label": string;
  size?: 14 | 16 | 18;
  /** Quiet keeps the full target clear and changes only the glyph on hover. */
  variant?: "surface" | "quiet";
  state?: "hover";
};

/** A grey tool in a header or panel bar: panel toggles, expand, pin, history. */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { icon, size = 18, variant = "surface", state, className, type = "button", ...rest },
  ref,
) {
  const classes = ["sds", "side-icon", variant === "quiet" ? "is-quiet" : "", state === "hover" ? "is-hover" : "", className].filter(Boolean).join(" ");
  return (
    <button ref={ref} type={type} className={classes} {...rest}>
      <Icon name={icon} size={size} />
    </button>
  );
});
