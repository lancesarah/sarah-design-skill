"use client";

import { Empty, TextIcon, Widget, WidgetEmpty, WidgetList, WidgetMore, WidgetNote, WidgetRow } from "@lance-live/gallery-ui";
import Link from "next/link";
import { useState } from "react";

type Meeting = { id: string; title: string; with: string; where: string; start: string; end: string };

/** A glance, not the day. The rest wait behind "+ N more". */
const LIMIT = 4;

/** Fixed so the server and the browser draw the same week. */
const TODAY = new Date(2026, 10, 12);

const DAY = 86_400_000;

/** No calendar screen yet. */
const CALENDAR = "#";

/** Whether a Google or Outlook calendar is connected. Without one there is no week to show. */
const CONNECTED = true;

/** By day, each day's in start order. */
const MEETINGS: Record<string, Meeting[]> = {
  "2026-11-09": [
    { id: "m1", title: "Weekly sales sync", with: "Sales team", where: "Board room", start: "9:00", end: "9:30 AM" },
    { id: "m2", title: "Acme Events hold review", with: "Dana Price", where: "Zoom", start: "2:00", end: "2:30 PM" },
  ],
  "2026-11-10": [{ id: "m3", title: "Site visit", with: "Brightline Partners", where: "Lobby", start: "11:00", end: "12:00 PM" }],
  "2026-11-12": [
    { id: "m4", title: "Ruiz proposal walkthrough", with: "Elena Ruiz", where: "Google Meet", start: "10:00", end: "10:30 AM" },
    { id: "m5", title: "Room block call", with: "Lumen Health", where: "Phone", start: "11:30", end: "12:00 PM" },
    { id: "m6", title: "Revenue meeting", with: "Sarah, Mark, Paul", where: "Board room", start: "1:00", end: "2:00 PM" },
    { id: "m7", title: "Wedding tasting", with: "Park–Okafor wedding", where: "Restaurant", start: "3:00", end: "4:00 PM" },
    { id: "m8", title: "Contract review", with: "Northwind Travel", where: "Zoom", start: "4:30", end: "5:00 PM" },
  ],
  "2026-11-13": [{ id: "m9", title: "Rate planning for March", with: "Mark", where: "Sales office", start: "9:30", end: "10:30 AM" }],
  "2026-11-17": [{ id: "m10", title: "Weekly sales sync", with: "Sales team", where: "Board room", start: "9:00", end: "9:30 AM" }],
  "2026-11-18": [{ id: "m11", title: "Holiday party walkthrough", with: "Brightline Partners", where: "Ballroom", start: "2:00", end: "3:00 PM" }],
};

function key(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

/** Monday to Sunday, `offset` weeks from this one. */
function weekOf(offset: number) {
  const monday = new Date(TODAY.getTime() - ((TODAY.getDay() + 6) % 7) * DAY + offset * 7 * DAY);
  return Array.from({ length: 7 }, (_, at) => new Date(monday.getTime() + at * DAY));
}

/** `Nov 9 – 15`, or `Nov 30 – Dec 6` across a month. */
function weekLabel(days: Date[]) {
  const first = days[0];
  const last = days[6];
  const month = (date: Date) => date.toLocaleDateString("en-US", { month: "short" });
  return first.getMonth() === last.getMonth()
    ? `${month(first)} ${first.getDate()} – ${last.getDate()}`
    : `${month(first)} ${first.getDate()} – ${month(last)} ${last.getDate()}`;
}

/** Someone's meetings, a week at a time. The strip picks the day, today to start, and the list shows that day's meetings. */
export function MeetingsWidget() {
  const [offset, setOffset] = useState(0);
  const [picked, setPicked] = useState(key(TODAY));
  const days = weekOf(offset);
  const today = key(TODAY);

  function step(by: number) {
    const next = offset + by;
    setOffset(next);
    setPicked(next === 0 ? today : key(weekOf(next)[0]));
  }

  const meetings = MEETINGS[picked] ?? [];
  const shown = meetings.slice(0, LIMIT);
  const more = meetings.length - shown.length;
  const pickedDay = days.find((day) => key(day) === picked) ?? days[0];

  if (!CONNECTED) {
    return (
      <Widget icon="calendar" title="Meetings">
        <WidgetEmpty>
          <Empty icon="calendar" title="No calendar connected">
            Connect Outlook or Google to see meetings.
          </Empty>
        </WidgetEmpty>
      </Widget>
    );
  }

  return (
    <Widget
      icon="calendar"
      title="Meetings"
      action={
        <span className="home-lance-tools">
          <WidgetNote className="home-week-label">{weekLabel(days)}</WidgetNote>
          <TextIcon icon="chevron" size="sm" className="home-prev" aria-label="Previous week" onClick={() => step(-1)} />
          <TextIcon icon="chevron" size="sm" className="home-next" aria-label="Next week" onClick={() => step(1)} />
        </span>
      }
    >
      <div className="home-week" role="tablist" aria-label={`Week of ${weekLabel(days)}`}>
        {days.map((day) => {
          const id = key(day);
          const count = MEETINGS[id]?.length ?? 0;
          return (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={id === picked}
              aria-label={`${day.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}, ${count ? `${count} meeting${count === 1 ? "" : "s"}` : "no meetings"}`}
              className={id === today ? "home-week-day is-today" : "home-week-day"}
              onClick={() => setPicked(id)}
            >
              <span className="home-week-weekday">{day.toLocaleDateString("en-US", { weekday: "narrow" })}</span>
              <span className="home-week-date">{day.getDate()}</span>
              <span className={count ? "home-week-dot is-busy" : "home-week-dot"} aria-hidden="true" />
            </button>
          );
        })}
      </div>
      {shown.length ? (
        <WidgetList>
          {shown.map((meeting) => (
            <WidgetRow
              key={meeting.id}
              as={Link}
              href={CALENDAR}
              title={meeting.title}
              subtitle={`${meeting.with} · ${meeting.where}`}
              meta={`${meeting.start} – ${meeting.end}`}
            />
          ))}
          {more > 0 ? (
            <WidgetMore as={Link} href={CALENDAR}>
              + {more} more
            </WidgetMore>
          ) : null}
        </WidgetList>
      ) : (
        <WidgetEmpty>
          <Empty icon="calendar" title="No meetings">
            Nothing on {pickedDay.toLocaleDateString("en-US", { weekday: "long" })}.
          </Empty>
        </WidgetEmpty>
      )}
    </Widget>
  );
}
