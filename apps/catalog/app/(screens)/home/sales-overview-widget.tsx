"use client";

import { Widget, WidgetNote } from "@lance-live/sds";

/** Submission rate is inquiries that became a submitted lead. Voice completions are calls Lance finished with a lead. */
const WEEK = { inquiries: 42, submitted: 0.68, voice: 19 };

/** Sales in three numbers, the past 7 days. */
export function SalesOverviewWidget() {
  return (
    <Widget icon="tag" title="Sales overview" action={<WidgetNote>Past 7d</WidgetNote>}>
      <dl className="home-departures-stats">
        <div>
          <dt>Inquiries</dt>
          <dd>{WEEK.inquiries}</dd>
        </div>
        <div>
          <dt>Submission rate</dt>
          <dd>{Math.round(WEEK.submitted * 100)}%</dd>
        </div>
        <div>
          <dt>Voice completions</dt>
          <dd>{WEEK.voice}</dd>
        </div>
      </dl>
    </Widget>
  );
}
