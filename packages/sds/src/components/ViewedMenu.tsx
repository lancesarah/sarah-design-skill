"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Icon } from "../icons";
import { OverlayMenu } from "./OverlayMenu";

export type Viewer = {
  name: string;
  src?: string;
};

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2);
}

function ViewRow({ person }: { person: Viewer }) {
  return (
    <div className="view-row">
      {person.src ? (
        <img className="avatar mini" src={person.src} alt="" />
      ) : (
        <span className="avatar mini">{initials(person.name)}</span>
      )}
      {person.name}
    </div>
  );
}

export function ViewedMenu({
  viewed,
  notViewed,
  open,
  className,
}: {
  viewed: readonly Viewer[];
  notViewed: readonly Viewer[];
  /** Force the menu open. Omit it and the chip toggles. */
  open?: boolean;
  className?: string;
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const anchorRef = useRef<HTMLButtonElement>(null);
  const listId = useId();
  const shown = open ?? internalOpen;
  const total = viewed.length + notViewed.length;

  useEffect(() => {
    if (!shown || open !== undefined) return;
    const close = (event: PointerEvent) => {
      const target = event.target as HTMLElement | null;
      if (anchorRef.current?.contains(target)) return;
      if (target?.closest?.(`[data-menu="${listId}"]`)) return;
      setInternalOpen(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [shown, open, listId]);

  return (
    <div className={["sds", "drop", "view-edit", className].filter(Boolean).join(" ")}>
      <button
        ref={anchorRef}
        className="sds chip view-pick"
        type="button"
        aria-expanded={shown}
        aria-haspopup="menu"
        aria-label="Viewed"
        onClick={() => {
          if (open === undefined) setInternalOpen((next) => !next);
        }}
      >
        <Icon name="eye" size={18} className="view-eye" />
        <span className="view-count">
          {viewed.length}/{total}
        </span>
        <Icon name="chevron" size={10} className="meta-chevron" />
      </button>
      <OverlayMenu open={shown} anchorRef={anchorRef} className="view-menu" label="Viewed" marker={listId}>
        {viewed.length ? (
          <>
            <p className="menu-k">Viewed</p>
            {viewed.map((person) => (
              <ViewRow key={person.name} person={person} />
            ))}
          </>
        ) : null}
        {notViewed.length ? (
          <>
            <p className="menu-k">Not viewed</p>
            {notViewed.map((person) => (
              <ViewRow key={person.name} person={person} />
            ))}
          </>
        ) : null}
      </OverlayMenu>
    </div>
  );
}
