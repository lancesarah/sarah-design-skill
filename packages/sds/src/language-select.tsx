"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { Menu } from "@lance-live/sds";
import "@lance-live/sds/language-select.css";

export type LanguageOption = { value: string; label: string; flag?: string; abbreviation?: string };
export type LanguageSelectProps = {
  value: string;
  onValueChange: (value: string) => void;
  options: readonly LanguageOption[];
  label: string;
  disabled?: boolean;
  className?: string;
};

/** A shared language menu with native names, flags, short codes, and keyboard navigation. */
export function LanguageSelect({ value, onValueChange, options, label, disabled = false, className }: LanguageSelectProps) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLFieldSetElement>(null);
  useLayoutEffect(() => {
    if (!open || disabled) return;
    const trigger = root.current?.querySelector<HTMLButtonElement>(".trigger");
    const marker = root.current?.querySelector<HTMLElement>("[data-menu]")?.dataset.menu;
    const menu = Array.from(document.querySelectorAll<HTMLElement>(".menu[data-menu]")).find(node => node.dataset.menu === marker);
    if (!menu) return;
    const items = Array.from(menu.querySelectorAll<HTMLButtonElement>('[role="menuitemradio"]:not(:disabled)'));
    const selected = items.find(item => item.getAttribute("aria-checked") === "true") ?? items[0];
    selected?.focus();
    const navigate = (event: KeyboardEvent) => {
      const current = items.indexOf(document.activeElement as HTMLButtonElement);
      const next = event.key === "ArrowDown" ? (current + 1) % items.length
        : event.key === "ArrowUp" ? (current - 1 + items.length) % items.length
        : event.key === "Home" ? 0 : event.key === "End" ? items.length - 1 : null;
      if (next !== null && items.length) { event.preventDefault(); items[next]?.focus(); }
      if (event.key === "Escape") { event.preventDefault(); setOpen(false); trigger?.focus(); }
      if (event.key === "Tab") setOpen(false);
    };
    menu.addEventListener("keydown", navigate);
    return () => menu.removeEventListener("keydown", navigate);
  }, [open, disabled, value]);

  const content = (option: LanguageOption) => <span className="language-select-option">
    {option.flag ? <span aria-hidden="true">{option.flag}</span> : null}
    <span>{option.label}</span>
    <span className="menu-label-suffix">{option.abbreviation ?? option.value.toUpperCase()}</span>
  </span>;
  return <fieldset ref={root} disabled={disabled} aria-label={label} className={["sds language-select", className].filter(Boolean).join(" ")}
    onKeyDown={event => {
      if (!disabled && (event.key === "ArrowDown" || event.key === "ArrowUp") && (event.target as HTMLElement).closest(".trigger")) {
        event.preventDefault(); setOpen(true);
      }
    }}>
    <Menu open={open && !disabled} onOpenChange={next => { if (!disabled) setOpen(next); }} value={value} onValueChange={next => { if (!disabled) { onValueChange(next); setOpen(false); } }} triggerLabel={label} placeholder={label} placeholderIcon={null}
      items={options.map(option => ({ value: option.value, label: option.label, content: content(option), triggerContent: content(option) }))} />
  </fieldset>;
}
