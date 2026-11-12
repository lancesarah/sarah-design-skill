"use client";

import { ASSIGNEE_PEOPLE, Avatar, Empty, Widget, WidgetEmpty, WidgetList, WidgetMore, WidgetRow } from "@lance-live/gallery-ui";
import Link from "next/link";

/** A closed ticket. `ago` is minutes since it was completed. */
type Closed = { id: string; item: string; closer: string; ago: number };

type Closer = { name: string; initials: string; items: string[]; latest: number };

const WINDOW = 24 * 60;
/** A glance, not the roster. The rest wait behind "+ N more". */
const LIMIT = 3;

const CLOSED: Closed[] = [
  { id: "c1", item: "Outlet", closer: "Sarah", ago: 20 },
  { id: "c2", item: "Shower", closer: "Paul", ago: 45 },
  { id: "c3", item: "Door lock", closer: "Mark", ago: 70 },
  { id: "c4", item: "Towels", closer: "Paul", ago: 2 * 60 },
  { id: "c5", item: "Lighting", closer: "Sarah", ago: 3 * 60 },
  { id: "c6", item: "TV", closer: "Mark", ago: 4 * 60 },
  { id: "c7", item: "Ice machine", closer: "Mark", ago: 6 * 60 },
  { id: "c8", item: "Climate", closer: "Paul", ago: 8 * 60 },
  { id: "c9", item: "Pillows/Bedding", closer: "Boris", ago: 11 * 60 },
  { id: "c10", item: "Plumbing", closer: "Mark", ago: 15 * 60 },
  { id: "c11", item: "Dryer", closer: "Paul", ago: 19 * 60 },
  { id: "c12", item: "Bug / insect", closer: "Mark", ago: 22 * 60 },
  { id: "c13", item: "Full service", closer: "Sarah", ago: 26 * 60 },
  { id: "c14", item: "TV", closer: "Boris", ago: 30 * 60 },
];

function initialsOf(name: string) {
  return ASSIGNEE_PEOPLE.find((person) => person.name === name)?.avatar ?? "";
}

/** One entry per person, most closed first. A tie goes to whoever closed one most recently. */
function byCloser(tickets: Closed[]) {
  const people = new Map<string, Closer>();
  for (const ticket of [...tickets].sort((a, b) => a.ago - b.ago)) {
    const person = people.get(ticket.closer) ?? { name: ticket.closer, initials: initialsOf(ticket.closer), items: [], latest: ticket.ago };
    person.items.push(ticket.item);
    people.set(ticket.closer, person);
  }
  return [...people.values()].sort((a, b) => b.items.length - a.items.length || a.latest - b.latest);
}

/** Tickets completed in the past 24h. The total leads, then who closed them, with what each person closed, latest first. */
export function CompletedWidget() {
  const today = CLOSED.filter((ticket) => ticket.ago < WINDOW);
  const closers = byCloser(today);
  const shown = closers.slice(0, LIMIT);
  const more = closers.length - shown.length;
  return (
    <Widget icon="check" title="Completed today">
      {today.length ? (
        <>
          <div className="home-summary">
            <p className="home-summary-hero">
              <span className="home-summary-figure">{today.length}</span>
              <span className="home-summary-label">{today.length === 1 ? "ticket" : "tickets"} completed in the past 24h</span>
            </p>
          </div>
          <WidgetList>
            {shown.map((person) => (
              <WidgetRow
                key={person.name}
                as={Link}
                href="/todos"
                lead={<Avatar initials={person.initials} />}
                title={person.name}
                subtitle={person.items.join(", ")}
                subtitleTone="muted"
                meta={<span className="home-hk-person-left">{person.items.length} closed</span>}
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
          <Empty icon="check" title="Nothing completed yet">
            Tickets closed in the past 24h show here.
          </Empty>
        </WidgetEmpty>
      )}
    </Widget>
  );
}
