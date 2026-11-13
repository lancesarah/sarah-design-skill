"use client";

import { Button, Meter, Widget, WidgetFigure, WidgetStats, WidgetSummary } from "@lance-live/sds";
import { useRouter } from "next/navigation";

const SCORE = 41;
const MAX = 80;
const VERIFIED = 184;
const DUE = 148;
const STALE = 30;

/** How much Lance can trust the knowledge base. The score leads; verified, due soon and stale sit beside it, and the one next step is reviewing answers. */
export function KnowledgeWidget() {
  const router = useRouter();
  return (
    <Widget icon="book" title="Knowledge health" className="home-knowledge">
      <WidgetSummary>
        <WidgetFigure value={SCORE} of={MAX} label="health score" />
        <WidgetStats
          items={[
            { label: "Verified", value: VERIFIED },
            { label: "Due soon", value: DUE },
            { label: "Stale", value: STALE },
          ]}
        />
        <Meter className="widget-summary-meter" value={SCORE} max={MAX} label={`${SCORE} out of ${MAX}`} />
      </WidgetSummary>
      <div className="home-summary-cta">
        <Button variant="primary" onClick={() => router.push("/knowledge")}>
          Review answers
        </Button>
      </div>
    </Widget>
  );
}
