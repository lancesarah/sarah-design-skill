"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import "./spacing-tool.css";

const SPACE: Record<number, string> = {
  2: "space-2",
  4: "space-4",
  8: "space-8",
  10: "space-10",
  12: "space-12",
  14: "space-14",
  16: "space-16",
  20: "space-20",
  25: "space-25",
};

type Item = { el: Element; rect: DOMRect };

type Line = {
  key: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  label: string;
  off: boolean;
};

type Frame = { x: number; y: number; w: number; h: number; tone: "selected" | "hover" };

type Snap = {
  frames: Frame[];
  lines: Line[];
  size: string;
  title: string;
  padding: string;
  gaps: string;
  inset: string;
  comparing: boolean;
};

function isTool(el: Element | null): boolean {
  return !!el?.closest("[data-measure-root], nextjs-portal");
}

function isPageRoot(el: Element): boolean {
  return el === document.body || el === document.documentElement;
}

function pointIn(el: Element, x: number, y: number): boolean {
  const rect = el.getBoundingClientRect();
  return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
}

function stepOut(el: Element): Element | null {
  let parent = el.parentElement;
  while (parent && !isPageRoot(parent)) {
    if (getComputedStyle(parent).display !== "contents") return parent;
    parent = parent.parentElement;
  }
  return null;
}

function targetAt(x: number, y: number): Element | null {
  for (const el of document.elementsFromPoint(x, y)) {
    if (isTool(el) || isPageRoot(el)) continue;
    const rect = el.getBoundingClientRect();
    if (rect.width < 1 || rect.height < 1) continue;
    return el;
  }
  return null;
}

function nameOf(el: Element): string {
  const id = el.id ? `#${el.id}` : "";
  const cls = [...el.classList].slice(0, 2).join(".");
  return `${el.tagName.toLowerCase()}${id}${cls ? `.${cls}` : ""}`;
}

function px(n: number): string {
  return String(Math.round(n));
}

function tokenLabel(n: number): string {
  const rounded = Math.round(n);
  const token = SPACE[rounded];
  return token ? `${rounded} · ${token}` : `${rounded}`;
}

function quad(values: number[]): string {
  const n = values.map((value) => Math.round(value));
  if (n.every((value) => value === n[0])) return tokenLabel(n[0]);
  if (n[0] === n[2] && n[1] === n[3]) return `${tokenLabel(n[0])}  ${tokenLabel(n[1])}`;
  return n.map((value) => tokenLabel(value)).join("  ");
}

function paddingOf(el: Element): number[] {
  const style = getComputedStyle(el);
  return [
    parseFloat(style.paddingTop) || 0,
    parseFloat(style.paddingRight) || 0,
    parseFloat(style.paddingBottom) || 0,
    parseFloat(style.paddingLeft) || 0,
  ];
}

function unitsOf(root: Element): Item[] {
  return [...root.children].flatMap((node) => {
    if (!(node instanceof Element) || isTool(node)) return [];
    const tag = node.tagName;
    if (tag === "SCRIPT" || tag === "STYLE" || tag === "LINK") return [];
    const rect = node.getBoundingClientRect();
    if (rect.width < 1 || rect.height < 1) return [];
    return [{ el: node, rect }];
  });
}

function overlap(a0: number, a1: number, b0: number, b1: number): number {
  return Math.min(a1, b1) - Math.max(a0, b0);
}

type Gap = {
  a: Item;
  b: Item;
  axis: "x" | "y";
  gap: number;
  mid: number;
  off: boolean;
};

function nearestGaps(items: Item[]): Gap[] {
  const index = new Map(items.map((item, i) => [item.el, i]));
  const seen = new Set<string>();
  const found: Gap[] = [];

  const add = (a: Item, b: Item, axis: "x" | "y", gap: number, mid: number) => {
    const i = index.get(a.el) ?? 0;
    const j = index.get(b.el) ?? 0;
    const key = `${axis}:${Math.min(i, j)}:${Math.max(i, j)}`;
    if (seen.has(key)) return;
    seen.add(key);
    found.push({ a, b, axis, gap: Math.max(0, gap), mid, off: false });
  };

  for (const a of items) {
    let right: { b: Item; gap: number } | null = null;
    let below: { b: Item; gap: number } | null = null;
    for (const b of items) {
      if (a.el === b.el) continue;
      const vertical = overlap(a.rect.top, a.rect.bottom, b.rect.top, b.rect.bottom);
      const horizontal = overlap(a.rect.left, a.rect.right, b.rect.left, b.rect.right);
      const gapX = b.rect.left - a.rect.right;
      const gapY = b.rect.top - a.rect.bottom;
      const minV = Math.min(a.rect.height, b.rect.height) * 0.5;
      const minH = Math.min(a.rect.width, b.rect.width) * 0.5;
      if (vertical >= minV && gapX >= -0.5 && (!right || gapX < right.gap)) right = { b, gap: gapX };
      if (horizontal >= minH && gapY >= -0.5 && (!below || gapY < below.gap)) below = { b, gap: gapY };
    }
    if (right) {
      const top = Math.max(a.rect.top, right.b.rect.top);
      const bottom = Math.min(a.rect.bottom, right.b.rect.bottom);
      add(a, right.b, "x", right.gap, (top + bottom) / 2);
    }
    if (below) {
      const left = Math.max(a.rect.left, below.b.rect.left);
      const rightEdge = Math.min(a.rect.right, below.b.rect.right);
      add(a, below.b, "y", below.gap, (left + rightEdge) / 2);
    }
  }

  const counts = new Map<string, number>();
  for (const gap of found) {
    const key = `${gap.axis}:${Math.round(gap.gap)}`;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  const mode = new Map<string, number>();
  for (const [key, count] of counts) {
    const axis = key.slice(0, 1);
    const current = mode.get(axis);
    if (current === undefined || count > (counts.get(`${axis}:${current}`) ?? 0)) {
      mode.set(axis, Number(key.slice(2)));
    }
  }
  const mixed = (axis: string) => [...counts.keys()].filter((key) => key.startsWith(`${axis}:`)).length > 1;
  for (const gap of found) {
    const usual = mode.get(gap.axis);
    gap.off = mixed(gap.axis) && Math.round(gap.gap) !== usual;
  }
  return found;
}

function line(axis: "x" | "y", from: number, to: number, at: number, label: string, off: boolean, key: string): Line {
  if (axis === "x") {
    const left = Math.min(from, to);
    const right = Math.max(from, to);
    return { key, x1: left, y1: at, x2: right, y2: at, label, off };
  }
  const top = Math.min(from, to);
  const bottom = Math.max(from, to);
  return { key, x1: at, y1: top, x2: at, y2: bottom, label, off };
}

function gapSummary(gaps: Gap[], axis: "x" | "y"): string {
  const values = gaps.filter((gap) => gap.axis === axis).map((gap) => gap.gap);
  if (values.length === 0) return "";
  const rounded = values.map((value) => Math.round(value));
  const unique = [...new Set(rounded)];
  const prefix = axis === "x" ? "across" : "down";
  if (unique.length === 1) return `${prefix} ${tokenLabel(unique[0])} × ${rounded.length}`;
  return `${prefix} ${rounded.map((value) => tokenLabel(value)).join(", ")}`;
}

function contains(outer: DOMRect, inner: DOMRect): boolean {
  return (
    inner.left >= outer.left - 0.5 &&
    inner.right <= outer.right + 0.5 &&
    inner.top >= outer.top - 0.5 &&
    inner.bottom <= outer.bottom + 0.5
  );
}

function between(a: DOMRect, b: DOMRect): Line[] {
  if (contains(a, b) || contains(b, a)) {
    const outer = contains(a, b) ? a : b;
    const inner = contains(a, b) ? b : a;
    const sides = [
      line("y", outer.top, inner.top, (inner.left + inner.right) / 2, px(inner.top - outer.top), false, "in-top"),
      line("y", inner.bottom, outer.bottom, (inner.left + inner.right) / 2, px(outer.bottom - inner.bottom), false, "in-bottom"),
      line("x", outer.left, inner.left, (inner.top + inner.bottom) / 2, px(inner.left - outer.left), false, "in-left"),
      line("x", inner.right, outer.right, (inner.top + inner.bottom) / 2, px(outer.right - inner.right), false, "in-right"),
    ];
    return sides.filter((side) => {
      const length = Math.abs(side.x2 - side.x1) + Math.abs(side.y2 - side.y1);
      return length > 0.5;
    });
  }

  const lines: Line[] = [];
  const separatedX = a.right <= b.left + 0.5 || b.right <= a.left + 0.5;
  const separatedY = a.bottom <= b.top + 0.5 || b.bottom <= a.top + 0.5;
  if (separatedX) {
    const left = a.right <= b.left ? a : b;
    const right = left === a ? b : a;
    const top = Math.max(left.top, right.top);
    const bottom = Math.min(left.bottom, right.bottom);
    const y = bottom > top ? (top + bottom) / 2 : (left.top + left.bottom + right.top + right.bottom) / 4;
    lines.push(line("x", left.right, right.left, y, px(right.left - left.right), false, "between-x"));
  }
  if (separatedY) {
    const top = a.bottom <= b.top ? a : b;
    const bottom = top === a ? b : a;
    const left = Math.max(top.left, bottom.left);
    const right = Math.min(top.right, bottom.right);
    const x = right > left ? (left + right) / 2 : (top.left + top.right + bottom.left + bottom.right) / 4;
    lines.push(line("y", top.bottom, bottom.top, x, px(bottom.top - top.bottom), false, "between-y"));
  }
  return lines;
}

function measure(selected: Element, hover: Element | null, comparing: boolean): Snap | null {
  if (!selected.isConnected) return null;
  const rect = selected.getBoundingClientRect();
  const padding = paddingOf(selected);
  const padText = padding.some((value) => value > 0.5) ? quad(padding) : "";

  if (comparing && hover && hover !== selected && hover.isConnected) {
    const other = hover.getBoundingClientRect();
    return {
      frames: [
        { x: rect.left, y: rect.top, w: rect.width, h: rect.height, tone: "selected" },
        { x: other.left, y: other.top, w: other.width, h: other.height, tone: "hover" },
      ],
      lines: between(rect, other),
      size: `${px(rect.width)} × ${px(rect.height)}`,
      title: `${nameOf(selected)}  →  ${nameOf(hover)}`,
      padding: padText,
      gaps: "",
      inset: "",
      comparing: true,
    };
  }

  const parent = stepOut(selected);
  const siblings = parent ? unitsOf(parent) : [{ el: selected, rect }];
  const gaps = nearestGaps(siblings);
  const lines: Line[] = gaps.map((gap, i) => {
    if (gap.axis === "x") return line("x", gap.a.rect.right, gap.b.rect.left, gap.mid, px(gap.gap), gap.off, `gap-${i}`);
    return line("y", gap.a.rect.bottom, gap.b.rect.top, gap.mid, px(gap.gap), gap.off, `gap-${i}`);
  });

  let inset = "";
  if (parent) {
    const box = parent.getBoundingClientRect();
    const group = siblings.map((item) => item.rect);
    const sides = {
      top: Math.min(...group.map((item) => item.top)) - box.top,
      right: box.right - Math.max(...group.map((item) => item.right)),
      bottom: box.bottom - Math.max(...group.map((item) => item.bottom)),
      left: Math.min(...group.map((item) => item.left)) - box.left,
    };
    const near = (value: number) => value > 0.5 && value <= 80;
    const drawn = [
      near(sides.top) ? line("y", box.top, box.top + sides.top, rect.left + rect.width / 2, px(sides.top), false, "pad-top") : null,
      near(sides.bottom) ? line("y", box.bottom - sides.bottom, box.bottom, rect.left + rect.width / 2, px(sides.bottom), false, "pad-bottom") : null,
      near(sides.left) ? line("x", box.left, box.left + sides.left, rect.top + rect.height / 2, px(sides.left), false, "pad-left") : null,
      near(sides.right) ? line("x", box.right - sides.right, box.right, rect.top + rect.height / 2, px(sides.right), false, "pad-right") : null,
    ].filter((item): item is Line => item !== null);
    lines.push(...drawn);
    if (drawn.length) inset = quad([sides.top, sides.right, sides.bottom, sides.left]);
  }

  const across = gapSummary(gaps, "x");
  const down = gapSummary(gaps, "y");

  const frames: Frame[] = [{ x: rect.left, y: rect.top, w: rect.width, h: rect.height, tone: "selected" }];
  if (hover && hover !== selected && hover.isConnected) {
    const other = hover.getBoundingClientRect();
    frames.push({ x: other.left, y: other.top, w: other.width, h: other.height, tone: "hover" });
  }

  return {
    frames,
    lines,
    size: `${px(rect.width)} × ${px(rect.height)}`,
    title: nameOf(selected),
    padding: padText,
    gaps: [across, down].filter(Boolean).join("   "),
    inset,
    comparing: false,
  };
}

export function SpacingTool() {
  const [on, setOn] = useState(false);
  const [altHeld, setAltHeld] = useState(false);
  const [selected, setSelected] = useState<Element | null>(null);
  const [hover, setHover] = useState<Element | null>(null);
  const [snap, setSnap] = useState<Snap | null>(null);
  const selectedRef = useRef<Element | null>(null);
  const hoverRef = useRef<Element | null>(null);
  const layerRef = useRef<HTMLDivElement>(null);
  const active = on || altHeld;
  selectedRef.current = selected;
  hoverRef.current = hover;

  useEffect(() => {
    const down = (event: KeyboardEvent) => {
      if (event.key === "Alt") setAltHeld(true);
      if (event.key === "Escape") {
        if (selectedRef.current) setSelected(null);
        else setOn(false);
      }
    };
    const up = (event: KeyboardEvent) => {
      if (event.key === "Alt") setAltHeld(false);
    };
    const clear = () => setAltHeld(false);
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", clear);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", clear);
    };
  }, []);

  useEffect(() => {
    const layer = layerRef.current;
    if (!active || !layer) return;
    const move = (event: MouseEvent) => {
      const next = targetAt(event.clientX, event.clientY);
      if (next === hoverRef.current) return;
      hoverRef.current = next;
      setHover(next);
    };
    const pick = (event: PointerEvent) => {
      if (event.button !== 0) return;
      const hit = targetAt(event.clientX, event.clientY);
      if (!hit) return;
      setSelected((current) => {
        const inside = !!current && (current.contains(hit) || pointIn(current, event.clientX, event.clientY));
        if (!event.shiftKey && inside) return stepOut(current) ?? current;
        return hit;
      });
    };
    const wheel = (event: WheelEvent) => {
      const hit = targetAt(event.clientX, event.clientY);
      let el: Element | null = hit;
      while (el && !isPageRoot(el)) {
        const style = getComputedStyle(el);
        const canY = /(auto|scroll|overlay)/.test(style.overflowY) && el.scrollHeight > el.clientHeight + 1;
        const canX = /(auto|scroll|overlay)/.test(style.overflowX) && el.scrollWidth > el.clientWidth + 1;
        if (canY || canX) {
          if (canY) el.scrollTop += event.deltaY;
          if (canX) el.scrollLeft += event.deltaX;
          event.preventDefault();
          return;
        }
        el = el.parentElement;
      }
    };
    layer.addEventListener("mousemove", move);
    layer.addEventListener("pointerdown", pick);
    layer.addEventListener("wheel", wheel, { passive: false });
    return () => {
      layer.removeEventListener("mousemove", move);
      layer.removeEventListener("pointerdown", pick);
      layer.removeEventListener("wheel", wheel);
    };
  }, [active]);

  useLayoutEffect(() => {
    if (!active) return;
    let frame = 0;
    const run = () => {
      const current = selectedRef.current;
      const over = hoverRef.current;
      const comparing = altHeld && !!current && !!over && over !== current;
      if (!current && over?.isConnected) {
        const rect = over.getBoundingClientRect();
        setSnap({
          frames: [{ x: rect.left, y: rect.top, w: rect.width, h: rect.height, tone: "hover" }],
          lines: [],
          size: `${px(rect.width)} × ${px(rect.height)}`,
          title: nameOf(over),
          padding: "",
          gaps: "",
          inset: "",
          comparing: false,
        });
        return;
      }
      setSnap(current ? measure(current, over, comparing) : null);
    };
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(run);
    };
    schedule();
    window.addEventListener("scroll", schedule, true);
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule, true);
      window.removeEventListener("resize", schedule);
    };
  }, [active, altHeld, selected, hover]);

  return (
    <>
      {active && (
        <div className="measure-layer" data-measure-root ref={layerRef}>
          {snap && (
          <>
          {snap.frames.map((frame) => (
            <div
              key={frame.tone}
              className={`measure-box is-${frame.tone}`}
              style={{ left: frame.x, top: frame.y, width: frame.w, height: frame.h }}
            />
          ))}
          <svg className="measure-lines" aria-hidden="true">
            {snap.lines.map((item) => {
              const horizontal = Math.abs(item.y1 - item.y2) < 0.5;
              return (
                <g key={item.key} className={item.off ? "is-off" : undefined}>
                  <line x1={item.x1} y1={item.y1} x2={item.x2} y2={item.y2} />
                  {horizontal ? (
                    <>
                      <line x1={item.x1} y1={item.y1 - 4} x2={item.x1} y2={item.y1 + 4} />
                      <line x1={item.x2} y1={item.y2 - 4} x2={item.x2} y2={item.y2 + 4} />
                    </>
                  ) : (
                    <>
                      <line x1={item.x1 - 4} y1={item.y1} x2={item.x1 + 4} y2={item.y1} />
                      <line x1={item.x2 - 4} y1={item.y2} x2={item.x2 + 4} y2={item.y2} />
                    </>
                  )}
                </g>
              );
            })}
          </svg>
          {snap.lines.map((item) => {
            const horizontal = Math.abs(item.y1 - item.y2) < 0.5;
            const midX = (item.x1 + item.x2) / 2;
            const midY = (item.y1 + item.y2) / 2;
            return (
              <span
                key={`${item.key}-label`}
                className={item.off ? "measure-label is-off" : "measure-label"}
                style={
                  horizontal
                    ? { left: midX, top: midY, transform: "translate(-50%, calc(-100% - 4px))" }
                    : { left: midX, top: midY, transform: "translate(6px, -50%)" }
                }
              >
                {item.label}
              </span>
            );
          })}
          {snap.frames
            .filter((frame) => frame.tone === "selected")
            .map((frame) => (
              <span key="size" className="measure-size" style={{ left: frame.x, top: Math.max(4, frame.y - 18) }}>
                {snap.size}
              </span>
            ))}
          </>
          )}
        </div>
      )}
      <div className="measure-chrome" data-measure-root>
        {active && (
          <p className="measure-hud">
            {snap ? (
              <>
                <span className="measure-hud-title">{snap.title}</span>
                <span>{snap.size}</span>
                {snap.padding && <span>padding {snap.padding}</span>}
                {snap.gaps && <span>{snap.comparing ? "to it" : snap.gaps}</span>}
                {snap.inset && <span>inset {snap.inset}</span>}
              </>
            ) : (
              <span>Click a unit. Click it again for the parent.</span>
            )}
            {snap?.lines.some((item) => item.off) && <span className="measure-hud-off">A gap does not match the others.</span>}
          </p>
        )}
        <button
          type="button"
          className="measure-toggle"
          aria-pressed={on}
          title="Click a unit. Click again to step out. Shift-click picks the element under the pointer. Hold Option to measure to another element. Esc clears."
          onClick={() => setOn((value) => !value)}
        >
          Spacing
        </button>
      </div>
    </>
  );
}
