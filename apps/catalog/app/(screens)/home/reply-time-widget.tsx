"use client";

import { Widget, WidgetFigure, WidgetNote, WidgetStats, WidgetSummary } from "@lance-live/gallery-ui";

const WINDOW = "Past 7d";

/** Minutes from a guest's first message to the first reply, one per conversation in the window. */
const FIRST_REPLIES = [4, 9, 12, 18, 26, 31, 38, 42, 47, 55, 64, 90, 135, 210, 380];

/** The two largest units, with a zero unit left out: `1d 2h`, `6h 20m`, `42m`. */
function duration(minutes: number) {
  const days = Math.floor(minutes / 1440);
  const hours = Math.floor((minutes % 1440) / 60);
  const mins = Math.round(minutes % 60);
  const parts = days ? [[days, "d"], [hours, "h"]] : hours ? [[hours, "h"], [mins, "m"]] : [[mins, "m"]];
  return parts.filter(([value]) => value).map(([value, unit]) => `${value}${unit}`).join(" ") || "0m";
}

function median(values: number[]) {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

/** How long a guest waits for a first reply. The median leads, since one slow night would pull the average up; the average sits beside it. */
export function ReplyTimeWidget() {
  const average = FIRST_REPLIES.reduce((sum, minutes) => sum + minutes, 0) / FIRST_REPLIES.length;
  return (
    <Widget icon="gauge" title="Average time to respond" action={<WidgetNote>{WINDOW}</WidgetNote>}>
      <WidgetSummary>
        <WidgetFigure value={duration(median(FIRST_REPLIES))} label="median first reply" />
        <WidgetStats
          items={[
            { label: "Average", value: duration(average) },
            { label: "Fastest", value: duration(Math.min(...FIRST_REPLIES)) },
            { label: "Slowest", value: duration(Math.max(...FIRST_REPLIES)) },
          ]}
        />
      </WidgetSummary>
    </Widget>
  );
}
