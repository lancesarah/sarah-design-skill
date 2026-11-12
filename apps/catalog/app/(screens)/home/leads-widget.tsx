"use client";

import { ShareBar, Widget, type Share } from "@lance-live/gallery-ui";

/** The pipeline, earliest stage first. Stages keep their order on the bar instead of going busiest first. */
const STAGES: Share[] = [
  { id: "new", label: "New", value: 6, tone: "action" },
  { id: "qualified", label: "Qualified", value: 2, tone: "strong" },
  { id: "talking", label: "Talking", value: 2, tone: "muted" },
  { id: "proposal", label: "Proposal", value: 2, tone: "quiet" },
  { id: "negotiating", label: "Negotiating", value: 2, tone: "faint" },
];

/** Open leads. The total leads, then one bar splits it by stage. */
export function LeadsWidget() {
  const total = STAGES.reduce((sum, stage) => sum + stage.value, 0);
  return (
    <Widget icon="users" title="Active leads">
      <div className="home-tally-summary home-tickets-body">
        <p className="home-tally-top">
          <span>
            <span className="home-summary-figure">{total}</span>
            <span className="home-tally-label">{total === 1 ? "open lead" : "open leads"}</span>
          </span>
        </p>
        <ShareBar shares={STAGES} />
      </div>
    </Widget>
  );
}
