"use client";

import { Fragment, useEffect, useId, useRef, useState, type ReactNode } from "react";
import { Icon, type IconName } from "../icons";
import { OverlayMenu } from "./OverlayMenu";

export type MenuItem = {
  value: string;
  label: string;
  /** Shared row content for choices such as a Person. The label still drives search. */
  content?: ReactNode;
  /** Optional content for the selected value in the trigger. */
  triggerContent?: ReactNode;
  /** Secondary text shown after the label in the trigger and options. */
  suffix?: string;
  /** Optional heading and divider before this option. */
  section?: string;
  dividerBefore?: boolean;
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
  /** Set to null for a plain selection. Individual options can still specify an icon. */
  placeholderIcon?: IconName | null;
  searchable?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  triggerLabel?: string;
  invalid?: boolean;
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
  onOpenChange,
  triggerLabel,
  invalid,
  triggerState,
  className,
}: MenuProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [query, setQuery] = useState("");
  const anchorRef = useRef<HTMLButtonElement>(null);
  const shown = open ?? internalOpen;
  const listId = useId();
  const selected = items.find((item) => item.value === value);
  const triggerIcon = selected?.icon ?? placeholderIcon;
  const visible = items.filter((item) => item.label.toLowerCase().includes(query.trim().toLowerCase()));

  useEffect(() => {
    if (!shown || (open !== undefined && !onOpenChange)) return;
    const close = (event: PointerEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target?.closest?.(`[data-menu="${listId}"]`)) {
        if (open === undefined) setInternalOpen(false);
        onOpenChange?.(false);
      }
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [shown, open, listId, onOpenChange]);

  return (
    <div className={["sds", "drop", className].filter(Boolean).join(" ")} data-menu={listId}>
      <button
        ref={anchorRef}
        className={["trigger", triggerState === "hover" || shown ? "is-hover" : ""].filter(Boolean).join(" ")}
        type="button"
        aria-expanded={shown}
        aria-haspopup="menu"
        aria-label={triggerLabel}
        aria-invalid={invalid || undefined}
        onClick={() => {
          if (open === undefined) setInternalOpen((next) => !next);
          onOpenChange?.(!shown);
        }}
      >
        <span className="pair">
          {selected?.triggerContent ?? <>
            {triggerIcon ? <Icon name={triggerIcon} size={14} /> : null}
            <span className={selected ? undefined : "dim"}>{selected?.label ?? placeholder}{selected?.suffix ? <span className="menu-label-suffix"> · {selected.suffix}</span> : null}</span>
          </>}
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
            {item.dividerBefore || (item.danger && index > 0 && !visible[index - 1]?.danger) ? <span className="menu-rule" role="separator" /> : null}
            {item.section ? <span className="menu-section-title">{item.section}</span> : null}
            <button
              className={["menu-item", item.danger ? "danger" : "", item.state === "hover" ? "is-hover" : ""].filter(Boolean).join(" ")}
              type="button"
              role={item.danger ? "menuitem" : "menuitemradio"}
              aria-checked={item.danger ? undefined : item.value === value}
              onClick={() => {
                onValueChange?.(item.value);
                if (open === undefined) setInternalOpen(false);
                onOpenChange?.(false);
              }}
            >
              {!item.content && item.icon ? <Icon name={item.icon} size={18} /> : null}
              {item.content ?? (item.description ? (
                <span className="mode-copy">
                  <b>{item.label}</b>
                  <span>{item.description}</span>
                </span>
              ) : (
                <span>{item.label}{item.suffix ? <span className="menu-label-suffix"> · {item.suffix}</span> : null}</span>
              ))}
              {item.danger ? null : <Icon name="check" size={14} className="check" />}
            </button>
          </Fragment>
        ))}
      </OverlayMenu>
    </div>
  );
}
