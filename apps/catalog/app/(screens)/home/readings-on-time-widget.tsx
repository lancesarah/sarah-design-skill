"use client";

import { Widget } from "@lance-live/gallery-ui";
import { CheckStatus } from "./check-status";

/** A scheduled round of readings. `due` is past once its time has come; a later round is still to come. */
type Round = { id: string; time: string; expected: number; logged: number; due: boolean };

const ROUNDS: Round[] = [
  { id: "r7", time: "7 AM", expected: 5, logged: 5, due: true },
  { id: "r11", time: "11 AM", expected: 5, logged: 5, due: true },
  { id: "r15", time: "3 PM", expected: 5, logged: 3, due: true },
  { id: "r19", time: "7 PM", expected: 5, logged: 0, due: false },
];

function plural(count: number, word: string) {
  return `${count} ${count === 1 ? word : `${word}s`}`;
}

/** Whether readings are keeping to schedule. Logged out of expected so far leads; on time or behind sits in the head. */
export function ReadingsOnTimeWidget() {
  const dueRounds = ROUNDS.filter((round) => round.due);
  const expected = dueRounds.reduce((sum, round) => sum + round.expected, 0);
  const logged = dueRounds.reduce((sum, round) => sum + round.logged, 0);
  const behind = expected - logged;
  const late = dueRounds.filter((round) => round.logged < round.expected).length;
  const next = ROUNDS.find((round) => !round.due);
  return (
    <Widget
      icon="clock"
      title="Readings on time"
      action={
        behind > 0 ? (
          <CheckStatus state="warn" title={`${plural(behind, "reading")} behind`} sub={plural(late, "round") + " late"} />
        ) : (
          <CheckStatus state="done" title="On time" sub={next ? `Next round ${next.time}` : "All rounds done"} />
        )
      }
    >
      <div className="home-summary is-alone">
        <p className="home-summary-hero">
          <span className="home-summary-figure">
            {logged}
            <span className="home-summary-of"> / {expected}</span>
          </span>
          <span className="home-summary-label">readings logged so far</span>
        </p>
      </div>
    </Widget>
  );
}
