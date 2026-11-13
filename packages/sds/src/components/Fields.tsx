"use client";

import { useState, type ReactNode } from "react";
import { Icon } from "../icons";

export type SearchFieldProps = {
  placeholder?: string;
  label?: string;
  iconOnly?: boolean;
  state?: "hover";
  defaultValue?: string;
  onValueChange?: (value: string) => void;
};

export function SearchField({
  placeholder = "Search notes",
  label = placeholder,
  iconOnly = false,
  state,
  defaultValue = "",
  onValueChange,
  className,
}: SearchFieldProps & { className?: string }) {
  const [value, setValue] = useState(defaultValue);
  const write = (next: string) => {
    setValue(next);
    onValueChange?.(next);
  };
  const classes = ["sds", "search", iconOnly ? "search-icon" : "", state === "hover" ? "is-hover" : "", value ? "has-value" : "", className]
    .filter(Boolean)
    .join(" ");
  return (
    <form className={classes} role="search" onSubmit={(event) => event.preventDefault()}>
      <Icon name="search" size={18} />
      {iconOnly ? null : (
        <input
          type="search"
          placeholder={placeholder}
          aria-label={label}
          value={value}
          onChange={(event) => write(event.target.value)}
        />
      )}
      {iconOnly ? null : (
        <button className="clear" type="button" hidden={value.length === 0} aria-label="Clear search" onClick={() => write("")}>
          <Icon name="close" size={14} />
        </button>
      )}
    </form>
  );
}

export function ThemeSwitch({
  pressed,
  onPressedChange,
  label = "Dark mode",
}: {
  pressed: boolean;
  onPressedChange: (pressed: boolean) => void;
  label?: string;
}) {
  return (
    <button
      className="sds theme-switch"
      type="button"
      aria-pressed={pressed}
      aria-label={label}
      onClick={(event) => {
        event.currentTarget.classList.add("is-init");
        onPressedChange(!pressed);
      }}
    >
      <span className="theme-switch-label">{label}</span>
      <span className="theme-switch-track" aria-hidden="true">
        <span className="theme-switch-knob" />
      </span>
    </button>
  );
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return <span className="k">{children}</span>;
}
