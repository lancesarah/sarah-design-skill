"use client";

import { Empty, RoomMark, Widget, WidgetEmpty, WidgetList, WidgetMore, WidgetNote, WidgetRow } from "@lance-live/gallery-ui";
import Link from "next/link";

type MinibarRoom = { room: string; items: string; charge: number; out: string };

/** A glance, not the folio. The rest wait behind "+ N more". */
const LIMIT = 4;

/** Checked out today with something taken from the minibar. Most recent checkout first. */
const ROOMS: MinibarRoom[] = [
  { room: "512", items: "2 waters, 1 chips", charge: 14, out: "20m" },
  { room: "1108", items: "Wine, 2 sodas", charge: 38, out: "1h" },
  { room: "305", items: "Chocolate", charge: 6, out: "2h" },
  { room: "917", items: "4 waters, 2 beers", charge: 28, out: "3h" },
  { room: "702", items: "Nuts", charge: 8, out: "4h" },
];

const money = (value: number) => `$${value}`;

/** Checkout rooms where the minibar was used: what was taken and the charge. The day's total sits in the head. */
export function MinibarWidget() {
  const shown = ROOMS.slice(0, LIMIT);
  const more = ROOMS.length - shown.length;
  const total = ROOMS.reduce((sum, room) => sum + room.charge, 0);
  return (
    <Widget icon="cup" title="Minibar" count={ROOMS.length} action={ROOMS.length ? <WidgetNote>{money(total)} today</WidgetNote> : undefined}>
      {shown.length ? (
        <WidgetList>
          {shown.map((room) => (
            <WidgetRow
              key={room.room}
              as={Link}
              href="/boards"
              lead={<RoomMark room={room.room} />}
              title={room.items}
              meta={`Out ${room.out}`}
              trail={<span className="home-trail-figure">{money(room.charge)}</span>}
            />
          ))}
          {more > 0 ? (
            <WidgetMore as={Link} href="/boards">
              + {more} more
            </WidgetMore>
          ) : null}
        </WidgetList>
      ) : (
        <WidgetEmpty>
          <Empty icon="cup" title="No minibar charges">
            Checkout rooms with items taken show here.
          </Empty>
        </WidgetEmpty>
      )}
    </Widget>
  );
}
