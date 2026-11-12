"use client";

import { ASSIGNEE_PEOPLE, Empty, Icon, Person, Status, Widget, WidgetEmpty, WidgetList, WidgetMore, WidgetRow, type StatusValue, type UrgencyValue } from "@lance-live/gallery-ui";
import Link from "next/link";

type HomeComplaint = { id: string; room: string; title: string; urgency: UrgencyValue; status: StatusValue; assignee: string; opened: string };

/** A glance, not the list. The rest wait behind "+ N more". */
const LIMIT = 4;
const RANK: Record<UrgencyValue, number> = { urgent: 0, high: 1, standard: 2, low: 3 };

const COMPLAINTS: HomeComplaint[] = [
  { id: "p1", room: "917", title: "Smoking smell in the hallway", urgency: "urgent", status: "open", assignee: "", opened: "2h" },
  { id: "p2", room: "905", title: "Noise from the room next door", urgency: "high", status: "progress", assignee: "Mark", opened: "5h" },
  { id: "p3", room: "412", title: "Shower drains slowly", urgency: "standard", status: "open", assignee: "Paul", opened: "1d" },
  { id: "p4", room: "1108", title: "Room not ready at check-in", urgency: "high", status: "progress", assignee: "Sarah", opened: "1d" },
  { id: "p5", room: "623", title: "Charged twice for parking", urgency: "low", status: "open", assignee: "", opened: "2d" },
];

function initialsOf(name: string) {
  return ASSIGNEE_PEOPLE.find((person) => person.name === name)?.avatar ?? "";
}

/** Open complaints at a glance, most urgent first, with who has each one. */
export function ComplaintsWidget() {
  const shown = [...COMPLAINTS].sort((a, b) => RANK[a.urgency] - RANK[b.urgency]).slice(0, LIMIT);
  const more = COMPLAINTS.length - shown.length;
  return (
    <Widget
      icon="alert"
      title="Complaints"
      count={COMPLAINTS.length}
      action={
        <Link className="sds text-icon sm" href="/complaints?new" aria-label="New complaint">
          <Icon name="plus" size={14} />
        </Link>
      }
    >
      {shown.length ? (
        <WidgetList>
          {shown.map((complaint) => (
            <WidgetRow
              key={complaint.id}
              as={Link}
              href="/complaints"
              lead={<Status status={complaint.status} iconOnly />}
              title={complaint.room}
              subtitle={complaint.title}
              meta={complaint.opened}
              trail={complaint.assignee ? <Person name={complaint.assignee} initials={initialsOf(complaint.assignee)} variant="pill" /> : <Person name="Unassigned" variant="unassigned" />}
            />
          ))}
          {more > 0 ? (
            <WidgetMore as={Link} href="/complaints">
              + {more} more
            </WidgetMore>
          ) : null}
        </WidgetList>
      ) : (
        <WidgetEmpty>
          <Empty icon="alert" title="No open complaints">
            Nothing is open right now.
          </Empty>
        </WidgetEmpty>
      )}
    </Widget>
  );
}
