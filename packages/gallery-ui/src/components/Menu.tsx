"use client";

import { Fragment, useEffect, useId, useRef, useState } from "react";
import { Icon, type IconName } from "../icons";
import { OverlayMenu } from "./OverlayMenu";

export type MenuItem = {
  value: string;
  label: string;
  icon?: IconName;
  danger?: boolean;
  description?: string;
  state?: "hover";
};

export type MenuProps = {
  items: MenuItem[];
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  placeholderIcon?: IconName;
  searchable?: boolean;
  open?: boolean;
  triggerState?: "hover";
  className?: string;
};

export function Menu({
  items,
  value,
  onValueChange,
  placeholder = "Anytime",
  placeholderIcon = "clock",
  searchable = false,
  open,
  triggerState,
  className,
}: MenuProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [query, setQuery] = useState("");
  const anchorRef = useRef<HTMLButtonElement>(null);
  const shown = open ?? internalOpen;
  const listId = useId();
  const selected = items.find((item) => item.value === value);
  const visible = items.filter((item) => item.label.toLowerCase().includes(query.trim().toLowerCase()));

  useEffect(() => {
    if (!shown || open !== undefined) return;
    const close = (event: PointerEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target?.closest?.(`[data-menu="${listId}"]`)) setInternalOpen(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [shown, open, listId]);

  return (
    <div className={["sds", "drop", className].filter(Boolean).join(" ")} data-menu={listId}>
      <button
        ref={anchorRef}
        className={["trigger", triggerState === "hover" || shown ? "is-hover" : ""].filter(Boolean).join(" ")}
        type="button"
        aria-expanded={shown}
        aria-haspopup="menu"
        onClick={() => {
          if (open === undefined) setInternalOpen((next) => !next);
        }}
      >
        <span className="pair">
          <Icon name={selected?.icon ?? placeholderIcon} size={14} />
          <span className={selected ? undefined : "dim"}>{selected?.label ?? placeholder}</span>
        </span>
        <Icon name="chevron" size={14} />
      </button>
      <OverlayMenu open={shown} anchorRef={anchorRef} marker={listId}>
        {searchable ? (
          <>
            <label className="menu-search">
              <Icon name="search" size={18} />
              <input
                type="search"
                value={query}
                placeholder="Search..."
                aria-label="Search options"
                onChange={(event) => setQuery(event.target.value)}
              />
            </label>
            <span className="menu-rule" />
          </>
        ) : null}
        {visible.map((item, index) => (
          <Fragment key={item.value}>
            {item.danger && index > 0 && !visible[index - 1]?.danger ? <span className="menu-rule" /> : null}
            <button
              className={["menu-item", item.danger ? "danger" : "", item.state === "hover" ? "is-hover" : ""].filter(Boolean).join(" ")}
              type="button"
              role={item.danger ? "menuitem" : "menuitemradio"}
              aria-checked={item.danger ? undefined : item.value === value}
              onClick={() => {
                onValueChange?.(item.value);
                if (open === undefined) setInternalOpen(false);
              }}
            >
              {item.icon ? <Icon name={item.icon} size={18} /> : null}
              {item.description ? (
                <span className="mode-copy">
                  <b>{item.label}</b>
                  <span>{item.description}</span>
                </span>
              ) : (
                item.label
              )}
              {item.danger ? null : <Icon name="check" size={14} className="check" />}
            </button>
          </Fragment>
        ))}
      </OverlayMenu>
    </div>
  );
}
