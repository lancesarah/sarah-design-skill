"use client";

import { Button, EditorDialog, EditorField, EditorFields, EditorPill, EditorPills, PlacePill, RequiredToast, taskMenuItem } from "@lance-live/gallery-ui";
import { useCallback, useMemo, useState } from "react";
import type { Measure, Source } from "./page";

type Entry = { measureId: string; value: number };

const DAYS_BACK = 7;
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function dayLabel(offset: number, date: Date) {
  if (offset === 0) return "Today";
  if (offset === 1) return "Yesterday";
  return `${MONTHS[date.getMonth()]} ${date.getDate()}`;
}

function rangeHint(measure: Measure) {
  if (measure.min != null && measure.max != null) return `${measure.min}–${measure.max} ${measure.unit}`;
  if (measure.max != null) return `Up to ${measure.max.toLocaleString("en-US")} ${measure.unit}`;
  if (measure.min != null) return `${measure.min} ${measure.unit} or more`;
  return measure.unit;
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

/** Records one reading for a source in the pill editor. */
export function RecordEditor({
  source,
  onClose,
  onSubmit,
}: {
  source: Source;
  onClose: () => void;
  onSubmit: (value: string, when: Date, alerts: string[], entries: Entry[], notes: string) => void;
}) {
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [offset, setOffset] = useState(0);
  const [notes, setNotes] = useState("");
  const [menu, setMenu] = useState(false);
  const [toast, setToast] = useState(0);
  const hideToast = useCallback(() => setToast(0), []);
  const days = useMemo(() => {
    const now = new Date();
    return Array.from({ length: DAYS_BACK }, (_, index) => {
      const date = new Date(now);
      date.setDate(now.getDate() - index);
      return { offset: index, date, label: dayLabel(index, date) };
    });
  }, []);
  const day = days[offset];

  const filled = source.measures.flatMap((measure) => {
    const raw = (draft[measure.id] ?? "").trim();
    if (!raw) return [];
    const shown = `${shownReading(raw)} ${measure.unit}`;
    const numeric = Number(raw.replace(/,/g, ""));
    return [{
      measure,
      shown,
      value: Number.isFinite(numeric) ? numeric : null,
      alert: outsideRange(measure, raw) ? `${measure.name} ${shown}` : null,
    }];
  });
  const missingRequired = source.measures.some((measure) => measure.required && !(draft[measure.id] ?? "").trim());
  const alerts = filled.flatMap((item) => (item.alert ? [item.alert] : []));

  function save() {
    if (filled.length === 0 || missingRequired) {
      setMenu(false);
      setToast(Date.now());
      return;
    }
    onSubmit(
      filled.map((item) => item.shown).join(", "),
      day.date,
      alerts,
      filled.flatMap((item) => (item.value == null ? [] : [{ measureId: item.measure.id, value: item.value }])),
      notes.trim(),
    );
  }

  return (
    <>
      <EditorDialog
        kicker="Record reading"
        layout="pills"
        className="pm-page todo-editor readings-record-editor"
        overline={alerts.length > 0 ? <span className="readings-record-alert">Out of range · {alerts.join(", ")}</span> : source.lastAt ? `Last recorded ${source.lastAt}` : "Not recorded yet"}
        title={source.name}
        subtitle={notes}
        subtitleLabel="Notes"
        subtitlePlaceholder="Add notes"
        onSubtitleChange={setNotes}
        onClose={onClose}
        onEscape={() => {
          if (!menu) return false;
          setMenu(false);
          return true;
        }}
        footer={<Button onClick={save}>Record reading</Button>}
      >
        <EditorPills>
          <PlacePill>{source.place || source.name}</PlacePill>
          <EditorPill
            icon="calendar"
            open={menu}
            onToggle={() => setMenu((current) => !current)}
            value={day.label}
            menu={days.map((option) =>
              taskMenuItem(String(option.offset), option.offset === offset, () => {
                setOffset(option.offset);
                setMenu(false);
              }, option.label),
            )}
          />
        </EditorPills>
        <EditorFields>
          {source.measures.map((measure) => (
            <EditorField
              key={measure.id}
              label={measure.name}
              placeholder={rangeHint(measure)}
              inputMode="decimal"
              value={draft[measure.id] ?? ""}
              onChange={(value) => setDraft((current) => ({ ...current, [measure.id]: value.replace(/[^0-9.,-]/g, "") }))}
            />
          ))}
        </EditorFields>
      </EditorDialog>
      {toast ? <RequiredToast id={toast} onDone={hideToast} message={missingRequired ? undefined : "Please enter at least one reading."} /> : null}
    </>
  );
}
