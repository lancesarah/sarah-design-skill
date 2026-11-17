"use client";

import { useEffect, useRef, useState } from "react";

async function writeClipboard(text: string) {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch {
      // Try the legacy path when clipboard access is restricted.
    }
  }
  const focused = document.activeElement;
  const field = document.createElement("textarea");
  field.value = text;
  field.readOnly = true;
  field.style.position = "fixed";
  field.style.insetInlineStart = "-9999px";
  document.body.append(field);
  try {
    field.select();
    if (!document.execCommand("copy")) throw new Error("Copy failed");
  } finally {
    field.remove();
    if (focused instanceof HTMLElement) focused.focus({ preventScroll: true });
  }
}

export function useCopyFeedback(defaultLabel: string) {
  const [feedback, setFeedback] = useState("");
  const timeout = useRef<number>(0);
  const attempt = useRef(0);

  useEffect(() => () => {
    window.clearTimeout(timeout.current);
    attempt.current += 1;
  }, []);

  async function copy(text: string) {
    const id = ++attempt.current;
    window.clearTimeout(timeout.current);
    let result = "Copied!";
    try {
      await writeClipboard(text);
    } catch {
      result = "Copy failed";
    }
    if (attempt.current !== id) return;
    setFeedback(result);
    timeout.current = window.setTimeout(() => setFeedback(""), 1600);
  }

  return { label: feedback || defaultLabel, copy };
}
