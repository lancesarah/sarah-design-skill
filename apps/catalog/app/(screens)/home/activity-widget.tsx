"use client";

import { SegmentedControl, Widget, WidgetKey, WidgetTally, type WidgetKeyTone } from "@lance-live/sds";
import { useEffect, useRef, useState, type CSSProperties } from "react";

import { ChartTooltip } from "../chart-tooltip";
import { useChartHover } from "../use-chart-hover";

type Period = "24h" | "7d" | "30d";
type Kind = "call" | "email" | "sms";
/** One bar: a stretch of time and what sales logged in it. */
type Bucket = { label: string; long: string } & Record<Kind, number>;

/** Calls sit at the bottom of each bar, in blue, since a call is the touch that moves a deal. */
const KINDS: { id: Kind; label: string; one: string; many: string }[] = [
  { id: "call", label: "Call", one: "call", many: "calls" },
  { id: "email", label: "Email", one: "email", many: "emails" },
  { id: "sms", label: "SMS", one: "SMS", many: "SMS" },
];

const KIND_KEY: Record<Kind, WidgetKeyTone> = { call: "action", email: "strong", sms: "muted" };

const PERIODS: { value: Period; label: string }[] = [
  { value: "24h", label: "24h" },
  { value: "7d", label: "7d" },
  { value: "30d", label: "30d" },
];

/** Oldest first, so the newest bar is on the right. */
const ACTIVITY: Record<Period, Bucket[]> = {
  "24h": [
    { label: "12a", long: "12 AM to 4 AM", call: 0, email: 1, sms: 0 },
    { label: "4a", long: "4 AM to 8 AM", call: 0, email: 2, sms: 0 },
    { label: "8a", long: "8 AM to 12 PM", call: 3, email: 6, sms: 2 },
    { label: "12p", long: "12 PM to 4 PM", call: 4, email: 5, sms: 1 },
    { label: "4p", long: "4 PM to 8 PM", call: 1, email: 3, sms: 2 },
    { label: "8p", long: "8 PM to 12 AM", call: 0, email: 1, sms: 0 },
  ],
  "7d": [
    { label: "F", long: "Friday", call: 5, email: 9, sms: 2 },
    { label: "S", long: "Saturday", call: 1, email: 2, sms: 1 },
    { label: "S", long: "Sunday", call: 0, email: 1, sms: 0 },
    { label: "M", long: "Monday", call: 7, email: 12, sms: 3 },
    { label: "T", long: "Tuesday", call: 6, email: 10, sms: 4 },
    { label: "W", long: "Wednesday", call: 8, email: 11, sms: 2 },
    { label: "T", long: "Today", call: 8, email: 18, sms: 5 },
  ],
  "30d": [
    { label: "Oct 14", long: "Oct 14 to 18", call: 18, email: 41, sms: 9 },
    { label: "Oct 19", long: "Oct 19 to 23", call: 22, email: 38, sms: 11 },
    { label: "Oct 24", long: "Oct 24 to 28", call: 15, email: 30, sms: 6 },
    { label: "Oct 29", long: "Oct 29 to Nov 2", call: 26, email: 47, sms: 12 },
    { label: "Nov 3", long: "Nov 3 to 7", call: 24, email: 52, sms: 10 },
    { label: "Nov 8", long: "Nov 8 to 12", call: 29, email: 51, sms: 14 },
  ],
};

const WINDOW: Record<Period, string> = { "24h": "in the past 24h", "7d": "in the past 7d", "30d": "in the past 30d" };

function sum(bucket: Bucket) {
  return KINDS.reduce((total, kind) => total + bucket[kind.id], 0);
}

function said(bucket: Bucket) {
  return `${bucket.long}: ${KINDS.map((kind) => `${bucket[kind.id]} ${bucket[kind.id] === 1 ? kind.one : kind.many}`).join(", ")}`;
}

/** Sales touches by period: the total and one figure per kind, then a bar per stretch of time, stacked by kind, the busiest at full height. */
export function ActivityWidget() {
  const [period, setPeriod] = useState<Period>("7d");
  const buckets = ACTIVITY[period];
  const totals = KINDS.map((kind) => ({ ...kind, value: buckets.reduce((total, bucket) => total + bucket[kind.id], 0) }));
  const total = totals.reduce((all, kind) => all + kind.value, 0);

  return (
    <Widget
      icon="users"
      title="Activity"
      action={<SegmentedControl aria-label="Period" className="home-activity-period" value={period} onValueChange={(value) => setPeriod(value as Period)} options={PERIODS} />}
    >
      <div className="home-tally-summary home-activity-body">
        <WidgetTally value={total} label={`${total === 1 ? "touch" : "touches"} ${WINDOW[period]}`} />
        <dl className="home-key">
          {totals.map((kind) => (
            <div key={kind.id}>
              <dt>
                <WidgetKey tone={KIND_KEY[kind.id]} />
                {kind.label}
              </dt>
              <dd>{kind.value}</dd>
            </div>
          ))}
        </dl>
        <WidgetBarChart key={period} label={`Activity ${WINDOW[period]}`} bars={buckets.map(bucket => ({
          label: bucket.label, description: said(bucket), segments: KINDS.map(kind => ({ value: bucket[kind.id], className: `is-${kind.id}` })),
        }))} />
      </div>
    </Widget>
  );
}

/** Shared bar graph used by dashboard widgets and profile analytics. */
export function WidgetBarChart({ bars, label }: { label: string; bars: { label: string; description: string; current?: boolean; segments: { value: number; className: string }[] }[] }) {
  const busiest = Math.max(1, ...bars.map(bar => bar.segments.reduce((total, segment) => total + segment.value, 0)));
  const chart = useRef<HTMLOListElement>(null);
  useChartHover(chart, bars);
  /** The bars fill the first time the chart is on screen, and again on each new period. */
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const node = chart.current;
    if (!node) return;
    const watch = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setSeen(true);
        watch.disconnect();
      },
      { threshold: 0.5 },
    );
    watch.observe(node);
    return () => watch.disconnect();
  }, []);

  return <ol ref={chart} className={seen ? "home-activity-chart is-seen" : "home-activity-chart"} aria-label={label}>
    {bars.map((bar, at) => <li key={`${bar.label}-${at}`} className={bar.current ? "is-current" : undefined} aria-current={bar.current ? "date" : undefined} style={{ "--bar": bar.segments.reduce((total, segment) => total + segment.value, 0) / busiest, "--at": at } as CSSProperties}>
      <button type="button" data-chart-point className="home-activity-track chart-tip-host" aria-label={bar.description}>
        <span className="home-activity-stack">{bar.segments.map((segment, index) => segment.value ? <span key={index} className={segment.className} style={{ flexGrow: segment.value }} /> : null)}</span>
        <ChartTooltip label={bar.label} value={bar.description.replace(`${bar.label}: `, "")} />
      </button>
      <span className="home-activity-label" aria-hidden="true">{bar.label}</span>
    </li>)}
  </ol>;
}
