"use client";

import { Widget } from "@lance-live/gallery-ui";

/** Estimated from what Lance did this week, at the time each would take by hand. */
const WEEK = { savedMinutes: 265, replies: 17, triaged: 23, calls: 31 };

/** Hours and minutes, with a zero unit left out: `4h 25m`, `2h`, `45m`. */
function duration(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  return [hours ? `${hours}h` : "", mins ? `${mins}m` : ""].filter(Boolean).join(" ") || "0m";
}

/** The manual work Lance absorbed this week. The estimate leads, the work behind it sits beside it. */
export function TimeSavedWidget() {
  return (
    <Widget icon="clock" title="Time saved" action={<span className="home-pm-today">This week</span>}>
      <div className="home-summary is-alone">
        <p className="home-summary-hero">
          <span className="home-summary-figure">~{duration(WEEK.savedMinutes)}</span>
          <span className="home-summary-label">saved, estimated</span>
        </p>
        <dl className="home-summary-stats">
          <div>
            <dt>Replies</dt>
            <dd>{WEEK.replies}</dd>
          </div>
          <div>
            <dt>Triaged</dt>
            <dd>{WEEK.triaged}</dd>
          </div>
          <div>
            <dt>Calls</dt>
            <dd>{WEEK.calls}</dd>
          </div>
        </dl>
      </div>
    </Widget>
  );
}
