"use client";

import { Empty, Widget, WidgetEmpty, WidgetList, WidgetMore, WidgetRow } from "@lance-live/gallery-ui";
import Link from "next/link";

type Reading = { id: string; source: string; target: string; value: string; when: string };

/** A glance, not the log. The rest wait behind "+ N more". */
const LIMIT = 4;

/** This week, newest first. */
const READINGS: Reading[] = [
  { id: "r1", source: "Pool pH", target: "7.2–7.6", value: "7.9", when: "2h" },
  { id: "r2", source: "Hot tub chlorine", target: "3–5 ppm", value: "1.8 ppm", when: "1d" },
  { id: "r3", source: "Boiler 2 pressure", target: "12–18 psi", value: "21 psi", when: "3d" },
  { id: "r4", source: "Walk-in freezer", target: "−10–0 °F", value: "4 °F", when: "4d" },
  { id: "r5", source: "Chiller return", target: "52–56 °F", value: "59 °F", when: "6d" },
];

/** Readings logged outside their target this week. The reading is red, the target sits under the source. */
export function OutOfRangeWidget() {
  const shown = READINGS.slice(0, LIMIT);
  const more = READINGS.length - shown.length;
  return (
    <Widget icon="warn" title="Out of range" count={READINGS.length} action={<span className="home-pm-today">This week</span>}>
      {shown.length ? (
        <WidgetList>
          {shown.map((reading) => (
            <WidgetRow
              key={reading.id}
              as={Link}
              href="/readings"
              title={reading.source}
              subtitle={`Target ${reading.target}`}
              meta={reading.when}
              trail={<span className="home-pm-behind">{reading.value}</span>}
            />
          ))}
          {more > 0 ? (
            <WidgetMore as={Link} href="/readings">
              + {more} more
            </WidgetMore>
          ) : null}
        </WidgetList>
      ) : (
        <WidgetEmpty>
          <Empty icon="gauge" title="Nothing out of range">
            Every reading this week was inside its target.
          </Empty>
        </WidgetEmpty>
      )}
    </Widget>
  );
}
