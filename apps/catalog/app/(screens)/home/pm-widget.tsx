"use client";

import { Empty, Status, Widget, WidgetEmpty, WidgetList, WidgetMore, WidgetNote, WidgetRow, type StatusValue } from "@lance-live/gallery-ui";
import Link from "next/link";

/** `behind` is how many areas the program trails its pace by. Zero is on track. */
type HomePm = { id: string; name: string; suggested: number; behind: number; due: string; status: StatusValue };

/** A glance, not the schedule. The rest wait behind "+ N more". */
const LIMIT = 4;

const PMS: HomePm[] = [
  { id: "make-right", name: "Make-it-right guestroom PM", suggested: 3, behind: 9, due: "Dec 31", status: "progress" },
  { id: "shower", name: "Shower door PM", suggested: 2, behind: 4, due: "Dec 31", status: "progress" },
  { id: "carpet", name: "Carpet cleaning", suggested: 3, behind: 0, due: "Dec 31", status: "progress" },
  { id: "extinguisher", name: "Fire extinguisher inspection", suggested: 2, behind: 0, due: "Nov 30", status: "progress" },
  { id: "garage", name: "Parking garage and lot", suggested: 1, behind: 1, due: "Nov 9", status: "open" },
  { id: "lights", name: "Emergency light test", suggested: 1, behind: 0, due: "Nov 30", status: "progress" },
];

/** Today's PM work: how many areas each program suggests, and whether it's behind. Behind comes first. */
export function PmWidget() {
  const shown = [...PMS].sort((a, b) => b.behind - a.behind).slice(0, LIMIT);
  const more = PMS.length - shown.length;
  const today = PMS.reduce((sum, pm) => sum + pm.suggested, 0);

  return (
    <Widget
      icon="wrench"
      title="PMs"
      count={PMS.length}
      action={PMS.length ? <WidgetNote>{today} areas today</WidgetNote> : undefined}
    >
      {PMS.length ? (
        <WidgetList>
          {shown.map((pm) => (
            <WidgetRow
              key={pm.id}
              as={Link}
              href="/pm"
              lead={<Status status={pm.status} iconOnly />}
              title={pm.name}
              subtitle={`${pm.suggested} ${pm.suggested === 1 ? "area" : "areas"} suggested today`}
              subtitleTone="muted"
              meta={`Due ${pm.due}`}
              trail={pm.behind ? <span className="home-pm-behind">{pm.behind} behind</span> : <span className="home-pm-on-track">On track</span>}
            />
          ))}
          {more > 0 ? (
            <WidgetMore as={Link} href="/pm">
              + {more} more
            </WidgetMore>
          ) : null}
        </WidgetList>
      ) : (
        <WidgetEmpty>
          <Empty icon="wrench" title="No PM programs">
            Programs show here once they are set up.
          </Empty>
        </WidgetEmpty>
      )}
    </Widget>
  );
}
