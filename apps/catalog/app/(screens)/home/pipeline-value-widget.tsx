"use client";

import { Widget } from "@lance-live/gallery-ui";

/** In dollars. Open is every live lead's value, won and the rate are this quarter. */
const PIPELINE = { open: 248_000, won: 86_000, winRate: 0.34 };

/** `$248k`, or `$1.2m` past a million. */
function money(value: number) {
  return value >= 1_000_000 ? `$${(value / 1_000_000).toFixed(1).replace(/\.0$/, "")}m` : `$${Math.round(value / 1000)}k`;
}

/** What the pipeline is worth: open value leads, won value and the win rate sit beside it. */
export function PipelineValueWidget() {
  return (
    <Widget icon="tag" title="Pipeline" action={<span className="home-pm-today">This quarter</span>}>
      <div className="home-summary is-alone">
        <p className="home-summary-hero">
          <span className="home-summary-figure">{money(PIPELINE.open)}</span>
          <span className="home-summary-label">open value</span>
        </p>
        <dl className="home-summary-stats">
          <div>
            <dt>Won</dt>
            <dd>{money(PIPELINE.won)}</dd>
          </div>
          <div>
            <dt>Win rate</dt>
            <dd>{Math.round(PIPELINE.winRate * 100)}%</dd>
          </div>
        </dl>
      </div>
    </Widget>
  );
}
