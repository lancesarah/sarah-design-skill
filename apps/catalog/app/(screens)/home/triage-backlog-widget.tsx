"use client";

import { Empty, Widget, WidgetEmpty, WidgetList, WidgetMore, WidgetRow } from "@lance-live/gallery-ui";
import Link from "next/link";

type Conversation = { id: string; from: string; channel: "Email" | "SMS" | "Call"; preview: string; age: string };

/** A glance, not the inbox. The rest wait behind "+ N more". */
const LIMIT = 4;

/** No sales inbox yet. */
const INBOX = "#";

/** Oldest first, so the longest unattached reads first. */
const BACKLOG: Conversation[] = [
  { id: "t1", from: "jordan@meridianco.com", channel: "Email", preview: "Looking at dates in May for 60 people", age: "1d" },
  { id: "t2", from: "+1 (415) 555-0142", channel: "SMS", preview: "Do you have rooms for a team offsite?", age: "6h" },
  { id: "t3", from: "+1 (212) 555-0199", channel: "Call", preview: "Asked about a rehearsal dinner for 40", age: "3h" },
  { id: "t4", from: "events@harborlight.org", channel: "Email", preview: "Gala in October, ballroom availability", age: "1h" },
  { id: "t5", from: "sam.k@outlook.com", channel: "Email", preview: "Room block for a family reunion", age: "20m" },
];

/** Sales conversations that are not on a lead yet. Who it is from, then the channel and the first line. */
export function TriageBacklogWidget() {
  const shown = BACKLOG.slice(0, LIMIT);
  const more = BACKLOG.length - shown.length;
  return (
    <Widget icon="list" title="Triage backlog" count={BACKLOG.length}>
      {shown.length ? (
        <WidgetList>
          {shown.map((item) => (
            <WidgetRow key={item.id} as={Link} href={INBOX} title={item.from} subtitle={`${item.channel} · ${item.preview}`} subtitleTone="muted" meta={item.age} />
          ))}
          {more > 0 ? (
            <WidgetMore as={Link} href={INBOX}>
              + {more} more
            </WidgetMore>
          ) : null}
        </WidgetList>
      ) : (
        <WidgetEmpty>
          <Empty icon="list" title="Backlog is clear">
            Every conversation is on a lead.
          </Empty>
        </WidgetEmpty>
      )}
    </Widget>
  );
}
