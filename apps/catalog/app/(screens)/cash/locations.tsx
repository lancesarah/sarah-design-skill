"use client";

import { Button, Checkbox, ConfirmDialog, DEPARTMENTS, DepartmentChip, Icon, OverlayMenu, captureClose, playEnter } from "@lance-live/gallery-ui";
import { forwardRef, useEffect, useId, useLayoutEffect, useRef, useState, type ButtonHTMLAttributes } from "react";
import { flushSync } from "react-dom";
import { InsetCard } from "../inset-card";
import { PageLayout } from "../page-layout";
import { createLocation, formatMoney, type CashLine, type CashLocation, type DepartmentName, type LineGroup } from "./model";
import { useMenu } from "./use-menu";

const LINE_GROUPS: Array<{ id: LineGroup; label: string }> = [
  { id: "coins", label: "Coins" },
  { id: "bills", label: "Bills" },
  { id: "other", label: "Other" },
];

const SHIFT_COLUMNS: Array<{ label: string; test: (name: string) => boolean }> = [
  { label: "AM shifts", test: (name) => name.startsWith("AM ") },
  { label: "PM shifts", test: (name) => name.startsWith("PM ") },
  { label: "Night audit shifts", test: (name) => name.startsWith("NA ") },
];

function shiftFace(name: string) {
  return name.replace(/ In$/, " in").replace(/ Out$/, " out");
}

function tally(count: number, one: string, many: string) {
  return `${count} ${count === 1 ? one : many}`;
}

export function LocationsEditor({
  locations,
  onBack,
  onChange,
}: {
  locations: CashLocation[];
  onBack: () => void;
  onChange: (locations: CashLocation[]) => void;
}) {
  const [draft, setDraft] = useState(locations);
  const [baseline] = useState(locations);
  const dirty = JSON.stringify(draft) !== JSON.stringify(baseline);
  const [focusId, setFocusId] = useState<string | null>(null);
  const [enterId, setEnterId] = useState<string | null>(null);
  const entered = useRef<string | null>(null);
  const scroller = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!enterId || entered.current === enterId) return;
    const node = scroller.current?.querySelector(`[data-location="${CSS.escape(enterId)}"]`);
    if (!(node instanceof HTMLElement)) return;
    entered.current = enterId;
    playEnter(node);
  }, [enterId, draft]);

  useEffect(() => {
    onChange(draft);
  }, [draft, onChange]);

  function update(id: string, change: (location: CashLocation) => CashLocation) {
    setDraft((current) => current.map((location) => (location.id === id ? change(location) : location)));
  }

  function removeLocation(id: string) {
    const play = captureClose(document.querySelector(`[data-location="${CSS.escape(id)}"]`));
    flushSync(() => {
      setDraft((current) => current.filter((location) => location.id !== id));
    });
    play();
  }

  function addLocation() {
    const id = `location-${Date.now()}`;
    setDraft((current) => [createLocation(id), ...current]);
    setFocusId(id);
    setEnterId(id);
    scroller.current?.scrollTo({ top: 0 });
  }

  return (
    <PageLayout
      className="sheet-page cash-page cash-locations"
      bodyClassName="cash-shift-body"
      icon="card"
      title={
        <>
          <button type="button" className="cash-back" onClick={onBack}>
            Cash & bank
          </button>
          <span className="cash-crumb-sep" aria-hidden="true">
            /
          </span>
          Manage locations
        </>
      }
      actions={
        <>
          {dirty ? <p className="cash-save-note">Changes apply to new counts only.</p> : null}
          <Button variant="secondary" onClick={onBack}>
            {dirty ? null : <Icon name="chevron" size={14} className="cash-back-icon" />}
            {dirty ? "Save" : "Back"}
          </Button>
          <Button onClick={addLocation}>
            <Icon name="plus" size={14} />
            New location
          </Button>
        </>
      }
    >
      <div className="cash-screen">
        <div className="cash-manage" ref={scroller}>
          {draft.map((location) => (
            <LocationCard
              key={location.id}
              location={location}
              focusName={location.id === focusId}
              onFocused={() => setFocusId(null)}
              onChange={(change) => update(location.id, change)}
              onRemove={() => removeLocation(location.id)}
            />
          ))}
        </div>
      </div>
    </PageLayout>
  );
}

const ChooseDepartment = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement>>(function ChooseDepartment(
  props,
  ref,
) {
  return (
    <button ref={ref} className="cash-choose-dept" {...props} type="button">
      <span className="cash-choose-dot" aria-hidden="true" />
      Choose department
      <span className="cash-choose-chevron">
        <Icon name="chevron" size={10} />
      </span>
    </button>
  );
});

function LocationCard({
  location,
  focusName,
  onFocused,
  onChange,
  onRemove,
}: {
  location: CashLocation;
  focusName: boolean;
  onFocused: () => void;
  onChange: (change: (location: CashLocation) => CashLocation) => void;
  onRemove: () => void;
}) {
  const nameRef = useRef<HTMLInputElement>(null);
  const bodyId = useId();
  const department = useMenu();
  const more = useMenu();
  const [morePoint, setMorePoint] = useState<{ x: number; y: number } | null>(null);
  const [open, setOpen] = useState(true);
  const [confirm, setConfirm] = useState(false);
  const customShifts = location.shifts.filter((shift) => !SHIFT_COLUMNS.some((column) => column.test(shift.name)));

  useEffect(() => {
    if (!focusName) return;
    nameRef.current?.focus();
    onFocused();
  }, [focusName, onFocused]);

  return (
    <>
    <InsetCard
      className={location.archived ? "is-archived" : undefined}
      data-location={location.id}
      open={open}
      onOpenChange={setOpen}
      bodyId={bodyId}
      onContextMenu={(event) => {
        const target = event.target;
        if (!(target instanceof Element)) return;
        if (target.closest("input, textarea, .menu, .dept-slot, .confirm-dialog")) return;
        event.preventDefault();
        setMorePoint({ x: event.clientX, y: event.clientY });
        more.setOpen(true);
      }}
      title={
        <div className="cash-card-id">
          <div className="cash-card-name">
            <span className="cash-name-fit">
              <span>{location.name || "Name"}</span>
              <input
                ref={nameRef}
                aria-label="Name"
                placeholder="Name"
                value={location.name}
                onChange={(event) => onChange((current) => ({ ...current, name: event.target.value }))}
              />
            </span>
            <button type="button" aria-label="Rename" onClick={() => nameRef.current?.focus()}>
              <Icon name="edit" size={14} />
            </button>
          </div>
          <span className="dept-slot">
            {location.department ? (
              <DepartmentChip
                as="button"
                ref={department.anchorRef}
                className="dept-pick"
                name={location.department}
                type="button"
                aria-haspopup="menu"
                aria-expanded={department.open}
                onClick={() => department.setOpen((open) => !open)}
              />
            ) : (
              <ChooseDepartment
                ref={department.anchorRef}
                aria-haspopup="menu"
                aria-expanded={department.open}
                onClick={() => department.setOpen((open) => !open)}
              />
            )}
            <OverlayMenu open={department.open} anchorRef={department.anchorRef} marker={department.marker} label="Department">
              {DEPARTMENTS.map((item) => (
                <button
                  key={item.value}
                  className="menu-item"
                  type="button"
                  role="menuitemradio"
                  aria-checked={location.department === item.value}
                  onClick={() => {
                    onChange((current) => ({ ...current, department: item.value as DepartmentName }));
                    department.setOpen(false);
                  }}
                >
                  <DepartmentChip name={item.value} />
                  <Icon name="check" size={14} className="check" />
                </button>
              ))}
            </OverlayMenu>
          </span>
          <span
            className={location.expected === 0 ? "cash-card-bank is-quiet" : "cash-card-bank"}
            aria-hidden={open || undefined}
          >
            <span>{formatMoney(location.expected)}</span>
          </span>
          {location.archived ? <span className="cash-archived">Archived</span> : null}
        </div>
      }
      actions={
        <>
          <button
            ref={more.anchorRef}
            className="cash-more"
            type="button"
            aria-label="Location options"
            aria-haspopup="menu"
            aria-expanded={more.open}
            onClick={() => {
              setMorePoint(null);
              more.setOpen((next) => !next);
            }}
          >
            <Icon name="dots" size={14} />
          </button>
          <OverlayMenu open={more.open} anchorRef={more.anchorRef} marker={more.marker} label="Location options" align="end" point={morePoint}>
          <button
            className="menu-item danger"
            type="button"
            role="menuitem"
            onClick={() => {
              more.setOpen(false);
              setConfirm(true);
            }}
          >
            <Icon name="trash" size={18} />
            Delete
          </button>
          </OverlayMenu>
        </>
      }
    >
        <BankFigure
          value={location.expected}
          onChange={(expected) => onChange((current) => ({ ...current, expected }))}
        />
        <section className="cash-sec">
          <div className="cash-sec-head">
            <h2>Shifts counted</h2>
            <span>{tally(location.shifts.filter((shift) => shift.on).length, "shift", "shifts")}</span>
          </div>
          <div className="cash-grid">
            {SHIFT_COLUMNS.map((column) => (
              <OptionColumn
                key={column.label}
                label={column.label}
                items={location.shifts.filter((shift) => column.test(shift.name))}
                face={(shift) => shiftFace(shift.name)}
                onToggle={(shift) =>
                  onChange((current) => ({
                    ...current,
                    shifts: current.shifts.map((item) => (item.id === shift.id ? { ...item, on: !item.on } : item)),
                  }))
                }
              />
            ))}
            <AddColumn
              label="Add custom shift"
              placeholder="Shift"
              items={customShifts}
              face={(shift) => shift.name}
              onToggle={(shift) =>
                onChange((current) => ({
                  ...current,
                  shifts: current.shifts.map((item) => (item.id === shift.id ? { ...item, on: !item.on } : item)),
                }))
              }
              onAdd={(name) => {
                if (location.shifts.some((shift) => shift.name.toLowerCase() === name.toLowerCase())) return;
                onChange((current) => ({
                  ...current,
                  shifts: [...current.shifts, { id: `shift-${Date.now()}`, name, on: true }],
                }));
              }}
            />
          </div>
        </section>
        <section className="cash-sec">
          <div className="cash-sec-head">
            <h2>Lines included</h2>
            <span>{tally(location.lines.filter((line) => line.on).length, "line", "lines")}</span>
          </div>
          <div className="cash-grid">
            {LINE_GROUPS.map((group) => (
              <OptionColumn
                key={group.id}
                label={group.label}
                items={location.lines.filter((line) => line.group === group.id)}
                face={(line) => line.label}
                onToggle={(line) =>
                  onChange((current) => ({
                    ...current,
                    lines: current.lines.map((item) => (item.id === line.id ? { ...item, on: !item.on } : item)),
                  }))
                }
              />
            ))}
            <AddColumn<CashLine>
              label="Add custom line"
              placeholder="Line"
              items={[]}
              face={(line) => line.label}
              onToggle={() => undefined}
              onAdd={(name) => {
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
              }}
            />
          </div>
        </section>
    </InsetCard>
      <ConfirmDialog
        open={confirm}
        name={location.name.trim() || "New location"}
        noun="location"
        onCancel={() => setConfirm(false)}
        onConfirm={() => {
          setConfirm(false);
          onRemove();
        }}
      />
    </>
  );
}

function BankFigure({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  const [text, setText] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const shown = text ?? value.toFixed(2);
  return (
    <div className="cash-bank-figure">
      <span>Expected bank</span>
      <label>
        <span className="cash-bank-sign">$</span>
        <span className="cash-bank-fit">
          <span>{shown || "0.00"}</span>
          <input
            ref={inputRef}
            aria-label="Expected bank"
            inputMode="decimal"
            className={text === null && value === 0 ? "is-quiet" : undefined}
            value={shown}
            onFocus={() => setText(value ? value.toFixed(2) : "")}
            onChange={(event) => {
              const next = event.target.value.replace(/[^0-9.]/g, "");
              setText(next);
              if (!next.trim()) {
                onChange(0);
                return;
              }
              const amount = Number(next);
              if (!Number.isNaN(amount)) onChange(amount);
            }}
            onBlur={() => setText(null)}
          />
        </span>
        <button type="button" className="cash-bank-edit" aria-label="Edit expected bank" onClick={() => inputRef.current?.focus()}>
          <Icon name="edit" size={26} />
        </button>
      </label>
    </div>
  );
}

function OptionColumn<T extends { id: string; on: boolean }>({
  label,
  items,
  face,
  onToggle,
}: {
  label: string;
  items: T[];
  face: (item: T) => string;
  onToggle: (item: T) => void;
}) {
  return (
    <div className="cash-col">
      <span className="cash-col-k">{label}</span>
      <div className="cash-col-list">
        {items.map((item) => (
          <Checkbox key={item.id} checked={item.on} onCheckedChange={() => onToggle(item)}>
            {face(item)}
          </Checkbox>
        ))}
      </div>
    </div>
  );
}

function AddColumn<T extends { id: string; on: boolean }>({
  label,
  placeholder,
  items,
  face,
  onToggle,
  onAdd,
}: {
  label: string;
  placeholder: string;
  items: T[];
  face: (item: T) => string;
  onToggle: (item: T) => void;
  onAdd: (name: string) => void;
}) {
  const [draft, setDraft] = useState<string | null>(null);
  const skip = useRef(false);

  function commit() {
    const name = draft?.trim() ?? "";
    setDraft(null);
    if (name) onAdd(name);
  }

  return (
    <div className="cash-col cash-col-add">
      <span className="cash-col-k" />
      {draft === null ? (
        <Button variant="secondary" onClick={() => setDraft("")}>
          <Icon name="plus" size={14} />
          {label}
        </Button>
      ) : (
        <input
          className="cash-add-input"
          autoFocus
          aria-label={placeholder}
          placeholder={placeholder}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={() => {
            if (skip.current) {
              skip.current = false;
              return;
            }
            commit();
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") event.currentTarget.blur();
            if (event.key === "Escape") {
              skip.current = true;
              setDraft(null);
            }
          }}
        />
      )}
      {items.length ? (
        <div className="cash-col-list">
          {items.map((item) => (
            <Checkbox key={item.id} checked={item.on} onCheckedChange={() => onToggle(item)}>
              {face(item)}
            </Checkbox>
          ))}
        </div>
      ) : null}
    </div>
  );
}

