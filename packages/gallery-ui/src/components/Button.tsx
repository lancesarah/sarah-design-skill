"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";

export type ButtonVariant = "primary" | "secondary" | "danger";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  icon?: boolean;
  /** Paints the gallery hover specimen without a pointer. */
  state?: "hover";
};

function classes(variant: ButtonVariant, icon: boolean, state: ButtonProps["state"], disabled: boolean | undefined, className?: string) {
  return [
    "sds",
    "btn",
    variant === "secondary" ? "btn-secondary" : "",
    variant === "danger" ? "btn-danger" : "",
    icon ? "btn-icon" : "",
    state === "hover" && !disabled ? "is-hover" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", icon = false, state, className, type = "button", disabled, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled}
      className={classes(variant, icon, state, disabled, className)}
      {...rest}
    />
  );
});
