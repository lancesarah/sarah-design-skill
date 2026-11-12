"use client";

import { Avatar, Empty, Widget, WidgetEmpty, WidgetList, WidgetMore, WidgetRow } from "@lance-live/gallery-ui";
import Link from "next/link";

type Waiting = { id: string; lead: string; initials: string; last: string; waiting: string; late: boolean };

/** A glance, not the inbox. The rest wait behind "+ N more". */
const LIMIT = 4;

/** No sales inbox yet. */
const INBOX = "#";

/** Longest waiting first. `late` is past the hour the hotel answers in. */
const WAITING: Waiting[] = [
  { id: "w1", lead: "Acme Events", initials: "AE", last: "Can you hold the block one more week?", waiting: "1d 2h", late: true },
  { id: "w2", lead: "Elena Ruiz", initials: "ER", last: "The billing address is still wrong on page 2.", waiting: "5h", late: true },
  { id: "w3", lead: "Northwind Travel", initials: "NT", last: "What rate can you do for March?", waiting: "2h", late: true },
  { id: "w4", lead: "Brightline Partners", initials: "BP", last: "Thanks for the tour, sending the deposit.", waiting: "40m", late: false },
  { id: "w5", lead: "Lumen Health", initials: "LH", last: "Is AV included in the ballroom?", waiting: "20m", late: false },
];

/** Open leads where the guest wrote last. How long they have waited sits on the right, red once it is past the hour. */
export function AwaitingReplyWidget() {
  const shown = WAITING.slice(0, LIMIT);
  const more = WAITING.length - shown.length;
  return (
    <Widget icon="bubble" title="Awaiting reply" count={WAITING.length}>
      {shown.length ? (
        <WidgetList>
          {shown.map((item) => (
            <WidgetRow
              key={item.id}
              as={Link}
              href={INBOX}
              lead={<Avatar initials={item.initials} name={item.lead} />}
              title={item.lead}
              subtitle={item.last}
              subtitleTone="muted"
              meta={item.late ? <span className="home-pm-behind">{item.waiting}</span> : item.waiting}
            />
          ))}
          {more > 0 ? (
            <WidgetMore as={Link} href={INBOX}>
              + {more} more
            </WidgetMore>
          ) : null}
        </WidgetList>
      ) : (
        <WidgetEmpty>
          <Empty icon="bubble" title="Nothing awaiting a reply">
            Every open lead has an answer from the hotel.
          </Empty>
        </WidgetEmpty>
      )}
    </Widget>
  );
}
