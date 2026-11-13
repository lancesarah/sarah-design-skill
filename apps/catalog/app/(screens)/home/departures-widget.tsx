"use client";

import { Widget } from "@lance-live/sds";
import { CheckStatus } from "./check-status";

/** Occupied: the guest hasn't checked out yet. Dirty: they left and the room waits for housekeeping. Clean: turned and ready. */
const DEPARTURES = { occupied: 3, dirty: 4, clean: 3 };

/** Housekeeping verifies the departures once they have walked them. Undefined until then. */
const VERIFIED: { by: string; ago: string } | undefined = undefined;

/** Today's check-outs in three numbers, with housekeeping's check in the head. */
export function DeparturesWidget() {
  return (
    <Widget
      icon="share"
      title="Departures"
      className="home-departures"
      action={
        <CheckStatus
          state={VERIFIED ? "done" : "pending"}
          title={VERIFIED ? "Verified" : "Not verified"}
          sub={VERIFIED ? `${VERIFIED.by}, ${VERIFIED.ago} ago` : "by housekeeping"}
        />
      }
    >
      <dl className="home-departures-stats">
        <div>
          <dt>Occupied</dt>
          <dd>{DEPARTURES.occupied}</dd>
        </div>
        <div>
          <dt>Dirty</dt>
          <dd>{DEPARTURES.dirty}</dd>
        </div>
        <div>
          <dt>Clean</dt>
          <dd>{DEPARTURES.clean}</dd>
        </div>
      </dl>
    </Widget>
  );
}
