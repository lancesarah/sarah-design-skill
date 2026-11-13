"use client";

import { ShareBar, Widget, WidgetFigure, type Share } from "@lance-live/sds";

/** Who finished each call: Lance on its own, or the desk after a handoff. */
const OUTCOMES: Share[] = [
  { id: "contained", label: "Contained", value: 94, tone: "action" },
  { id: "desk", label: "Desk pickup", value: 34, tone: "strong" },
];

const RATING = 4.6;
const STAR = "M7 1.3 8.53 5.2 12.71 5.45 9.47 8.1 10.53 12.15 7 9.9 3.47 12.15 4.53 8.1 1.29 5.45 5.47 5.2Z";

/** The rating as five stars, read like a meter: the earned part in the action blue over a quiet track, the last star filled in part. The label under it says the number. */
function Stars({ value }: { value: number }) {
  return (
    <span className="home-stars" aria-hidden="true">
      {[0, 1, 2, 3, 4].map((at) => (
        <span key={at} className="home-star">
          <svg viewBox="0 0 14 14">
            <path d={STAR} />
          </svg>
          <span className="home-star-fill" style={{ width: `${Math.min(1, Math.max(0, value - at)) * 100}%` }}>
            <svg viewBox="0 0 14 14">
              <path d={STAR} />
            </svg>
          </span>
        </span>
      ))}
    </span>
  );
}

/** Today's calls on the voice line. The total and the rating split the top in half, then one bar splits the calls into contained and desk pickup. */
export function VoiceWidget() {
  const total = OUTCOMES.reduce((sum, outcome) => sum + outcome.value, 0);
  return (
    <Widget icon="phone" title="Voice overview">
      <div className="home-tally-summary home-tickets-body">
        <div className="home-voice-split">
          <WidgetFigure value={total} label={total === 1 ? "call handled" : "calls handled"} />
          <p className="widget-figure">
            <Stars value={RATING} />
            <span className="widget-figure-label">
              <span className="home-summary-label-figure">{RATING}</span> / 5 call rating
            </span>
          </p>
        </div>
        <ShareBar shares={OUTCOMES} percent />
      </div>
    </Widget>
  );
}
