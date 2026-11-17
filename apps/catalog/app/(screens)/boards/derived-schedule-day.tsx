"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Button, OverlayMenu, formatTime } from "@lance-live/sds";


const names: Record<string, string> = { Mon: "Monday", Tue: "Tuesday", Wed: "Wednesday", Thu: "Thursday", Fri: "Friday", Sat: "Saturday", Sun: "Sunday" };
const history: Record<string, { confidence: number; weeks: number }> = {
  Mon: { confidence: 94, weeks: 35 }, Tue: { confidence: 91, weeks: 35 }, Wed: { confidence: 86, weeks: 28 }, Thu: { confidence: 88, weeks: 16 }, Fri: { confidence: 89, weeks: 32 }, Sat: { confidence: 94, weeks: 35 }, Sun: { confidence: 91, weeks: 35 },
};
export function DerivedScheduleDay({ day, shift, cleared, onAction }: { day: string; shift?: { start: string; end: string }; cleared: boolean; onAction: (action: "working" | "off" | "clear") => void }) {
  const [open, setOpen] = useState(false);
  const anchor = useRef<HTMLButtonElement>(null);
  const first = useRef<HTMLButtonElement>(null);
  const id = useId();
  const meta = history[day];
  const time = shift ? `${formatTime(shift.start)} – ${formatTime(shift.end)}` : cleared ? "—" : "Off";
  useEffect(() => {
    if (!open) return;
    first.current?.focus();
    const close = (event: PointerEvent) => { if (!(event.target as HTMLElement).closest(`[data-menu="${id}"]`)) setOpen(false); };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [open, id]);
  function choose(action: "working" | "off" | "clear") { onAction(action); setOpen(false); anchor.current?.focus(); }
  return <div className="hk-derived-day" data-working={!!shift} data-menu={id}>
    <Button ref={anchor} variant="secondary" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen(!open)} onKeyDown={event => { if (event.key === "ArrowDown") { event.preventDefault(); setOpen(true); } }}><span className="hk-day-copy"><span>{day}</span><span className="hk-derived-shift">{time}</span></span></Button>
    <OverlayMenu open={open} anchorRef={anchor} marker={id} label={`${names[day]} schedule`}>
      <div onKeyDown={event => {
        if (event.key === "Escape") { event.preventDefault(); setOpen(false); anchor.current?.focus(); }
        if (event.key === "Tab") { setOpen(false); anchor.current?.focus(); }
        if (event.key === "ArrowDown" || event.key === "ArrowUp") {
          event.preventDefault();
          const items = [...event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="menuitem"]')];
          const index = items.indexOf(document.activeElement as HTMLButtonElement);
          items[(index + (event.key === "ArrowDown" ? 1 : items.length - 1)) % items.length]?.focus();
        }
      }}>
        <div className="hk-derived-menu-heading"><span>{names[day]}</span><span className="hk-help">{shift ? `Typical ${time} · ${meta.confidence}% confidence · ${meta.weeks} wks` : cleared ? "No typical shift" : `Off ${meta.confidence}% of weeks · ${meta.weeks} wks`}</span></div>
        <button ref={first} className="menu-item" type="button" role="menuitem" onClick={() => choose(shift ? "off" : "working")}>{shift ? "Mark as day off" : "Mark as working day"}</button>
        {shift ? <button className="menu-item" type="button" role="menuitem" onClick={() => choose("clear")}>Clear typical shift</button> : null}
      </div>
    </OverlayMenu>
  </div>;
}
