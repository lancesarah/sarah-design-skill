"use client";

import { useCallback, useLayoutEffect, useRef, useState } from "react";

// Open widths are 277 and 392. Rails are 54 and 62.
// The center keeps the 375px list and a 520px note (895).
// Left nav closes first, then the chat. See patterns.md, Window resize.
const SIDE_OPEN_AT = 1564;
const LANCE_OPEN_AT = 1341;

type Flags = { chosen: boolean; heldOpen: boolean };

function readSide(): Flags {
  try {
    return {
      chosen: sessionStorage.getItem("side-chosen") === "1",
      heldOpen: sessionStorage.getItem("side-held-open") === "1",
    };
  } catch {
    return { chosen: false, heldOpen: false };
  }
}

function rememberSide(flags: Flags) {
  try {
    sessionStorage.setItem("side-chosen", flags.chosen ? "1" : "0");
    sessionStorage.setItem("side-held-open", flags.heldOpen ? "1" : "0");
  } catch {
    /* storage can be blocked */
  }
}

function setSideCollapsed(collapsed: boolean) {
  if (document.body.classList.contains("is-side-collapsed") !== collapsed) {
    document.body.classList.toggle("is-side-collapsed", collapsed);
    document.body.classList.remove("is-side-settling");
  }
}

function setLanceCollapsed(collapsed: boolean) {
  if (document.body.classList.contains("is-lance-collapsed") === collapsed) return;
  document.body.classList.toggle("is-lance-collapsed", collapsed);
}

export function usePageLimits() {
  const side = useRef<Flags>({ chosen: false, heldOpen: false });
  const lance = useRef<Flags>({ chosen: false, heldOpen: false });
  const [sideCollapsed, setSide] = useState(false);
  const [lanceCollapsed, setLance] = useState(false);

  const apply = useCallback(() => {
    const width = window.innerWidth;
    if (width >= SIDE_OPEN_AT && side.current.heldOpen) {
      side.current.heldOpen = false;
      rememberSide(side.current);
    }
    if (width >= LANCE_OPEN_AT) lance.current.heldOpen = false;
    const sideNext = (width < SIDE_OPEN_AT && !side.current.heldOpen) || side.current.chosen;
    const lanceNext = (width < LANCE_OPEN_AT && !lance.current.heldOpen) || lance.current.chosen;
    setSideCollapsed(sideNext);
    setLanceCollapsed(lanceNext);
    setSide(sideNext);
    setLance(lanceNext);
  }, []);

  useLayoutEffect(() => {
    side.current = readSide();
    apply();
    window.addEventListener("resize", apply);
    return () => window.removeEventListener("resize", apply);
  }, [apply]);

  const chooseSide = (next: boolean) => {
    side.current.chosen = next;
    side.current.heldOpen = !next && window.innerWidth < SIDE_OPEN_AT;
    rememberSide(side.current);
    setSideCollapsed(next);
    setSide(next);
  };

  const chooseLance = (next: boolean) => {
    lance.current.chosen = next;
    lance.current.heldOpen = !next && window.innerWidth < LANCE_OPEN_AT;
    setLanceCollapsed(next);
    setLance(next);
  };

  return { sideCollapsed, lanceCollapsed, chooseSide, chooseLance };
}
