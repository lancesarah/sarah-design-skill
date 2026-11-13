"use client";

import { useEffect, useId, useRef, useState, type ReactNode, type TransitionEvent } from "react";
import { Icon } from "../icons";
import { Button } from "./Button";
import { ConfirmDialog } from "./ConfirmDialog";
import { OverlayMenu, type MenuPoint } from "./OverlayMenu";

export function DetailPanel({
  label,
  hidden = false,
  id,
  onClose,
  onExited,
  actions,
  onEdit,
  children,
  name,
  noun = "record",
  onDeleted,
  menuAt,
  /** A new record puts the cursor in the first text field. Menus stay closed. */
  focusText = false,
}: {
  label: string;
  hidden?: boolean;
  id?: string;
  onClose?: () => void;
  onExited?: () => void;
  /** Extra controls in the right-hand group, ahead of the options menu. */
  actions?: ReactNode;
  /** Shows Edit after the actions. The panel stays view-only and the editor popup does the editing. */
  onEdit?: () => void;
  children: ReactNode;
  /** The named thing in the delete confirmation. */
  name?: string;
  noun?: string;
  onDeleted?: () => void;
  /** Opens this panel's more menu at the pointer. Same menu as the three-dot control. */
  menuAt?: MenuPoint | null;
  focusText?: boolean;
}) {
  const panelRef = useRef<HTMLElement>(null);
  const moreAnchor = useRef<HTMLButtonElement>(null);
  const menuId = useId().replace(/:/g, "");
  const [more, setMore] = useState(false);
  const [point, setPoint] = useState<{ x: number; y: number } | null>(null);
  const [confirm, setConfirm] = useState(false);

  const openedMenu = useRef(0);

  useEffect(() => {
    if (!hidden) return;
    setMore(false);
    setPoint(null);
  }, [hidden]);

  useEffect(() => {
    if (hidden || !focusText) return;
    const frame = requestAnimationFrame(() => {
      const root = panelRef.current?.querySelector(".todo-side-scroll");
      if (!root) return;
      const fields = root.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>("textarea, input");
      for (const field of fields) {
        if (field instanceof HTMLInputElement) {
          const type = field.type;
          if (type === "hidden" || type === "file" || type === "checkbox" || type === "radio" || type === "button" || type === "submit") continue;
        }
        if (field.disabled || field.closest("[hidden]")) continue;
        field.focus({ preventScroll: true });
        return;
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [hidden, focusText]);

  useEffect(() => {
    if (!menuAt || hidden || menuAt.token === openedMenu.current) return;
    openedMenu.current = menuAt.token;
    setPoint({ x: menuAt.x, y: menuAt.y });
    setMore(true);
  }, [menuAt, hidden]);

  useEffect(() => {
    if (!more) return;
    const close = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (moreAnchor.current?.contains(target)) return;
      if (target.closest(`[data-menu="${menuId}"]`)) return;
      setMore(false);
      setPoint(null);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [more, menuId]);

  useEffect(() => {
    if (hidden || !onClose) return;
    const close = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (panelRef.current?.contains(target)) return;
      // Menus render outside the panel, and a row click chooses the next record.
      if (target.closest(".menu, .sheet-line, .confirm-dialog, .editor-dialog, .photo-viewer")) return;
      onClose();
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [hidden, onClose]);

  const onTransitionEnd = (event: TransitionEvent<HTMLElement>) => {
    if (!onExited || !hidden || event.target !== event.currentTarget || event.propertyName !== "transform") return;
    const shifted = new DOMMatrix(getComputedStyle(event.currentTarget).transform).m41;
    if (shifted < event.currentTarget.offsetWidth) return;
    onExited();
  };

  function openAt(next: { x: number; y: number } | null) {
    setPoint(next);
    setMore(true);
  }

  return (
    <aside
      ref={panelRef}
      className="todo-side"
      id={id}
      aria-label={label}
      hidden={hidden}
      onTransitionEnd={onExited ? onTransitionEnd : undefined}
      onContextMenu={(event) => {
        if (confirm) return;
        const target = event.target;
        if (!(target instanceof Element)) return;
        if (target.closest(".menu, input, textarea, .confirm-dialog, .comment")) return;
        event.preventDefault();
        openAt({ x: event.clientX, y: event.clientY });
      }}
    >
      <header className="todo-side-bar">
        {onClose ? (
          <button className="note-more side-back" type="button" aria-label="Back" onClick={onClose}>
            <Icon name="chevron" size={14} />
          </button>
        ) : null}
        <span className="todo-side-actions">
          {actions}
          {onEdit ? (
            <Button variant="secondary" onClick={onEdit}>
              <Icon name="edit" size={14} />
              Edit
            </Button>
          ) : null}
          <span className="drop">
            <button
              ref={moreAnchor}
              className="note-more"
              type="button"
              aria-haspopup="menu"
              aria-expanded={more}
              aria-label="More"
              onClick={() => {
                setPoint(null);
                setMore((open) => !open);
              }}
            >
              <Icon name="dots" size={14} />
            </button>
            <OverlayMenu open={more} anchorRef={moreAnchor} marker={menuId} label="Options" point={point} align={point ? "start" : "end"}>
              <button
                className="menu-item danger"
                type="button"
                role="menuitem"
                onClick={() => {
                  setMore(false);
                  setPoint(null);
                  setConfirm(true);
                }}
              >
                <Icon name="trash" size={18} />
                Delete
              </button>
            </OverlayMenu>
          </span>
        </span>
      </header>
      <div className="todo-side-scroll">{children}</div>
      <ConfirmDialog
        open={confirm}
        name={name ?? label}
        noun={noun}
        onCancel={() => setConfirm(false)}
        onConfirm={() => {
          setConfirm(false);
          onDeleted?.();
        }}
      />
    </aside>
  );
}
