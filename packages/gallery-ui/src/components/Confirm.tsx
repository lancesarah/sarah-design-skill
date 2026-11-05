"use client";

import { Button } from "./Button";

export type ConfirmProps = {
  name: string;
  noun?: string;
  onCancel?: () => void;
  onConfirm?: () => void;
};

export function Confirm({
  name,
  noun = "record",
  onCancel,
  onConfirm,
  className,
  titleId,
}: ConfirmProps & { className?: string; titleId?: string }) {
  return (
    <div className={["sds", "confirm", className].filter(Boolean).join(" ")}>
      <strong id={titleId}>Delete this {noun}?</strong>
      <p>“{name}” will be permanently removed for the whole team.</p>
      <div className="confirm-actions">
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="danger" onClick={onConfirm}>
          Delete
        </Button>
      </div>
    </div>
  );
}
