"use client";

import { Empty, Widget, WidgetEmpty, WidgetList, WidgetMore, WidgetRow } from "@lance-live/gallery-ui";
import Link from "next/link";
import { useState } from "react";
import { Podium, Rank, RangeSegments, initialsFrom, type Range } from "./leaderboard";

/** Rooms cleaned in the window, and how many of those an inspector sent back. */
type Housekeeper = { id: string; name: string; rooms: number; sentBack: number };

/** Rows under the podium, fourth to sixth. The rest wait behind "+ N more". */
const LIMIT = 3;

const BOARD: Record<Range, Housekeeper[]> = {
  "7d": [
    { id: "h1", name: "Sofia Martinez", rooms: 70, sentBack: 0 },
    { id: "h2", name: "Maria Garcia", rooms: 56, sentBack: 2 },
    { id: "h3", name: "Ana Lopez", rooms: 53, sentBack: 0 },
    { id: "h4", name: "Carmen Hernandez", rooms: 53, sentBack: 1 },
    { id: "h5", name: "Lupe Valdez", rooms: 41, sentBack: 3 },
    { id: "h6", name: "Esmeralda Ruiz", rooms: 38, sentBack: 0 },
    { id: "h7", name: "Rosa Mendez", rooms: 33, sentBack: 2 },
    { id: "h8", name: "Wendy Quinn", rooms: 29, sentBack: 1 },
  ],
  "14d": [
    { id: "h2", name: "Maria Garcia", rooms: 262, sentBack: 6 },
    { id: "h1", name: "Sofia Martinez", rooms: 258, sentBack: 2 },
    { id: "h4", name: "Carmen Hernandez", rooms: 231, sentBack: 4 },
    { id: "h3", name: "Ana Lopez", rooms: 219, sentBack: 1 },
    { id: "h5", name: "Lupe Valdez", rooms: 184, sentBack: 9 },
    { id: "h6", name: "Esmeralda Ruiz", rooms: 171, sentBack: 3 },
    { id: "h7", name: "Rosa Mendez", rooms: 150, sentBack: 5 },
    { id: "h8", name: "Wendy Quinn", rooms: 132, sentBack: 4 },
  ],
};

/** Most rooms first. A tie goes to whoever had fewer sent back. */
function ranked(list: Housekeeper[]) {
  return [...list].sort((a, b) => b.rooms - a.rooms || a.sentBack - b.sentBack);
}

/** Housekeepers ranked by rooms cleaned over the chosen window, with how many came back from inspection. */
export function HousekeepingLeaderboardWidget() {
  const [range, setRange] = useState<Range>("7d");
  const board = ranked(BOARD[range]);
  const shown = board.slice(3, 3 + LIMIT);
  const more = board.length - 3 - shown.length;
  return (
    <Widget icon="bed" title="Housekeeper leaderboard" count={board.length} action={<RangeSegments value={range} onChange={setRange} />}>
      {board.length ? (
        <>
          <Podium top={board.slice(0, 3).map((person) => ({ id: person.id, name: person.name, initials: initialsFrom(person.name), score: `${person.rooms} rooms` }))} />
          {shown.length ? (
        <WidgetList>
          {shown.map((person, index) => (
            <WidgetRow
              key={person.id}
              as={Link}
              href="/boards"
              lead={<Rank place={index + 4} />}
              title={person.name}
              subtitle={person.sentBack ? `${person.sentBack} sent back` : "None sent back"}
              subtitleTone="muted"
              meta={<span className="home-hk-person-left">{person.rooms} rooms</span>}
            />
          ))}
          {more > 0 ? (
            <WidgetMore as={Link} href="/boards">
              + {more} more
            </WidgetMore>
          ) : null}
        </WidgetList>
          ) : null}
        </>
      ) : (
        <WidgetEmpty>
          <Empty icon="bed" title="No rooms cleaned yet">
            Housekeepers show here once they clean a room.
          </Empty>
        </WidgetEmpty>
      )}
    </Widget>
  );
}
