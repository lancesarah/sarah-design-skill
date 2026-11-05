"use client";

import {
  Button,
  DataTable,
  DepartmentChip,
  DetailPanel,
  Icon,
  Person,
  SegmentedControl,
  Tabs,
  captureClose,
  type DataColumn,
  type DataSort,
} from "@lance-live/gallery-ui";
import { useEffect, useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { FilterMenu, SearchBox } from "../chrome";
import { Glyph } from "../glyph";
import { PageLayout } from "../page-layout";
import { CountForm } from "./count-form";
import { LocationsEditor } from "./locations";
import {
  INITIAL_COUNTS,
  INITIAL_LOCATIONS,
  formatMoney,
  formatWhen,
  shiftLabel,
  sortShifts,
  summaryLines,
  totalOf,
  varianceLabel,
  varianceOf,
  type CashCount,
  type CashLocation,
  type DepartmentName,
} from "./model";

type View =
  | { name: "list" }
  | { name: "locations" }
  | { name: "count"; count: CashCount | null };

const RANGES = [
  { value: "anytime", label: "Anytime" },
  { value: "24h", label: "24h" },
  { value: "48h", label: "48h" },
  { value: "7d", label: "7d" },
  { value: "30d", label: "30d" },
  { value: "90d", label: "90d" },
];

const RANGE_HOURS: Record<string, number> = {
  "24h": 24,
  "48h": 48,
  "7d": 24 * 7,
  "30d": 24 * 30,
  "90d": 24 * 90,
};

function countedAt(when: string, now = new Date()) {
  const parsed = Date.parse(`${when}, ${now.getFullYear()}`);
  if (Number.isNaN(parsed)) return now.getTime();
  if (parsed - now.getTime() > 24 * 60 * 60 * 1000) {
    const previous = Date.parse(`${when}, ${now.getFullYear() - 1}`);
    return Number.isNaN(previous) ? parsed : previous;
  }
  return parsed;
}

function inRange(when: string, range: string) {
  const hours = RANGE_HOURS[range];
  if (hours == null) return true;
  return Date.now() - countedAt(when) <= hours * 60 * 60 * 1000;
}

export default function CashPage() {
  const [locations, setLocations] = useState(INITIAL_LOCATIONS);
  const [counts, setCounts] = useState(INITIAL_COUNTS);
  const [view, setView] = useState<View>({ name: "list" });
  const [query, setQuery] = useState("");
  const [shift, setShift] = useState("");
  const [place, setPlace] = useState("all");
  const [range, setRange] = useState("anytime");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [present, setPresent] = useState(false);
  const [hidden, setHidden] = useState(true);
  const [enteringId, setEnteringId] = useState<string | null>(null);
  const [sort, setSort] = useState<DataSort | null>(null);
  const retained = useRef<CashCount | null>(null);

  const shiftOptions = useMemo(() => sortShifts([...new Set(counts.map((count) => count.shift))]), [counts]);
  const places = useMemo(() => locations.filter((location) => !location.archived), [locations]);
  const matched = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return counts.filter((count) => {
      if (shift && count.shift !== shift) return false;
      if (!inRange(count.when, range)) return false;
      if (!needle) return true;
      const location = locations.find((item) => item.id === count.locationId);
      const hay = `${count.shift} ${count.by} ${count.notes} ${count.when} ${location?.name ?? ""} ${location?.department ?? ""} ${formatMoney(totalOf(count))}`.toLowerCase();
      return hay.includes(needle);
    });
  }, [counts, locations, query, range, shift]);
  const visible = useMemo(
    () => (place === "all" ? matched : matched.filter((count) => count.locationId === place)),
    [matched, place],
  );
  const locationTabs = useMemo(
    () => [
      { value: "all", label: "All", count: matched.length },
      ...places.map((location) => ({
        value: location.id,
        label: location.name.trim() || "New location",
        count: matched.filter((count) => count.locationId === location.id).length,
      })),
    ],
    [matched, places],
  );

  const departmentByLocation = useMemo(() => new Map(locations.map((location) => [location.id, location.department])), [locations]);
  const columns = useMemo(() => countColumns(departmentByLocation), [departmentByLocation]);
  const active = locations.some((location) => !location.archived);
  const open = counts.find((count) => count.id === selectedId) ?? null;
  if (open) retained.current = open;
  const sideCount = retained.current;
  const sideLocation = sideCount ? locations.find((item) => item.id === sideCount.locationId) ?? null : null;

  useEffect(() => {
    if (place === "all") return;
    if (places.some((location) => location.id === place)) return;
    setPlace("all");
  }, [place, places]);

  useEffect(() => {
    if (open) {
      setPresent(true);
      return;
    }
    setHidden(true);
  }, [open]);

  useEffect(() => {
    if (!present || !open) return;
    const frame = requestAnimationFrame(() => setHidden(false));
    return () => cancelAnimationFrame(frame);
  }, [present, open]);

  useEffect(() => {
    if (!present || !hidden || open) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timer = window.setTimeout(() => setPresent(false), reduce ? 0 : 360);
    return () => window.clearTimeout(timer);
  }, [present, hidden, open]);

  function remove(count: CashCount) {
    const play = captureClose(document.querySelector(`[data-record="${CSS.escape(count.id)}"]`));
    flushSync(() => {
      setCounts((list) => list.filter((item) => item.id !== count.id));
      setSelectedId((current) => (current === count.id ? null : current));
    });
    play();
  }

  if (view.name === "locations") {
    return (
      <LocationsEditor
        locations={locations}
        onBack={() => setView({ name: "list" })}
        onChange={setLocations}
      />
    );
  }

  return (
    <PageLayout
      className="sheet-page cash-page"
      data-view="head"
      icon="card"
      title="Cash & bank"
      count={view.name === "list" ? visible.length : undefined}
      tabs={
        view.name === "list" ? (
          <Tabs label="Cash locations" value={place} onValueChange={setPlace} items={locationTabs} />
        ) : null
      }
      actions={
        view.name === "list" ? (
          <>
            <Button variant="secondary" onClick={() => setView({ name: "locations" })}>
              <Icon name="pin" size={14} />
              Manage locations
            </Button>
            <Button disabled={!active} onClick={() => setView({ name: "count", count: null })}>
              <Icon name="plus-bold" size={14} />
              New count
            </Button>
          </>
        ) : null
      }
      toolbar={
        view.name === "list" ? (
          <div className="filter-row page-toolbar">
            <SearchBox placeholder="Search" label="Search counts" value={query} onValueChange={setQuery} />
            <FilterMenu value={shift} onValueChange={setShift} options={shiftOptions} />
            <div className="filter-chips">
              {shift ? (
                <button className="chip chip-filter" type="button" onClick={() => setShift("")}>
                  <span className="chip-k">Shift</span>: {shift} <Glyph name="plus" size={10} className="x" />
                </button>
              ) : null}
            </div>
            <SegmentedControl
              className="range"
              aria-label="Time range"
              value={range}
              onValueChange={setRange}
              options={RANGES}
            />
          </div>
        ) : null
      }
    >
      {view.name === "list" ? (
        <div className="sheet-work">
          <div className="sheet-list">
            {visible.length === 0 ? (
              <div className="stage sheet-stage">
                <DataTable rows={[]} total={counts.length} empty="No counts" columns={columns} />
              </div>
            ) : (
              locations.map((location) => {
                const rows = visible.filter((count) => count.locationId === location.id);
                if (rows.length === 0) return null;
                const owned = counts.filter((count) => count.locationId === location.id).length;
                return (
                  <div key={location.id} className="stage sheet-stage">
                    <h2 className="cash-place">
                      <Icon name="pin" size={14} />
                      {location.name || "New location"}
                    </h2>
                    <DataTable
                      rows={rows}
                      total={owned}
                      empty="No counts"
                      columns={columns}
                      selectedId={selectedId}
                      enteringId={rows.some((row) => row.id === enteringId) ? enteringId : null}
                      sort={sort}
                      onSortChange={setSort}
                      onRowClick={(row) => setSelectedId((current) => (current === row.id ? null : row.id))}
                    />
                  </div>
                );
              })
            )}
          </div>
        </div>
      ) : null}
      {view.name === "count" ? (
        <CountForm
          locations={locations}
          initial={view.count}
          onCancel={() => setView({ name: "list" })}
          onPost={(posted) => {
            const editing = view.count;
            const id = editing?.id ?? `count-${Date.now()}`;
            const keep = Boolean(editing && !editing.entry && Object.keys(posted.entry).length === 0);
            const next: CashCount = {
              id,
              locationId: posted.locationId,
              shift: posted.shift,
              by: editing?.by ?? "Sarah",
              initials: editing?.initials ?? "SM",
              when: editing?.when ?? formatWhen(new Date()),
              notes: posted.notes,
              expected: editing && keep ? editing.expected : posted.expected,
              entry: editing && keep ? null : posted.entry,
              total: editing && keep ? editing.total : posted.total,
            };
            setCounts((list) => (editing ? list.map((item) => (item.id === id ? next : item)) : [next, ...list]));
            setEnteringId(editing ? null : id);
            setSelectedId(id);
            setView({ name: "list" });
          }}
        />
      ) : null}
      {view.name === "list" && present && sideCount && sideLocation ? (
        <CountSide
          count={sideCount}
          location={sideLocation}
          hidden={hidden}
          onClose={() => setSelectedId(null)}
          onExited={() => setPresent(false)}
          onEdit={() => setView({ name: "count", count: sideCount })}
          onDeleted={() => remove(sideCount)}
        />
      ) : null}
    </PageLayout>
  );
}

function countColumns(departmentByLocation: Map<string, DepartmentName | null>): Array<DataColumn<CashCount>> {
  const even = { flex: true, minWidth: 125 };
  return [
    {
      id: "shift",
      title: "Shift",
      labelInset: 8,
      ...even,
      sortValue: (row) => row.shift,
      render: (row) => <span className="cash-shift">{shiftLabel(row.shift)}</span>,
    },
    {
      id: "dept",
      title: "Dept",
      labelInset: 8,
      ...even,
      render: (row) => {
        const name = departmentByLocation.get(row.locationId);
        return name ? <DepartmentChip name={name} /> : null;
      },
    },
    {
      id: "by",
      title: "Counted by",
      ...even,
      render: (row) => <Person variant="pill" name={row.by} initials={row.initials} />,
    },
    {
      id: "when",
      title: "Timestamp",
      ...even,
      render: (row) => <span className="sheet-when">{row.when}</span>,
    },
    {
      id: "total",
      title: "Total",
      ...even,
      sortValue: (row) => totalOf(row),
      render: (row) => <span className="cash-money">{formatMoney(totalOf(row))}</span>,
    },
    {
      id: "variance",
      title: "Over/short",
      sortable: true,
      ...even,
      sortValue: (row) => varianceOf(row),
      render: (row) => <Variance count={row} />,
    },
  ];
}

function Variance({ count }: { count: CashCount }) {
  const delta = varianceOf(count);
  const tone = delta === 0 ? "is-even" : delta > 0 ? "is-over" : "is-short";
  return <span className={`cash-var ${tone}`}>{varianceLabel(delta)}</span>;
}

function CountSide({
  count,
  location,
  hidden,
  onClose,
  onExited,
  onEdit,
  onDeleted,
}: {
  count: CashCount;
  location: CashLocation;
  hidden: boolean;
  onClose: () => void;
  onExited: () => void;
  onEdit: () => void;
  onDeleted: () => void;
}) {
  const lines = summaryLines(location, count.entry);
  return (
    <DetailPanel
      label="Count"
      hidden={hidden}
      name={shiftLabel(count.shift)}
      noun="count"
      onClose={onClose}
      onExited={onExited}
      onDeleted={onDeleted}
      actions={
        <Button variant="secondary" onClick={onEdit}>
          Edit
        </Button>
      }
    >
      <div className="cash-side-head">
        <div className="todo-side-intro">
          <div className="todo-side-title-row">
            <h2>{shiftLabel(count.shift)}</h2>
            <Variance count={count} />
          </div>
          <p className="cash-side-meta">
            <Person variant="pill" name={count.by} initials={count.initials} />
            <span>{count.when}</span>
          </p>
          <p className="cash-side-total">
            <span className="sheet-label">Total</span>
            <span className="cash-money">{formatMoney(totalOf(count))}</span>
          </p>
        </div>
        <div className="todo-side-rule" />
      </div>
      {lines.length > 0 ? (
        <div className="cash-lines">
          {lines.map(({ line, amount }) => (
            <div key={line.id} className="cash-line">
              <span className="cash-line-name">{line.countLabel ?? line.label}</span>
              <span className="cash-money">{formatMoney(amount)}</span>
            </div>
          ))}
        </div>
      ) : null}
      <div className="todo-side-rule" />
      <section className="todo-side-desc">
        <span className="sheet-label">Notes</span>
        {count.notes ? <p>{count.notes}</p> : <p className="cash-none">none</p>}
      </section>
    </DetailPanel>
  );
}
