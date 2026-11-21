"use client";

import { useMemo, type KeyboardEventHandler } from "react";
import { Icon } from "../icons";

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
  locale?: string;
  hourLabel?: string;
  minuteLabel?: string;
  emptyLabel?: string;
  invalid?: boolean;
  describedBy?: string;
  disabled?: boolean;
  id?: string;
  required?: boolean;
  readOnly?: boolean;
  autoFocus?: boolean;
  min?: string;
  max?: string;
  /** Allowed interval in seconds, starting at min or midnight. */
  step?: number;
  onBlur?: () => void;
  onKeyDown?: KeyboardEventHandler<HTMLSelectElement>;
};

const digits = (n: number) => String(n).padStart(2, "0");
const minuteOfDay = (time: string) => Number(time.slice(0, 2)) * 60 + Number(time.slice(3, 5));

/** Separate hour and minute controls sharing one local, 24-hour HH:mm value. */
export function TimePicker({ value, onValueChange, label, disabled, readOnly, required, id, locale, hourLabel, minuteLabel, emptyLabel,
  min, max, step = 60, invalid, describedBy, autoFocus, onBlur, onKeyDown }: TimePickerProps) {
  const choices = useMemo(() => {
    const start = min ? minuteOfDay(min) : 0;
    const end = max ? minuteOfDay(max) : 1439;
    const hours = new Map<string, string[]>();
    for (let n = 0; n < 1440; n++) {
      const inRange = start <= end ? n >= start && n <= end : n >= start || n <= end;
      if (!inRange || ((n - start) * 60) % step !== 0) continue;
      const hour = digits(Math.floor(n / 60));
      if (!hours.has(hour)) hours.set(hour, []);
      hours.get(hour)!.push(digits(n % 60));
    }
    return hours;
  }, [min, max, step]);
  const hourFormat = useMemo(() => new Intl.DateTimeFormat(locale, { hour: "numeric", hour12: true }), [locale]);
  const [hour = "", minute = ""] = value.split(":");
  const firstHour = choices.keys().next().value ?? "";
  const minutes = choices.get(hour || firstHour) ?? [];
  const blank = <option value="" disabled={required}>––</option>;
  return <span className="sds split-time" role="group" aria-label={label} aria-describedby={describedBy}
    aria-invalid={invalid || undefined} onBlur={event => {
      if (!event.currentTarget.contains(event.relatedTarget as Node | null)) onBlur?.();
    }}>
    <span className="split-time-part">
    <select id={id} aria-label={hourLabel ?? `${label} — hour`} value={hour} disabled={disabled || readOnly}
      required={required} autoFocus={autoFocus} onKeyDown={onKeyDown} onChange={event => {
        const next = event.target.value;
        const allowed = choices.get(next);
        onValueChange(allowed ? next + ":" + (allowed.includes(minute) ? minute : allowed[0]) : "");
      }}>
      <option value="" disabled={required}>{emptyLabel ?? "––"}</option>
      {hour && !choices.has(hour) && <option disabled>{hour}</option>}
      {Array.from(choices.keys(), h => <option value={h} key={h}>{hourFormat.format(new Date(2000, 0, 1, Number(h)))}</option>)}
    </select>
    <Icon name="chevron" size={12} />
    </span>
    <span className="split-time-part">
    <select aria-label={minuteLabel ?? `${label} — minute`} value={minute} disabled={disabled || readOnly}
      required={required} onKeyDown={onKeyDown} onChange={event => {
        onValueChange(event.target.value ? (hour || firstHour) + ":" + event.target.value : "");
      }}>
      {blank}
      {minute && !minutes.includes(minute) && <option disabled>{minute}</option>}
      {minutes.map(m => <option value={m} key={m}>:{m}</option>)}
    </select>
    <Icon name="chevron" size={12} />
    </span>
  </span>;
}
