"use client";

import { Widget } from "@lance-live/gallery-ui";
import type { CSSProperties } from "react";
import { useSeen } from "./use-seen";

/** New leads a day, oldest first, ending today. */
const DAILY = [2, 4, 3, 5, 1, 0, 3, 4, 6, 5, 3, 2, 1, 4, 5, 7, 4, 3, 1, 2, 5, 6, 8, 5, 4, 2, 3, 6, 7, 5];
/** The 30 days before these. */
const PRIOR = 107;

/** Lead volume, a bar a day for 30 days. The total leads with its change on the 30 days before. */
export function LeadTrendWidget() {
  const total = DAILY.reduce((sum, value) => sum + value, 0);
  const change = Math.round(((total - PRIOR) / PRIOR) * 100);
  const busiest = Math.max(1, ...DAILY);
  const { ref, seen } = useSeen<HTMLDivElement>();
  return (
    <Widget icon="users" title="Lead trend" action={<span className="home-pm-today">Past 30d</span>}>
      <div className="home-tally-summary home-trend-body">
        <p className="home-tally-top">
          <span>
            <span className="home-summary-figure">{total}</span>
            <span className="home-tally-label">{total === 1 ? "lead" : "leads"}</span>
          </span>
          <span className="home-tally-aside">
            {change >= 0 ? "+" : "−"}
            {Math.abs(change)}% on the 30d before
          </span>
        </p>
        <div ref={ref} className={seen ? "home-trend is-seen" : "home-trend"} role="img" aria-label={`New leads a day for 30 days: ${DAILY.join(", ")}. Today ${DAILY[DAILY.length - 1]}.`}>
          {DAILY.map((value, at) => (
            <span key={at} style={{ "--bar": value / busiest, "--at": at } as CSSProperties} />
          ))}
        </div>
        <p className="home-trend-axis" aria-hidden="true">
          <span>30d ago</span>
          <span>Today</span>
        </p>
      </div>
    </Widget>
  );
}
