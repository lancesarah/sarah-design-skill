"use client";

import { Empty, Widget, WidgetEmpty, WidgetList, WidgetRow } from "@lance-live/gallery-ui";
import Link from "next/link";

type ReadingGroup = { id: string; name: string; readings: number; recorded: number; outOfRange: number };

const GROUPS: ReadingGroup[] = [
  { id: "pool", name: "Pool", readings: 2, recorded: 1, outOfRange: 0 },
  { id: "utility", name: "Utility meters", readings: 4, recorded: 4, outOfRange: 0 },
  { id: "boilers", name: "Boilers", readings: 9, recorded: 9, outOfRange: 0 },
];

/** What a group still needs: its missing readings, then any out of range. Empty when it is done and in range. */
function needs(group: ReadingGroup) {
  const missing = group.readings - group.recorded;
  return [missing > 0 ? `${missing} missing` : "", group.outOfRange > 0 ? `${group.outOfRange} out of range` : ""].filter(Boolean).join(", ");
}

function WarnMark({ label }: { label: string }) {
  return (
    <svg className="home-readings-warn" width="14" height="14" viewBox="0 0 14 14" role="img" aria-label={label}>
      <title>{label}</title>
      <path d="M7 5.4V8M7 1.8 1.4 11.2h11.2L7 1.8Z" fill="none" stroke="currentColor" strokeLinecap="square" />
      <rect x="6.7" y="9.2" width=".6" height=".6" fill="currentColor" />
    </svg>
  );
}

/** Today's readings. What is missing leads, whether anything is out of range sits opposite, then each group's recorded count. */export function ReadingsWidget() {
  const total = GROUPS.reduce((sum, group) => sum + group.readings, 0);
  const recorded = GROUPS.reduce((sum, group) => sum + group.recorded, 0);
  const outOfRange = GROUPS.reduce((sum, group) => sum + group.outOfRange, 0);
  return (
    <Widget icon="gauge" title="Readings" className="home-tally home-readings">
      {GROUPS.length ? (
        <>
          <div className="home-tally-summary">
            <p className="home-tally-top">
              <span>
                <span className="home-summary-figure">{total - recorded}</span>
                <span className="home-tally-label">missing</span>
              </span>
              <span className={outOfRange > 0 ? "home-tally-aside is-warn" : "home-tally-aside"}>
                {outOfRange > 0 ? `${outOfRange} out of range` : "none out of range"}
              </span>
            </p>
          </div>
          <WidgetList>
            {GROUPS.map((group) => {
              const need = needs(group);
              return (
                <WidgetRow
                  key={group.id}
                  as={Link}
                  href="/readings"
                  lead={<span className={need ? "home-readings-dot is-open" : "home-readings-dot"} aria-hidden="true" />}
                  title={group.name}
                  meta={
                    <span className={need ? "home-tally-count is-open" : "home-tally-count"}>
                      {group.recorded}/{group.readings}
                      {need ? <WarnMark label={need} /> : null}
                    </span>
                  }
                />
              );
            })}
          </WidgetList>
        </>
      ) : (
        <WidgetEmpty>
          <Empty icon="gauge" title="No readings set up">
            Reading groups show here once they are added.
          </Empty>
        </WidgetEmpty>
      )}
    </Widget>
  );
}
