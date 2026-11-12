"use client";

import { Empty, Widget, WidgetEmpty, WidgetFacts, WidgetList, WidgetMore, WidgetRow } from "@lance-live/gallery-ui";
import Link from "next/link";

type HotelEvent = { id: string; name: string; kind: "BEO" | "Group resume"; where: string; guests: number; day: "Today" | "Tomorrow"; time: string };

/** A glance, not the calendar. The rest wait behind "+ N more". */
const LIMIT = 4;

/** No events screen yet. */
const EVENTS_HREF = "#";

/** Today first, then tomorrow, each by start time. */
const EVENTS: HotelEvent[] = [
  { id: "e1", name: "Brightline Partners breakfast", kind: "BEO", where: "Garden room", guests: 40, day: "Today", time: "8:00 AM" },
  { id: "e2", name: "Lumen Health clinical summit", kind: "Group resume", where: "Ballroom", guests: 180, day: "Today", time: "9:00 AM" },
  { id: "e3", name: "Park–Okafor rehearsal dinner", kind: "BEO", where: "Restaurant", guests: 36, day: "Today", time: "6:30 PM" },
  { id: "e4", name: "Northwind Travel group", kind: "Group resume", where: "Arrivals", guests: 24, day: "Tomorrow", time: "2:00 PM" },
  { id: "e5", name: "Park–Okafor wedding", kind: "BEO", where: "Ballroom", guests: 140, day: "Tomorrow", time: "5:00 PM" },
];

/** Today's and tomorrow's BEOs and group resumes. Tomorrow's say so first, so the day reads before the room. */
export function EventsWidget() {
  const shown = EVENTS.slice(0, LIMIT);
  const more = EVENTS.length - shown.length;
  return (
    <Widget icon="calendar" title="Today's events" count={EVENTS.length}>
      {shown.length ? (
        <WidgetList>
          {shown.map((event) => (
            <WidgetRow
              key={event.id}
              as={Link}
              href={EVENTS_HREF}
              title={event.name}
              subtitle={<WidgetFacts items={[event.day === "Tomorrow" ? "Tomorrow" : null, event.where, `${event.guests} guests`]} />}
              meta={event.time}
              trail={<span className="mini-pill">{event.kind}</span>}
            />
          ))}
          {more > 0 ? (
            <WidgetMore as={Link} href={EVENTS_HREF}>
              + {more} more
            </WidgetMore>
          ) : null}
        </WidgetList>
      ) : (
        <WidgetEmpty>
          <Empty icon="calendar" title="No events">
            BEOs and group resumes for today and tomorrow show here.
          </Empty>
        </WidgetEmpty>
      )}
    </Widget>
  );
}
