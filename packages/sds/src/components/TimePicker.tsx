"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Icon } from "../icons";
import { OverlayMenu } from "./OverlayMenu";

export function formatTime(value: string) {
  if (!/^\d{2}:\d{2}$/.test(value)) return value;
  const [hour, minute] = value.split(":").map(Number);
  return `${hour % 12 || 12}:${String(minute).padStart(2, "0")}${hour < 12 ? "AM" : "PM"}`;
}
export function parseTime(value: string): string | null {
  const match = value.trim().match(/^(\d{1,2}):(\d{2})\s*(am|pm)?$/i);
  if (!match) return null;
  let hour = Number(match[1]);
  const minute = Number(match[2]);
  if (minute > 59 || hour > (match[3] ? 12 : 23) || (match[3] && hour < 1)) return null;
  if (match[3]) hour = hour % 12 + (match[3].toLowerCase() === "pm" ? 12 : 0);
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

export type TimePickerProps = {
  value: string;
  onValueChange: (value: string) => void;
  label: string;
  invalid?: boolean;
  describedBy?: string;
  disabled?: boolean;
};

/** Editable minute-precision time, with half-hour suggestions in the shared menu. */
export function TimePicker({ value, onValueChange, label, invalid, describedBy, disabled }: TimePickerProps) {
  const [draft, setDraft] = useState(formatTime(value));
  const [open, setOpen] = useState(false);
  const [badInput, setBadInput] = useState(false);
  const anchor = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const options = useRef<(HTMLButtonElement | null)[]>([]);
  const id = useId();
  useEffect(() => { setDraft(formatTime(value)); setBadInput(false); }, [value]);
  useEffect(() => {
    if (!open) return;
    const index = Math.max(0, Math.min(47, Math.floor((Number(value.slice(0, 2)) * 60 + Number(value.slice(3))) / 30) || 0));
    options.current[index]?.focus();
    options.current[index]?.scrollIntoView({ block: "nearest" });
    const close = (event: PointerEvent) => {
      if (!(event.target as HTMLElement).closest(`[data-menu="${id}"]`)) setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [open, id]);
  function commit() {
    const parsed = parseTime(draft);
    setBadInput(parsed === null);
    if (parsed !== null) { setDraft(formatTime(parsed)); onValueChange(parsed); }
  }
  return <div className="sds time-picker" data-menu={id}>
    <div ref={anchor} className="line time-picker-field" data-disabled={disabled || undefined}>
      <Icon name="clock" size={14} />
      <input aria-label={label} aria-invalid={invalid || badInput || undefined} aria-describedby={badInput ? `${id}-error` : describedBy} disabled={disabled} value={draft} placeholder="9:00AM" onChange={event => setDraft(event.target.value)} onBlur={commit} onKeyDown={event => {
        if (event.key === "Enter") { event.preventDefault(); commit(); }
        if (event.key === "ArrowDown") { event.preventDefault(); setOpen(true); }
        if (event.key === "Escape") { setDraft(formatTime(value)); setBadInput(false); }
      }} />
      <button ref={trigger} type="button" className="time-picker-trigger" disabled={disabled} aria-label={`Choose ${label}`} aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen(!open)}><Icon name="chevron" size={14} /></button>
    </div>
    {badInput ? <span className="time-picker-error" id={`${id}-error`} role="alert">Use a time like 9:00AM.</span> : null}
    <OverlayMenu open={open} anchorRef={anchor} marker={id} label={label} className="time-picker-menu">
      {Array.from({ length: 48 }, (_, index) => {
        const time = `${String(Math.floor(index / 2)).padStart(2, "0")}:${index % 2 ? "30" : "00"}`;
        return <button key={time} ref={node => { options.current[index] = node; }} type="button" className="menu-item" role="menuitemradio" aria-checked={value === time} onClick={() => { onValueChange(time); setDraft(formatTime(time)); setBadInput(false); setOpen(false); trigger.current?.focus(); }} onKeyDown={event => {
          const next = event.key === "ArrowDown" ? (index + 1) % 48 : event.key === "ArrowUp" ? (index + 47) % 48 : event.key === "Home" ? 0 : event.key === "End" ? 47 : null;
          if (next !== null) { event.preventDefault(); options.current[next]?.focus(); }
          if (event.key === "Escape") { event.preventDefault(); setOpen(false); trigger.current?.focus(); }
          if (event.key === "Tab") { setOpen(false); trigger.current?.focus(); }
        }}><span>{formatTime(time)}</span>{value === time ? <Icon name="check" size={14} /> : null}</button>;
      })}
    </OverlayMenu>
  </div>;
}
