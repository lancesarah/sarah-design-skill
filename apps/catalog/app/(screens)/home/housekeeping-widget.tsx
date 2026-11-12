"use client";

import { Avatar, Empty, Meter, Widget, WidgetEmpty, WidgetList, WidgetMore, WidgetRow } from "@lance-live/gallery-ui";
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
          <div className="home-summary">
            <p className="home-summary-hero">
              <span className="home-summary-figure">{left}</span>
              <span className="home-summary-label">rooms left to clean</span>
            </p>
            <dl className="home-summary-stats">
              <div>
                <dt>
                  <span className="home-summary-key is-clean" aria-hidden="true" />
                  Clean
                </dt>
                <dd>{clean}</dd>
              </div>
              <div>
                <dt>
                  <span className="home-summary-key is-dnd" aria-hidden="true" />
                  DND
                </dt>
                <dd>{DND}</dd>
              </div>
              <div>
                <dt>Total</dt>
                <dd>{total}</dd>
              </div>
            </dl>
            <Meter className="home-summary-meter" value={clean} max={total} end={DND} label={`${clean} clean, ${left} left, ${DND} on DND, of ${total} rooms`} />
          </div>
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
