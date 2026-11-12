"use client";

import { ASSIGNEE_PEOPLE, Empty, Person, Widget, WidgetEmpty, WidgetList, WidgetMore, WidgetRow } from "@lance-live/gallery-ui";
import Link from "next/link";

/** A sales task due today or earlier. `late` is how far past due, and a task due today has its time instead. */
type SalesTask = { id: string; task: string; account: string; owner: string } & ({ late: string } | { due: string });

/** A glance, not the list. The rest wait behind "+ N more". */
const LIMIT = 4;

/** Overdue first, oldest first, then today's by time. */
const TASKS: SalesTask[] = [
  { id: "s1", task: "Follow up on Acme hold", account: "Acme Events", owner: "Sarah", late: "2d" },
  { id: "s2", task: "Reissue the Ruiz proposal with the corrected billing", account: "Elena Ruiz", owner: "Mark", late: "1d" },
  { id: "s3", task: "Confirm the room block", account: "Lumen Health clinical summit", owner: "", due: "10:00 AM" },
  { id: "s4", task: "Send the wedding contract", account: "Park–Okafor wedding", owner: "Sarah", due: "1:30 PM" },
  { id: "s5", task: "Call about the rate for March", account: "Northwind Travel", owner: "Paul", due: "3:00 PM" },
  { id: "s6", task: "Site visit follow-up", account: "Brightline Partners", owner: "Mark", due: "4:30 PM" },
];

function initialsOf(name: string) {
  return ASSIGNEE_PEOPLE.find((person) => person.name === name)?.avatar ?? "";
}

/** Sales tasks for today: what to do, for which account, when, and who has it. A late task says how late, in red. */
export function SalesTodayWidget() {
  const shown = TASKS.slice(0, LIMIT);
  const more = TASKS.length - shown.length;
  return (
    <Widget icon="todo" title="What to do today" count={TASKS.length}>
      {shown.length ? (
        <WidgetList>
          {shown.map((item) => (
            <WidgetRow
              key={item.id}
              as={Link}
              href="/todos"
              title={item.task}
              subtitle={item.account}
              subtitleTone="muted"
              meta={"late" in item ? <span className="home-pm-behind">{item.late} late</span> : item.due}
              trail={item.owner ? <Person name={item.owner} initials={initialsOf(item.owner)} variant="pill" /> : <Person name="Unassigned" variant="unassigned" />}
            />
          ))}
          {more > 0 ? (
            <WidgetMore as={Link} href="/todos">
              + {more} more
            </WidgetMore>
          ) : null}
        </WidgetList>
      ) : (
        <WidgetEmpty>
          <Empty icon="todo" title="Nothing due today">
            Sales tasks due today show up here.
          </Empty>
        </WidgetEmpty>
      )}
    </Widget>
  );
}
