"use client";

import { Avatar, Empty, Meter, Widget, WidgetEmpty, WidgetFigure, WidgetList, WidgetMore, WidgetRow, WidgetStats, WidgetSummary } from "@lance-live/gallery-ui";
import Link from "next/link";

type Housekeeper = { id: string; name: string; initials: string; done: number; left: number };

/** Rooms on DND are skipped, so they count as neither clean nor left. */
const DND = 6;
/** A glance, not the roster. The rest wait behind "+ N more". */
const LIMIT = 3;

const HOUSEKEEPERS: Housekeeper[] = [
  { id: "h1", name: "Esmeralda", initials: "ES", done: 12, left: 9 },
  { id: "h2", name: "Fred", initials: "FS", done: 11, left: 8 },
  { id: "h3", name: "Lupe", initials: "LV", done: 9, left: 7 },
  { id: "h4", name: "Rosa", initials: "RM", done: 6, left: 8 },
  { id: "h5", name: "Wendy", initials: "WQ", done: 14, left: 6 },
];

/** Today's rooms at a glance. Rooms left to clean leads; clean and DND sit beside it, then the housekeepers with the most left. */
export function HousekeepingWidget() {
  const clean = HOUSEKEEPERS.reduce((sum, person) => sum + person.done, 0);
  const left = HOUSEKEEPERS.reduce((sum, person) => sum + person.left, 0);
  const total = clean + left + DND;
  const shown = [...HOUSEKEEPERS].sort((a, b) => b.left - a.left).slice(0, LIMIT);
  const more = HOUSEKEEPERS.length - shown.length;
  return (
    <Widget icon="bed" title="Housekeeping" className="home-housekeeping">
      {HOUSEKEEPERS.length ? (
        <>
          <WidgetSummary>
            <WidgetFigure value={left} label="rooms left to clean" />
            <WidgetStats
              items={[
                { label: "Clean", value: clean, key: "action" },
                { label: "DND", value: DND, key: "strong" },
                { label: "Total", value: total },
              ]}
            />
            <Meter className="widget-summary-meter" value={clean} max={total} end={DND} label={`${clean} clean, ${left} left, ${DND} on DND, of ${total} rooms`} />
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
          <Empty icon="bed" title="No rooms assigned">
            Housekeepers show here once today's rooms are assigned.
          </Empty>
        </WidgetEmpty>
      )}
    </Widget>
  );
}
