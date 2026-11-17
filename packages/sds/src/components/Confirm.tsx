"use client";

import { Button } from "./Button";

export type ConfirmProps = {
  name: string;
  noun?: string;
  /** The destructive verb, on the title and the confirming button: Delete, Remove, Unassign. */
  action?: string;
  /** Replaces the default title, for an action that is not about one named thing. */
  title?: string;
  /** Replaces the line under the title when the action is not a permanent delete. */
  detail?: string;
  onCancel?: () => void;
  onConfirm?: () => void;
};

export function Confirm({
  name,
  noun = "record",
  action = "Delete",
  title,
  detail,
  onCancel,
  onConfirm,
  className,
  titleId,
}: ConfirmProps & { className?: string; titleId?: string }) {
  return (
    <div className={["sds", "confirm", className].filter(Boolean).join(" ")}>
      <strong id={titleId}>{title ?? `${action} this ${noun}?`}</strong>
      <p>{detail ?? `“${name}” will be permanently removed for the whole team.`}</p>
      <div className="confirm-actions">
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="danger" onClick={onConfirm}>
          {action}
        </Button>
      </div>
    </div>
  );
}
