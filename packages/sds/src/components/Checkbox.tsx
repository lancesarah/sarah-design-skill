"use client";

import { forwardRef, useState, type ButtonHTMLAttributes, type ReactNode } from "react";
import { Icon } from "../icons";

export type CheckboxProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onChange" | "children"> & {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  /** Paints the gallery hover specimen without a pointer. */
  state?: "hover";
  /** The large box, for a row picked from a list of people. The box sits alone at the end of that row. */
  size?: "lg";
  children?: ReactNode;
};

export const Checkbox = forwardRef<HTMLButtonElement, CheckboxProps>(function Checkbox(
  { checked, defaultChecked = false, onCheckedChange, state, size, className, children, disabled, onClick, type = "button", ...rest },
  ref,
) {
  const [internal, setInternal] = useState(defaultChecked);
  const on = checked ?? internal;

  return (
    <button
      ref={ref}
      type={type}
      role="checkbox"
      aria-checked={on}
      disabled={disabled}
      className={["sds", "check", size === "lg" ? "check-lg" : "", state === "hover" && !disabled ? "is-hover" : "", className].filter(Boolean).join(" ")}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented || disabled) return;
        const next = !on;
        if (checked === undefined) setInternal(next);
        onCheckedChange?.(next);
      }}
      {...rest}
    >
      <span className="check-box">{on ? <Icon name="check" size={size === "lg" ? 12 : 10} /> : null}</span>
      {children}
    </button>
  );
});
