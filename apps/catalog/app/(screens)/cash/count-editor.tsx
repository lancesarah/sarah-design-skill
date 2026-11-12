"use client";

import { Button, ConfirmDialog, EditorDialog, EditorField, EditorPill, EditorPills, PlacePill, RequiredToast, SegmentedControl, taskMenuItem } from "@lance-live/gallery-ui";
import { useCallback, useMemo, useState } from "react";
import {
  LINE_GROUPS,
  countLines,
  defaultLines,
  dollarsFromInput,
  enabledShifts,
  formatMoney,
  inputFromDollars,
  shiftFace,
  sortShifts,
  varianceLabel,
  type CashCount,
  type CashLocation,
  type PostedCount,
} from "./model";

type Mode = "count" | "amount";
type CountPick = "location" | "shift";

const MODES: Array<{ value: Mode; label: string }> = [
  { value: "count", label: "Count" },
  { value: "amount", label: "Amount" },
];

function firstShift(options: string[], current = "") {
  return options.includes(current) ? current : options.includes("PM In") ? "PM In" : (options[0] ?? "");
}

/** A count in the pill editor. With `initial` it edits that count, and its location stays put. */
export function CountEditor({
  locations,
  initial,
  onClose,
  onPost,
  onDelete,
}: {
  locations: CashLocation[];
  initial?: CashCount;
  onClose: () => void;
  onPost: (count: PostedCount) => void;
  onDelete?: () => void;
}) {
  const active = locations.filter((location) => !location.archived || location.id === initial?.locationId);
  const only = active.length === 1 ? active[0] : undefined;
  const [locationId, setLocationId] = useState(initial?.locationId ?? only?.id ?? "");
  const location = active.find((item) => item.id === locationId);
  const shifts = useMemo(() => {
    if (!location) return [];
    const names = enabledShifts(location);
    if (initial?.locationId === location.id && initial.shift && !names.includes(initial.shift)) names.push(initial.shift);
    return sortShifts(names);
  }, [initial, location]);
  const [shift, setShift] = useState(() => (initial?.shift && shifts.includes(initial.shift) ? initial.shift : firstShift(shifts)));
  const [mode, setMode] = useState<Mode>("count");
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [values, setValues] = useState<Record<string, string>>(() => {
    if (!initial?.entry || !location) return {};
    const next: Record<string, string> = {};
    for (const line of countLines(location)) {
      const dollars = initial.entry[line.id];
      if (dollars) next[line.id] = inputFromDollars(line, dollars, "count");
    }
    return next;
  });
  const [confirm, setConfirm] = useState(false);
  const [menu, setMenu] = useState<CountPick | null>(null);
  const [tried, setTried] = useState(false);
  const [toast, setToast] = useState(0);
  const hideToast = useCallback(() => setToast(0), []);
  const lines = useMemo(() => (location ? countLines(location) : defaultLines().filter((line) => line.on || line.always)), [location]);
  const toggle = (next: CountPick) => setMenu((current) => (current === next ? null : next));

  function chooseLocation(nextId: string) {
    const next = active.find((item) => item.id === nextId);
    setLocationId(nextId);
    if (!next) return;
    setShift((current) => firstShift(enabledShifts(next), current));
    setValues((current) => {
      const kept: Record<string, string> = {};
      for (const line of countLines(next)) {
        if (current[line.id]) kept[line.id] = current[line.id];
      }
      return kept;
    });
  }

  function chooseMode(next: Mode) {
    if (next !== mode) {
      setValues((current) => {
        const converted: Record<string, string> = {};
        for (const line of lines) {
          const dollars = dollarsFromInput(line, current[line.id] ?? "", mode);
          if (dollars) converted[line.id] = inputFromDollars(line, dollars, next);
        }
        return converted;
      });
    }
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
  const typed = Object.values(entry).reduce((sum, value) => sum + value, 0);
  const started = Object.keys(entry).length > 0;
  const total = initial && !initial.entry && !started ? initial.total : typed;
  const expected = initial && initial.locationId === location?.id ? initial.expected : (location?.expected ?? 0);
  const shown = started || Boolean(initial);
  const delta = total - expected;
  const tone = delta === 0 ? "is-even" : delta > 0 ? "is-over" : "is-short";
  const missing = { location: !location, shift: !shift };

  const place = location ? location.name || "New location" : "Location";

  return (
    <>
      <EditorDialog
        kicker={initial ? "Edit count" : "New count"}
        layout="pills"
        className="pm-page todo-editor cash-count-editor"
        overline={
          location ? (
            <>
              Expected {formatMoney(expected)}
              {shown ? <span className={`cash-var ${tone}`}> · {varianceLabel(delta)}</span> : null}
            </>
          ) : undefined
        }
        title={formatMoney(total)}
        subtitle={notes}
        subtitleLabel="Notes"
        subtitlePlaceholder="Add notes"
        onSubtitleChange={setNotes}
        deleteLabel="Delete count"
        onDelete={initial && onDelete ? () => setConfirm(true) : undefined}
        onClose={onClose}
        onEscape={() => {
          if (confirm) return true;
          if (!menu) return false;
          setMenu(null);
          return true;
        }}
        footer={
          <Button
            onClick={() => {
              if (!location || !shift) {
                setMenu(null);
                setTried(true);
                setToast(Date.now());
                return;
              }
              onPost({ locationId: location.id, shift, notes: notes.trim(), entry, total: typed, expected });
            }}
          >
            {initial ? "Save count" : "Post count"}
          </Button>
        }
      >
        <EditorPills>
          {active.length > 1 && !initial ? (
            <EditorPill
              icon="location"
              open={menu === "location"}
              onToggle={() => toggle("location")}
              value={place}
              quiet={!location}
              invalid={tried && missing.location}
              menu={active.map((option) =>
                taskMenuItem(option.id, option.id === locationId, () => {
                  chooseLocation(option.id);
                  setMenu(null);
                }, option.name || "New location"),
              )}
            />
          ) : (
            <PlacePill>{place}</PlacePill>
          )}
          <EditorPill
            icon="clock"
            open={menu === "shift"}
            onToggle={() => {
              if (shifts.length) toggle("shift");
            }}
            value={shift ? shiftFace(shift) : "Shift"}
            quiet={!shift}
            invalid={tried && missing.shift}
            menu={shifts.map((option) =>
              taskMenuItem(option, option === shift, () => {
                setShift(option);
                setMenu(null);
              }, shiftFace(option)),
            )}
          />
          <SegmentedControl
            className="cash-count-mode"
            aria-label="Entry mode"
            value={mode}
            onValueChange={(next) => (next === "count" || next === "amount") && chooseMode(next)}
            options={MODES}
          />
        </EditorPills>
        <div className="cash-editor-lines">
          {LINE_GROUPS.map((group) => (
            <div className="cash-editor-col" key={group.id} role="group" aria-label={group.label}>
              {lines
                .filter((line) => line.group === group.id)
                .map((line) => {
                  const piece = mode === "count" && line.kind === "count";
                  return (
                    <EditorField
                      key={line.id}
                      label={line.countLabel ?? line.label}
                      placeholder={piece ? "0" : "0.00"}
                      inputMode="decimal"
                      value={values[line.id] ?? ""}
                      onChange={(value) => setValues((current) => ({ ...current, [line.id]: value.replace(/[^0-9.]/g, "") }))}
                    />
                  );
                })}
            </div>
          ))}
        </div>
      </EditorDialog>
      {toast ? <RequiredToast id={toast} onDone={hideToast} /> : null}
      {onDelete ? (
        <ConfirmDialog
          open={confirm}
          name={shiftFace(initial?.shift ?? "") || "Count"}
          noun="count"
          onCancel={() => setConfirm(false)}
          onConfirm={() => {
            setConfirm(false);
            onDelete();
          }}
        />
      ) : null}
    </>
  );
}
