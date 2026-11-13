"use client";

import { ASSIGNEE_PEOPLE, Empty, isRoomNumber, Person, RoomMark, Widget, WidgetEmpty, WidgetFigure, WidgetList, WidgetMore, WidgetNote, WidgetRow, WidgetSummary } from "@lance-live/gallery-ui";
import Link from "next/link";
/** A maintenance ticket closed in the past 24h. `minutes` is from opened to resolved. */
type Resolved = { id: string; room: string; item: string; minutes: number; resolver: string };

/** A glance, not the list. The rest wait behind "+ N more". */
const LIMIT = 4;

const RESOLVED: Resolved[] = [
  { id: "m1", room: "714", item: "Climate", minutes: 3 * 1440 + 4 * 60, resolver: "Mark" },
  { id: "m2", room: "1108", item: "Plumbing", minutes: 2 * 1440 + 6 * 60, resolver: "Paul" },
  { id: "m3", room: "Lobby", item: "Ice machine", minutes: 1440 + 9 * 60, resolver: "Mark" },
  { id: "m4", room: "305", item: "TV", minutes: 1440 + 2 * 60, resolver: "Paul" },
  { id: "m5", room: "612", item: "Lighting", minutes: 18 * 60, resolver: "Sarah" },
  { id: "m6", room: "917", item: "Door lock", minutes: 6 * 60 + 30, resolver: "Mark" },
  { id: "m7", room: "220", item: "Shower", minutes: 3 * 60, resolver: "Paul" },
  { id: "m8", room: "816", item: "Outlet", minutes: 45, resolver: "Sarah" },
];

/** The two largest units, with a zero unit left out: `3d 4h`, `1d`, `6h 30m`, `45m`. */
function duration(minutes: number) {
  const days = Math.floor(minutes / 1440);
  const hours = Math.floor((minutes % 1440) / 60);
  const mins = Math.round(minutes % 60);
  const parts = days ? [[days, "d"], [hours, "h"]] : hours ? [[hours, "h"], [mins, "m"]] : [[mins, "m"]];
  return parts.filter(([value]) => value).map(([value, unit]) => `${value}${unit}`).join(" ") || "0m";
}

function initialsOf(name: string) {
  return ASSIGNEE_PEOPLE.find((person) => person.name === name)?.avatar ?? "";
}

/** How long maintenance takes to resolve a ticket. The average leads, then the slowest tickets, slowest first. */
export function ResponseTimeWidget() {
  const average = RESOLVED.length ? RESOLVED.reduce((sum, ticket) => sum + ticket.minutes, 0) / RESOLVED.length : 0;
  const shown = [...RESOLVED].sort((a, b) => b.minutes - a.minutes).slice(0, LIMIT);
  const more = RESOLVED.length - shown.length;
  return (
    <Widget icon="wrench" title="Response time" action={<WidgetNote>Past 24h</WidgetNote>}>
      {RESOLVED.length ? (
        <>
          <WidgetSummary>
            <WidgetFigure value={duration(average)} label="average time to resolve" />
          </WidgetSummary>
          <WidgetList>
            {shown.map((ticket) => (
              <WidgetRow
                key={ticket.id}
                as={Link}
                href="/todos"
                lead={<RoomMark room={ticket.room} />}
                title={isRoomNumber(ticket.room) ? ticket.item : `${ticket.room} · ${ticket.item}`}
                meta={duration(ticket.minutes)}
                trail={<Person name={ticket.resolver} initials={initialsOf(ticket.resolver)} variant="pill" />}
              />
            ))}
            {more > 0 ? (
              <WidgetMore as={Link} href="/todos">
                + {more} more
              </WidgetMore>
            ) : null}
          </WidgetList>
        </>
      ) : (
        <WidgetEmpty>
          <Empty icon="wrench" title="Nothing resolved yet">
            Resolved maintenance tickets show here.
          </Empty>
        </WidgetEmpty>
      )}
    </Widget>
  );
}
