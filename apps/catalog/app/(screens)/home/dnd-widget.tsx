"use client";

import { Empty, Icon, RoomMark, Widget, WidgetEmpty, WidgetList, WidgetMore, WidgetRow } from "@lance-live/gallery-ui";
import Link from "next/link";
import { CheckStatus } from "./check-status";
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

/** Bottles the desk handed out today. */
const WATER_TAKEN = 14;

/** The desk's two tallies for today: rooms with the DND sign out, and water taken. Then the DND rooms. Housekeeping's one check on the list sits in the head. */
export function DndWidget() {
  const shown = ROOMS.slice(0, LIMIT);
  const more = ROOMS.length - shown.length;
  return (
    <Widget
      icon="moon"
      title="Front desk tools"
      action={
        <CheckStatus
          state={VERIFIED ? "done" : "pending"}
          title={VERIFIED ? "Verified" : "Not verified"}
          sub={VERIFIED ? `${VERIFIED.by}, ${VERIFIED.ago} ago` : "by housekeeping"}
        />
      }
    >
      {ROOMS.length ? (
        <>
          <div className="home-summary">
            <p className="home-summary-hero">
              <span className="home-summary-figure">{ROOMS.length}</span>
              <span className="home-summary-label">rooms on DND</span>
            </p>
            <dl className="home-summary-stats">
              <div>
                <dt>Water taken</dt>
                <dd>{WATER_TAKEN}</dd>
              </div>
            </dl>
          </div>
          <WidgetList>
            {shown.map((room) => (
              <WidgetRow
                key={room.room}
                as={Link}
                href="/boards"
                lead={<RoomMark room={room.room} />}
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
        </>
      ) : (
        <WidgetEmpty>
          <Empty icon="moon" title="No rooms on DND">
            Rooms with the sign out show here.
          </Empty>
        </WidgetEmpty>
      )}
    </Widget>
  );
}
