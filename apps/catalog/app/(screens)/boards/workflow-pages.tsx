"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { Button, SuccessCheck, FilterPicker, Chip, ThemeSwitch, DataTable, Tabs, EditorDialog, EditorPill, EditorPills, Icon, Menu, Person, Status, taskMenuItem, SectionHeader, SettingsCard, SettingsMenuRow, SettingsRow, SettingsToggleRow, TimePicker, formatTime, useCopyFeedback, type MenuItem } from "@lance-live/sds";
import { PageLayout, PageTitle } from "../page-layout";
import { SearchBox } from "../chrome";
import { OTHER_BOARD_STAFF, ROOMS, SERVICES, UNASSIGNED, formatDuration, isDone, roomFloor, type Room, type Staff } from "./data";

export const todayKey = () => new Intl.DateTimeFormat("en-CA", { timeZone: "America/Los_Angeles", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
export const dateKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
export function dateLabel(value: string) {
  const today = todayKey();
  const delta = Math.round((Date.parse(`${value}T12:00:00`) - Date.parse(`${today}T12:00:00`)) / 86400000);
  return delta === 0 ? "Today" : delta === -1 ? "Yesterday" : delta === 1 ? "Tomorrow" : new Date(`${value}T12:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

/** Uses the existing calendar specimen's classes, without a new visual variant. */
export function BoardCalendar({ value, onChange }: { value: string; onChange: (date: string) => void }) {
  const [month, setMonth] = useState(() => new Date(`${value.slice(0, 7)}-01T12:00:00`));
  const count = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  return <><div className="board-date-picker">
    <div className="cal-head"><button type="button" className="cal-nav" data-cal-prev aria-label="Previous month" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}><Icon name="chevron" size={14} /></button><span className="cal-title">{month.toLocaleDateString("en-US", { month: "long", year: "numeric" })}</span><button type="button" className="cal-nav" data-cal-next aria-label="Next month" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}><Icon name="chevron" size={14} /></button></div>
    <div className="cal-week">{["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(day => <span key={day}>{day}</span>)}</div>
    <div className="cal-grid">{Array.from({ length: month.getDay() }, (_, i) => <span key={`blank-${i}`} />)}{Array.from({ length: count }, (_, i) => {
      const key = dateKey(new Date(month.getFullYear(), month.getMonth(), i + 1));
      return <button key={key} type="button" className={`cal-day${key === value ? " is-selected" : ""}${key === todayKey() ? " is-today" : ""}`} aria-label={new Date(`${key}T12:00:00`).toLocaleDateString("en-US", { dateStyle: "full" })} aria-pressed={key === value} onClick={() => onChange(key)}>{i + 1}</button>;
    })}</div>
    </div>
    <div className="menu-rule" role="separator" />
    <button type="button" role="menuitem" className="menu-item" onClick={() => onChange(todayKey())}><Icon name="calendar" size={14} />Today</button>
  </>;
}

export function WorkflowFrame({ title, breadcrumb = title, className = "", description, onBack, children }: { title: string; breadcrumb?: string; className?: string; description?: string; onBack: () => void; children: ReactNode }) {
  return <PageLayout className="sheet-page" data-view="head" icon="grid" title={<PageTitle parent="Boards" current={breadcrumb} onBack={onBack} />} actions={<Button variant="secondary" onClick={onBack}><Icon name="chevron" size={14} className="pm-back-icon" />Back</Button>} bodyClassName="housekeeper-scroll">
    <div className={`board-workflow ${className}`}><header className="board-workflow-intro"><h1>{title}</h1>{description ? <p>{description}</p> : null}</header>{children}</div>
  </PageLayout>;
}
export const LIMIT_FIELDS = ["Rooms", "Checkouts", "Queens", "Suites", "Floors"] as const;
export type LimitValues = Partial<Record<typeof LIMIT_FIELDS[number], number>>;
export type BoardLimits = { hard: boolean; global: LimitValues; personal: Record<string, LimitValues> };
export const defaultLimits: BoardLimits = { hard: true, global: { Rooms: 15, Checkouts: 8, Queens: 10, Suites: 4, Floors: 3 }, personal: {} };
export function LimitsPage({ value, staff, selected, onSave, onBack }: { value: BoardLimits; staff: Staff[]; selected?: string; onSave: (next: BoardLimits) => void; onBack: () => void }) {
  const [draft, setDraft] = useState<BoardLimits>(() => structuredClone(value));
  const valid = [draft.global, ...Object.values(draft.personal)].every(values => Object.values(values).every(n => n === undefined || (Number.isSafeInteger(n) && n >= 0)));

  function field(label: typeof LIMIT_FIELDS[number], person?: Staff) {
    const values = person ? draft.personal[person.id] ?? {} : draft.global;
    const current = values[label];
    return <input
      className="sds editor-field-input"
      type="number"
      min={0}
      step={1}
      aria-label={person ? `${person.name}: ${label}` : label}
      aria-invalid={current !== undefined && (!Number.isSafeInteger(current) || current < 0)}
      placeholder={person ? String(draft.global[label] ?? "—") : "—"}
      value={current ?? ""}
      onChange={event => {
        const amount = event.target.value === "" ? undefined : Number(event.target.value);
        setDraft(previous => person ? {
          ...previous,
          personal: { ...previous.personal, [person.id]: { ...previous.personal[person.id], [label]: amount } },
        } : { ...previous, global: { ...previous.global, [label]: amount } });
      }}
    />;
  }

  return <EditorDialog kicker="Edit limits" title="" layout="pills" className="board-limits-dialog" onClose={onBack} footer={<>
    <Button variant="secondary" onClick={onBack}>Cancel</Button>
    <Button disabled={!valid} onClick={() => onSave(draft)}><Icon name="check" />Save limits</Button>
  </>}>
    <p className="hk-help">Auto-assign fills rooms within the caps first. With hard limits on, extra rooms stay unassigned. With hard limits off, extra rooms are spread across the team.</p>
    <SettingsCard label="Limit enforcement" className="board-limits-enforcement">
      <SettingsToggleRow label="Enforce hard limits" value={draft.hard} onValueChange={hard => setDraft(current => ({ ...current, hard }))} />
    </SettingsCard>
    <section className="board-limits-section">
      <SectionHeader icon="tune" title="Hotel-wide limits" aside="Leave blank for no limit." />
      <div className="board-limits-global">
        {LIMIT_FIELDS.map(label => <label key={label} className="editor-field"><span className="editor-field-label">{label}</span>{field(label)}</label>)}
      </div>
    </section>
    <section className="board-limits-section">
      <SectionHeader icon="user" title="Per housekeeper" aside="Leave blank to use the hotel-wide limit." />
      <SettingsCard label="Housekeeper limits" className="board-limits-table">
        <table>
          <colgroup><col className="board-limits-person-column" /><col span={LIMIT_FIELDS.length} /></colgroup>
          <thead><tr><th scope="col">Housekeeper</th>{LIMIT_FIELDS.map(label => <th key={label} scope="col">{label}</th>)}</tr></thead>
          <tbody>{staff.map(person => <tr key={person.id} data-selected={person.id === selected || undefined}>
            <th scope="row"><Person name={person.name} initials={person.initials} variant="mini" /></th>
            {LIMIT_FIELDS.map(label => <td key={label}>{field(label, person)}</td>)}
          </tr>)}</tbody>
        </table>
      </SettingsCard>
    </section>
    {!valid && <p role="alert" className="hk-help">Use whole numbers of zero or more.</p>}
  </EditorDialog>;
}

const inventory = [...new Map([...ROOMS.map(room => [room.number, room.type] as const), ["319", "KSTE"], ["320", "QQST"], ["414", "SUIT"]].map(([number, type]) => [number, { number, type: type as Room["type"] }])).values()];
function checkoutValue(value = "11:00") {
  const match = value.match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)$/i);
  if (!match) return value;
  return `${String(Number(match[1]) % 12 + (match[3].toUpperCase() === "PM" ? 12 : 0)).padStart(2, "0")}:${match[2] ?? "00"}`;
}
export function RoomEditor({ room, rooms, staff, onSave, onBack }: { room?: Room; rooms: Room[]; staff: Staff[]; onSave: (room: Room) => void; onBack: () => void }) {
  const [draft, setDraft] = useState<Room>(() => room ? { ...room } : { id: `room-${Date.now()}`, number: "", type: "KSTE", service: "refresh", state: "dirty", dnd: false, occupied: false, housekeeper: UNASSIGNED, inspector: UNASSIGNED });
  const [openPill, setOpenPill] = useState<string | null>(null);
  const [minibarItems, setMinibarItems] = useState(() =>
    (room?.minibarTaken ?? []).map(({ name, quantity }, id) => ({ id, name, quantity: String(quantity) })),
  );
  const nextMinibarId = useRef(minibarItems.length);
  const duplicate = rooms.some(item => item.number === draft.number && item.id !== draft.id);
  const patch = (values: Partial<Room>) => setDraft({ ...draft, ...values });
  const assignment = (role: Staff["role"]) => [{ value: UNASSIGNED, label: "Unassigned", icon: "user" as const }, ...staff.filter(person => person.role === role && person.onBoard).map(person => ({ value: person.id, label: person.name, icon: "user" as const }))];
  if (!room) {
    function pill(key: string, icon: "bed" | "user" | "check" | "clock" | "clean-full", value: string, choices: { value: string; label: string }[], current: string, choose: (value: string) => void) {
      return <EditorPill icon={icon} value={value} open={openPill === key} onToggle={() => setOpenPill(openPill === key ? null : key)} menu={choices.map(option => taskMenuItem(option.value, option.value === current, () => { choose(option.value); setOpenPill(null); }, option.label))} />;
    }
    return <EditorDialog kicker="Add room" layout="pills" className="pm-page todo-editor" title={draft.number} titlePlaceholder="Room number" onTitleChange={value => { const number = value.replace(/[^0-9]/g, ""); patch({ number, type: inventory.find(item => item.number === number)?.type ?? "KSTE" }); }} onClose={onBack} onEscape={() => { if (!openPill) return false; setOpenPill(null); return true; }} footer={<Button disabled={!draft.number || duplicate} onClick={() => onSave(draft)}><Icon name="plus" size={14} />Add room</Button>}>
      <EditorPills>
        {pill("status", "check", { dirty: "Not started", cleaning: "In progress", clean: "Clean", inspected: "Inspected" }[draft.state], [{ value: "dirty", label: "Not started" }, { value: "cleaning", label: "In progress" }, { value: "clean", label: "Clean" }, { value: "inspected", label: "Inspected" }], draft.state, state => patch({ state: state as Room["state"] }))}
        {pill("service", "clean-full", SERVICES.find(item => item.value === draft.service)?.label ?? draft.service, SERVICES, draft.service, service => patch({ service: service as Room["service"] }))}
        <span className="editor-pill"><ThemeSwitch label="DND" pressed={draft.dnd} onPressedChange={dnd => patch({ dnd })} /></span>
        <span className="editor-pill"><ThemeSwitch label="Pet" pressed={draft.pet ?? false} onPressedChange={pet => patch({ pet })} /></span>
      </EditorPills>
      {duplicate ? <p className="hk-help" role="alert">This room is already on the board.</p> : null}
    </EditorDialog>;
  }
  const minibarNames = new Set(minibarItems.map(item => item.name.trim().toLowerCase()));
  const validMinibar = minibarNames.size === minibarItems.length && minibarItems.every(({ name, quantity }) =>
    name.trim() && Number.isSafeInteger(Number(quantity)) && Number(quantity) > 0,
  );

  function updateMinibarItem(id: number, values: Partial<{ name: string; quantity: string }>) {
    setMinibarItems(current => current.map(item => item.id === id ? { ...item, ...values } : item));
  }

  function addMinibarItem() {
    const id = nextMinibarId.current++;
    setMinibarItems(current => [...current, { id, name: "", quantity: "1" }]);
  }

  function saveRoom() {
    const minibarTaken = minibarItems.map(({ name, quantity }) => ({ name: name.trim(), quantity: Number(quantity) }));
    onSave(minibarTaken.length || draft.minibarTaken ? { ...draft, minibarTaken } : draft);
  }

  return <WorkflowFrame title={`Room ${room.number}`} breadcrumb={`Edit room ${room.number}`} onBack={onBack}>
    <section>
      <SectionHeader icon="bed" title="Room details" />
      <SettingsCard label="Room details">
        <SettingsRow label="Room" description={duplicate ? "This room is already on the board." : undefined}><Menu searchable placeholder="Choose room" placeholderIcon="bed" value={draft.number} items={inventory.map(item => ({ value: item.number, label: item.number, suffix: item.type, icon: "bed" }))} onValueChange={number => patch({ number, type: inventory.find(item => item.number === number)!.type })} /></SettingsRow>
        <SettingsMenuRow label="Status" value={draft.state} onValueChange={state => patch({ state: state as Room["state"] })} items={[["dirty", "Not started"], ["cleaning", "In progress"], ["clean", "Clean"], ["inspected", "Inspected"]].map(([value, label]) => ({ value, label, icon: "check" }))} />
        <SettingsMenuRow label="Service" value={draft.service} onValueChange={service => patch({ service: service as Room["service"] })} items={SERVICES.map(item => ({ ...item, icon: "clean-full" }))} />
        <SettingsToggleRow label="Occupied" value={draft.occupied} onValueChange={occupied => patch({ occupied })} />
        <SettingsToggleRow label="Do not disturb" value={draft.dnd} onValueChange={dnd => patch({ dnd })} />
        {draft.service === "checkout" ? <SettingsRow label="Checkout time"><TimePicker label="Checkout time" value={checkoutValue(draft.dueOut)} onValueChange={dueOut => patch({ dueOut: formatTime(dueOut) })} /></SettingsRow> : null}
        <SettingsToggleRow label="Guest has a pet" value={draft.pet ?? false} onValueChange={pet => patch({ pet })} />
        <SettingsRow label="Minibar taken">
          <Button variant="secondary" onClick={addMinibarItem}><Icon name="plus" />Add item</Button>
        </SettingsRow>
        {minibarItems.map((item, index) => (
          <SettingsRow key={item.id} label={`Item ${index + 1}`} className="board-minibar-item">
            <input className="sds line" aria-label={`Minibar item ${index + 1} name`} placeholder="Item name" value={item.name} onChange={event => updateMinibarItem(item.id, { name: event.target.value })} />
            <input className="sds line board-minibar-quantity" type="number" min="1" step="1" aria-label={`Minibar item ${index + 1} quantity`} value={item.quantity} onChange={event => updateMinibarItem(item.id, { quantity: event.target.value })} />
            <Button icon variant="danger-light" aria-label={`Remove minibar item ${index + 1}`} onClick={() => setMinibarItems(current => current.filter(entry => entry.id !== item.id))}><Icon name="trash" /></Button>
          </SettingsRow>
        ))}
      </SettingsCard>
      {!validMinibar && <p className="hk-help">Give each minibar item a unique name and a quantity of 1 or more.</p>}
    </section>
    <section><SectionHeader icon="user" title="Assignments" /><SettingsCard label="Assignments"><SettingsMenuRow label="Housekeeper" items={assignment("housekeeper")} value={draft.housekeeper} onValueChange={housekeeper => patch({ housekeeper })} /><SettingsMenuRow label="Inspector" items={assignment("inspector")} value={draft.inspector} onValueChange={inspector => patch({ inspector })} /></SettingsCard></section>
    <section><SectionHeader icon="clipboard" title="Notes" /><textarea className="sds text-well" aria-label="Room notes" placeholder="Add room notes…" value={draft.notes ?? ""} onChange={event => patch({ notes: event.target.value })} /></section>
    <div className="board-workflow-actions"><Button variant="secondary" onClick={onBack}>Cancel</Button><Button disabled={!draft.number || duplicate || !validMinibar} onClick={saveRoom}><Icon name="check" size={14} />Save changes</Button></div>
  </WorkflowFrame>;
}

export function ShiftPage({ person, onSave, onBack }: { person: Staff; onSave: (patch: Partial<Staff>) => void; onBack: () => void }) {
  const asTime = (value: number) => `${String(Math.floor(value / 60)).padStart(2, "0")}:${String(value % 60).padStart(2, "0")}`;
  const [start, setStart] = useState(asTime(person.shiftStart ?? 540));
  const [end, setEnd] = useState(asTime(person.shiftEnd ?? 1020));
  const minutes = (time: string) => Number(time.slice(0, 2)) * 60 + Number(time.slice(3));
  const duration = (minutes(end) - minutes(start) + 1440) % 1440;
  return <WorkflowFrame title={`Activate ${person.name}`} description="Set today's shift to include this person in assignments." onBack={onBack}><section><SectionHeader icon="clock" title="Shift" /><SettingsCard label="Shift"><SettingsRow label="From"><TimePicker label="Shift start" value={start} onValueChange={setStart} /></SettingsRow><SettingsRow label="To"><TimePicker label="Shift end" value={end} onValueChange={setEnd} /></SettingsRow><SettingsRow label="Hours"><span>{formatDuration(duration)}</span></SettingsRow></SettingsCard></section><div className="board-workflow-actions"><Button variant="secondary" onClick={onBack}>Cancel</Button><Button disabled={!duration} onClick={() => onSave({ shiftStart: minutes(start), shiftEnd: minutes(end), boardState: "active" })}><Icon name="check" size={14} />Activate shift</Button></div></WorkflowFrame>;
}

export function ReportPage({ rooms, staff, date, onBack }: { rooms: Room[]; staff: Staff[]; date: string; onBack: () => void }) {
  const [review, setReview] = useState(false);
  const [sent, setSent] = useState(false);
  const summary = useRef<HTMLElement>(null);
  const completion = useRef<HTMLElement>(null);
  const [recipient, setRecipient] = useState("operations@example.com");
  const reportTitle = `HSK OPENING ${date.slice(5, 7)}-${date.slice(8)}-${date.slice(0, 4)}`;
  const [housekeepers, setHousekeepers] = useState(() => staff.filter(person => person.onBoard && person.role === "housekeeper").map(person => person.name));
  const [newHousekeeper, setNewHousekeeper] = useState("");
  const copyReport = useCopyFeedback("Copy report");
  const [values, setValues] = useState<Record<string, string>>({
    Opening: "", Closing: "", Occupancy: "", Arrivals: "",
    "Total rooms to clean": String(rooms.length), "Total occupied rooms": String(rooms.filter(room => room.occupied).length),
    "Open / dropped rooms": "0", "DND / no service": String(rooms.filter(room => room.dnd).length),
    "Called in sick": "None", Laundry: "", "AM houseperson": "", "Mid houseperson": "", Lobby: "", "Overnight houseperson": "", Maintenance: "",
  });
  const fieldId = useId();
  const numeric = new Set(["Occupancy", "Arrivals", "Total rooms to clean", "Total occupied rooms", "Open / dropped rooms", "DND / no service"]);
  const validNumbers = Object.entries(values).every(([key, value]) => !numeric.has(key) || value === "" || (Number.isInteger(Number(value)) && Number(value) >= 0));
  const emails = recipient.split(/[,;]+/).map(value => value.trim()).filter(Boolean);
  const validRecipients = emails.length > 0 && emails.every(email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));
  const addHousekeeper = () => { const name = newHousekeeper.trim(); if (name && !housekeepers.some(item => item.toLowerCase() === name.toLowerCase())) setHousekeepers(current => [...current, name]); setNewHousekeeper(""); };
  const reportText = [reportTitle, "", ...Object.entries(values).map(([key, value]) => `${key}: ${value || "—"}`), "", "Housekeepers:", ...housekeepers].join("\n");
  useEffect(() => {
    const section = sent ? completion.current : summary.current;
    if (!review || !section) return;
    const page = section.closest(".housekeeper-scroll");
    if (page) page.scrollTop = 0;
    section.focus({ preventScroll: true });
  }, [review, sent]);

  return <WorkflowFrame title={reportTitle} breadcrumb="Send report" className="board-report" onBack={onBack}>
    {sent ? <SettingsCard label="Report completion">
      <section className="board-report-success" ref={completion} tabIndex={-1} aria-labelledby="board-report-success-title">
        <SuccessCheck />
        <h2 id="board-report-success-title">Send preview complete</h2>
        <p>No email was sent.</p>
        <dl className="board-report-success-recipients">
          <dt>Recipients</dt>
          <dd>{emails.join(", ")}</dd>
        </dl>
        <div className="board-report-success-actions">
          <Button variant="secondary" onClick={() => { setSent(false); setReview(false); }}>Edit report</Button>
          <Button onClick={onBack}>Back to Boards</Button>
        </div>
      </section>
    </SettingsCard> : <>
      <section ref={summary} className="board-report-summary" aria-label={review ? "Opening report summary" : "Opening report fields"} tabIndex={-1}>
        <dl className={`board-report-summary-grid${review ? "" : " is-editing"}`}>
          {Object.entries(values).map(([label, value], index) => {
            const id = `${fieldId}-${index}`;
            const isNumber = numeric.has(label);
            return <div className={label === "Maintenance" ? "board-report-full" : undefined} key={label}>
              <dt>{review ? label : <label htmlFor={id}>{label}</label>}</dt>
              <dd>{review ? value || "—" : <input
                id={id}
                className="sds line"
                type={isNumber ? "number" : "text"}
                min={isNumber ? 0 : undefined}
                step={isNumber ? 1 : undefined}
                value={value}
                placeholder="—"
                onChange={event => setValues(current => ({ ...current, [label]: event.target.value }))}
              />}</dd>
            </div>;
          })}
          <div className="board-report-full board-report-housekeepers">
            <dt>Housekeepers</dt>
            <dd>{review ? housekeepers.join(", ") || "—" : <>
              <div className="board-report-roster">
                {housekeepers.map(name => <Button key={name} variant="secondary" aria-label={`Remove ${name} from report`} onClick={() => setHousekeepers(current => current.filter(item => item !== name))}>
                  {name}<Icon name="close" size={14} />
                </Button>)}
              </div>
              <div className="board-report-add">
                <input className="sds line" aria-label="Housekeeper name" placeholder="Add name…" value={newHousekeeper} onChange={event => setNewHousekeeper(event.target.value)} onKeyDown={event => {
                  if (event.key !== "Enter") return;
                  event.preventDefault();
                  addHousekeeper();
                }} />
                <Button variant="secondary" disabled={!newHousekeeper.trim()} onClick={addHousekeeper}><Icon name="plus" size={14} />Add</Button>
              </div>
            </>}</dd>
          </div>
        </dl>
        {!review && !validNumbers && <p className="hk-help" role="alert">Enter whole numbers of zero or more for room totals, occupancy, and arrivals.</p>}
      </section>
      <section>
        <SectionHeader icon="mail" title="Recipients" />
        <div className="board-report-delivery" role="group" aria-label="Recipients">
          <input className="sds line" aria-label="Report recipient" value={recipient} placeholder="Email addresses, separated by commas" onChange={event => setRecipient(event.target.value)} />
          <div className="board-report-recipients" role="group" aria-label="Suggested recipients">{staff.filter(person => person.onBoard).map(person => {
            const email = `${person.id}@example.com`;
            const selected = emails.includes(email);
            return <Button key={person.id} variant={selected ? "tertiary" : "secondary"} aria-pressed={selected} onClick={() => setRecipient((selected ? emails.filter(item => item !== email) : [...emails, email]).join(", "))}>
              {selected ? <Icon name="check" size={14} /> : null}{person.name}
            </Button>;
          })}</div>
        </div>
      </section>
      <div className="board-workflow-actions board-report-actions">
        <Button variant="secondary" onClick={() => review ? setReview(false) : onBack()}>{review ? "Edit report" : "Cancel"}</Button>
        <Button variant="secondary" onClick={() => void copyReport.copy(reportText)}><Icon name="clipboard" size={14} /><span aria-live="polite">{copyReport.label}</span></Button>
        <Button disabled={review ? !validRecipients : !validNumbers} onClick={() => review ? setSent(true) : setReview(true)}><Icon name={review ? "mail" : "eye"} size={14} />{review ? "Simulate send" : "Review report"}</Button>
      </div>
    </>}
  </WorkflowFrame>;
}

const ROOM_STATUS_TABS = [
  { value: "departures", label: "Check-Outs" },
  { value: "stayovers", label: "Stayovers" },
  { value: "strips", label: "Strips" },
] as const;
type RoomStatusTab = typeof ROOM_STATUS_TABS[number]["value"];
type RoomStatusFilters = { staff: string; floor: string; status: string };
const DEFAULT_STATUS_FILTERS: RoomStatusFilters = { staff: "all", floor: "all", status: "all" };
type RoomStatusFilterField = keyof RoomStatusFilters;

function RoomStatusFilterMenu({ fields, filters, onChange }: {
  fields: { key: RoomStatusFilterField; label: string; options: MenuItem[] }[];
  filters: RoomStatusFilters;
  onChange: (key: RoomStatusFilterField, value: string) => void;
}) {
  return <FilterPicker compact triggerClassName="board-room-status-filter-trigger" groups={fields.map(({ key, label, options }) => ({
    id: key,
    label,
    options,
    selected: [filters[key]],
    mode: "single",
    onSelectedChange: ([value]) => onChange(key, value),
  }))} />;
}

const boardTime = new Intl.DateTimeFormat("en-US", { timeZone: "America/Los_Angeles", hour: "numeric", minute: "2-digit" });
const boardDay = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Los_Angeles", year: "numeric", month: "2-digit", day: "2-digit" });

function roomStatus(room: Room) {
  if (room.dnd) return "DND";
  if (isDone(room, "housekeeper")) return room.occupied ? "OC" : "VC";
  return room.state === "cleaning" ? "In progress" : "Dirty";
}

export function BoardRoomStats({ rooms, staff, date, initial, onBack }: {
  rooms: Room[];
  staff: Staff[];
  date: string;
  initial: RoomStatusTab;
  onBack: () => void;
}) {
  const [tab, setTab] = useState<RoomStatusTab>(initial);
  const [query, setQuery] = useState("");
  const [filtersByTab, setFiltersByTab] = useState<Partial<Record<RoomStatusTab, RoomStatusFilters>>>({});
  const filters = filtersByTab[tab] ?? DEFAULT_STATUS_FILTERS;
  const groups = {
    departures: rooms.filter(room => room.service === "checkout"),
    stayovers: rooms.filter(room => ["refresh", "full", "well"].includes(room.service)),
    strips: rooms.filter(room => room.strip),
  };
  const strips = tab === "strips";
  const group = groups[tab];
  const people = new Map([...staff, ...OTHER_BOARD_STAFF].map(person => [person.id, person]));
  const assignee = (room: Room) => {
    const id = strips ? room.strip?.assignee : room.housekeeper;
    return id && people.has(id) ? id : UNASSIGNED;
  };
  const staffName = (id?: string) => id ? people.get(id)?.name : undefined;
  const staffChoices = [...new Set(group.map(assignee))]
    .map(value => {
      const person = people.get(value);
      const label = person?.name ?? "Unassigned";
      return {
        value,
        label,
        content: <Person name={label} initials={person?.initials} variant={person ? "pill" : "unassigned"} />,
      };
    })
    .sort((a, b) => a.label.localeCompare(b.label));
  const floors = [...new Set(group.map(room => roomFloor(room.number)).filter(Boolean))]
    .sort((a, b) => Number(a) - Number(b));
  const roomQuery = query.trim();
  const visible = group.filter(room => (
    room.number.startsWith(roomQuery) &&
    (filters.staff === "all" || assignee(room) === filters.staff) &&
    (filters.floor === "all" || roomFloor(room.number) === filters.floor) &&
    (filters.status === "all" || filters.status === (strips ? room.strip?.completed ? "done" : "pending" : roomStatus(room)))
  )).sort((a, b) => a.number.localeCompare(b.number, undefined, { numeric: true }));

  function setFilter(key: keyof RoomStatusFilters, value: string) {
    setFiltersByTab(current => ({ ...current, [tab]: { ...(current[tab] ?? DEFAULT_STATUS_FILTERS), [key]: value } }));
  }

  const statusOptions = strips
    ? [{ value: "all", label: "All" }, { value: "pending", label: "Pending" }, { value: "done", label: "Done" }]
    : [{ value: "all", label: "All" }, { value: "VC", label: "VC" }, { value: "OC", label: "OC" }];
  const filterFields = [
    { key: "staff", label: strips ? "Houseperson" : "Housekeeper", options: [{ value: "all", label: strips ? "All Housepersons" : "All Housekeepers" }, ...staffChoices] },
    { key: "floor", label: "Floor", options: [{ value: "all", label: "All Floors" }, ...floors.map(value => ({ value, label: `Floor ${value}` }))] },
    { key: "status", label: "Status", options: statusOptions },
  ] satisfies Parameters<typeof RoomStatusFilterMenu>[0]["fields"];

  return <PageLayout
    className="sheet-page board-room-status-page"
    data-view="head"
    icon="grid"
    title={<PageTitle parent="Boards" current="Room status" onBack={onBack} />}
    actions={<Button variant="secondary" onClick={onBack}><Icon name="chevron" className="pm-back-icon" />Back</Button>}
  >
    <section className="board-room-status" aria-label={ROOM_STATUS_TABS.find(item => item.value === tab)?.label}>
      <Tabs label="Room status" value={tab} onValueChange={value => setTab(value as RoomStatusTab)} items={ROOM_STATUS_TABS.map(item => ({ ...item, count: groups[item.value].length }))} />
      <div className="board-room-status-filters" role="group" aria-label="Room status filters">
        <SearchBox placeholder="Search rooms" label="Search rooms" value={query} onValueChange={setQuery} />
        <RoomStatusFilterMenu key={tab} fields={filterFields} filters={filters} onChange={setFilter} />
        {filterFields.map(({ key, label, options }) => {
          const selected = options.find(option => option.value === filters[key] && option.value !== "all");
          return selected ? <Chip key={key} filter={{ name: label, value: selected.label }} aria-label={`Clear ${label.toLowerCase()} filter: ${selected.label}`} onClick={() => setFilter(key, "all")} /> : null;
        })}
      </div>
      <DataTable rows={visible} total={group.length} empty="No rooms match these filters." columns={[
        { id: "number", title: "Room", ink: "strong", minWidth: 70, render: room => room.number },
        tab === "stayovers"
          ? { id: "service", title: "Service", render: room => SERVICES.find(item => item.value === room.service)?.label }
          : { id: "type", title: "Type", render: room => room.type },
        { id: "status", title: "Status", render: room => {
          const complete = isDone(room, "housekeeper");
          return <span className="board-room-status-value"><span aria-hidden="true"><Status iconOnly status={complete ? "complete" : room.state === "cleaning" ? "progress" : "open"} /></span>{roomStatus(room)}</span>;
        } },
        { id: "assignee", title: strips ? "Houseperson" : "Housekeeper", text: "short", flex: true, render: room => staffName(assignee(room)) ?? "—" },
        strips
          ? { id: "requested", title: "Requested by", render: room => staffName(room.strip?.requestedBy) ?? "—" }
          : { id: "completed", title: "Completed", render: room => {
            const completion = isDone(room, "housekeeper") ? room.activity?.find(entry => entry.kind === "clean" && entry.at !== undefined && boardDay.format(entry.at) === date) : undefined;
            return completion?.at === undefined ? "—" : boardTime.format(completion.at).replace(/\s/g, "");
          } },
        strips
          ? { id: "stripped", title: "Stripped", render: room => <Status status={room.strip?.completed ? "complete" : "open"} /> }
          : { id: "inspected", title: "Inspected", render: room => {
            if (room.state === "inspected" || (isDone(room, "housekeeper") && staff.some(person => person.id === room.housekeeper && person.selfInspect))) {
              return <Status iconOnly status="complete" />;
            }
            return staffName(room.inspector)
              ? <Status iconOnly status="open" />
              : "—";
          } },
      ]} />
    </section>
  </PageLayout>;
}
