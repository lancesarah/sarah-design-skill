"use client";

import { Icon, Widget, WidgetList, WidgetMore, WidgetRow } from "@lance-live/gallery-ui";
import Link from "next/link";

type RoomStatus = "OD" | "OC";
type DndRoom = { room: string; status: RoomStatus; since: string };

const STATUS_NAME: Record<RoomStatus, string> = { OD: "Occupied dirty", OC: "Occupied clean" };
/** A glance, not the roster. The rest wait behind "+ N more". */
const LIMIT = 4;

const ROOMS: DndRoom[] = [
  { room: "612", status: "OD", since: "5h" },
  { room: "318", status: "OD", since: "4h" },
  { room: "1021", status: "OD", since: "3h" },
  { room: "816", status: "OD", since: "2h" },
  { room: "904", status: "OD", since: "1h" },
  { room: "207", status: "OD", since: "40m" },
];

/** Housekeeping verifies the DND list as a whole, once they have walked it. Undefined until then. */
const VERIFIED: { by: string; ago: string } | undefined = { by: "Rosa", ago: "20m" };

/** Green check once housekeeping has verified the list; a dashed ring until then. */
function VerifiedMark({ verified }: { verified: boolean }) {
  return verified ? (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path fill="var(--status-complete)" fillRule="evenodd" d="M9 0a9 9 0 1 0 0 18A9 9 0 0 0 9 0Zm3.65 6.66-1.05-.86-4 4.9-1.75-1.76-.95.96 2.8 2.8 4.95-6.04Z" />
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <circle cx="9" cy="9" r="8" fill="none" stroke="var(--black-25)" strokeWidth="1.5" strokeDasharray="2.5 2.5" />
    </svg>
  );
}

/** Rooms with the sign out right now. The count leads, housekeeping's one check on the list sits beside it, then the rooms. */
export function DndWidget() {
  const shown = ROOMS.slice(0, LIMIT);
  const more = ROOMS.length - shown.length;
  return (
    <Widget icon="moon" title="Do not disturb">
      <div className="home-summary">
        <p className="home-summary-hero">
          <span className="home-summary-figure">{ROOMS.length}</span>
          <span className="home-summary-label">rooms on DND</span>
        </p>
        <p className="home-dnd-check">
          <VerifiedMark verified={Boolean(VERIFIED)} />
          <span className="home-dnd-check-copy">
            <span>{VERIFIED ? "Verified" : "Not verified"}</span>
            <span className="home-dnd-check-sub">{VERIFIED ? `${VERIFIED.by}, ${VERIFIED.ago} ago` : "by housekeeping"}</span>
          </span>
        </p>
      </div>
      <WidgetList>
        {shown.map((room) => (
          <WidgetRow
            key={room.room}
            as={Link}
            href="/boards"
            lead={<span className="home-dnd-room">{room.room}</span>}
            title={
              <span className="home-dnd-state">
                <Icon name="moon" size={14} />
                <span className="mini-pill" title={STATUS_NAME[room.status]}>
                  {room.status}
                </span>
              </span>
            }
            meta={room.since}
          />
        ))}
        {more > 0 ? (
          <WidgetMore as={Link} href="/boards">
            + {more} more
          </WidgetMore>
        ) : null}
      </WidgetList>
    </Widget>
  );
}
