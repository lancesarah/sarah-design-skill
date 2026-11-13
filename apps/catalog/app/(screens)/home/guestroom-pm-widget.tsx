"use client";

import { Widget, WidgetNote } from "@lance-live/gallery-ui";

/** One guestroom program this cycle. `late` is rooms past their cadence. */
const PROGRAM = { name: "Guestroom sweep", done: 2, total: 3, late: 1 };

const RADIUS = 28;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/** Done out of total as a ring, read like Meter: the done part in the action blue over a quiet track, the percent in the middle. */
function Ring({ value, max }: { value: number; max: number }) {
  const share = max ? Math.min(1, value / max) : 0;
  return (
    <span className="home-ring" role="img" aria-label={`${Math.round(share * 100)}% done`}>
      <svg viewBox="0 0 64 64" aria-hidden="true">
        <circle className="home-ring-track" cx="32" cy="32" r={RADIUS} />
        {share > 0 ? (
          <circle className="home-ring-fill" cx="32" cy="32" r={RADIUS} strokeDasharray={`${share * CIRCUMFERENCE} ${CIRCUMFERENCE}`} />
        ) : null}
      </svg>
      <span className="home-ring-figure" aria-hidden="true">
        {Math.round(share * 100)}%
      </span>
    </span>
  );
}

/** How far one guestroom PM is through its cycle. The ring and rooms done lead; past cadence sits under them. */
export function GuestroomPmWidget() {
  const { name, done, total, late } = PROGRAM;
  return (
    <Widget icon="wrench" title="Guestroom PMs" action={<WidgetNote>{name} · this cycle</WidgetNote>}>
      <div className="home-ring-summary">
        <Ring value={done} max={total} />
        <p className="widget-figure">
          <span className="widget-figure-value">
            {done}
            <span className="widget-figure-of"> / {total}</span>
          </span>
          <span className="widget-figure-label">rooms done</span>
          {late ? <span className="home-pm-behind home-ring-late">{late} past cadence</span> : null}
        </p>
      </div>
    </Widget>
  );
}
