"use client";

import { ShareBar, Widget, WidgetNote, WidgetTally, type Share } from "@lance-live/gallery-ui";

/** This week's conversations, earliest stage first. Won takes the blue. */
const STAGES: Share[] = [
  { id: "inquiry", label: "Inquiry", value: 9, tone: "strong" },
  { id: "qualifying", label: "Qualifying", value: 6, tone: "muted" },
  { id: "proposal", label: "Proposal", value: 4, tone: "quiet" },
  { id: "won", label: "Won", value: 3, tone: "action" },
];

/** Where this week's sales conversations sit. The total leads, then one bar splits it by stage. */
export function PipelineFunnelWidget() {
  const total = STAGES.reduce((sum, stage) => sum + stage.value, 0);
  return (
    <Widget icon="bubble-lines" title="Pipeline" action={<WidgetNote>This week</WidgetNote>}>
      <div className="home-tally-summary home-tickets-body">
        <WidgetTally value={total} label={total === 1 ? "conversation" : "conversations"} />
        <ShareBar shares={STAGES} />
      </div>
    </Widget>
  );
}
