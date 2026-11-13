"use client";

import { ASSIGNEE_PEOPLE, Empty, Widget, WidgetEmpty, WidgetList, WidgetMore, WidgetRow } from "@lance-live/sds";
import Link from "next/link";
import { useState } from "react";
import { Podium, Rank, RangeSegments, initialsFrom, type Range } from "./leaderboard";

/** Work closed in the window: work orders, PMs, and readings logged. */
type Engineer = { id: string; name: string; workOrders: number; pms: number; readings: number };

/** Rows under the podium, fourth to sixth. The rest wait behind "+ N more". */
const LIMIT = 3;

const BOARD: Record<Range, Engineer[]> = {
  "7d": [
    { id: "e1", name: "Mark", workOrders: 31, pms: 9, readings: 28 },
    { id: "e2", name: "Paul", workOrders: 27, pms: 12, readings: 22 },
    { id: "e3", name: "Boris", workOrders: 14, pms: 6, readings: 35 },
    { id: "e4", name: "Robin", workOrders: 9, pms: 4, readings: 10 },
    { id: "e5", name: "Chris", workOrders: 7, pms: 2, readings: 6 },
    { id: "e6", name: "Othman", workOrders: 5, pms: 3, readings: 4 },
    { id: "e7", name: "Diana", workOrders: 3, pms: 1, readings: 9 },
  ],
  "14d": [
    { id: "e2", name: "Paul", workOrders: 118, pms: 44, readings: 90 },
    { id: "e1", name: "Mark", workOrders: 112, pms: 38, readings: 104 },
    { id: "e3", name: "Boris", workOrders: 61, pms: 25, readings: 141 },
    { id: "e4", name: "Robin", workOrders: 40, pms: 17, readings: 38 },
    { id: "e5", name: "Chris", workOrders: 22, pms: 8, readings: 12 },
    { id: "e6", name: "Othman", workOrders: 19, pms: 9, readings: 15 },
    { id: "e7", name: "Diana", workOrders: 11, pms: 4, readings: 30 },
  ],
};

function plural(count: number, word: string) {
  return `${count} ${count === 1 ? word : `${word}s`}`;
}

/** Most work orders first. A tie goes to whoever closed more PMs. */
function ranked(list: Engineer[]) {
  return [...list].sort((a, b) => b.workOrders - a.workOrders || b.pms - a.pms);
}

/** Engineers ranked by work orders closed over the chosen window, with their PMs and readings under the name. */
export function MaintenanceLeaderboardWidget() {
  const [range, setRange] = useState<Range>("7d");
  const board = ranked(BOARD[range]);
  const shown = board.slice(3, 3 + LIMIT);
  const more = board.length - 3 - shown.length;
  return (
    <Widget icon="wrench" title="Engineer leaderboard" count={board.length} action={<RangeSegments value={range} onChange={setRange} />}>
      {board.length ? (
        <>
          <Podium top={board.slice(0, 3).map((person) => ({ id: person.id, name: person.name, initials: ASSIGNEE_PEOPLE.find((known) => known.name === person.name)?.avatar ?? initialsFrom(person.name), score: plural(person.workOrders, "work order") }))} />
          {shown.length ? (
        <WidgetList>
          {shown.map((person, index) => (
            <WidgetRow
              key={person.id}
              as={Link}
              href="/todos"
              lead={<Rank place={index + 4} />}
              title={person.name}
              subtitle={`${plural(person.pms, "PM")} · ${plural(person.readings, "reading")}`}
              subtitleTone="muted"
              meta={<span className="home-hk-person-left">{plural(person.workOrders, "work order")}</span>}
            />
          ))}
          {more > 0 ? (
            <WidgetMore as={Link} href="/todos">
              + {more} more
            </WidgetMore>
          ) : null}
        </WidgetList>
          ) : null}
        </>
      ) : (
        <WidgetEmpty>
          <Empty icon="wrench" title="No work closed yet">
            Engineers show here once they close a work order.
          </Empty>
        </WidgetEmpty>
      )}
    </Widget>
  );
}
