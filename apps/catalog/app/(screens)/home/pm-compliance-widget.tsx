"use client";

import { Widget } from "@lance-live/gallery-ui";

/** One program's PMs that came due in the window, and how many of those were completed. */
type Program = { id: string; name: string; due: number; done: number };

const WINDOW = "Past 7d";

const PROGRAMS: Program[] = [
  { id: "make-right", name: "Make-it-right guestroom PM", due: 8, done: 7 },
  { id: "shower", name: "Shower door PM", due: 5, done: 4 },
  { id: "carpet", name: "Carpet cleaning", due: 4, done: 4 },
  { id: "extinguisher", name: "Fire extinguisher inspection", due: 3, done: 3 },
  { id: "garage", name: "Parking garage and lot", due: 2, done: 1 },
  { id: "lights", name: "Emergency light test", due: 2, done: 2 },
];

/** Meter's rhythm on the inner edge: 2px ticks about every 4px along the arch. */
const TICKS = 67;
const CENTER = { x: 110, y: 110 };
const OUTER = 104;
const INNER = 86;

/** Nothing due counts as complete. The percent and the ticks round down, so one missed PM never reads as 100%. */
function share(done: number, due: number) {
  return due ? Math.min(1, done / due) : 1;
}

/** Two decimals, so the server and the browser write the same coordinate. */
const at = (n: number) => Math.round(n * 100) / 100;

/** A half dial of ticks, left to right. The done ticks take the action blue. */
function Dial({ value }: { value: number }) {
  const lit = Math.floor(value * TICKS);
  return (
    <svg viewBox="0 0 220 112" aria-hidden="true">
      {Array.from({ length: TICKS }, (_, i) => {
        const angle = Math.PI - (i / (TICKS - 1)) * Math.PI;
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        return (
          <line
            key={i}
            className={i < lit ? "is-done" : undefined}
            x1={at(CENTER.x + INNER * cos)}
            y1={at(CENTER.y - INNER * sin)}
            x2={at(CENTER.x + OUTER * cos)}
            y2={at(CENTER.y - OUTER * sin)}
          />
        );
      })}
    </svg>
  );
}

/** PMs completed out of PMs due in the window, across every program. The percent sits in a half dial; done, missed, and due sit under it. */
export function PmComplianceWidget() {
  const due = PROGRAMS.reduce((sum, program) => sum + program.due, 0);
  const done = PROGRAMS.reduce((sum, program) => sum + program.done, 0);
  const missed = due - done;
  const value = share(done, due);
  return (
    <Widget icon="wrench" title="PM compliance" action={<span className="home-pm-today">{WINDOW}</span>}>
      <div className="home-gauge">
        <div className="home-gauge-dial" role="img" aria-label={`${Math.floor(value * 100)}% completed, ${done} of ${due} PMs, ${missed} missed`}>
          <Dial value={value} />
          <p className="home-gauge-read" aria-hidden="true">
            <span className="home-summary-figure">{Math.floor(value * 100)}%</span>
            <span className="home-summary-label">completed</span>
          </p>
        </div>
        <dl className="home-summary-stats">
          <div>
            <dt>
              <span className="home-summary-key is-clean" aria-hidden="true" />
              Done
            </dt>
            <dd>{done}</dd>
          </div>
          <div>
            <dt>
              <span className="home-summary-key is-waiting" aria-hidden="true" />
              Missed
            </dt>
            <dd>{missed}</dd>
          </div>
          <div>
            <dt>Due</dt>
            <dd>{due}</dd>
          </div>
        </dl>
      </div>
    </Widget>
  );
}
