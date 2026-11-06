"use client";

import { Button, DepartmentChip, Icon, OverlayMenu, SegmentedControl } from "@lance-live/gallery-ui";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { PageLayout } from "../page-layout";
import {
  countLines,
  dollarsFromInput,
  enabledShifts,
  formatMoney,
  inputFromDollars,
  sortShifts,
  varianceLabel,
  type CashLine,
  type CashLocation,
  type LineGroup,
} from "./model";
import { useMenu } from "./use-menu";

const LINE_GROUPS: Array<{ id: LineGroup; label: string }> = [
  { id: "coins", label: "Coins" },
  { id: "bills", label: "Bills" },
  { id: "other", label: "Other" },
];

function shiftFace(name: string) {
  return name.replace(/ In$/, " in").replace(/ Out$/, " out");
}

type Mode = "count" | "amount";

export type PostedCount = {
  locationId: string;
  shift: string;
  notes: string;
  entry: Record<string, number>;
  total: number;
  expected: number;
};

export function CountForm({
  locations,
  initial,
  onCancel,
  onPost,
}: {
  locations: CashLocation[];
  initial: { id?: string; locationId: string; shift: string; notes: string; entry: Record<string, number> | null } | null;
  onCancel: () => void;
  onPost: (count: PostedCount) => void;
}) {
  const active = locations.filter((location) => !location.archived || location.id === initial?.locationId);
  const [locationId, setLocationId] = useState(initial?.locationId ?? active[0]?.id ?? "");
  const location = active.find((item) => item.id === locationId) ?? active[0];
  const shifts = useMemo(() => {
    if (!location) return [];
    const names = enabledShifts(location);
    if (initial?.locationId === location.id && initial.shift && !names.includes(initial.shift)) names.push(initial.shift);
    return sortShifts(names);
  }, [initial, location]);
  const [shift, setShift] = useState(() => (initial?.shift && shifts.includes(initial.shift) ? initial.shift : shifts.includes("PM In") ? "PM In" : (shifts[0] ?? "")));
  const [mode, setMode] = useState<Mode>("count");
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [focused, setFocused] = useState<string | null>(initial?.id ? null : "pennies");
  const lines = useMemo(() => (location ? countLines(location) : []), [location]);
  const [values, setValues] = useState<Record<string, string>>(() => {
    if (!initial?.entry || !location) return {};
    const next: Record<string, string> = {};
    for (const line of countLines(location)) {
      const dollars = initial.entry[line.id];
      if (!dollars) continue;
      next[line.id] = inputFromDollars(line, dollars, "count");
    }
    return next;
  });

  function chooseLocation(nextId: string) {
    const next = active.find((item) => item.id === nextId);
    setLocationId(nextId);
    if (!next) return;
    const options = enabledShifts(next);
    setShift((current) => (options.includes(current) ? current : options.includes("PM In") ? "PM In" : (options[0] ?? "")));
    setValues((current) => {
      const kept: Record<string, string> = {};
      for (const line of countLines(next)) {
        if (current[line.id]) kept[line.id] = current[line.id];
      }
      return kept;
    });
  }

  function chooseMode(next: string) {
    if (next !== "count" && next !== "amount") return;
    if (next === mode || !location) {
      setMode(next);
      return;
    }
    setValues((current) => {
      const converted: Record<string, string> = {};
      for (const line of countLines(location)) {
        const dollars = dollarsFromInput(line, current[line.id] ?? "", mode);
        if (!dollars) continue;
        converted[line.id] = inputFromDollars(line, dollars, next);
      }
      return converted;
    });
    setMode(next);
  }

  const entry = useMemo(() => {
    const next: Record<string, number> = {};
    for (const line of lines) {
      const dollars = dollarsFromInput(line, values[line.id] ?? "", mode);
      if (dollars) next[line.id] = dollars;
    }
    return next;
  }, [lines, mode, values]);
  const total = Object.values(entry).reduce((sum, value) => sum + value, 0);
  const expected = location?.expected ?? 0;
  const started = Object.values(entry).some((value) => value !== 0);
  const delta = total - expected;
  const tone = !started ? "" : delta === 0 ? "is-even" : delta > 0 ? "is-over" : "is-short";

  const title = initial?.id ? "Edit count" : "New count";
  const page = (children: ReactNode) => (
    <PageLayout
      className="sheet-page cash-page"
      bodyClassName="cash-shift-body"
      icon="card"
      title={
        <>
          <button type="button" className="cash-back" onClick={onCancel}>
            Cash & bank
          </button>
          <span className="cash-crumb-sep" aria-hidden="true">
            /
          </span>
          {title}
        </>
      }
      actions={
        <>
          <Button variant="secondary" onClick={onCancel}>
            <Icon name="chevron" size={14} className="cash-back-icon" />
            Back
          </Button>
          <Button disabled={!location || !shift} onClick={() => location && shift && onPost({ locationId: location.id, shift, notes: notes.trim(), entry, total, expected })}>
            Post count
          </Button>
        </>
      }
    >
      <div className="cash-screen">
        <div className="cash-manage">{children}</div>
      </div>
    </PageLayout>
  );

  if (!location) return page(<p className="cash-none">No locations</p>);

  return page(
    <div className="cash-count">
      <div className="cash-bank-figure">
        <span>Counted</span>
        <div className={started ? "cash-count-sum" : "cash-count-sum is-quiet"}>
          <span className="cash-bank-sign">$</span>
          {total.toFixed(2)}
        </div>
        <div className="cash-count-ref">
          <span>Expected {formatMoney(expected)}</span>
          <span className={tone}>{started ? varianceLabel(delta) : "—"}</span>
        </div>
      </div>
      <div className="cash-count-picks">
        <div className="cash-count-place">
          <LocationField locations={active} value={location.id} locked={Boolean(initial?.id)} onChange={chooseLocation} />
          {location.department ? <DepartmentChip name={location.department} style={{ boxShadow: "none" }} /> : null}
        </div>
        <ShiftField shifts={shifts} value={shift} onChange={setShift} />
        <SegmentedControl
          className="cash-count-mode"
          aria-label="Entry mode"
          value={mode}
          onValueChange={chooseMode}
          options={[
            { value: "count", label: "Count" },
            { value: "amount", label: "Amount" },
          ]}
        />
      </div>
      <section className="cash-sec">
        <div className="cash-sec-head">
          <h2>Lines</h2>
        </div>
        <div className="cash-grid">
          {LINE_GROUPS.map((group) => (
            <div className="cash-col" key={group.id}>
              <span className="cash-col-k">{group.label}</span>
              <div className="cash-col-list">
                {lines
                  .filter((line) => line.group === group.id)
                  .map((line) => (
                    <DenomRow
                      key={line.id}
                      line={line}
                      mode={mode}
                      value={values[line.id] ?? ""}
                      focused={focused === line.id}
                      autoFocus={!initial?.id && line.id === "pennies"}
                      onFocus={() => setFocused(line.id)}
                      onBlur={() => setFocused((current) => (current === line.id ? null : current))}
                      onChange={(value) => setValues((current) => ({ ...current, [line.id]: value }))}
                    />
                  ))}
              </div>
            </div>
          ))}
          <div className="cash-col cash-col-notes">
            <span className="cash-col-k">Notes</span>
            <textarea className="cash-add-input cash-count-notes" aria-label="Notes" value={notes} onChange={(event) => setNotes(event.target.value)} />
          </div>
        </div>
      </section>
    </div>,
  );
}

function LocationField({
  locations,
  value,
  locked,
  onChange,
}: {
  locations: CashLocation[];
  value: string;
  locked: boolean;
  onChange: (id: string) => void;
}) {
  const current = locations.find((location) => location.id === value);
  const name = current?.name || "New location";
  const menu = useMenu();
  return locked || locations.length < 2 ? (
        <span className="cash-meta-item">
          <span className="sheet-label">Location</span>
          <span className="cash-meta-value">{name}</span>
        </span>
      ) : (
        <span className="drop">
          <span className="sheet-label">Location</span>
          <button ref={menu.anchorRef} className="cash-select" type="button" aria-haspopup="menu" aria-expanded={menu.open} onClick={() => menu.setOpen((open) => !open)}>
            {name}
            <Icon name="chevron" size={14} />
          </button>
          <OverlayMenu open={menu.open} anchorRef={menu.anchorRef} marker={menu.marker} label="Location">
            {locations.map((location) => (
              <button
                key={location.id}
                className="menu-item"
                type="button"
                role="menuitemradio"
                aria-checked={location.id === value}
                onClick={() => {
                  onChange(location.id);
                  menu.setOpen(false);
                }}
              >
                {location.name || "New location"}
                <Icon name="check" size={14} className="check" />
              </button>
            ))}
          </OverlayMenu>
        </span>
      );
}

function ShiftField({ shifts, value, onChange }: { shifts: string[]; value: string; onChange: (shift: string) => void }) {
  const menu = useMenu();
  return (
    <span className="drop">
      <span className="sheet-label">Shift</span>
      <button ref={menu.anchorRef} className="cash-select" type="button" aria-haspopup="menu" aria-expanded={menu.open} onClick={() => menu.setOpen((open) => !open)}>
        {value ? shiftFace(value) : "Shift"}
        <Icon name="chevron" size={14} />
      </button>
      <OverlayMenu open={menu.open} anchorRef={menu.anchorRef} marker={menu.marker} label="Shift">
        {shifts.map((shift) => (
          <button
            key={shift}
            className="menu-item"
            type="button"
            role="menuitemradio"
            aria-checked={shift === value}
            onClick={() => {
              onChange(shift);
              menu.setOpen(false);
            }}
          >
            {shiftFace(shift)}
            <Icon name="check" size={14} className="check" />
          </button>
        ))}
      </OverlayMenu>
    </span>
  );
}

function DenomRow({
  line,
  mode,
  value,
  focused,
  autoFocus,
  onFocus,
  onBlur,
  onChange,
}: {
  line: CashLine;
  mode: Mode;
  value: string;
  focused: boolean;
  autoFocus?: boolean;
  onFocus: () => void;
  onBlur: () => void;
  onChange: (value: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (!autoFocus) return;
    const input = inputRef.current;
    if (!input) return;
    input.focus();
    input.select();
  }, [autoFocus]);
  const piece = mode === "count" && line.kind === "count";
  const dollars = dollarsFromInput(line, value, mode);
  const showEq = piece && (focused || value !== "");
  return (
    <label className={["cash-count-line", focused ? "is-active" : "", value ? "has-value" : ""].filter(Boolean).join(" ")}>
      <span className="cash-count-copy">
        <span>{line.countLabel ?? line.label}</span>
        {showEq ? <span className="cash-eq">{formatMoney(dollars)}</span> : null}
      </span>
      <input
        ref={inputRef}
        className="cash-qty"
        inputMode="decimal"
        aria-label={line.label}
        value={value}
        placeholder={focused ? "0" : "—"}
        onFocus={onFocus}
        onBlur={onBlur}
        onChange={(event) => onChange(event.target.value.replace(/[^0-9.]/g, ""))}
      />
    </label>
  );
}
