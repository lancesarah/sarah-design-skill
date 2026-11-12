"use client";

import { Widget } from "@lance-live/gallery-ui";

/** What maintenance has in front of it right now. */
const QUEUE = { tickets: 9, readings: 2, suggested: 6 };

/** Maintenance's three queues in three numbers: open tickets, readings still due, and PMs suggested for today. */
export function MaintenanceTodosWidget() {
  return (
    <Widget icon="wrench" title="Maintenance">
      <dl className="home-departures-stats">
        <div>
          <dt>Open tickets</dt>
          <dd>{QUEUE.tickets}</dd>
        </div>
        <div>
          <dt>Readings due</dt>
          <dd>{QUEUE.readings}</dd>
        </div>
        <div>
          <dt>Suggested PMs</dt>
          <dd>{QUEUE.suggested}</dd>
        </div>
      </dl>
    </Widget>
  );
}
