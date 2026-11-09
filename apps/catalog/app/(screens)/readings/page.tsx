"use client";

import {
  AssigneeCell,
  Button,
  DataTable,
  Icon,
  SegmentedControl,
  TITLE_TEXT_INSET,
  Tabs,
  type DataColumn,
  type DataSort,
} from "@lance-live/gallery-ui";
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { flushSync } from "react-dom";
import { FilterMenu, SearchBox } from "../chrome";
import { Glyph } from "../glyph";
import { PageLayout, PageTitle } from "../page-layout";
import { SourceEditor, SourceEditorDialog } from "./source-editor";

export type Measure = { id: string; name: string; unit: string; min?: number; max?: number; required?: boolean };

export type Source = {
  id: string;
  name: string;
  category: string;
  place: string;
  kind: string;
  active: boolean;
  perDay: number;
  dueBy?: string[];
  measures: Measure[];
  /** The logged summary. Empty means this source has not been logged. */
  latest: string | null;
  /** Last time anyone opened a log, even when the values were not kept. */
  lastAt: string | null;
  /** Stats outside their range, each with its reading. Empty means in range. */
  alerts: string[];
};

type Log = { id: string; sourceId: string; value: string; when: string; by: string; initials: string };

type Reading = { id: string; sourceId: string; measureId: string; value: number; when: string };

type Entry = { measureId: string; value: number };

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const STARTER: Source[] = [
  {
    id: "guestrooms",
    name: "Guestrooms",
    category: "Guest",
    place: "Guestrooms",
    kind: "Boiler",
    active: true,
    perDay: 1,
    measures: [
      { id: "domestic", name: "Domestic Temp", unit: "°F", min: 100, max: 140 },
      { id: "feed", name: "Feed Temp", unit: "°F", min: 100, max: 160 },
      { id: "return", name: "Return Temp", unit: "°F", min: 90, max: 150 },
      { id: "storage", name: "Storage Temp", unit: "°F", min: 110, max: 160 },
    ],
    latest: "126 °F",
    lastAt: "Nov 7, 8:00 AM",
    alerts: [],
  },
  {
    id: "kitchen",
    name: "Kitchen",
    category: "Food",
    place: "Kitchen",
    kind: "Boiler",
    active: true,
    perDay: 1,
    measures: [
      { id: "cooler", name: "Cooler", unit: "°F", min: 34, max: 40 },
      { id: "freezer", name: "Freezer", unit: "°F", min: -10, max: 0 },
      { id: "dish", name: "Dish machine", unit: "°F", min: 150, max: 180 },
      { id: "hold", name: "Hot holding", unit: "°F", min: 140, max: 165 },
    ],
    latest: null,
    lastAt: "Oct 27, 1:13 PM",
    alerts: [],
  },
  {
    id: "laundry",
    name: "Laundry",
    category: "Housekeeping",
    place: "Laundry",
    kind: "Boiler",
    active: false,
    perDay: 1,
    measures: [
      { id: "wash", name: "Wash", unit: "°F", min: 120, max: 160 },
      { id: "rinse", name: "Rinse", unit: "°F", min: 120, max: 160 },
      { id: "dry", name: "Dry", unit: "°F", min: 120, max: 180 },
      { id: "heater", name: "Water heater", unit: "°F", min: 110, max: 140 },
    ],
    latest: null,
    lastAt: "Oct 27, 1:14 PM",
    alerts: [],
  },
  {
    id: "electrical",
    name: "Electrical",
    category: "Energy",
    place: "Electrical",
    kind: "Utility Meter",
    active: true,
    perDay: 1,
    measures: [{ id: "kwh", name: "Usage", unit: "kWh", max: 8000 }],
    latest: "8,502 kWh",
    lastAt: "Oct 27, 10:06 AM",
    alerts: ["Usage 8,502 kWh"],
  },
  {
    id: "gas",
    name: "Gas",
    category: "Energy",
    place: "Gas",
    kind: "Utility Meter",
    active: true,
    perDay: 1,
    measures: [{ id: "therms", name: "Usage", unit: "therms", max: 40000 }],
    latest: "34,943 therms",
    lastAt: "Nov 7, 7:45 AM",
    alerts: [],
  },
  {
    id: "sprinkler",
    name: "Sprinkler",
    category: "Safety",
    place: "Sprinkler",
    kind: "Utility Meter",
    active: false,
    perDay: 1,
    measures: [{ id: "pressure", name: "Pressure", unit: "psi", min: 40, max: 80 }],
    latest: null,
    lastAt: null,
    alerts: [],
  },
  {
    id: "water-lrg",
    name: "Water Lrg",
    category: "Water",
    place: "Large meter",
    kind: "Utility Meter",
    active: true,
    perDay: 1,
    measures: [{ id: "usage", name: "Usage", unit: "gal", max: 20000 }],
    latest: null,
    lastAt: null,
    alerts: [],
  },
  {
    id: "water-sml",
    name: "Water Sml",
    category: "Water",
    place: "Small meter",
    kind: "Utility Meter",
    active: false,
    perDay: 1,
    measures: [{ id: "usage", name: "Usage", unit: "gal", max: 5000 }],
    latest: null,
    lastAt: null,
    alerts: [],
  },
];

function parseWhen(value: string | null): Date | null {
  if (!value || value === "Not recorded") return null;
  const match = value.match(/^([A-Za-z]+) (\d+), (\d+):(\d+) (AM|PM)$/);
  if (!match) return null;
  const month = MONTHS.indexOf(match[1]);
  if (month < 0) return null;
  let hour = Number(match[3]) % 12;
  if (match[5] === "PM") hour += 12;
  const year = new Date().getFullYear();
  return new Date(year, month, Number(match[2]), hour, Number(match[4]));
}

function formatWhen(date: Date) {
  const hour = date.getHours();
  const mins = date.getMinutes().toString().padStart(2, "0");
  const shown = hour % 12 || 12;
  return `${MONTHS[date.getMonth()]} ${date.getDate()}, ${shown}:${mins} ${hour < 12 ? "AM" : "PM"}`;
}

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function withinDays(value: string | null, days: number, now: Date) {
  const date = parseWhen(value);
  if (!date) return true;
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  start.setDate(start.getDate() - (days - 1));
  return date >= start;
}

function guestSeries(): Reading[] {
  const domestic = [110, 128, 112, 114, 130, 126, 118, 116, 132, 120, 115, 129, 118, 126];
  const start = new Date(new Date().getFullYear(), 9, 25, 8, 0, 0, 0);
  const points = domestic.map((value, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return { id: `guest-domestic-${index}`, sourceId: "guestrooms", measureId: "domestic", value, when: formatWhen(date) };
  });
  const feed = [118, 122, 126];
  const back = [108, 114, 120];
  for (let index = 0; index < 3; index += 1) {
    const date = new Date(start);
    date.setDate(start.getDate() + 11 + index);
    points.push(
      { id: `guest-feed-${index}`, sourceId: "guestrooms", measureId: "feed", value: feed[index], when: formatWhen(date) },
      { id: `guest-return-${index}`, sourceId: "guestrooms", measureId: "return", value: back[index], when: formatWhen(date) },
    );
  }
  points.push({ id: "guest-storage-0", sourceId: "guestrooms", measureId: "storage", value: 140, when: formatWhen(start) });
  points.push(
    { id: "electrical-0", sourceId: "electrical", measureId: "kwh", value: 8502, when: "Oct 27, 10:06 AM" },
    { id: "gas-0", sourceId: "gas", measureId: "therms", value: 34943, when: "Nov 7, 7:45 AM" },
  );
  return points;
}

function downloadReadings(rows: Array<{ category: string; place: string; status: string; value: string; when: string; by: string }>) {
  const header = ["Category", "Location", "Status", "Reading", "Date", "Recorded by"];
  const csv = [header, ...rows.map((row) => [row.category, row.place, row.status, row.value, row.when, row.by])]
    .map((line) => line.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(","))
    .join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "readings-history.csv";
  link.click();
  URL.revokeObjectURL(url);
}

function measureCount(source: Source) {
  const count = source.measures.length;
  return `${count} ${count === 1 ? "measurement" : "measurements"}`;
}

function shownReading(raw: string) {
  const numeric = Number(raw.replace(/,/g, ""));
  return Number.isFinite(numeric) && /^-?[\d,]+(\.\d+)?$/.test(raw) ? numeric.toLocaleString("en-US") : raw;
}

function outsideRange(measure: Measure, raw: string) {
  if (measure.min == null && measure.max == null) return false;
  const numeric = Number(raw.replace(/,/g, ""));
  if (!Number.isFinite(numeric)) return false;
  return (measure.min != null && numeric < measure.min) || (measure.max != null && numeric > measure.max);
}

function ReadingStatus({ source }: { source: Source }) {
  if (!source.latest) {
    return (
      <span className="readings-status is-empty">
        <span className="readings-ring" aria-hidden="true" />
        Not recorded
      </span>
    );
  }
  if (source.alerts.length > 0) {
    return (
      <span className="readings-status is-warn">
        <svg className="readings-mark" width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
          <path d="M7 5.4V8M7 1.8 1.4 11.2h11.2L7 1.8Z" fill="none" stroke="currentColor" strokeLinecap="square" />
          <rect x="6.7" y="9.2" width=".6" height=".6" fill="currentColor" />
        </svg>
        {source.alerts.join(", ")}
      </span>
    );
  }
  return (
    <span className="readings-status is-logged">
      <svg className="readings-mark" width="16" height="16" viewBox="0 0 18 18" aria-hidden="true">
        <path
          fill="currentColor"
          fillRule="evenodd"
          d="M9 0a9 9 0 1 0 0 18A9 9 0 0 0 9 0Zm3.65 6.66-1.05-.86-4 4.9-1.75-1.76-.95.96 2.8 2.8 4.95-6.04Z"
        />
      </svg>
      In range
    </span>
  );
}

function BackButton({ onBack }: { onBack: () => void }) {
  return (
    <Button variant="secondary" onClick={onBack}>
      <Icon name="chevron" size={14} className="pm-back-icon" />
      Back
    </Button>
  );
}

function shiftPage(direction: "forward" | "back", update: () => void) {
  const snap =
    document.documentElement.classList.contains("is-keys") ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (snap || typeof document.startViewTransition !== "function") {
    update();
    return;
  }
  document.documentElement.dataset.pmShift = direction;
  let transition: ViewTransition;
  try {
    transition = document.startViewTransition(() => {
      flushSync(update);
    });
  } catch {
    delete document.documentElement.dataset.pmShift;
    update();
    return;
  }
  transition.finished.finally(() => {
    if (document.documentElement.dataset.pmShift === direction) {
      delete document.documentElement.dataset.pmShift;
    }
  });
}

function RecordForm({
  source,
  onSubmit,
}: {
  source: Source;
  onSubmit: (value: string, when: Date, alerts: string[], entries: Entry[]) => void;
}) {
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [day, setDay] = useState<"today" | "yesterday" | "pick">("today");
  const [picked, setPicked] = useState("");
  const [notes, setNotes] = useState("");

  function reset() {
    setDraft({});
    setDay("today");
    setPicked("");
    setNotes("");
  }

  function when() {
    const now = new Date();
    if (day === "yesterday") {
      const date = new Date(now);
      date.setDate(date.getDate() - 1);
      return date;
    }
    if (day === "pick" && picked) {
      const [year, month, date] = picked.split("-").map(Number);
      const next = new Date(now);
      next.setFullYear(year, month - 1, date);
      return next;
    }
    return now;
  }

  return (
    <form
      className="readings-form"
      onSubmit={(event) => {
        event.preventDefault();
        const filled = source.measures.flatMap((measure) => {
          const raw = (draft[measure.id] ?? "").trim();
          if (!raw) return [];
          const shown = `${shownReading(raw)} ${measure.unit}`;
          const numeric = Number(raw.replace(/,/g, ""));
          return [{
            measureId: measure.id,
            shown,
            value: Number.isFinite(numeric) ? numeric : null,
            alert: outsideRange(measure, raw) ? `${measure.name} ${shown}` : null,
          }];
        });
        if (filled.length === 0) return;
        const summary = filled.map((item) => item.shown).join(", ");
        reset();
        onSubmit(
          summary,
          when(),
          filled.flatMap((item) => item.alert ? [item.alert] : []),
          filled.flatMap((item) => item.value == null ? [] : [{ measureId: item.measureId, value: item.value }]),
        );
      }}
    >
      <div className="readings-card">
        <h2 className="readings-card-title">
          Record reading
          <span>{source.name}</span>
        </h2>
        <div className="readings-grid">
          {source.measures.map((measure) => (
            <label key={measure.id} className="readings-field">
              <span className="sheet-label">{measure.name}</span>
              <span className="readings-entry">
                <input
                  className="sds line"
                  inputMode="decimal"
                  aria-label={measure.name}
                  value={draft[measure.id] ?? ""}
                  onChange={(event) => setDraft((current) => ({ ...current, [measure.id]: event.target.value }))}
                />
                <span className="readings-unit">{measure.unit}</span>
              </span>
            </label>
          ))}
        </div>
        <div className="readings-field">
          <span className="sheet-label">Reading date</span>
          <div className="readings-dates">
            <Button variant={day === "today" ? "tertiary" : "secondary"} aria-pressed={day === "today"} type="button" onClick={() => setDay("today")}>
              Today
            </Button>
            <Button variant={day === "yesterday" ? "tertiary" : "secondary"} aria-pressed={day === "yesterday"} type="button" onClick={() => setDay("yesterday")}>
              Yesterday
            </Button>
            <input
              className={day === "pick" && picked ? "sds line is-picked" : "sds line"}
              type="date"
              aria-label="Reading date"
              value={picked}
              onChange={(event) => {
                setPicked(event.target.value);
                setDay("pick");
              }}
            />
          </div>
        </div>
        <label className="readings-field">
          <span className="sheet-label">Notes (optional)</span>
          <textarea className="text-well" rows={3} value={notes} placeholder="Anything to flag" onChange={(event) => setNotes(event.target.value)} />
        </label>
        <div className="readings-foot">
          <Button variant="secondary" type="button" onClick={reset}>Cancel</Button>
          <Button type="submit">Submit</Button>
        </div>
      </div>
    </form>
  );
}

function pointsFor(readings: Reading[], sourceId: string, measureId: string) {
  return readings
    .filter((reading) => reading.sourceId === sourceId && reading.measureId === measureId)
    .sort((a, b) => (parseWhen(a.when)?.getTime() ?? 0) - (parseWhen(b.when)?.getTime() ?? 0));
}

function placePointTip(host: HTMLElement) {
  const tip = host.querySelector<HTMLElement>(":scope > .tip");
  if (!tip) return;
  const box = host.getBoundingClientRect();
  const gap = 12;
  const tipBox = tip.getBoundingClientRect();
  const tipWidth = tipBox.width || tip.offsetWidth;
  const tipHeight = tipBox.height || tip.offsetHeight;
  let left = box.right + gap;
  if (left + tipWidth > window.innerWidth - 12) left = box.left - gap - tipWidth;
  const top = Math.min(Math.max(8, box.top + box.height / 2 - tipHeight / 2), window.innerHeight - tipHeight - 8);
  tip.style.position = "fixed";
  tip.style.left = `${left}px`;
  tip.style.top = `${top}px`;
  tip.style.transform = "none";
}

function revealPointTip(host: HTMLElement) {
  const tip = host.querySelector<HTMLElement>(":scope > .tip");
  if (!tip) return;
  try {
    if (!tip.matches(":popover-open")) tip.showPopover();
  } catch {
    // The tip can already be opening as the pointer crosses the point.
  }
  placePointTip(host);
}

function hidePointTip(host: HTMLElement) {
  const tip = host.querySelector<HTMLElement>(":scope > .tip");
  if (!tip?.matches(":popover-open")) return;
  try {
    tip.hidePopover();
  } catch {
    // The tip can already be closed when the pointer leaves.
  }
}

function ReadingChart({ measure, points }: { measure: Measure; points: Reading[] }) {
  const chartRef = useRef<HTMLElement>(null);
  const guideRef = useRef<HTMLSpanElement>(null);
  const values = points.map((point) => point.value);
  const low = Math.min(...values);
  const high = Math.max(...values);
  const span = high - low || Math.max(Math.abs(high), 1);
  const yMin = low - span * 0.25;
  const yMax = high + span * 0.25;
  const width = 640;
  const height = 220;
  const pad = { left: 40, right: 8, top: 12, bottom: 28 };
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;
  const xAt = (index: number) => pad.left + (points.length === 1 ? innerW / 2 : (index / (points.length - 1)) * innerW);
  const yAt = (value: number) => pad.top + ((yMax - value) / (yMax - yMin)) * innerH;
  const line = points.map((point, index) => `${index === 0 ? "M" : "L"} ${xAt(index).toFixed(1)} ${yAt(point.value).toFixed(1)}`).join(" ");
  const ticks = [0, 1, 2, 3].map((step) => yMin + ((yMax - yMin) * step) / 3);
  const labelEvery = Math.max(1, Math.ceil(points.length / 5));
  const labeled = new Set<number>();
  for (let index = 0; index < points.length; index += labelEvery) labeled.add(index);
  labeled.add(points.length - 1);
  const labeledIndexes = [...labeled].sort((a, b) => a - b);
  if (labeledIndexes.length > 2) {
    const last = labeledIndexes[labeledIndexes.length - 1];
    const before = labeledIndexes[labeledIndexes.length - 2];
    if (last - before < labelEvery) labeledIndexes.splice(labeledIndexes.length - 2, 1);
  }

  useEffect(() => {
    const root = chartRef.current;
    const guide = guideRef.current;
    if (!root || !guide) return;
    let current: HTMLElement | null = null;

    const hosts = () => [...root.querySelectorAll<HTMLElement>(".readings-point")];
    const nearest = (clientX: number) => {
      let chosen: HTMLElement | null = null;
      let best = Infinity;
      for (const host of hosts()) {
        const box = host.getBoundingClientRect();
        const distance = Math.abs(box.left + box.width / 2 - clientX);
        if (distance < best) {
          best = distance;
          chosen = host;
        }
      }
      return chosen;
    };
    const show = (host: HTMLElement) => {
      if (current && current !== host) {
        current.classList.remove("is-active");
        hidePointTip(current);
      }
      current = host;
      host.classList.add("is-active");
      const chart = root.getBoundingClientRect();
      const box = host.getBoundingClientRect();
      guide.style.left = `${box.left + box.width / 2 - chart.left}px`;
      guide.hidden = false;
      revealPointTip(host);
    };
    const clear = () => {
      if (current) {
        current.classList.remove("is-active");
        hidePointTip(current);
        current = null;
      }
      guide.hidden = true;
    };
    const onMove = (event: PointerEvent) => {
      const host = nearest(event.clientX);
      if (host) show(host);
    };
    const onLeave = (event: PointerEvent) => {
      const next = event.relatedTarget;
      if (next instanceof Node && root.contains(next)) return;
      clear();
    };
    const onFocusIn = (event: FocusEvent) => {
      const host = (event.target as Element | null)?.closest<HTMLElement>(".readings-point");
      if (host && root.contains(host)) show(host);
    };
    const onFocusOut = (event: FocusEvent) => {
      const host = (event.target as Element | null)?.closest<HTMLElement>(".readings-point");
      if (!host || !root.contains(host) || host.contains(event.relatedTarget as Node)) return;
      clear();
    };

    root.addEventListener("pointermove", onMove);
    root.addEventListener("pointerleave", onLeave);
    root.addEventListener("focusin", onFocusIn);
    root.addEventListener("focusout", onFocusOut);
    return () => {
      clear();
      root.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerleave", onLeave);
      root.removeEventListener("focusin", onFocusIn);
      root.removeEventListener("focusout", onFocusOut);
    };
  }, [points]);

  return (
    <figure className="readings-chart" ref={chartRef}>
      <svg className="readings-plot" viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
        {ticks.map((tick) => (
          <g key={tick}>
            <line x1={pad.left} x2={width - pad.right} y1={yAt(tick)} y2={yAt(tick)} />
            <text x={pad.left - 8} y={yAt(tick) + 4} textAnchor="end">{Math.round(tick)}</text>
          </g>
        ))}
        <path d={line} />
        {labeledIndexes.map((index) => {
          const point = points[index];
          return (
            <text
              key={`${point.id}-label`}
              x={xAt(index)}
              y={height - 8}
              textAnchor={index === 0 ? "start" : index === points.length - 1 ? "end" : "middle"}
            >
              {point.when.split(",")[0]}
            </text>
          );
        })}
      </svg>
      <span ref={guideRef} className="readings-guide" hidden />
      <div className="readings-points">
        {points.map((point, index) => (
          <button
            key={point.id}
            type="button"
            className="readings-point tip-host"
            style={{ left: `${(xAt(index) / width) * 100}%`, top: `${(yAt(point.value) / height) * 100}%` }}
            aria-label={`${point.when}, ${point.value.toLocaleString()} ${measure.unit}`}
          >
            <span className="tip readings-tip" role="tooltip" popover="manual">
              <span className="readings-tip-when">{point.when}</span>
              <strong>{point.value.toLocaleString()} {measure.unit}</strong>
            </span>
          </button>
        ))}
      </div>
    </figure>
  );
}

function ReadingChartEmpty() {
  const width = 640;
  const height = 220;
  const pad = { left: 40, right: 8, top: 12, bottom: 28 };
  const innerW = width - pad.left - pad.right;
  const ticks = [0, 1, 2, 3].map((step) => pad.top + ((height - pad.top - pad.bottom) * step) / 3);
  const dates = [0, 1, 2, 3, 4].map((step) => pad.left + (innerW * step) / 4);
  return (
    <figure className="readings-chart is-empty">
      <svg className="readings-plot" viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
        {ticks.map((y) => (
          <g key={y}>
            <line x1={pad.left} x2={width - pad.right} y1={y} y2={y} />
            <rect x={pad.left - 22} y={y - 3} width="14" height="6" rx="2" />
          </g>
        ))}
        {dates.map((x, index) => (
          <rect
            key={x}
            x={index === 0 ? x : index === dates.length - 1 ? x - 16 : x - 8}
            y={height - 15}
            width="16"
            height="6"
            rx="2"
          />
        ))}
      </svg>
      <p className="readings-chart-empty">More readings are needed to build this graph.</p>
    </figure>
  );
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function ChartStage({ id, children }: { id: string; children: ReactNode }) {
  const stage = useRef<HTMLDivElement>(null);
  const seen = useRef<number | null>(null);
  const previous = useRef({ id, node: children });
  const [leaving, setLeaving] = useState<{ id: string; node: ReactNode } | null>(null);
  if (previous.current.id !== id) {
    setLeaving(previous.current);
    previous.current = { id, node: children };
  } else {
    previous.current = { id, node: children };
  }

  useLayoutEffect(() => {
    const el = stage.current;
    if (!el) return;
    const next = el.offsetHeight;
    const prev = seen.current;
    seen.current = next;
    if (prev == null || prev === next || prefersReducedMotion()) return;
    el.animate(
      [{ height: `${prev}px` }, { height: `${next}px` }],
      { duration: next > prev ? 240 : 192, easing: "cubic-bezier(0.23, 1, 0.32, 1)" },
    );
  });

  return (
    <div className="readings-stage" ref={stage}>
      {leaving ? (
        <div className="readings-stage-leave" onAnimationEnd={() => setLeaving(null)}>
          {leaving.node}
        </div>
      ) : null}
      <div className="readings-stage-enter" key={id}>{children}</div>
    </div>
  );
}

function SourcePage({
  source,
  readings,
  onEdit,
  onSubmit,
}: {
  source: Source;
  readings: Reading[];
  onEdit: () => void;
  onSubmit: (value: string, when: Date, alerts: string[], entries: Entry[]) => void;
}) {
  const [measureId, setMeasureId] = useState(source.measures[0]?.id ?? "");
  const measure = source.measures.find((item) => item.id === measureId) ?? source.measures[0];
  const points = measure ? pointsFor(readings, source.id, measure.id) : [];

  return (
    <div className="pm-check">
      <div className="readings-check-head">
        <div className="pm-check-bar">
          <p className="pm-check-when">
            <span>{source.lastAt ? `Recorded ${source.lastAt}` : "Not recorded"}</span>
          </p>
          <button type="button" className="pm-check-edit" onClick={onEdit}>
            <Icon name="edit" size={18} />
            Edit source
          </button>
        </div>
        <div className="pm-check-intro">
          <header className="pm-check-name">
            <h2>{source.name}</h2>
            <p>
              {source.category ? `${source.category} · ` : ""}
              {measureCount(source)}
            </p>
          </header>
          <div className="pm-check-chips">
            <ReadingStatus source={source} />
            <span className="pm-check-range">
              <Icon name="calendar" size={14} />
              {source.lastAt ?? "Not recorded"}
            </span>
          </div>
        </div>
        <hr className="pm-check-rule" />
      </div>
      <section className="pm-check-block">
        <RecordForm source={source} onSubmit={onSubmit} />
      </section>
      <section className="pm-check-block" aria-label="Last readings">
        <hr className="pm-check-rule" />
        <p className="pm-list-k">Last readings</p>
        <div className="readings-stats">
          {source.measures.map((item) => {
            const latest = pointsFor(readings, source.id, item.id).at(-1);
            return (
              <div key={item.id} className="readings-stat">
                <small>{item.name}</small>
                <b>{latest ? `${latest.value.toLocaleString()} ${item.unit}` : "Not recorded"}</b>
              </div>
            );
          })}
        </div>
      </section>
      <section className="pm-check-block readings-graph" aria-label="Graphs">
        <hr className="pm-check-rule" />
        {source.measures.length > 1 ? (
          <Tabs
            label="Measurement"
            value={measure?.id ?? ""}
            onValueChange={setMeasureId}
            items={source.measures.map((item) => ({ value: item.id, label: item.name }))}
          />
        ) : null}
        <ChartStage id={measure && points.length > 1 ? measure.id : "empty"}>
          {measure && points.length > 1 ? <ReadingChart measure={measure} points={points} /> : <ReadingChartEmpty />}
        </ChartStage>
      </section>
    </div>
  );
}

export default function ReadingsPage() {
  const [sources, setSources] = useState(STARTER);
  const [logs, setLogs] = useState<Log[]>(() =>
    STARTER.flatMap((source) =>
      source.latest && source.lastAt ? [{ id: `log-${source.id}`, sourceId: source.id, value: source.latest, when: source.lastAt, by: "Sarah", initials: "SM" }] : [],
    ),
  );
  const [readings, setReadings] = useState<Reading[]>(guestSeries);
  const [view, setView] = useState<"list" | "history" | "edit" | "source">("list");
  const [openId, setOpenId] = useState<string | null>(null);
  const [scope, setScope] = useState<"range" | "all">("all");
  const [query, setQuery] = useState("");
  const [range, setRange] = useState("14d");
  const [historyQuery, setHistoryQuery] = useState("");
  const [historySources, setHistorySources] = useState<string[]>([]);
  const [historySort, setHistorySort] = useState<DataSort | null>(null);
  const [fromHistory, setFromHistory] = useState(false);
  const [focusSourceId, setFocusSourceId] = useState<string | null>(null);
  const [editingSource, setEditingSource] = useState(false);

  const now = new Date();
  const days = range === "7d" ? 7 : range === "30d" ? 30 : 14;
  const wanted = query.trim().toLowerCase();
  const visible = sources.filter((source) => {
    if (!source.active) return false;
    if (scope === "range" && source.alerts.length === 0) return false;
    if (!withinDays(source.lastAt, days, now)) return false;
    if (!wanted) return true;
    return `${source.name} ${source.measures.map((measure) => measure.name).join(" ")}`.toLowerCase().includes(wanted);
  });
  const recordedToday = sources.filter((source) => {
    if (!source.active) return false;
    const date = parseWhen(source.lastAt);
    return source.latest != null && date != null && sameDay(date, now);
  }).length;
  const outOfRange = sources.filter((source) => source.active && source.alerts.length > 0).length;
  const activeSources = sources.filter((source) => source.active).length;

  useEffect(() => {
    if (!focusSourceId) return;
    const field = document.querySelector<HTMLInputElement>(`[data-source="${CSS.escape(focusSourceId)}"] .readings-source-name`);
    field?.focus();
    field?.select();
    setFocusSourceId(null);
  }, [focusSourceId, sources]);

  function submit(source: Source, value: string, when: Date, alerts: string[], entries: Entry[]) {
    const stamp = formatWhen(when);
    setSources((current) => current.map((item) => item.id === source.id ? { ...item, latest: value, lastAt: stamp, alerts } : item));
    setLogs((current) => [{ id: `log-${Date.now()}`, sourceId: source.id, value, when: stamp, by: "Sarah", initials: "SM" }, ...current]);
    if (entries.length > 0) {
      setReadings((current) => [
        ...current,
        ...entries.map((entry, index) => ({
          id: `reading-${Date.now()}-${index}`,
          sourceId: source.id,
          measureId: entry.measureId,
          value: entry.value,
          when: stamp,
        })),
      ]);
    }
  }

  const columns: Array<DataColumn<Source>> = [
    {
      id: "name",
      title: "Source",
      text: "primary",
      flex: true,
      lines: 2,
      labelInset: TITLE_TEXT_INSET,
      render: (row) => (
        <div className="title-sub">
          <span className="title-sub-field">{row.name}</span>
          <span className="title-sub-note">{measureCount(row)}</span>
        </div>
      ),
    },
    {
      id: "status",
      title: "Status",
      ink: "strong",
      render: (row) => <ReadingStatus source={row} />,
    },
    {
      id: "last",
      title: "Last reading",
      render: (row) => <span className="sheet-when">{row.lastAt ?? "Not recorded"}</span>,
    },
    {
      id: "record",
      title: "",
      minWidth: 120,
      minContent: (
        <Button variant="secondary">
          <Icon name="plus" size={14} />
          Record
        </Button>
      ),
      render: (row) => (
        <Button
          variant="secondary"
          onClick={() => shiftPage("forward", () => { setOpenId(row.id); setView("source"); })}
        >
          <Icon name="plus" size={14} />
          Record
        </Button>
      ),
    },
  ];

  if (view === "source") {
    const source = sources.find((item) => item.id === openId);
    const toList = () => shiftPage("back", () => { setEditingSource(false); setFromHistory(false); setView("list"); });
    const close = () => shiftPage("back", () => {
      setEditingSource(false);
      if (fromHistory) {
        setFromHistory(false);
        setView("history");
        return;
      }
      setView("list");
    });
    if (source) {
      return (
        <PageLayout
          className="sheet-page readings-page pm-page"
          data-view="head"
          icon="gauge"
        title={<PageTitle parent="Readings" before={fromHistory ? { label: "History", onClick: close } : undefined} current={source.name} onBack={toList} />}
        actions={<BackButton onBack={close} />}
          bodyClassName="pm-shift-body"
        >
          <div className="pm-sub">
            <SourcePage
              source={source}
              readings={readings}
              onEdit={() => setEditingSource(true)}
              onSubmit={(value, when, alerts, entries) => submit(source, value, when, alerts, entries)}
            />
            {editingSource ? (
              <SourceEditorDialog
                source={source}
                sources={sources}
                onChange={setSources}
                onClose={() => setEditingSource(false)}
                onDelete={() => {
                  setSources((current) => current.filter((item) => item.id !== source.id));
                  setEditingSource(false);
                  setOpenId(null);
                  setView("list");
                }}
              />
            ) : null}
          </div>
        </PageLayout>
      );
    }
  }

  if (view === "history") {
    const historyWanted = historyQuery.trim().toLowerCase();
    const rows = logs
      .map((log) => {
        const source = sources.find((item) => item.id === log.sourceId);
        const status = source && source.alerts.length > 0 ? source.alerts.join(", ") : "In range";
        return {
          ...log,
          name: source?.name ?? "Source",
          category: source?.category || source?.name || "Source",
          place: source?.place || source?.name || "",
          status,
          source,
        };
      })
      .filter((log) => {
        if (historySources.length > 0 && !historySources.includes(log.name)) return false;
        if (!historyWanted) return true;
        return `${log.category} ${log.place} ${log.name} ${log.value} ${log.by}`.toLowerCase().includes(historyWanted);
      });
    const historyColumns: Array<DataColumn<(typeof rows)[number]>> = [
      {
        id: "name",
        title: "Source",
        text: "primary",
        flex: true,
        lines: 2,
        minWidth: 240,
        labelInset: TITLE_TEXT_INSET,
        render: (row) => (
          <div className="title-sub">
            <span className="title-sub-field">{row.category}</span>
            <span className="title-sub-note">{row.place}</span>
          </div>
        ),
      },
      {
        id: "status",
        title: "Status",
        ink: "strong",
        render: (row) => row.source ? <ReadingStatus source={{ ...row.source, latest: row.value }} /> : <span className="sheet-when">{row.status}</span>,
      },
      { id: "value", title: "Reading", render: (row) => <span className="sheet-when">{row.value}</span> },
      {
        id: "when",
        title: "Date",
        sortable: true,
        sortValue: (row) => parseWhen(row.when)?.getTime() ?? 0,
        render: (row) => <span className="sheet-when">{row.when}</span>,
      },
      {
        id: "who",
        title: "Recorded by",
        sortable: true,
        sortValue: (row) => row.by,
        labelInset: 0,
        measure: () => (
          <span className="sheet-who">
            <span className="mini-pill">
              <span className="avatar mini">SM</span>
            </span>
          </span>
        ),
        render: (row) => <AssigneeCell name={row.by} initials={row.initials} />,
      },
    ];
    return (
      <PageLayout
        className="sheet-page readings-page"
        data-view="head"
        icon="gauge"
        title={<PageTitle parent="Readings" current="History" onBack={() => shiftPage("back", () => setView("list"))} />}
        count={rows.length}
        actions={<BackButton onBack={() => shiftPage("back", () => setView("list"))} />}
        bodyClassName="pm-shift-body"
      >
        <div className="pm-sub">
          <div className="filter-row page-toolbar">
            <SearchBox placeholder="Search history" label="Search history" value={historyQuery} onValueChange={setHistoryQuery} />
            <FilterMenu
              value={historySources}
              onValueChange={setHistorySources}
              options={sources.map((source) => source.name)}
              sorts={[{ id: "when", label: "Date" }, { id: "who", label: "Staff member" }]}
              sortId={historySort?.columnId ?? null}
              onSortChange={(id) => setHistorySort((current) => {
                if (current?.columnId === id) return { columnId: id, direction: current.direction === "asc" ? "desc" : "asc" };
                return { columnId: id, direction: id === "who" ? "asc" : "desc" };
              })}
            />
            <div className="filter-chips">
              {historySources.map((value) => (
                <button key={value} className="chip chip-filter" type="button" onClick={() => setHistorySources((current) => current.filter((item) => item !== value))}>
                  <span className="chip-k">Source</span>: {value} <Glyph name="plus" size={10} className="x" />
                </button>
              ))}
            </div>
            <Button variant="secondary" className="pm-download" onClick={() => downloadReadings(rows)}>
              <Icon name="upload" size={14} />
              Download report
            </Button>
          </div>
          <div className="pm-table">
            <DataTable
              rows={rows}
              total={logs.length}
              columns={historyColumns}
              empty="Nothing to show"
              sort={historySort}
              onSortChange={setHistorySort}
              interactive
              onRowClick={(row) => {
                shiftPage("forward", () => {
                  setOpenId(row.sourceId);
                  setFromHistory(true);
                  setView("source");
                });
              }}
            />
          </div>
        </div>
      </PageLayout>
    );
  }

  if (view === "edit") {
    return (
      <PageLayout
        className="sheet-page readings-page"
        data-view="head"
        icon="gauge"
        title={<PageTitle parent="Readings" current="Edit readings" onBack={() => shiftPage("back", () => setView("list"))} />}
        actions={<BackButton onBack={() => shiftPage("back", () => setView("list"))} />}
        bodyClassName="pm-shift-body"
      >
        <div className="pm-sub readings-edit">
          <SourceEditor
            sources={sources}
            onChange={setSources}
            focusId={focusSourceId}
            onAdded={setFocusSourceId}
          />
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      className="sheet-page readings-page"
      data-view="head"
      icon="gauge"
      title="Readings"
      count={visible.length}
      bodyClassName="pm-shift-body"
      actions={
        <>
          <Button variant="secondary" onClick={() => shiftPage("forward", () => setView("history"))}>
            <Icon name="clock" size={14} />
            History
          </Button>
          <Button variant="secondary" onClick={() => shiftPage("forward", () => setView("edit"))}>
            <Icon name="list" size={14} />
            Edit readings
          </Button>
        </>
      }
      tabs={
        <Tabs
          label="Which readings"
          value={scope}
          onValueChange={(value) => setScope(value as "range" | "all")}
          items={[
            { value: "range", label: "Out of range", count: outOfRange },
            { value: "all", label: "All", count: activeSources },
          ]}
        />
      }
      toolbar={
        <div className="filter-row page-toolbar">
          <SearchBox placeholder="Search readings" label="Search readings" value={query} onValueChange={setQuery} />
          <SegmentedControl
            className="range"
            aria-label="Time range"
            value={range}
            onValueChange={setRange}
            options={[
              { value: "7d", label: "7d" },
              { value: "14d", label: "14d" },
              { value: "30d", label: "30d" },
            ]}
          />
        </div>
      }
    >
      <div className="sheet-stack">
        <section className="kb-health" aria-label="Readings">
          <div className="kb-health-score pm-closed">
            <p className="kb-health-label">Recorded today</p>
            <p className="kb-score-figures">
              <span className="kb-score-num">{recordedToday}</span>
              <span className="kb-score-of">/{activeSources}</span>
            </p>
          </div>
          <div className="kb-health-rule" aria-hidden="true" />
          <div className="kb-health-questions">
            <dl className="kb-facts pm-facts">
              <div>
                <dt>Out of range in last 7 days</dt>
                <dd>{outOfRange}</dd>
              </div>
              <div>
                <dt>Complete readings in last 7 days</dt>
                <dd>0/7</dd>
              </div>
              <div>
                <dt>Fully logged streak</dt>
                <dd>0 days</dd>
              </div>
            </dl>
          </div>
        </section>
        <div className="sheet-work readings-board">
          <DataTable
            rows={visible}
            total={activeSources}
            columns={columns}
            empty="Nothing to show"
            interactive
            onRowClick={(row) => shiftPage("forward", () => { setOpenId(row.id); setView("source"); })}
          />
        </div>
      </div>
    </PageLayout>
  );
}
