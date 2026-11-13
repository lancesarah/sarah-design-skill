"use client";

import { Avatar, Empty, Meter, Widget, WidgetEmpty, WidgetFigure, WidgetList, WidgetMore, WidgetRow, WidgetStats, WidgetSummary } from "@lance-live/sds";
import Link from "next/link";

type Inspector = { id: string; name: string; initials: string; done: number; left: number };

/** Rooms not cleaned yet, so not ready to inspect. They take the meter's dark end. */
const NOT_READY = 23;
/** Rooms an inspector failed and returned to housekeeping today. */
const SENT_BACK = 3;
/** A glance, not the roster. The rest wait behind "+ N more". */
const LIMIT = 3;

const INSPECTORS: Inspector[] = [
  { id: "i1", name: "Rosa", initials: "RM", done: 14, left: 5 },
  { id: "i2", name: "Lupe", initials: "LV", done: 12, left: 4 },
  { id: "i3", name: "Mark", initials: "MJ", done: 9, left: 3 },
  { id: "i4", name: "Ana", initials: "AC", done: 6, left: 2 },
];

/** Today's inspections at a glance. Rooms cleaned and waiting lead; done and not ready sit beside them, then the inspectors with the most left. */
export function InspectionsWidget() {
  const done = INSPECTORS.reduce((sum, person) => sum + person.done, 0);
  const cleaned = INSPECTORS.reduce((sum, person) => sum + person.left, 0);
  const total = done + cleaned + NOT_READY;
  const shown = [...INSPECTORS].sort((a, b) => b.left - a.left).slice(0, LIMIT);
  const more = INSPECTORS.length - shown.length;
  return (
    <Widget icon="eye" title="Inspections">
      {INSPECTORS.length ? (
        <>
          <WidgetSummary>
            <WidgetFigure value={cleaned} label="rooms to inspect" />
            <WidgetStats
              items={[
                { label: "Done", value: done, key: "action" },
                { label: "Cleaned", value: cleaned, key: "quiet" },
                { label: "Not ready", value: NOT_READY, key: "strong" },
                { label: "Sent back", value: SENT_BACK },
              ]}
            />
            <Meter
              className="widget-summary-meter"
              value={done}
              max={total}
              end={NOT_READY}
              label={`${done} done, ${cleaned} cleaned and waiting, ${NOT_READY} not ready, of ${total} rooms`}
            />
          </WidgetSummary>
          <WidgetList>
            {shown.map((person) => (
              <WidgetRow
                key={person.id}
                as={Link}
                href="/boards"
                lead={<Avatar initials={person.initials} />}
                title={person.name}
                subtitle={`${person.done} done`}
                subtitleTone="muted"
                meta={<span className="home-hk-person-left">{person.left} left</span>}
              />
            ))}
            {more > 0 ? (
              <WidgetMore as={Link} href="/boards">
                + {more} more
              </WidgetMore>
            ) : null}
          </WidgetList>
        </>
      ) : (
        <WidgetEmpty>
          <Empty icon="eye" title="No inspections assigned">
            Inspectors show here once today's rooms are assigned.
          </Empty>
        </WidgetEmpty>
      )}
    </Widget>
  );
}
