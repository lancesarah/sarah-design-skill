"use client";

import { Button, Icon, OverlayMenu, SegmentedControl } from "@lance-live/gallery-ui";
import { useMemo, useState } from "react";
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
} from "./model";
import { useMenu } from "./use-menu";

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
  const [focused, setFocused] = useState<string | null>(null);
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

  return (
    <div className="cash-screen">
      <div className="cash-scroll">
        <div className="cash-meta">
          <LocationField locations={active} value={locationId} locked={Boolean(initial?.id)} onChange={chooseLocation} />
          <ShiftField shifts={shifts} value={shift} onChange={setShift} />
          <div className="cash-meta-item">
            <span className="sheet-label">Entry mode</span>
            <SegmentedControl
              aria-label="Entry mode"
              value={mode}
              onValueChange={chooseMode}
              options={[
                { value: "count", label: "# Count" },
                { value: "amount", label: "$ Amount" },
              ]}
            />
          </div>
          <div className="cash-meta-item">
            <span className="sheet-label">Expected bank</span>
            <span className="cash-meta-value cash-money">{formatMoney(expected)}</span>
          </div>
        </div>
        <div className="cash-blocks">
          <div className="cash-block">
            <h2>Denominations</h2>
            <div className="cash-denoms">
              {lines.map((line) => (
                <DenomRow
                  key={line.id}
                  line={line}
                  mode={mode}
                  value={values[line.id] ?? ""}
                  focused={focused === line.id}
                  onFocus={() => setFocused(line.id)}
                  onBlur={() => setFocused((current) => (current === line.id ? null : current))}
                  onChange={(value) => setValues((current) => ({ ...current, [line.id]: value }))}
                />
              ))}
              <label className="cash-denom cash-notes-field">
                <span className="cash-denom-name">Notes</span>
                <input className="cash-qty" aria-label="Notes" value={notes} onChange={(event) => setNotes(event.target.value)} />
              </label>
            </div>
          </div>
        </div>
      </div>
      <footer className="cash-foot">
        <div className="cash-totals">
          <div className="cash-total">
            <span className="sheet-label">Running total</span>
            <strong>{formatMoney(total)}</strong>
          </div>
          <div className={`cash-total ${tone}`}>
            <span className="sheet-label">Over / Short</span>
            <strong>{started ? varianceLabel(delta) : "—"}</strong>
          </div>
        </div>
        <div className="cash-foot-actions">
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button disabled={!location || !shift} onClick={() => location && shift && onPost({ locationId: location.id, shift, notes: notes.trim(), entry, total, expected })}>
            Post count
          </Button>
        </div>
      </footer>
    </div>
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
  return (
    <div className="cash-meta-item">
      <span className="sheet-label">Location</span>
      {locked || locations.length < 2 ? (
        <span className="cash-meta-value">{name}</span>
      ) : (
        <span className="drop">
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
                <Icon name="check" className="check" />
              </button>
            ))}
          </OverlayMenu>
        </span>
      )}
    </div>
  );
}

function ShiftField({ shifts, value, onChange }: { shifts: string[]; value: string; onChange: (shift: string) => void }) {
  const menu = useMenu();
  return (
    <div className="cash-meta-item">
      <span className="sheet-label">Shift</span>
      <span className="drop">
        <button ref={menu.anchorRef} className="cash-select" type="button" aria-haspopup="menu" aria-expanded={menu.open} onClick={() => menu.setOpen((open) => !open)}>
          {value || "—"}
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
              {shift}
              <Icon name="check" className="check" />
            </button>
          ))}
        </OverlayMenu>
      </span>
    </div>
  );
}

function DenomRow({
  line,
  mode,
  value,
  focused,
  onFocus,
  onBlur,
  onChange,
}: {
  line: CashLine;
  mode: Mode;
  value: string;
  focused: boolean;
  onFocus: () => void;
  onBlur: () => void;
  onChange: (value: string) => void;
}) {
  const piece = mode === "count" && line.kind === "count";
  const dollars = dollarsFromInput(line, value, mode);
  const showEq = piece && (focused || value !== "");
  return (
    <label className="cash-denom">
      <span className="cash-denom-name">{line.countLabel ?? line.label}</span>
      <input
        className="cash-qty"
        inputMode="decimal"
        aria-label={line.label}
        value={value}
        placeholder={piece ? "0" : "—"}
        onFocus={onFocus}
        onBlur={onBlur}
        onChange={(event) => onChange(event.target.value.replace(/[^0-9.]/g, ""))}
      />
      <span className="cash-eq">{showEq ? `${value || "0"} → ${formatMoney(dollars)}` : ""}</span>
    </label>
  );
}
