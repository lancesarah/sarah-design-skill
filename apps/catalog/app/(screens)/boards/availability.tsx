"use client";

import { useEffect, useId, useState } from "react";
import { Button, Checkbox, Icon, IconButton, TimePicker } from "@lance-live/sds";
import { windowError } from "./availability-windows";
import { formatDuration, type StaffPreferences } from "./data";

type Window = { start: string; end: string };
type Day = { enabled: boolean; windows: Window[] };
const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const initialWindows = () => [{ start: "09:00", end: "17:00" }];
const minute = (time: string) => Number(time.slice(0, 2)) * 60 + Number(time.slice(3));

export function Availability({ value, onChange }: { value: StaffPreferences["availability"]; onChange: (value: NonNullable<StaffPreferences["availability"]>) => void }) {
  const [selectedDay, setSelectedDay] = useState(0);
  const tabsId = useId();
  function updateDay(index: number, next: Day) {
    const updated = { ...value, [weekdays[index].slice(0, 3)]: next };
    if (next.enabled) setSelectedDay(index);
    else {
      const nextIndex = Array.from({ length: 6 }, (_, offset) => (index + offset + 1) % 7)
        .find(candidate => updated[weekdays[candidate].slice(0, 3)]?.enabled !== false);
      setSelectedDay(nextIndex ?? -1);
    }
    onChange(updated);
  }
  function setDayAvailability(index: number, enabled: boolean) {
    const key = weekdays[index].slice(0, 3);
    const saved = value?.[key];
    const windows = saved?.windows?.length ? saved.windows : saved?.start && saved?.end ? [{ start: saved.start, end: saved.end }] : initialWindows();
    updateDay(index, { enabled, windows });
  }
  function dayHours(day: string) {
    const saved = value?.[day.slice(0, 3)];
    if (saved?.enabled === false) return "Off";
    const windows = saved?.windows ?? (saved?.start && saved?.end ? [{ start: saved.start, end: saved.end }] : initialWindows());
    const totalMinutes = windows.reduce((total, window) => total + (minute(window.end) - minute(window.start) + 1440) % 1440, 0);
    return formatDuration(totalMinutes);
  }
  return <div className="hk-availability"><p className="hk-help">Select a day to set the times they can work. Add multiple windows when needed.</p>
    <div className="hk-availability-tabs" role="tablist" aria-label="Availability by day">{weekdays.map((day, index) => <div className="hk-day-tile" key={day} data-available={value?.[day.slice(0, 3)]?.enabled !== false}><button type="button" role="tab" id={`${tabsId}-tab-${index}`} aria-controls={`${tabsId}-panel-${index}`} aria-selected={selectedDay === index} tabIndex={selectedDay === index || (selectedDay === -1 && index === 0) ? 0 : -1} onClick={() => {
      const enabled = value?.[day.slice(0, 3)]?.enabled !== false;
      if (enabled && selectedDay !== index) setSelectedDay(index);
      else setDayAvailability(index, !enabled);
    }} onKeyDown={event => {
      const next = event.key === "ArrowRight" ? (index + 1) % 7 : event.key === "ArrowLeft" ? (index + 6) % 7 : event.key === "Home" ? 0 : event.key === "End" ? 6 : null;
      if (next === null) return;
      event.preventDefault();
      setSelectedDay(next);
      event.currentTarget.closest(".hk-availability-tabs")?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[next]?.focus();
    }}><span className="hk-day-copy"><span>{day.slice(0, 3)}</span><span className="hk-availability-tab-status">{dayHours(day)}</span></span></button><Checkbox className="hk-day-check" aria-label={`Available on ${day}`} checked={value?.[day.slice(0, 3)]?.enabled !== false} onCheckedChange={enabled => setDayAvailability(index, enabled)} /></div>)}</div>
    {selectedDay === -1 ? <p className="hk-help">Select an available day to set its times.</p> : null}
    {weekdays.map((day, index) => { const key = day.slice(0, 3); const saved = value?.[key];
      const dayValue = { enabled: saved?.enabled ?? true, windows: saved?.windows ?? (saved?.start && saved?.end ? [{ start: saved.start, end: saved.end }] : initialWindows()) };
      return <div key={day} role="tabpanel" id={`${tabsId}-panel-${index}`} aria-labelledby={`${tabsId}-tab-${index}`} hidden={selectedDay !== index}>
        <AvailabilityDay day={day} value={dayValue} onChange={next => updateDay(index, next)} />
      </div>;
    })}
  </div>;
}

function AvailabilityDay({ day, value, onChange }: { day: string; value: Day; onChange: (next: Day) => void }) {
  const [windows, setWindows] = useState(value.windows);
  // Sync restored saved windows without wiping invalid drafts on unrelated renders.
  const savedWindows = JSON.stringify(value.windows);
  useEffect(() => { setWindows(JSON.parse(savedWindows) as Window[]); }, [savedWindows]);
  const id = useId();
  const error = windowError(windows);
  function write(next: Window[]) {
    setWindows(next);
    if (!windowError(next)) onChange({ enabled: next.length > 0, windows: next });
  }
  function addWindow() {
    if (!windows.length) { write(initialWindows()); return; }
    const last = windows.at(-1);
    const start = last ? minute(last.end) : 540;
    const end = (start + 120) % 1440;
    const time = (number: number) => `${String(Math.floor(number / 60)).padStart(2, "0")}:${String(number % 60).padStart(2, "0")}`;
    write([...windows, { start: time(start), end: time(end) }]);
  }
  return <section className="hk-availability-day" aria-label={`${day} availability`}>
    <div className="hk-availability-day-head"><span>{day}</span><span className="hk-availability-day-hours">{error ? "—" : formatDuration(windows.reduce((total, window) => total + (minute(window.end) - minute(window.start) + 1440) % 1440, 0))}</span></div>
    {value.enabled ? <div className="hk-availability-windows">
      {windows.map((window, index) => <div className="hk-availability-window" key={index}>
        <div className="hk-time"><span>From</span><TimePicker label={`${day} window ${index + 1} start`} invalid={!!error} describedBy={error ? id : undefined} value={window.start} onValueChange={time => write(windows.map((item, i) => i === index ? { ...item, start: time } : item))} /></div>
        <div className="hk-time"><span>To</span><TimePicker label={`${day} window ${index + 1} end`} invalid={!!error} describedBy={error ? id : undefined} value={window.end} onValueChange={time => write(windows.map((item, i) => i === index ? { ...item, end: time } : item))} /></div>
        <IconButton icon="close" size={14} aria-label={`Remove ${day} window ${index + 1}`} onClick={() => write(windows.filter((_, i) => i !== index))} />
        {window.start && window.end && window.end < window.start ? <span className="hk-help hk-overnight">Ends next day</span> : null}
      </div>)}
      {error ? <p className="hk-availability-error" id={id} role="alert">{error} Changes to this day aren’t saved yet.</p> : null}
      <Button variant="secondary" aria-label={`Add time window for ${day}`} onClick={addWindow}><Icon name="plus" size={14} />Add window</Button>
    </div> : <span className="hk-help hk-unavailable">Unavailable</span>}
  </section>;
}
