"use client";

import { Button, Meter, Widget } from "@lance-live/gallery-ui";
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
      <div className="home-summary">
        <p className="home-summary-hero">
          <span className="home-summary-figure">
            {SCORE}
            <span className="home-summary-of"> / {MAX}</span>
          </span>
          <span className="home-summary-label">health score</span>
        </p>
        <dl className="home-summary-stats">
          <div>
            <dt>Verified</dt>
            <dd>{VERIFIED}</dd>
          </div>
          <div>
            <dt>Due soon</dt>
            <dd>{DUE}</dd>
          </div>
          <div>
            <dt>Stale</dt>
            <dd>{STALE}</dd>
          </div>
        </dl>
        <Meter className="home-summary-meter" value={SCORE} max={MAX} label={`${SCORE} out of ${MAX}`} />
      </div>
      <div className="home-summary-cta">
        <Button variant="primary" onClick={() => router.push("/knowledge")}>
          Review answers
        </Button>
      </div>
    </Widget>
  );
}
