"use client";

import { Button, DEPARTMENTS, Icon, OverlayMenu } from "@lance-live/gallery-ui";
import { useEffect, useRef, useState } from "react";
import {
  createLocation,
  formatMoney,
  includedLineCount,
  type CashLine,
  type CashLocation,
  type DepartmentName,
  type LineGroup,
} from "./model";
import { useMenu } from "./use-menu";

const GROUPS: Array<{ id: LineGroup; label: string }> = [
  { id: "coins", label: "Coins" },
  { id: "bills", label: "Bills" },
  { id: "other", label: "Other lines" },
];

export function LocationsEditor({
  locations,
  onCancel,
  onSave,
}: {
  locations: CashLocation[];
  onCancel: () => void;
  onSave: (locations: CashLocation[]) => void;
}) {
  const [draft, setDraft] = useState(locations);
  const [selectedId, setSelectedId] = useState(locations[0]?.id ?? "");
  const [focusName, setFocusName] = useState(false);
  const selected = draft.find((location) => location.id === selectedId) ?? draft[0];

  function update(id: string, change: (location: CashLocation) => CashLocation) {
    setDraft((current) => current.map((location) => (location.id === id ? change(location) : location)));
  }

  function addLocation() {
    const id = `location-${Date.now()}`;
    setDraft((current) => [...current, createLocation(id)]);
    setSelectedId(id);
    setFocusName(true);
  }

  return (
    <div className="cash-screen">
      <div className="cash-manage-body">
        <div className="cash-manage-list">
          <div className="cash-manage-label">
            <span className="sheet-label">Locations</span>
            <span className="sheet-label">
              {draft.length} {draft.length === 1 ? "location" : "locations"}
            </span>
          </div>
          {draft.map((location) => {
            const shifts = location.shifts.filter((shift) => shift.on).length;
            return (
              <button key={location.id} className="cash-loc" type="button" aria-current={location.id === selected?.id} onClick={() => setSelectedId(location.id)}>
                <span className={location.name ? "cash-loc-name" : "cash-loc-name is-empty"}>{location.name || "New location"}</span>
                <span className="cash-loc-meta">
                  {shifts} {shifts === 1 ? "shift" : "shifts"}
                </span>
              </button>
            );
          })}
          <Button variant="secondary" onClick={addLocation}>
            <Icon name="plus" size={14} />
            New location
          </Button>
        </div>
        {selected ? (
          <LocationDetail
            key={selected.id}
            location={selected}
            focusName={focusName}
            onFocused={() => setFocusName(false)}
            onChange={(change) => update(selected.id, change)}
          />
        ) : null}
      </div>
      <footer className="cash-foot">
        <p className="cash-note">Changes apply to new counts only.</p>
        <div className="cash-foot-actions">
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={() => onSave(draft)}>Save</Button>
        </div>
      </footer>
    </div>
  );
}

function LocationDetail({
  location,
  focusName,
  onFocused,
  onChange,
}: {
  location: CashLocation;
  focusName: boolean;
  onFocused: () => void;
  onChange: (change: (location: CashLocation) => CashLocation) => void;
}) {
  const nameRef = useRef<HTMLInputElement>(null);
  const [expectedText, setExpectedText] = useState(location.expected.toFixed(2));
  const [shiftDraft, setShiftDraft] = useState<string | null>(null);
  const [lineDraft, setLineDraft] = useState<string | null>(null);
  const skipShift = useRef(false);
  const skipLine = useRef(false);
  const shiftsOn = location.shifts.filter((shift) => shift.on).length;
  const linesOn = includedLineCount(location);
  const menu = useMenu();

  useEffect(() => {
    if (!focusName) return;
    nameRef.current?.focus();
    onFocused();
  }, [focusName, onFocused]);

  function commitShift() {
    const name = shiftDraft?.trim() ?? "";
    setShiftDraft(null);
    if (!name) return;
    if (location.shifts.some((shift) => shift.name.toLowerCase() === name.toLowerCase())) return;
    onChange((current) => ({ ...current, shifts: [...current.shifts, { id: `shift-${Date.now()}`, name, on: true }] }));
  }

  function commitLine() {
    const name = lineDraft?.trim() ?? "";
    setLineDraft(null);
    if (!name) return;
    if (location.lines.some((line) => line.label.toLowerCase() === name.toLowerCase())) return;
    const added: CashLine = {
      id: `line-${Date.now()}`,
      label: name,
      group: "other",
      kind: "amount",
      unit: 1,
      on: true,
    };
    onChange((current) => ({ ...current, lines: [...current.lines, added] }));
  }

  return (
    <div className="cash-manage-detail">
      <div className="cash-loc-head">
        <div>
          <h2 className={location.name ? "cash-loc-title" : "cash-loc-title is-empty"}>{location.name || "New location"}</h2>
          <p className="cash-sub">
            {shiftsOn} {shiftsOn === 1 ? "shift" : "shifts"} · {linesOn} {linesOn === 1 ? "line" : "lines"} · {formatMoney(location.expected)} expected bank
          </p>
        </div>
        <Button variant="secondary" aria-pressed={location.archived} onClick={() => onChange((current) => ({ ...current, archived: !current.archived }))}>
          Archive
        </Button>
      </div>
      <div className="cash-fields">
        <label className="sds field">
          <span>Name</span>
          <input
            ref={nameRef}
            aria-label="Name"
            value={location.name}
            placeholder="Name"
            onChange={(event) => onChange((current) => ({ ...current, name: event.target.value }))}
          />
        </label>
        <div className="cash-meta-item">
          <span className="sheet-label">Department</span>
          <span className="drop">
            <button ref={menu.anchorRef} className="cash-select" type="button" aria-haspopup="menu" aria-expanded={menu.open} onClick={() => menu.setOpen((open) => !open)}>
              {location.department}
              <Icon name="chevron" size={14} />
            </button>
            <OverlayMenu open={menu.open} anchorRef={menu.anchorRef} marker={menu.marker} label="Department">
              {DEPARTMENTS.map((item) => (
                <button
                  key={item.value}
                  className="menu-item"
                  type="button"
                  role="menuitemradio"
                  aria-checked={location.department === item.value}
                  onClick={() => {
                    onChange((current) => ({ ...current, department: item.value as DepartmentName }));
                    menu.setOpen(false);
                  }}
                >
                  <span className="dept" data-dept={item.dept}>
                    {item.value}
                  </span>
                  <Icon name="check" className="check" />
                </button>
              ))}
            </OverlayMenu>
          </span>
        </div>
        <label className="sds field">
          <span>Expected bank</span>
          <input
            aria-label="Expected bank"
            inputMode="decimal"
            value={expectedText}
            onChange={(event) => {
              const next = event.target.value.replace(/[^0-9.]/g, "");
              setExpectedText(next);
              const amount = Number(next);
              if (next.trim() && !Number.isNaN(amount)) onChange((current) => ({ ...current, expected: amount }));
              if (!next.trim()) onChange((current) => ({ ...current, expected: 0 }));
            }}
            onBlur={() => setExpectedText(location.expected.toFixed(2))}
          />
        </label>
      </div>
      <div className="cash-blocks">
        <section className="cash-block">
          <div className="cash-block-head">
            <h2>Shifts counted here</h2>
            <span className="sheet-label">
              {shiftsOn} of {location.shifts.length} on
            </span>
          </div>
          <div className="cash-check-grid">
            {location.shifts.map((shift) => (
              <Check
                key={shift.id}
                label={shift.name}
                checked={shift.on}
                onChange={() => onChange((current) => ({ ...current, shifts: current.shifts.map((item) => (item.id === shift.id ? { ...item, on: !item.on } : item)) }))}
              />
            ))}
          </div>
          {shiftDraft === null ? (
            <Button variant="secondary" onClick={() => setShiftDraft("")}>
              <Icon name="plus" size={14} />
              Add shift
            </Button>
          ) : (
            <input
              className="cash-qty cash-inline"
              autoFocus
              aria-label="Shift"
              placeholder="Shift"
              value={shiftDraft}
              onChange={(event) => setShiftDraft(event.target.value)}
              onBlur={() => {
                if (skipShift.current) {
                  skipShift.current = false;
                  return;
                }
                commitShift();
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") event.currentTarget.blur();
                if (event.key === "Escape") {
                  skipShift.current = true;
                  setShiftDraft(null);
                }
              }}
            />
          )}
        </section>
        <section className="cash-block">
          <div className="cash-block-head">
            <h2>Lines included in the count</h2>
            <span className="sheet-label">
              {linesOn} of {location.lines.length} on
            </span>
          </div>
          <div className="cash-check-grid">
            {GROUPS.map((group) => (
              <div key={group.id} className="cash-check-col">
                <span className="sheet-label">{group.label}</span>
                {location.lines
                  .filter((line) => line.group === group.id)
                  .map((line) => (
                    <Check
                      key={line.id}
                      label={line.label}
                      checked={line.on}
                      onChange={() =>
                        onChange((current) => ({
                          ...current,
                          lines: current.lines.map((item) => (item.id === line.id ? { ...item, on: !item.on } : item)),
                        }))
                      }
                    />
                  ))}
                {group.id === "other" ? (
                  lineDraft === null ? (
                    <Button variant="secondary" onClick={() => setLineDraft("")}>
                      <Icon name="plus" size={14} />
                      Add custom line
                    </Button>
                  ) : (
                    <input
                      className="cash-qty cash-inline"
                      autoFocus
                      aria-label="Custom line"
                      placeholder="Line"
                      value={lineDraft}
                      onChange={(event) => setLineDraft(event.target.value)}
                      onBlur={() => {
                        if (skipLine.current) {
                          skipLine.current = false;
                          return;
                        }
                        commitLine();
                      }}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") event.currentTarget.blur();
                        if (event.key === "Escape") {
                          skipLine.current = true;
                          setLineDraft(null);
                        }
                      }}
                    />
                  )
                ) : null}
              </div>
            ))}
          </div>
          <p className="cash-note">Unchecked lines are hidden from this location&apos;s counting flow. Deposit/drop and bank till always show.</p>
        </section>
      </div>
    </div>
  );
}

function Check({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <button className="cash-check" type="button" role="checkbox" aria-checked={checked} onClick={onChange}>
      <span className="cash-tick" aria-hidden="true">
        {checked ? <Icon name="check" size={12} /> : null}
      </span>
      {label}
    </button>
  );
}
