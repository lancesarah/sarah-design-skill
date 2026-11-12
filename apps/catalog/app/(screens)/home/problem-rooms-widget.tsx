"use client";

import { Empty, RoomMark, Widget, WidgetEmpty, WidgetList, WidgetMore, WidgetRow } from "@lance-live/gallery-ui";
import Link from "next/link";
/** A room's tickets over the last 90d. `issue` is the one that keeps coming back; `last` is the age of the newest ticket. */
type ProblemRoom = { room: string; issue: string; tickets: number; last: string };

/** A glance, not the list. The rest wait behind "+ N more". */
const LIMIT = 4;

const ROOMS: ProblemRoom[] = [
  { room: "714", issue: "AC not cooling", tickets: 5, last: "2d" },
  { room: "1108", issue: "Shower drains slowly", tickets: 4, last: "6h" },
  { room: "305", issue: "TV won't turn on", tickets: 3, last: "9d" },
  { room: "917", issue: "Smoking smell", tickets: 3, last: "2h" },
  { room: "612", issue: "Lights flicker", tickets: 2, last: "3d" },
  { room: "220", issue: "Door lock sticks", tickets: 2, last: "21d" },
  { room: "816", issue: "Bug / insect", tickets: 1, last: "2h" },
];

/** A room is a problem from this many tickets in 90d. */
const THRESHOLD = 3;

/** Rooms with 3 or more tickets in 90d, most tickets first, with the issue that repeats and when the last one came in. */
export function ProblemRoomsWidget() {
  const problems = ROOMS.filter((room) => room.tickets >= THRESHOLD).sort((a, b) => b.tickets - a.tickets);
  const shown = problems.slice(0, LIMIT);
  const more = problems.length - shown.length;
  return (
    <Widget icon="warn" title="Problem rooms" count={problems.length} action={<span className="home-pm-today">Last 90d</span>}>
      {shown.length ? (
        <WidgetList>
          {shown.map((room) => (
            <WidgetRow
              key={room.room}
              as={Link}
              href="/todos"
              lead={<RoomMark room={room.room} />}
              title={room.issue}
              meta={`Last ${room.last}`}
              trail={<span className="home-trail-figure">{room.tickets} tickets</span>}
            />
          ))}
          {more > 0 ? (
            <WidgetMore as={Link} href="/todos">
              + {more} more
            </WidgetMore>
          ) : null}
        </WidgetList>
      ) : (
        <WidgetEmpty>
          <Empty icon="warn" title="No problem rooms">
            No room had more than one ticket in 90d.
          </Empty>
        </WidgetEmpty>
      )}
    </Widget>
  );
}
