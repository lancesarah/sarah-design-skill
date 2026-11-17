"use client";

import { useState, type ReactNode } from "react";
import { Button, EditorDialog, Icon, Menu, Person, SectionHeader, SettingsCard, SettingsRow, type IconName, type MenuItem } from "@lance-live/sds";
import { SERVICES, UNASSIGNED, roomFloor, type Room, type RoomState, type Service, type Staff } from "./data";

type BulkPatch = Partial<Pick<Room, "housekeeper" | "inspector" | "state" | "service" | "dnd" | "pet" | "notes">>;
const STATES: { value: RoomState; label: string }[] = [
  { value: "dirty", label: "Not started" },
  { value: "cleaning", label: "In progress" },
  { value: "clean", label: "Clean" },
  { value: "inspected", label: "Inspected" },
];
const NO_CHANGE = { value: "", label: "No change" };
const BOOLEAN_OPTIONS = [NO_CHANGE, { value: "true", label: "Yes" }, { value: "false", label: "No" }];
const UNASSIGNED_OPTION = { value: UNASSIGNED, label: "Unassigned", content: <Person name="Unassigned" variant="unassigned" /> };

function parseRoomNumbers(input: string) {
  return input.trim().replace(/\s*[-–]\s*/g, "-").split(/[\s,]+/).filter(Boolean).map(item => {
    const range = /^(\d+)(?:-(\d+))?$/.exec(item);
    if (!range) return null;
    const start = Number(range[1]);
    const end = Number(range[2] ?? start);
    return Number.isSafeInteger(start) && Number.isSafeInteger(end) && start <= end ? { start, end } : null;
  });
}

function EditField({ label, children }: { label: string; children: ReactNode }) {
  return <div className="editor-field"><span className="editor-field-label">{label}</span>{children}</div>;
}

export function BulkEditDialog({ rooms, staff, onClose, onApply }: {
  rooms: Room[];
  staff: Staff[];
  onClose: () => void;
  onApply: (ids: Set<string>, patch: BulkPatch) => void;
}) {
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [numbers, setNumbers] = useState("");
  const [changes, setChanges] = useState<BulkPatch>({});
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const ranges = parseRoomNumbers(numbers);
  const invalidNumbers = ranges.includes(null) || (Boolean(numbers.trim()) && !ranges.length);
  const attendants = staff.filter(person => person.role === "housekeeper");
  const attendantIds = new Set(attendants.map(person => person.id));
  const floors = [...new Set(rooms.map(room => roomFloor(room.number)).filter(Boolean))].sort((a, b) => Number(a) - Number(b));
  const types = [...new Set(rooms.map(room => room.type))].sort();

  const hasTarget = Boolean(numbers.trim()) || Object.values(filters).some(Boolean);
  const matched = hasTarget && !invalidNumbers ? rooms.filter(room => (
    (!filters.service || room.service === filters.service) &&
    (!filters.state || room.state === filters.state) &&
    (!filters.floor || roomFloor(room.number) === filters.floor) &&
    (!filters.type || room.type === filters.type) &&
    (!filters.housekeeper || (attendantIds.has(room.housekeeper) ? room.housekeeper : UNASSIGNED) === filters.housekeeper) &&
    (!ranges.length || /^\d+$/.test(room.number) && ranges.some(range => range && Number(room.number) >= range.start && Number(room.number) <= range.end))
  )) : [];
  const patch = Object.fromEntries(Object.entries(changes).filter(([key, value]) =>
    value !== undefined && value !== "" && (key !== "notes" || String(value).trim()),
  )) as BulkPatch;
  const canApply = matched.length > 0 && Object.keys(patch).length > 0;
  const applyLabel = hasTarget && !invalidNumbers
    ? `Apply to ${matched.length} ${matched.length === 1 ? "room" : "rooms"}`
    : "Apply to rooms";

  function staffItems(people: Staff[]): MenuItem[] {
    return people.map(person => ({
      value: person.id,
      label: person.name,
      content: <Person name={person.name} initials={person.initials} variant="pill" />,
    }));
  }

  function menu(label: string, icon: IconName, value: string, items: MenuItem[], select: (value: string) => void) {
    return <Menu triggerLabel={label} placeholderIcon={icon} value={value} items={items} onValueChange={select} open={activeMenu === label} onOpenChange={open => setActiveMenu(current => open ? label : current === label ? null : current)} />;
  }

  function filter(key: string, label: string, any: string, items: MenuItem[]) {
    return menu(label, "filter", filters[key] ?? "", [{ value: "", label: any }, ...items], value => setFilters(current => ({ ...current, [key]: value })));
  }

  function setChange<K extends keyof BulkPatch>(key: K, value: BulkPatch[K]) {
    setChanges(current => ({ ...current, [key]: value }));
  }

  return <EditorDialog kicker="Bulk edit" title="" className="board-bulk-dialog" layout="pills" onClose={onClose} onEscape={() => {
    if (!activeMenu) return false;
    setActiveMenu(null);
    return true;
  }} footer={<Button disabled={!canApply} onClick={() => onApply(new Set(matched.map(room => room.id)), patch)}>
    <Icon name="check" />{applyLabel}
  </Button>}>
    <div className="board-bulk-section">
      <span className="editor-field-label">Filter rooms</span>
      <div className="board-bulk-filters">
        {filter("service", "Service filter", "Any service", SERVICES)}
        {filter("state", "Status filter", "Any status", STATES)}
        {filter("floor", "Floor filter", "Any floor", floors.map(value => ({ value, label: `Floor ${value}` })))}
        {filter("type", "Room type filter", "Any type", types.map(value => ({ value, label: value })))}
        {filter("housekeeper", "Attendant filter", "Any attendant", [UNASSIGNED_OPTION, ...staffItems(attendants)])}
      </div>
      <label className="editor-field">
        <span className="editor-field-label">Room numbers</span>
        <input className="sds editor-field-input" placeholder="e.g. 215, 216, 401–415" aria-invalid={invalidNumbers || undefined} value={numbers} onChange={event => setNumbers(event.target.value)} />
      </label>
      {invalidNumbers ? <p className="board-upload-error" role="alert">Enter room numbers or ranges like 401–415.</p> : hasTarget ? <p className="hk-help board-bulk-count" role="status">{matched.length} {matched.length === 1 ? "room" : "rooms"} matched</p> : null}
    </div>
    <hr className="board-bulk-rule" />
    <div className="board-bulk-section">
      <div className="board-bulk-changes-heading">
        <SectionHeader icon="edit" title="Changes" />
        <p className="editor-field-label">Leave any field as “No change” to skip it.</p>
      </div>
      <div className="editor-fields">
        <EditField label="Attendant">{menu("Attendant", "user", changes.housekeeper ?? "", [NO_CHANGE, UNASSIGNED_OPTION, ...staffItems(attendants)], value => setChange("housekeeper", value))}</EditField>
        <EditField label="Inspector">{menu("Inspector", "user", changes.inspector ?? "", [NO_CHANGE, UNASSIGNED_OPTION, ...staffItems(staff.filter(person => person.role === "inspector"))], value => setChange("inspector", value))}</EditField>
        <EditField label="Status">{menu("Status", "check", changes.state ?? "", [NO_CHANGE, ...STATES], value => setChange("state", value ? value as RoomState : undefined))}</EditField>
        <EditField label="Service">{menu("Service", "clean-full", changes.service ?? "", [NO_CHANGE, ...SERVICES], value => setChange("service", value ? value as Service : undefined))}</EditField>
      </div>
      <SettingsCard label="Room flags">
        <SettingsRow label="Do not disturb" icon="moon">{menu("Do not disturb", "moon", String(changes.dnd ?? ""), BOOLEAN_OPTIONS, value => setChange("dnd", value ? value === "true" : undefined))}</SettingsRow>
        <SettingsRow label="Guest has a pet" icon="paw">{menu("Guest has a pet", "paw", String(changes.pet ?? ""), BOOLEAN_OPTIONS, value => setChange("pet", value ? value === "true" : undefined))}</SettingsRow>
      </SettingsCard>
      <label className="editor-field">
        <span className="editor-field-label">Notes</span>
        <textarea className="sds text-well" placeholder="Set notes on all matched rooms…" value={changes.notes ?? ""} onChange={event => setChange("notes", event.target.value)} />
      </label>
    </div>
  </EditorDialog>;
}
