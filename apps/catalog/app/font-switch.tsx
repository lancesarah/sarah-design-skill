"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

const faces = [
  { id: "jakarta", label: "Jakarta" },
  { id: "switzer", label: "Switzer" },
] as const;

type Face = (typeof faces)[number]["id"];

export function FontSwitch() {
  const [face, setFace] = useState<Face>("switzer");
  const [lines, setLines] = useState(true);
  const [underline, setUnderline] = useState(false);
  const [greyIcons, setGreyIcons] = useState(false);
  const trackRef = useRef<HTMLSpanElement>(null);
  const pillRef = useRef<HTMLSpanElement>(null);
  const ready = useRef(false);
  const mounted = useRef(false);

  useEffect(() => {
    const saved = localStorage.getItem("font") === "jakarta" ? "jakarta" : "switzer";
    mounted.current = true;
    setFace(saved);
    const off = localStorage.getItem("sheet-lines") === "off";
    if (off) document.documentElement.dataset.sheetLines = "off";
    setLines(!off);
    const lineTabs = localStorage.getItem("tab-style") === "line";
    if (lineTabs) document.documentElement.dataset.tabStyle = "line";
    setUnderline(lineTabs);
    const mutedIcons = localStorage.getItem("icon-ink") === "muted";
    if (mutedIcons) document.documentElement.dataset.iconInk = "muted";
    setGreyIcons(mutedIcons);
  }, []);

  function toggleUnderline() {
    const next = !underline;
    setUnderline(next);
    if (next) document.documentElement.dataset.tabStyle = "line";
    else delete document.documentElement.dataset.tabStyle;
    try {
      localStorage.setItem("tab-style", next ? "line" : "pill");
    } catch {
      /* storage can be blocked; the attribute still switches the page */
    }
  }

  function toggleGreyIcons() {
    const next = !greyIcons;
    setGreyIcons(next);
    if (next) document.documentElement.dataset.iconInk = "muted";
    else delete document.documentElement.dataset.iconInk;
    try {
      localStorage.setItem("icon-ink", next ? "muted" : "ink");
    } catch {
      /* storage can be blocked; the attribute still switches the page */
    }
  }

  useEffect(() => {
    const clear = () => {
      document.querySelectorAll("[data-icon-label]").forEach((el) => el.removeAttribute("data-icon-label"));
    };
    if (!greyIcons) {
      clear();
      return;
    }
    let frame = 0;
    const mark = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        clear();
        document.querySelectorAll("svg.i").forEach((svg) => {
          if (!(svg instanceof SVGElement) || iconIsWhite(svg)) return;
          let node = svg.parentElement;
          while (node && node !== document.body) {
            if (hasVisibleLabel(node, svg)) {
              svg.setAttribute("data-icon-label", "");
              return;
            }
            if (node.matches("button, a, [role='menuitem'], [role='menuitemradio'], [role='menuitemcheckbox'], [role='option'], [role='tab']")) return;
            node = node.parentElement;
          }
        });
      });
    };
    mark();
    const observer = new MutationObserver(mark);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      clear();
    };
  }, [greyIcons]);

  function toggleLines() {
    const next = !lines;
    setLines(next);
    if (next) delete document.documentElement.dataset.sheetLines;
    else document.documentElement.dataset.sheetLines = "off";
    try {
      localStorage.setItem("sheet-lines", next ? "on" : "off");
    } catch {
      /* storage can be blocked; the attribute still switches the page */
    }
  }

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
      <button type="button" aria-pressed={!lines} onClick={toggleLines}>
        No lines
      </button>
      <button type="button" aria-pressed={underline} onClick={toggleUnderline}>
        Underline
      </button>
      <button type="button" aria-pressed={greyIcons} onClick={toggleGreyIcons}>
        Grey icons
      </button>
    </div>
  );
}

function iconIsWhite(icon: SVGElement) {
  if (isWhite(getComputedStyle(icon).color)) return true;
  const shape = icon.querySelector("path, circle, rect, line, polyline, polygon");
  if (!(shape instanceof Element)) return false;
  const paint = getComputedStyle(shape);
  return (paint.fill !== "none" && isWhite(paint.fill)) || (paint.stroke !== "none" && isWhite(paint.stroke));
}

function isWhite(color: string) {
  const match = color.match(/rgba?\(\s*(\d+)[\s,]+(\d+)[\s,]+(\d+)/);
  if (!match) return false;
  return Number(match[1]) >= 250 && Number(match[2]) >= 250 && Number(match[3]) >= 250;
}

function hasVisibleLabel(el: HTMLElement, icon: Element) {
  for (const node of el.childNodes) {
    if (node.nodeType === Node.TEXT_NODE && node.textContent?.trim()) return true;
    if (!(node instanceof HTMLElement) || node === icon || node.contains(icon) || node.matches("svg")) continue;
    const style = getComputedStyle(node);
    if (style.display === "none" || style.visibility === "hidden") continue;
    if (node.innerText.trim()) return true;
  }
  return false;
}
