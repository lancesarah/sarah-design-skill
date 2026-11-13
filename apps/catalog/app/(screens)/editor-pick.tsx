"use client";

import { Button, Icon, OverlayMenu } from "@lance-live/sds";
import { useRef, type ReactNode } from "react";

/** A dropdown field in the editor popup's fields layout. The pill layout uses `EditorPill`. The menu holds `taskMenuItem` rows. */
export function EditorPick({
  open,
  onToggle,
  value,
  menu,
  chip,
  icon,
  quiet = false,
  invalid = false,
  variant = "secondary",
}: {
  open: boolean;
  onToggle: () => void;
  value: ReactNode;
  menu: ReactNode;
  chip?: boolean;
  icon?: "calendar" | "home" | "location" | "tag";
  /** The value is a placeholder, such as an unset location. */
  quiet?: boolean;
  /** A required choice left empty. Outlined in red. */
  invalid?: boolean;
  variant?: "secondary" | "tertiary";
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const trigger = chip ? (
    <Button ref={ref} variant={variant} aria-haspopup="menu" aria-expanded={open} aria-invalid={invalid || undefined} onClick={onToggle}>
      <span>{value}</span>
      <Icon name="chevron" size={14} />
    </Button>
  ) : (
    <button ref={ref} type="button" className={["pm-editor-input pm-editor-pick", quiet && "is-quiet", invalid && "is-invalid"].filter(Boolean).join(" ")} aria-haspopup="menu" aria-expanded={open} aria-invalid={invalid || undefined} onClick={onToggle}>
      <span className="pm-editor-pick-value">
        {icon ? <Icon name={icon} size={14} /> : null}
        <span>{value}</span>
      </span>
      <Icon name="chevron" size={14} />
    </button>
  );
  return (
    <>
      {trigger}
      <OverlayMenu open={open} anchorRef={ref} onPointerDown={(event) => event.stopPropagation()}>
        {menu}
      </OverlayMenu>
    </>
  );
}
