"use client";

import { Widget, type Share } from "@lance-live/gallery-ui";
import { useEffect, useRef, useState, type CSSProperties } from "react";

/** Busiest first, so the bars read from the tallest down. */
const CHANNELS: Share[] = [
  { id: "voice", label: "Voice", value: 46, tone: "action" },
  { id: "text", label: "Text", value: 38, tone: "strong" },
  { id: "tablet", label: "Tablet", value: 21, tone: "muted" },
  { id: "manual", label: "Manual", value: 9, tone: "quiet" },
];

/** Today's tickets. The total leads, then one bar per channel: a hatched track, filled against the busiest channel, with the figure and the channel under it. */
export function TicketsWidget() {
  const total = CHANNELS.reduce((sum, channel) => sum + channel.value, 0);
  const busiest = Math.max(1, ...CHANNELS.map((channel) => channel.value));
  const chart = useRef<HTMLDListElement>(null);
  /** The bars fill once, the first time the chart is on screen. */
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

  return (
    <Widget icon="tag" title="Tickets by channel">
      <div className="home-tally-summary home-tickets-body">
        <p className="home-tally-top">
          <span>
            <span className="home-summary-figure">{total}</span>
            <span className="home-tally-label">{total === 1 ? "ticket recorded" : "tickets recorded"}</span>
          </span>
          <span className="home-tally-aside">today</span>
        </p>
        <dl ref={chart} className={seen ? "home-bars is-seen" : "home-bars"}>
          {CHANNELS.map((channel, at) => (
            <div key={channel.id} className={`is-${channel.tone}`} style={{ "--bar": channel.value / busiest, "--at": at } as CSSProperties}>
              <dt>{channel.label}</dt>
              <dd>{channel.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </Widget>
  );
}
