"use client";

import { useEffect } from "react";

/** The Next dev toast sits on the collapsed rail. Park it on the right. */
export function DevBadge() {
  useEffect(() => {
    const place = () => {
      const toast = document.querySelector("nextjs-portal")?.shadowRoot?.querySelector("#devtools-indicator");
      if (!(toast instanceof HTMLElement)) return;
      toast.style.left = "auto";
      toast.style.right = "20px";
    };
    place();
    const observer = new MutationObserver(place);
    observer.observe(document.body, { childList: true });
    return () => observer.disconnect();
  }, []);
  return null;
}
