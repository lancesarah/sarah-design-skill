"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

const faces = [
  { id: "jakarta", label: "Jakarta" },
  { id: "switzer", label: "Switzer" },
] as const;

type Face = (typeof faces)[number]["id"];

export function FontSwitch() {
  const [face, setFace] = useState<Face>("switzer");
  const trackRef = useRef<HTMLSpanElement>(null);
  const pillRef = useRef<HTMLSpanElement>(null);
  const ready = useRef(false);
  const mounted = useRef(false);

  useEffect(() => {
    const saved = localStorage.getItem("font") === "jakarta" ? "jakarta" : "switzer";
    mounted.current = true;
    setFace(saved);
  }, []);

  useLayoutEffect(() => {
    if (mounted.current) {
      if (face === "switzer") document.documentElement.dataset.font = "switzer";
      else delete document.documentElement.dataset.font;
      try {
        localStorage.setItem("font", face);
      } catch {
        /* storage can be blocked; the attribute still switches the page */
      }
    }

    const track = trackRef.current;
    const pill = pillRef.current;
    if (!track || !pill) return;
    const chosen = track.querySelector<HTMLElement>("[aria-pressed='true']");
    if (!chosen || !chosen.offsetWidth) {
      pill.style.opacity = "0";
      return;
    }
    const x = chosen.offsetLeft;
    const w = chosen.offsetWidth;
    const prev = parseFloat(pill.style.left) || 0;
    const snap = !ready.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!snap && x !== prev) pill.dataset.dir = x > prev ? "right" : "left";
    if (snap) pill.style.transition = "none";
    pill.style.opacity = "1";
    pill.style.top = `${chosen.offsetTop}px`;
    pill.style.height = `${chosen.offsetHeight}px`;
    pill.style.left = `${x}px`;
    pill.style.right = `${track.clientWidth - x - w}px`;
    if (snap) {
      ready.current = true;
      void pill.offsetWidth;
      pill.style.transition = "";
    }
  }, [face]);

  return (
    <div className="dev-switch" role="group" aria-label="Dev">
      <span>Dev</span>
      <span className="slide-group has-slide" ref={trackRef}>
        <span className="slide-pill" ref={pillRef} aria-hidden="true" />
        {faces.map((item) => (
          <button
            key={item.id}
            type="button"
            data-font={item.id}
            aria-pressed={face === item.id}
            onClick={() => setFace(item.id)}
          >
            {item.label}
          </button>
        ))}
      </span>
    </div>
  );
}
