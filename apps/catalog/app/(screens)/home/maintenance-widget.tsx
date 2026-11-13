"use client";

import { Widget, WidgetNote, WidgetTally } from "@lance-live/sds";

const WINDOW = "Past 7d";

/** PMs that came due in the window, and work orders closed in it. `reactive` is work that wasn't a PM. `repairMinutes` is opened to resolved, summed. */
const WEEK = { pmsDue: 24, pmsDone: 21, pmsOverdue: 3, workOrders: 42, reactive: 37, repairMinutes: 42 * 198 };

/** The two largest units, with a zero unit left out: `1d 2h`, `3h 18m`, `45m`. */
function duration(minutes: number) {
  const days = Math.floor(minutes / 1440);
  const hours = Math.floor((minutes % 1440) / 60);
  const mins = Math.round(minutes % 60);
  const parts = days ? [[days, "d"], [hours, "h"]] : hours ? [[hours, "h"], [mins, "m"]] : [[mins, "m"]];
  return parts.filter(([value]) => value).map(([value, unit]) => `${value}${unit}`).join(" ") || "0m";
}

/** Rounded down, so one missed PM never reads as 100%. */
function percent(part: number, whole: number) {
  return whole ? Math.floor((part / whole) * 100) : 100;
}

/** The week in maintenance. PMs completed leads; overdue PMs, unplanned work, and time to repair sit under it in three columns. */
export function MaintenanceWidget() {
  const { pmsDue, pmsDone, pmsOverdue, workOrders, reactive, repairMinutes } = WEEK;
  return (
    <Widget icon="wrench" title="Maintenance overview" action={<WidgetNote>{WINDOW}</WidgetNote>}>
      <div className="home-maint">
        <WidgetTally value={`${percent(pmsDone, pmsDue)}%`} label="PMs completed" aside={`${pmsDone} of ${pmsDue} due`} />
        <dl className="home-maint-stats">
          <div>
            <dt>PMs overdue</dt>
            <dd className={pmsOverdue ? "is-late" : undefined}>{pmsOverdue}</dd>
          </div>
          <div>
            <dt>Unplanned work</dt>
            <dd>{percent(reactive, workOrders)}%</dd>
          </div>
          <div>
            <dt>Time to repair</dt>
            <dd>{duration(workOrders ? repairMinutes / workOrders : 0)}</dd>
          </div>
        </dl>
      </div>
    </Widget>
  );
}
