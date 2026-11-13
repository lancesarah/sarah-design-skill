"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Confirm } from "./Confirm";

export function ConfirmDialog({
  open,
  name,
  noun = "record",
  onCancel,
  onConfirm,
}: {
  open: boolean;
  name: string;
  noun?: string;
  onCancel?: () => void;
  onConfirm?: () => void;
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
    if (!open || !dialog || dialog.open) return;
    dialog.classList.remove("is-closing");
    dialog.showModal();
  }, [open, mounted]);

  function settle(confirming: boolean) {
    const dialog = ref.current;
    const finish = () => {
      dialog?.classList.remove("is-closing");
      if (dialog?.open) dialog.close();
      if (confirming) onConfirmRef.current?.();
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
          name={name}
          noun={noun}
          onCancel={() => settle(false)}
          onConfirm={() => settle(true)}
        />
      ) : null}
    </dialog>,
    document.body,
  );
}
