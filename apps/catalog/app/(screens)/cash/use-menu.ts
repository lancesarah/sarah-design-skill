"use client";

import { useEffect, useId, useRef, useState } from "react";

export function useMenu() {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLButtonElement>(null);
  const marker = useId().replace(/:/g, "");

  useEffect(() => {
    if (!open) return;
    const close = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (anchorRef.current?.contains(target)) return;
      if (target.closest(`[data-menu="${marker}"]`)) return;
      setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [open, marker]);

  return { open, setOpen, anchorRef, marker };
}
