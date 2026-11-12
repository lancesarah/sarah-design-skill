"use client";

import { Icon } from "../icons";

/** A room number has digits only. Anything else, such as Lobby, is a place. */
export function isRoomNumber(room: string) {
  return /^\d+$/.test(room);
}

/** The room as a 40px square at the start of a widget row, like a group chat's mark in Messages. A place has no number, so it takes the location icon, and the row writes the place in its title. */
export function RoomMark({ room, className }: { room: string; className?: string }) {
  const classes = ["sds", "room-mark", className].filter(Boolean).join(" ");
  return isRoomNumber(room) ? (
    <span className={classes}>{room}</span>
  ) : (
    <span className={classes} aria-hidden="true">
      <Icon name="location" size={18} />
    </span>
  );
}
