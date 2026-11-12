"use client";

import { Widget } from "@lance-live/gallery-ui";
import type { CSSProperties } from "react";
import { useSeen } from "./use-seen";

type Stage = { id: string; label: string; value: number; tone: "muted" | "action" | "quiet" };

/** In pipeline order. Live stages are grey, won is the blue, lost is the quiet grey. */
const STAGES: Stage[] = [
  { id: "new", label: "New", value: 6, tone: "muted" },
  { id: "qualified", label: "Qualified", value: 2, tone: "muted" },
  { id: "talking", label: "Talking", value: 2, tone: "muted" },
  { id: "proposal", label: "Proposal", value: 2, tone: "muted" },
  { id: "negotiating", label: "Negotiating", value: 2, tone: "muted" },
  { id: "won", label: "Won", value: 5, tone: "action" },
  { id: "lost", label: "Lost", value: 3, tone: "quiet" },
];

/** Live lead counts at every stage, then won and lost. The Tickets by channel bars, kept in stage order, the biggest stage full. */
export function PipelineStagesWidget() {
  const live = STAGES.filter((stage) => stage.tone === "muted").reduce((sum, stage) => sum + stage.value, 0);
  const biggest = Math.max(1, ...STAGES.map((stage) => stage.value));
  const { ref, seen } = useSeen<HTMLDListElement>();
  return (
    <Widget icon="list" title="Pipeline stages">
      <div className="home-tally-summary home-tickets-body">
        <p className="home-tally-top">
          <span>
            <span className="home-summary-figure">{live}</span>
            <span className="home-tally-label">{live === 1 ? "live lead" : "live leads"}</span>
          </span>
        </p>
        <dl ref={ref} className={seen ? "home-bars is-seen is-compact" : "home-bars is-compact"}>
          {STAGES.map((stage, at) => (
            <div key={stage.id} className={`is-${stage.tone}`} style={{ "--bar": stage.value / biggest, "--at": at } as CSSProperties}>
              <dt>{stage.label}</dt>
              <dd>{stage.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </Widget>
  );
}
