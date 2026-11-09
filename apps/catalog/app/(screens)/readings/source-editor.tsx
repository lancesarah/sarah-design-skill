"use client";

import {
  Button,
  ConfirmDialog,
  DataTable,
  Icon,
  OverlayMenu,
  Tabs,
  ThemeSwitch,
  TITLE_TEXT_INSET,
  taskMenuItem,
  type DataColumn,
} from "@lance-live/gallery-ui";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FilterMenu, SearchBox } from "../chrome";
import { Glyph } from "../glyph";
import type { Measure, Source } from "./page";

const KINDS = ["Boiler", "Utility Meter", "Pool"];
const DEADLINES = ["6:00 AM", "9:00 AM", "12:00 PM", "3:00 PM", "5:00 PM", "8:00 PM", "11:00 PM"];
const DUE_TIMES = ["12 AM", "6 AM", "9 AM", "12 PM", "3 PM", "5 PM", "8 PM", "10 PM", "11 PM"];
const DUE_DEFAULTS = ["12 PM", "10 PM", "6 AM", "3 PM", "8 PM", "11 PM"];

function dueList(source: Source) {
  return Array.from({ length: source.perDay }, (_, index) => source.dueBy?.[index] ?? DUE_DEFAULTS[index % DUE_DEFAULTS.length]);
}

function withPerDay(source: Source, perDay: number): Source {
  const next = Math.max(1, perDay);
  if (next === 1) return { ...source, perDay: next };
  const dueBy = [...(source.dueBy ?? [])];
  while (dueBy.length < next) dueBy.push(DUE_DEFAULTS[dueBy.length % DUE_DEFAULTS.length]);
  return { ...source, perDay: next, dueBy };
}

function dueMenuId(index: number) {
  return `due:${index}`;
}

function parseDue(menu: string | null) {
  if (!menu?.startsWith("due:")) return null;
  const index = Number(menu.slice(4));
  return Number.isInteger(index) ? index : null;
}

function boundText(value: number | undefined) {
  return value == null ? "" : String(value);
}

function boundValue(text: string) {
  const trimmed = text.trim();
  if (!trimmed || trimmed === "—") return undefined;
  const next = Number(trimmed);
  return Number.isFinite(next) ? next : undefined;
}

function MeasureName({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useLayoutEffect(() => {
    const node = ref.current;
    if (!node) return;
    node.style.height = "auto";
    node.style.height = `${Math.max(32, node.scrollHeight)}px`;
  }, [value]);
  return (
    <textarea
      ref={ref}
      className="pm-editor-line"
      rows={1}
      aria-label="Measurement"
      placeholder="Measurement"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      onKeyDown={(event) => {
        if (event.key === "Enter") event.preventDefault();
      }}
    />
  );
}

function sourceColumns(
  patch: (id: string, update: (source: Source) => Source) => void,
): Array<DataColumn<Source>> {
  return [
    {
      id: "name",
      title: "Name",
      text: "primary",
      flex: true,
      lines: 1,
      minWidth: 200,
      labelInset: TITLE_TEXT_INSET,
      render: (source) => (
        <span className={source.name.trim() ? "pm-template-name" : "pm-template-name is-empty"}>
          {source.name.trim() || "Source"}
        </span>
      ),
    },
    {
      id: "type",
      title: "Type",
      minWidth: 156,
      render: (source) => <span className="pm-template-meta">{source.kind}</span>,
    },
    {
      id: "measurements",
      title: "Measurements",
      render: (source) => <span className="readings-count">{source.measures.length}</span>,
    },
    {
      id: "required",
      title: "Required",
      render: (source) => <span className="readings-count">{source.measures.filter((measure) => measure.required).length}</span>,
    },
    {
      id: "active",
      title: "Active",
      minWidth: 72,
      render: (source) => (
        <ThemeSwitch
          pressed={source.active}
          label="Active"
          onPressedChange={(next) => patch(source.id, (item) => ({ ...item, active: next }))}
        />
      ),
    },
  ];
}

function SourceDialog({
  source,
  patch,
  patchMeasure,
  onClose,
  onDelete,
}: {
  source: Source;
  patch: (id: string, update: (source: Source) => Source) => void;
  patchMeasure: (sourceId: string, measureId: string, update: (measure: Measure) => Measure) => void;
  onClose: () => void;
  onDelete: () => void;
}) {
  const [tab, setTab] = useState("details");
  const [menu, setMenu] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [pending, setPending] = useState<{ noun: string; name: string; run: () => void } | null>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  const kindRef = useRef<HTMLButtonElement>(null);
  const dueRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  const name = source.name.trim() || "Source";
  const cadence = source.perDay === 1 ? "Once a day" : `${source.perDay} a day`;

  useEffect(() => {
    const field = titleRef.current;
    if (field && !field.value.trim()) field.focus();
  }, [source.id]);

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(event: KeyboardEvent) {
      if (event.key !== "Escape" || pending) return;
      if (menu) {
        setMenu(null);
        return;
      }
      closeRef.current();
    }
    function onPointerDown(event: Event) {
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (target.closest(".menu, .pm-editor-pick, .readings-due-drop")) return;
      setMenu(null);
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [menu, pending]);

  return createPortal(
    <div className="pm-editor-dialog" role="dialog" aria-modal="true" aria-label="Edit source">
      <button type="button" className="pm-editor-scrim" aria-label="Close" onClick={() => closeRef.current()} />
      <div className="pm-editor-pop pm-page readings-editor">
        <div className="pm-editor-page">
          <header className="pm-check-name pm-editor-head">
            <div className="pm-editor-kicker">
              <p>Edit source</p>
              <div className="pm-editor-kicker-actions">
                <Button variant="danger-light" className="pm-editor-delete" onClick={() => setPending({ noun: "source", name, run: onDelete })}>
                  <Icon name="trash" size={14} />
                  Delete source
                </Button>
                <button type="button" className="pm-editor-close" aria-label="Close" onClick={() => closeRef.current()}>
                  <Icon name="close" size={14} />
                </button>
              </div>
            </div>
            <div className="pm-editor-name">
              <input
                ref={titleRef}
                className="pm-editor-title"
                aria-label="Name"
                value={source.name}
                placeholder="Source name"
                onChange={(event) => patch(source.id, (item) => ({ ...item, name: event.target.value }))}
              />
              <p>{source.kind} · {cadence}</p>
            </div>
          </header>
          <div className="pm-editor">
            <Tabs
              label="Source"
              value={tab}
              onValueChange={setTab}
              items={[
                { value: "details", label: "Details" },
                { value: "measurements", label: "Measurements", count: source.measures.length },
              ]}
            />
            {tab === "details" ? (
              <div className="pm-editor-stack">
                <label className="pm-editor-field">
                  <span className="sheet-label">Name</span>
                  <input
                    className="pm-editor-input"
                    aria-label="Name"
                    value={source.name}
                    placeholder="Source name"
                    onChange={(event) => patch(source.id, (item) => ({ ...item, name: event.target.value }))}
                  />
                </label>
                <div className="pm-editor-pair">
                  <div className="pm-editor-field">
                    <span className="sheet-label">Type</span>
                    <button
                      ref={kindRef}
                      type="button"
                      className="pm-editor-input pm-editor-pick"
                      aria-haspopup="menu"
                      aria-expanded={menu === "kind"}
                      onClick={() => setMenu((current) => (current === "kind" ? null : "kind"))}
                    >
                      <span className="pm-editor-pick-value">
                        <Icon name="home" size={14} />
                        <span>{source.kind}</span>
                      </span>
                      <Icon name="chevron" size={14} />
                    </button>
                    <OverlayMenu open={menu === "kind"} anchorRef={kindRef} label="Type" onPointerDown={(event) => event.stopPropagation()}>
                      {KINDS.map((kind) => taskMenuItem(kind, kind === source.kind, () => {
                        patch(source.id, (item) => ({ ...item, kind }));
                        setMenu(null);
                      }, kind))}
                    </OverlayMenu>
                  </div>
                  <div className="pm-editor-field">
                    <span className="sheet-label">Readings per day</span>
                    <div className="readings-step">
                      <Button
                        variant="secondary"
                        icon
                        aria-label="Fewer readings"
                        disabled={source.perDay <= 1}
                        onClick={() => patch(source.id, (item) => withPerDay(item, item.perDay - 1))}
                      >
                        <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
                          <path d="M2.5 7h9" fill="none" stroke="currentColor" strokeWidth="var(--icon-stroke)" />
                        </svg>
                      </Button>
                      <b>{source.perDay}</b>
                      <Button
                        variant="secondary"
                        icon
                        aria-label="More readings"
                        onClick={() => patch(source.id, (item) => withPerDay(item, item.perDay + 1))}
                      >
                        <Icon name="plus" size={14} />
                      </Button>
                    </div>
                  </div>
                </div>
                {source.perDay > 1 ? (
                  <div className="pm-editor-field">
                    <span className="sheet-label">Due by</span>
                    <div className="readings-due">
                      {dueList(source).map((time, index) => {
                        const id = dueMenuId(index);
                        return (
                          <div key={id} className="readings-due-item">
                            <span>Reading {index + 1}</span>
                            <Button
                              variant="secondary"
                              className="readings-deadline-drop readings-due-drop"
                              aria-label={`Reading ${index + 1} due by`}
                              aria-haspopup="menu"
                              aria-expanded={menu === id}
                              onClick={(event) => {
                                dueRef.current = event.currentTarget;
                                setMenu((current) => (current === id ? null : id));
                              }}
                            >
                              <span>{time}</span>
                              <Icon name="chevron" size={14} />
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                    <OverlayMenu open={parseDue(menu) != null} anchorRef={dueRef} label="Due by" onPointerDown={(event) => event.stopPropagation()}>
                      {DUE_TIMES.map((time) => {
                        const index = parseDue(menu);
                        const selected = index != null && dueList(source)[index] === time;
                        return (
                          <button
                            key={time}
                            type="button"
                            className="menu-item"
                            role="menuitemradio"
                            aria-checked={selected}
                            onClick={() => {
                              if (index == null) return;
                              const next = dueList(source);
                              next[index] = time;
                              patch(source.id, (item) => ({ ...item, dueBy: next }));
                              setMenu(null);
                            }}
                          >
                            {time}
                            <Icon name="check" size={14} className="check" />
                          </button>
                        );
                      })}
                    </OverlayMenu>
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="pm-editor-stack">
                <section className="pm-editor-block" aria-label="Measurements">
                  <DataTable
                    rows={source.measures}
                    empty="No measurements. Add one for this source."
                    interactive
                    columns={[{
                      id: "measurement",
                      title: "Measurement",
                      text: "primary",
                      flex: true,
                      lines: 2,
                      render: (measure) => (
                        <div className="pm-editor-row-body">
                          <div className="pm-step-top">
                            <MeasureName
                              value={measure.name}
                              onChange={(name) => patchMeasure(source.id, measure.id, (item) => ({ ...item, name }))}
                            />
                            <div className="pm-step-tools">
                              <Button
                                variant={measure.required ? "tertiary" : "secondary"}
                                aria-pressed={measure.required === true}
                                onClick={() => patchMeasure(source.id, measure.id, (item) => ({ ...item, required: !item.required }))}
                              >
                                {measure.required ? "Required" : "Optional"}
                              </Button>
                              <button
                                type="button"
                                className="pm-editor-remove"
                                aria-label={`Remove ${measure.name || "measurement"}`}
                                onClick={() => {
                                  const previous = source.measures;
                                  setPending({
                                    noun: "measurement",
                                    name: measure.name.trim() || "Untitled measurement",
                                    run: () => patch(source.id, (item) => ({
                                      ...item,
                                      measures: previous.filter((entry) => entry.id !== measure.id),
                                    })),
                                  });
                                }}
                              >
                                <Icon name="trash" size={14} />
                              </button>
                            </div>
                          </div>
                          <div className="pm-step-range">
                            <input
                              className="sds line pm-step-unit"
                              aria-label="Unit"
                              placeholder="Unit (°F, psi)"
                              value={measure.unit}
                              onChange={(event) => patchMeasure(source.id, measure.id, (item) => ({ ...item, unit: event.target.value }))}
                            />
                            <input
                              className="sds line pm-step-bound"
                              aria-label="Minimum"
                              placeholder="Min"
                              inputMode="decimal"
                              value={boundText(measure.min)}
                              onChange={(event) => patchMeasure(source.id, measure.id, (item) => ({ ...item, min: boundValue(event.target.value) }))}
                            />
                            <span aria-hidden="true">–</span>
                            <input
                              className="sds line pm-step-bound"
                              aria-label="Maximum"
                              placeholder="Max"
                              inputMode="decimal"
                              value={boundText(measure.max)}
                              onChange={(event) => patchMeasure(source.id, measure.id, (item) => ({ ...item, max: boundValue(event.target.value) }))}
                            />
                            <span className="pm-step-range-note">expected range (optional)</span>
                          </div>
                        </div>
                      ),
                    }]}
                  />
                  <form
                    className="pm-editor-compose"
                    onSubmit={(event) => {
                      event.preventDefault();
                      const next = draft.trim();
                      if (!next) return;
                      patch(source.id, (item) => ({
                        ...item,
                        measures: [...item.measures, { id: `measure-${Date.now()}`, name: next, unit: "" }],
                      }));
                      setDraft("");
                    }}
                  >
                    <input
                      className="sds line"
                      value={draft}
                      placeholder="New measurement..."
                      aria-label="New measurement"
                      onChange={(event) => setDraft(event.target.value)}
                    />
                    <Button variant="secondary" type="submit">Add</Button>
                  </form>
                </section>
              </div>
            )}
          </div>
        </div>
        <div className="pm-editor-foot">
          <Button onClick={() => closeRef.current()}>Save</Button>
        </div>
      </div>
      <ConfirmDialog
        open={pending != null}
        name={pending?.name ?? name}
        noun={pending?.noun ?? "source"}
        onCancel={() => setPending(null)}
        onConfirm={() => {
          const current = pending;
          setPending(null);
          current?.run();
        }}
      />
    </div>,
    document.body,
  );
}

export function SourceEditorDialog({
  source,
  sources,
  onChange,
  onClose,
  onDelete,
}: {
  source: Source;
  sources: Source[];
  onChange: (sources: Source[]) => void;
  onClose: () => void;
  onDelete: () => void;
}) {
  function patch(id: string, update: (source: Source) => Source) {
    onChange(sources.map((item) => (item.id === id ? update(item) : item)));
  }

  function patchMeasure(sourceId: string, measureId: string, update: (measure: Measure) => Measure) {
    patch(sourceId, (item) => ({
      ...item,
      measures: item.measures.map((measure) => (measure.id === measureId ? update(measure) : measure)),
    }));
  }

  return <SourceDialog source={source} patch={patch} patchMeasure={patchMeasure} onClose={onClose} onDelete={onDelete} />;
}

export function SourceEditor({
  sources,
  onChange,
  focusId,
  onAdded,
}: {
  sources: Source[];
  onChange: (sources: Source[]) => void;
  focusId: string | null;
  onAdded: (id: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [statuses, setStatuses] = useState<string[]>([]);
  const [deadline, setDeadline] = useState("11:00 PM");
  const [openId, setOpenId] = useState<string | null>("guestrooms");
  const [menu, setMenu] = useState<"deadline" | null>(null);
  const deadlineRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!menu) return;
    const close = (event: Event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (target.closest(".menu, .readings-deadline-drop")) return;
      setMenu(null);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenu(null);
    };
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", onKey);
    };
  }, [menu]);

  useLayoutEffect(() => {
    if (focusId) setOpenId(focusId);
  }, [focusId]);

  const wanted = query.trim().toLowerCase();
  const rows = sources.filter((source) => {
    if (statuses.length > 0) {
      const status = source.active ? "Active" : "Inactive";
      if (!statuses.includes(status)) return false;
    }
    if (!wanted) return true;
    return `${source.name} ${source.kind} ${source.measures.map((measure) => measure.name).join(" ")}`.toLowerCase().includes(wanted);
  });

  function patch(id: string, update: (source: Source) => Source) {
    onChange(sources.map((source) => (source.id === id ? update(source) : source)));
  }

  function patchMeasure(sourceId: string, measureId: string, update: (measure: Measure) => Measure) {
    patch(sourceId, (source) => ({
      ...source,
      measures: source.measures.map((measure) => (measure.id === measureId ? update(measure) : measure)),
    }));
  }

  function addSource() {
    const id = `source-${Date.now()}`;
    onChange([
      ...sources,
      {
        id,
        name: "",
        category: "",
        place: "",
        kind: "Boiler",
        active: true,
        perDay: 1,
        measures: [{ id: `measure-${Date.now()}`, name: "", unit: "" }],
        latest: null,
        lastAt: null,
        alerts: [],
      },
    ]);
    setOpenId(id);
    onAdded(id);
  }

  const editing = sources.find((source) => source.id === openId) ?? null;

  return (
    <>
      <div className="filter-row page-toolbar">
        <SearchBox placeholder="Search sources" label="Search sources" value={query} onValueChange={setQuery} />
        <FilterMenu value={statuses} onValueChange={setStatuses} options={["Active", "Inactive"]} />
        <div className="filter-chips">
          {statuses.map((value) => (
            <button key={value} className="chip chip-filter" type="button" onClick={() => setStatuses((current) => current.filter((item) => item !== value))}>
              <span className="chip-k">Status</span>: {value} <Glyph name="plus" size={10} className="x" />
            </button>
          ))}
        </div>
        <div className="readings-toolbar-end">
          <div className="readings-deadline">
            <span>Daily deadline</span>
            <Button
              ref={deadlineRef}
              variant="secondary"
              className="readings-deadline-drop"
              aria-label="Daily deadline"
              aria-haspopup="menu"
              aria-expanded={menu === "deadline"}
              onClick={() => setMenu((current) => (current === "deadline" ? null : "deadline"))}
            >
              <span>{deadline}</span>
              <Icon name="chevron" size={14} />
            </Button>
            <OverlayMenu open={menu === "deadline"} anchorRef={deadlineRef} label="Daily deadline">
              {DEADLINES.map((time) => (
                <button
                  key={time}
                  type="button"
                  className="menu-item"
                  role="menuitemradio"
                  aria-checked={deadline === time}
                  onClick={() => {
                    setDeadline(time);
                    setMenu(null);
                  }}
                >
                  {time}
                  <Icon name="check" size={14} className="check" />
                </button>
              ))}
            </OverlayMenu>
          </div>
          <Button onClick={addSource}>
            <Icon name="plus-bold" size={14} />
            New source
          </Button>
        </div>
      </div>
      <div className="pm-table">
        <DataTable
          rows={rows}
          total={sources.length}
          empty="No sources"
          interactive
          selectedId={openId}
          onRowClick={(source) => setOpenId(source.id)}
          onDelete={(source) => {
            onChange(sources.filter((item) => item.id !== source.id));
            if (openId === source.id) setOpenId(null);
          }}
          deleteNoun="source"
          rowName={(row) => row.name.trim() || "Source"}
          columns={sourceColumns(patch)}
        />
      </div>
      {editing ? (
        <SourceDialog
          key={editing.id}
          source={editing}
          patch={patch}
          patchMeasure={patchMeasure}
          onClose={() => setOpenId(null)}
          onDelete={() => {
            onChange(sources.filter((source) => source.id !== editing.id));
            setOpenId(null);
          }}
        />
      ) : null}
    </>
  );
}
