"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { CommentButton } from "./comments";
import { useDevDrag } from "./dev-drag";

export function FontSwitch({ children }: { children?: ReactNode }) {
  const [lines, setLines] = useState(true);
  const [underline, setUnderline] = useState(false);
  const [softInk, setSoftInk] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);
  useDevDrag(barRef, "dev-switch");

  useEffect(() => {
    delete document.documentElement.dataset.font;
    localStorage.removeItem("font");
    const off = localStorage.getItem("sheet-lines") === "off";
    if (off) document.documentElement.dataset.sheetLines = "off";
    setLines(!off);
    const lineTabs = localStorage.getItem("tab-style") === "line";
    if (lineTabs) document.documentElement.dataset.tabStyle = "line";
    setUnderline(lineTabs);
    const soft = localStorage.getItem("text-ink") === "soft";
    if (soft) document.documentElement.dataset.textInk = "soft";
    setSoftInk(soft);
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

  function toggleSoftInk() {
    const next = !softInk;
    setSoftInk(next);
    if (next) document.documentElement.dataset.textInk = "soft";
    else delete document.documentElement.dataset.textInk;
    try {
      localStorage.setItem("text-ink", next ? "soft" : "black");
    } catch {
      /* storage can be blocked; the attribute still switches the page */
    }
  }

  useEffect(() => {
    const clear = () => {
      document.querySelectorAll("[data-soft-ink]").forEach((el) => el.removeAttribute("data-soft-ink"));
    };
    if (!softInk) {
      clear();
      return;
    }
    // Reads every color with the soft rule off, then writes. Interleaving reads and writes forces a style recalc per element.
    const apply = () => {
      const root = document.documentElement;
      delete root.dataset.textInk;
      const marks: Array<[Element, boolean]> = [];
      document.querySelectorAll("body *").forEach((el) => {
        if (!(el instanceof HTMLElement) || el.closest(".dev-switch, .measure-chrome")) return;
        marks.push([el, isBlack(getComputedStyle(el).color)]);
      });
      root.dataset.textInk = "soft";
      for (const [el, black] of marks) el.toggleAttribute("data-soft-ink", black);
    };
    let queued = 0;
    const schedule = () => {
      if (queued) return;
      queued = requestAnimationFrame(() => {
        queued = 0;
        apply();
      });
    };
    apply();
    const ignored = (node: Node) => node instanceof Element && node.matches("script, .dev-switch, .measure-chrome, next-route-announcer");
    const observer = new MutationObserver((records) => {
      const relevant = records.some((record) => {
        if (record.target !== document.body) return true;
        return [...record.addedNodes].some((node) => !ignored(node));
      });
      if (relevant) schedule();
    });
    observer.observe(document.body, { childList: true, subtree: true });
    return () => {
      observer.disconnect();
      cancelAnimationFrame(queued);
      clear();
    };
  }, [softInk]);

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


  return (
    <div ref={barRef} className="dev-switch" role="group" aria-label="Dev">
      <span>Dev</span>
      <button type="button" aria-pressed={!lines} onClick={toggleLines}>
        No lines
      </button>
      <button type="button" aria-pressed={underline} onClick={toggleUnderline}>
        Underline
      </button>
      <button type="button" aria-pressed={softInk} onClick={toggleSoftInk}>
        Soft black
      </button>
      <CommentButton />
      {children}
    </div>
  );
}

function isBlack(color: string) {
  const match = color.match(/rgba?\(\s*(\d+)[\s,]+(\d+)[\s,]+(\d+)/);
  if (!match) return false;
  return match[1] === "0" && match[2] === "0" && match[3] === "0";
}
