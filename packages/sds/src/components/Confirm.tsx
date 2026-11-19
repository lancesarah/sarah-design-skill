"use client";

import type { MouseEvent, ReactNode } from "react";
import { Button } from "./Button";

export type ConfirmProps = {
  name: string;
  noun?: string;
  /** The destructive verb, on the title and the confirming button: Delete, Remove, Unassign. */
  action?: ReactNode;
  /** Replaces the default title, for an action that is not about one named thing. */
  title?: ReactNode;
  /** Replaces the line under the title when the action is not a permanent delete. */
  detail?: ReactNode;
  children?: ReactNode;
  confirmLabel?: ReactNode;
  cancelLabel?: ReactNode;
  busy?: boolean;
  disabled?: boolean;
  cancelDisabled?: boolean;
  tone?: "danger" | "primary";
  onCancel?: () => void;
  onConfirm?: (event: MouseEvent<HTMLButtonElement>) => void;
};

export function Confirm({
  name,
  noun = "record",
  action = "Delete",
  title,
  detail,
  onCancel,
  onConfirm,
  children,
  confirmLabel,
  cancelLabel = "Cancel",
  busy = false,
  disabled = false,
  cancelDisabled = false,
  tone = "danger",
  className,
  titleId,
}: ConfirmProps & { className?: string; titleId?: string }) {
  return (
    <div className={["sds", "confirm", className].filter(Boolean).join(" ")} aria-busy={busy || undefined}>
      <strong id={titleId}>{title ?? `${action} this ${noun}?`}</strong>
      {typeof detail === "string" || detail == null ? <p>{detail ?? `“${name}” will be permanently removed for the whole team.`}</p> : <div className="confirm-detail">{detail}</div>}
      {children}
      <div className="confirm-actions">
        <Button variant="secondary" disabled={busy || cancelDisabled} onClick={onCancel}>
          {cancelLabel}
        </Button>
        <Button variant={tone} disabled={busy || disabled} onClick={onConfirm}>
          {confirmLabel ?? action}
        </Button>
      </div>
    </div>
  );
}
