"use client";

import { useEffect, useRef, type ReactNode, type Ref } from "react";
import { createPortal } from "react-dom";
import { Icon } from "../icons";
import { Button } from "./Button";
import { Tabs, type TabItem } from "./Tabs";

export type EditorDialogTabs = {
  /** Names the tab list for assistive tech. */
  label: string;
  value: string;
  items: TabItem[];
  onValueChange: (value: string) => void;
};

export type EditorDialogProps = {
  /** The line above the title. Also names the dialog. */
  kicker: string;
  title: string;
  /** Without it the title is read-only text, and `titlePlaceholder` shows when it is empty. */
  onTitleChange?: (value: string) => void;
  titlePlaceholder?: string;
  titleRef?: Ref<HTMLInputElement>;
  /** A short line above the title, such as the room. */
  overline?: ReactNode;
  subtitle?: ReactNode;
  /** Makes the subtitle a text entry under the title, such as a description. `subtitle` is then its value. */
  onSubtitleChange?: (value: string) => void;
  subtitlePlaceholder?: string;
  subtitleLabel?: string;
  /** Turns the subtitle placeholder red, such as a required description left empty. */
  subtitleInvalid?: boolean;
  tabs?: EditorDialogTabs;
  /** Shows the delete button in the header. Ask before deleting. */
  onDelete?: () => void;
  deleteLabel?: string;
  onClose: () => void;
  /** Return true when Escape was used for something else, such as closing a menu, so the dialog stays open. */
  onEscape?: () => boolean;
  footer: ReactNode;
  /** `pills` fits the card to its content for an `EditorPills` body. */
  layout?: "fields" | "pills";
  /** Extra classes on the card. */
  className?: string;
  bodyRef?: Ref<HTMLDivElement>;
  /** The body for the current tab. It scrolls, and starts at the top when the tab changes. */
  children: ReactNode;
};

export function EditorDialog({
  kicker,
  title,
  onTitleChange,
  titlePlaceholder,
  titleRef,
  overline,
  subtitle,
  onSubtitleChange,
  subtitlePlaceholder,
  subtitleLabel = "Description",
  subtitleInvalid = false,
  tabs,
  onDelete,
  deleteLabel = "Delete",
  onClose,
  onEscape,
  footer,
  layout = "fields",
  className,
  bodyRef,
  children,
}: EditorDialogProps) {
  const closeRef = useRef(onClose);
  const escapeRef = useRef(onEscape);
  const cardRef = useRef<HTMLDivElement>(null);
  closeRef.current = onClose;
  escapeRef.current = onEscape;

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(event: KeyboardEvent) {
      if (event.key !== "Escape" || escapeRef.current?.()) return;
      closeRef.current();
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  // Opening puts the cursor at the end of the first text entry.
  useEffect(() => {
    const field = cardRef.current?.querySelector<
      HTMLInputElement | HTMLTextAreaElement
    >(
      'input:not([type="hidden"], [type="file"], [type="checkbox"], [type="radio"]), textarea',
    );
    if (!field) return;
    field.focus({ preventScroll: true });
    const end = field.value.length;
    field.setSelectionRange(end, end);
  }, []);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="editor-dialog"
      role="dialog"
      aria-modal="true"
      aria-label={kicker}
    >
      <button
        type="button"
        className="editor-dialog-scrim"
        aria-label="Close"
        onClick={() => closeRef.current()}
      />
      <div
        ref={cardRef}
        className={["editor-dialog-card", layout === "pills" && "is-pills", className].filter(Boolean).join(" ")}
      >
        <div className="editor-dialog-page">
          <header className="editor-dialog-head">
            <div className="editor-dialog-kicker">
              <p>{kicker}</p>
              <div className="editor-dialog-actions">
                {onDelete ? (
                  <Button variant="danger-light" onClick={onDelete}>
                    <Icon name="trash" size={14} />
                    {deleteLabel}
                  </Button>
                ) : null}
                <button
                  type="button"
                  className="editor-dialog-close"
                  aria-label="Close"
                  onClick={() => closeRef.current()}
                >
                  <Icon name="close" size={14} />
                </button>
              </div>
            </div>
            <div className="editor-dialog-name">
              {overline ? <p>{overline}</p> : null}
              {onTitleChange ? (
                <input
                  ref={titleRef}
                  className="editor-dialog-title"
                  aria-label="Name"
                  value={title}
                  placeholder={titlePlaceholder}
                  onChange={(event) => onTitleChange(event.target.value)}
                />
              ) : (
                <h2
                  className={
                    title
                      ? "editor-dialog-title"
                      : "editor-dialog-title is-quiet"
                  }
                >
                  {title || titlePlaceholder}
                </h2>
              )}
              {onSubtitleChange ? (
                <textarea
                  className={
                    subtitleInvalid
                      ? "editor-dialog-subtitle is-invalid"
                      : "editor-dialog-subtitle"
                  }
                  aria-label={subtitleLabel}
                  aria-invalid={subtitleInvalid || undefined}
                  rows={1}
                  value={typeof subtitle === "string" ? subtitle : ""}
                  placeholder={subtitlePlaceholder}
                  onChange={(event) => onSubtitleChange(event.target.value)}
                />
              ) : subtitle ? (
                <p>{subtitle}</p>
              ) : null}
            </div>
          </header>
          <div className="editor-dialog-main">
            {tabs ? (
              <Tabs
                label={tabs.label}
                value={tabs.value}
                onValueChange={tabs.onValueChange}
                items={tabs.items}
              />
            ) : (
              <hr className="editor-dialog-rule" />
            )}
            <div key={tabs?.value} ref={bodyRef} className="editor-dialog-body">
              {children}
            </div>
          </div>
        </div>
        <div className="editor-dialog-foot">{footer}</div>
      </div>
    </div>,
    document.body,
  );
}
