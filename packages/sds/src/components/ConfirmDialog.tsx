"use client";

import { useEffect, useId, useRef, useState, type MouseEvent } from "react";
import { createPortal } from "react-dom";
import { Confirm, type ConfirmProps } from "./Confirm";

export function ConfirmDialog({
  open,
  keepOpenOnConfirm = false,
  onCancel,
  onConfirm,
  busy = false,
  disabled = false,
  cancelDisabled = false,
  ...confirmProps
}: ConfirmProps & {
  open: boolean;
  /** Controlled async actions can leave the dialog open until their result arrives. */
  keepOpenOnConfirm?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const [mounted, setMounted] = useState(false);
  const onCancelRef = useRef(onCancel);
  const onConfirmRef = useRef(onConfirm);
  onCancelRef.current = onCancel;
  onConfirmRef.current = onConfirm;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (!open) { if (dialog.open) dialog.close(); return; }
    if (dialog.open) return;
    dialog.classList.remove("is-closing");
    dialog.showModal();
  }, [open, mounted]);

  function settle(confirming: boolean, event?: MouseEvent<HTMLButtonElement>) {
    if (busy || (confirming ? disabled : cancelDisabled)) return;
    if (confirming && keepOpenOnConfirm) {
      if (event) onConfirmRef.current?.(event);
      return;
    }
    const dialog = ref.current;
    if (dialog?.classList.contains("is-closing")) return;
    const finish = () => {
      dialog?.classList.remove("is-closing");
      if (dialog?.open) dialog.close();
      if (confirming && event) onConfirmRef.current?.(event);
      else onCancelRef.current?.();
    };
    if (!dialog?.open || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      finish();
      return;
    }
    dialog.classList.add("is-closing");
    const card = dialog.querySelector(".confirm");
    let settled = false;
    const done = () => {
      if (settled) return;
      settled = true;
      finish();
    };
    card?.addEventListener("animationend", done, { once: true });
    window.setTimeout(done, 240);
  }

  if (!mounted) return null;

  return createPortal(
    <dialog
      ref={ref}
      className="sds confirm-dialog"
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault();
        settle(false);
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) settle(false);
      }}
    >
      {open ? (
        <Confirm
          titleId={titleId}
          {...confirmProps}
          busy={busy}
          disabled={disabled}
          cancelDisabled={cancelDisabled}
          onCancel={() => settle(false)}
          onConfirm={(event) => settle(true, event)}
        />
      ) : null}
    </dialog>,
    document.body,
  );
}
