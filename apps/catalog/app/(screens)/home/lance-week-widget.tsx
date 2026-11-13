"use client";

import { Widget } from "@lance-live/sds";

/** `savedMinutes` is an estimate from the replies Lance drafted. */
const WEEK = { replies: 17, inquiries: 11, savedMinutes: 265 };

/** Hours and minutes, with a zero unit left out: `4h 25m`, `2h`, `45m`. */
function duration(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  return [hours ? `${hours}h` : "", mins ? `${mins}m` : ""].filter(Boolean).join(" ") || "0m";
}

/** What Lance did this week, in three numbers. */
export function LanceWeekWidget() {
  return (
    <Widget icon="calendar" title="Lance this week">
      <dl className="home-departures-stats">
        <div>
          <dt>Replies drafted</dt>
          <dd>{WEEK.replies}</dd>
        </div>
        <div>
          <dt>New inquiries</dt>
          <dd>{WEEK.inquiries}</dd>
        </div>
        <div>
          <dt>Saved, estimated</dt>
          <dd>~{duration(WEEK.savedMinutes)}</dd>
        </div>
      </dl>
    </Widget>
  );
}
