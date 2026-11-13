"use client";

import { Widget, WidgetFigure, WidgetNote, WidgetStats, WidgetSummary } from "@lance-live/gallery-ui";

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
    <Widget icon="clock" title="Time saved" action={<WidgetNote>This week</WidgetNote>}>
      <WidgetSummary alone>
        <WidgetFigure value={`~${duration(WEEK.savedMinutes)}`} label="saved, estimated" />
        <WidgetStats
          items={[
            { label: "Replies", value: WEEK.replies },
            { label: "Triaged", value: WEEK.triaged },
            { label: "Calls", value: WEEK.calls },
          ]}
        />
      </WidgetSummary>
    </Widget>
  );
}
