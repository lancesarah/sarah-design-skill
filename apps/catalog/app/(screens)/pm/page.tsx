"use client";

import {
  ASSIGNEE_PEOPLE,
  ActivityFeed,
  Avatar,
  Button,
  CHIP_LABEL_INSET,
  ConfirmDialog,
  DataTable,
  AssigneeCell,
  DetailPanel,
  EditorDialog,
  FactRow,
  Empty,
  Icon,
  OverlayMenu,
  Person,
  Tabs,
  Meter,
  Status,
  StatusCell,
  TITLE_TEXT_INSET,
  TableChip,
  TaskAssignee,
  Toast,
  captureClose,
  taskMenuItem,
  useTableMenu,
  type ActivityItem,
  type DataColumn,
  type StatusValue,
} from "@lance-live/gallery-ui";
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from "react";
import { createPortal, flushSync } from "react-dom";
import { FilterMenu, SearchBox } from "../chrome";
import { Glyph } from "../glyph";
import { EditText } from "../edit-text";
import { EditorPick } from "../editor-pick";
import { PageLayout, PageTitle, type TitlePage } from "../page-layout";

type Cadence = "weekly" | "monthly" | "quarterly" | "semiannual" | "annual";
type GroupId = "guestrooms" | "weekly" | "monthly";
type TemplateType = "mechanical" | "life" | "building";
type Scope = "upcoming" | "all";

type Mark = { kind: "empty" } | { kind: "done" } | { kind: "ratio"; done: number; total: number };

type CrewMember = { name: string; initials: string };
type CheckMark = "none" | "open" | "pass" | "fail";
type StepResponse = "check" | "reading";
type CheckItem = {
  id: string;
  label: string;
  state: CheckMark;
  issue?: string;
  photo?: string;
  photos?: string[];
  areaId?: string;
  required?: boolean;
  response?: StepResponse;
  unit?: string;
  min?: string;
  max?: string;
};
type CheckGroup = { id: string; title: string; items: CheckItem[] };

type Template = {
  id: string;
  group: GroupId;
  type: TemplateType;
  active: boolean;
  name: string;
  cadence: Cadence;
  pace: string;
  periods: [Mark, Mark, Mark];
  cycleDone: number;
  cycleTotal: number;
  due: string;
  dueOrder: number;
  place: string;
  note: string;
  status: StatusValue;
  assignee: string;
  initials: string;
  /** Guestroom programs are shared. Absent on a single-person check. */
  crew?: CrewMember[];
  completedOn?: string;
  minutes?: number;
  observations?: string;
  checklist?: CheckGroup[];
  areas?: { id: string; name: string; place: string; status?: StatusValue; recordedDays?: number; vacant?: boolean }[];
  activity: ActivityItem[];
};

const UPCOMING_THROUGH = 20261113;

const PLACES = ["Guestrooms", "Pool", "Spa", "Kitchen", "Laundry", "Elevator", "Engineering", "Floors 2–4", "Garage", "Lobby", "Mechanical", "Corridors", "Roof", "Stairwells", "Building"];

const RESPONSES: Array<{ value: StepResponse; label: string }> = [
  { value: "check", label: "Check" },
  { value: "reading", label: "Reading" },
];

const TYPES: Array<{ value: TemplateType; label: string }> = [
  { value: "mechanical", label: "Mechanical" },
  { value: "life", label: "Life safety" },
  { value: "building", label: "Building" },
];

const CADENCES: Array<{ value: Cadence; label: string }> = [
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "semiannual", label: "Semi-annual" },
  { value: "annual", label: "Annual" },
];

const GROUPS: Array<{ id: GroupId; title: string; headers: [string, string, string] }> = [
  { id: "guestrooms", title: "Guestrooms", headers: ["'26 Q1", "'26 Q2", "'26 Q3"] },
  { id: "weekly", title: "Weekly", headers: ["Oct 19", "Oct 26", "Nov 2"] },
  { id: "monthly", title: "Monthly", headers: ["Aug", "Sep", "Oct"] },
];

const empty: Mark = { kind: "empty" };
const done: Mark = { kind: "done" };
const ratio = (doneCount: number, total: number): Mark => ({ kind: "ratio", done: doneCount, total });

function typeLabel(value: TemplateType) {
  return TYPES.find((item) => item.value === value)?.label ?? "Building";
}

function areaCount(template: Template) {
  const count = template.areas?.length ?? 0;
  if (count === 0) return "—";
  return count === 1 ? "1 area" : `${count} areas`;
}

function cadenceLabel(value: Cadence) {
  return CADENCES.find((item) => item.value === value)?.label ?? value;
}

function durationLabel(minutes: number) {
  const whole = Math.max(0, Math.round(minutes));
  const hours = Math.floor(whole / 60);
  const rest = whole % 60;
  if (hours && rest) return `${hours}h ${rest}m`;
  if (hours) return `${hours}h`;
  return `${rest}m`;
}

function cycleRange(template: Template) {
  const year = Math.floor(template.dueOrder / 10000);
  const month = Math.floor((template.dueOrder % 10000) / 100) - 1;
  const day = template.dueOrder % 100;
  const end = new Date(year, month, day);
  const start = new Date(end);
  if (template.cadence === "weekly") start.setDate(end.getDate() - 6);
  else if (template.cadence === "monthly") start.setDate(1);
  else if (template.cadence === "quarterly") {
    start.setMonth(end.getMonth() - 2);
    start.setDate(1);
  } else if (template.cadence === "semiannual") {
    start.setMonth(end.getMonth() - 5);
    start.setDate(1);
  } else {
    start.setMonth(0);
    start.setDate(1);
  }
  const format = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" });
  return `${format.format(start)} – ${format.format(end)}`;
}

function periodRange(group: GroupId, label: string) {
  const format = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" });
  if (group === "guestrooms") {
    const quarter = Number(label.match(/Q(\d)/)?.[1] ?? 1);
    const start = new Date(2026, (quarter - 1) * 3, 1);
    const end = new Date(2026, quarter * 3, 0);
    return `${format.format(start)} – ${format.format(end)}`;
  }
  if (group === "monthly") {
    const month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].indexOf(label);
    const start = new Date(2026, month, 1);
    const end = new Date(2026, month + 1, 0);
    return `${format.format(start)} – ${format.format(end)}`;
  }
  const end = new Date(`${label}, 2026`);
  const start = new Date(end);
  start.setDate(end.getDate() - 6);
  return `${format.format(start)} – ${format.format(end)}`;
}

function groupTitle(id: GroupId) {
  return GROUPS.find((group) => group.id === id)?.title ?? id;
}

function scheduled(text: string, time: string): ActivityItem[] {
  return [{ kind: "status", name: "Sarah", initials: "SM", text, time }];
}

function isUpcoming(template: Template) {
  return template.cycleDone < template.cycleTotal && template.dueOrder <= UPCOMING_THROUGH;
}

/** Days since the last recorded PM. Done rooms are recent. Open rooms go back a cycle or more. */
function lastRecorded(index: number, status: StatusValue, salt: number) {
  const mix = (index * 17 + salt) % 97;
  if (status === "complete") return 1 + (mix % 21);
  if (status === "progress") return 1 + (mix % 9);
  return 40 + ((index * 29 + salt) % 141);
}

function recordedAgo(days: number) {
  if (days < 1) return "Today";
  return `${days}d ago`;
}

/** One area per guestroom. Twenty rooms a floor, starting at 101. Statuses are spread through the list. */
function guestroomAreas(prefix: string, count: number, complete: number, progress: number) {
  const perFloor = 20;
  const step = 7;
  const salt = [...prefix].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const marks: StatusValue[] = Array.from({ length: count }, (_, index) => {
    if (index < complete) return "complete";
    if (index < complete + progress) return "progress";
    return "open";
  });
  return Array.from({ length: count }, (_, index) => {
    const floor = Math.floor(index / perFloor) + 1;
    const number = floor * 100 + (index % perFloor) + 1;
    const status = marks[(index * step) % count];
    return {
      id: `${prefix}-${number}`,
      name: `Room ${number}`,
      place: `Floor ${floor}`,
      status,
      recordedDays: lastRecorded(index, status, salt),
      vacant: (index * 5 + (salt % 5)) % 6 === 0,
    };
  });
}

const STARTER: Template[] = [
  { id: "shower", group: "guestrooms", type: "building", active: true, name: "Shower door PM", cadence: "quarterly", pace: "2/day to finish by Dec 31", periods: [ratio(57, 102), ratio(58, 102), empty], cycleDone: 0, cycleTotal: 102, due: "Dec 31", dueOrder: 20261231, place: "Guestrooms", note: "Check the sweep, the latch, and the closer on each shower door.", status: "open", assignee: "Sarah", initials: "SM", crew: [{ name: "Sarah", initials: "SM" }, { name: "Paul", initials: "PG" }], activity: scheduled("opened this cycle", "Oct 1"), areas: guestroomAreas("shower", 102, 57, 8) },
  { id: "make-right", group: "guestrooms", type: "building", active: true, name: "Make-it-right guestroom PM", cadence: "semiannual", pace: "3/day to finish by Dec 31", periods: [empty, ratio(2, 145), ratio(1, 145)], cycleDone: 0, cycleTotal: 145, due: "Dec 31", dueOrder: 20261231, place: "Guestrooms", note: "Walk the room for the items on the make-it-right list.", status: "open", assignee: "Mark", initials: "MJ", crew: [{ name: "Mark", initials: "MJ" }, { name: "Boris", initials: "B" }], activity: scheduled("opened this cycle", "Oct 1"), areas: guestroomAreas("mir", 145, 2, 4) },
  { id: "carpet", group: "guestrooms", type: "building", active: true, name: "Carpet cleaning", cadence: "quarterly", pace: "3/day to finish by Dec 31", periods: [ratio(37, 145), ratio(4, 145), ratio(34, 145)], cycleDone: 0, cycleTotal: 145, due: "Dec 31", dueOrder: 20261231, place: "Guestrooms", note: "Schedule the rooms and confirm the dry time before the next arrival.", status: "open", assignee: "Paul", initials: "PG", crew: [{ name: "Paul", initials: "PG" }, { name: "Sarah", initials: "SM" }], activity: scheduled("opened this cycle", "Oct 1"), areas: guestroomAreas("carpet", 145, 37, 6) },
  { id: "way-of-clean", group: "guestrooms", type: "building", active: true, name: "Guestroom way of clean", cadence: "quarterly", pace: "", periods: [ratio(62, 145), ratio(102, 145), ratio(101, 145)], cycleDone: 41, cycleTotal: 145, due: "Dec 31", dueOrder: 20261231, place: "Guestrooms", note: "Score the room against the way-of-clean checklist.", status: "progress", assignee: "Sarah", initials: "SM", crew: [{ name: "Sarah", initials: "SM" }, { name: "Mark", initials: "MJ" }, { name: "Boris", initials: "B" }], activity: scheduled("started this cycle", "Oct 6"), areas: guestroomAreas("woc", 145, 41, 12) },
  { id: "garage", group: "weekly", type: "building", active: true, name: "Parking garage and lot", cadence: "weekly", pace: "", periods: [done, empty, done], cycleDone: 0, cycleTotal: 1, due: "Nov 9", dueOrder: 20261109, place: "Garage", note: "Walk the garage for lights, leaks, and the gate.", status: "open", assignee: "Boris", initials: "B", activity: scheduled("scheduled this check", "Nov 2") },
  { id: "pool-lift", group: "weekly", type: "life", active: true, name: "ADA pool lift review", cadence: "weekly", pace: "", periods: [empty, done, empty], cycleDone: 0, cycleTotal: 1, due: "Nov 9", dueOrder: 20261109, place: "Pool", note: "Run the lift through a full cycle and check the belt.", status: "open", assignee: "Paul", initials: "PG", activity: scheduled("scheduled this check", "Nov 2") },
  { id: "dryer", group: "weekly", type: "mechanical", active: true, name: "Dryer lint screen", cadence: "weekly", pace: "", periods: [done, done, empty], cycleDone: 0, cycleTotal: 1, due: "Nov 9", dueOrder: 20261109, place: "Laundry", note: "Clear the lint screen and the exhaust path.", status: "progress", assignee: "Paul", initials: "PG", activity: [...scheduled("scheduled this check", "Nov 2"), { kind: "status", name: "Paul", initials: "PG", text: "started this check", time: "Nov 6" }] },
  { id: "thermistor", group: "weekly", type: "mechanical", active: true, name: "House dryer thermistor", cadence: "weekly", pace: "", periods: [empty, empty, empty], cycleDone: 0, cycleTotal: 1, due: "Nov 4", dueOrder: 20261104, place: "Laundry", note: "Read the thermistor and confirm the high-limit.", status: "open", assignee: "Unassigned", initials: "", activity: scheduled("scheduled this check", "Oct 28") },
  { id: "blowdown", group: "weekly", type: "mechanical", active: true, name: "Boiler blowdown", cadence: "weekly", pace: "", periods: [done, done, done], cycleDone: 1, cycleTotal: 1, due: "Nov 2", dueOrder: 20261102, place: "Mechanical", note: "Blow down the boiler and log the sight glass.", status: "complete", assignee: "Sarah", initials: "SM", completedOn: "Nov 2", minutes: 55, activity: [...scheduled("scheduled this check", "Oct 26"), { kind: "status", name: "Sarah", initials: "SM", text: "completed this check", time: "Nov 2" }] },
  { id: "extinguisher", group: "monthly", type: "life", active: true, name: "Fire extinguisher inspection", cadence: "monthly", pace: "", periods: [ratio(12, 12), ratio(12, 12), ratio(11, 12)], cycleDone: 4, cycleTotal: 12, due: "Nov 30", dueOrder: 20261130, place: "Corridors", note: "Confirm each extinguisher is charged and unobstructed.", status: "progress", assignee: "Boris", initials: "B", activity: scheduled("started this cycle", "Nov 1"), areas: [{ id: "ext-lobby", name: "Lobby", place: "Floor 1", status: "complete", recordedDays: 6 }, { id: "ext-east", name: "Floor 2 east", place: "Floor 2", status: "complete", recordedDays: 12 }, { id: "ext-west", name: "Floor 3 west", place: "Floor 3", status: "progress", recordedDays: 3 }, { id: "ext-kitchen", name: "Kitchen", place: "Floor 1", status: "open", recordedDays: 41 }] },
  { id: "ice", group: "monthly", type: "mechanical", active: true, name: "Ice machine sanitation", cadence: "monthly", pace: "", periods: [empty, done, done], cycleDone: 0, cycleTotal: 1, due: "Nov 30", dueOrder: 20261130, place: "Kitchen", note: "Empty, sanitize, and rinse the bin.", status: "open", assignee: "Mark", initials: "MJ", activity: scheduled("scheduled this check", "Nov 1") },
  { id: "roof", group: "monthly", type: "building", active: true, name: "Roof drain check", cadence: "monthly", pace: "", periods: [done, empty, done], cycleDone: 0, cycleTotal: 1, due: "Nov 30", dueOrder: 20261130, place: "Roof", note: "Clear the drains and look for ponding.", status: "open", assignee: "Paul", initials: "PG", activity: scheduled("scheduled this check", "Nov 1") },
  { id: "lights", group: "monthly", type: "life", active: true, name: "Emergency light test", cadence: "monthly", pace: "", periods: [ratio(8, 8), ratio(8, 8), ratio(8, 8)], cycleDone: 3, cycleTotal: 8, due: "Nov 30", dueOrder: 20261130, place: "Stairwells", note: "Push-test each emergency fixture.", status: "progress", assignee: "Sarah", initials: "SM", activity: scheduled("started this cycle", "Nov 1"), areas: [{ id: "light-a", name: "Stair A", place: "Tower", status: "complete", recordedDays: 8 }, { id: "light-b", name: "Stair B", place: "Tower", status: "progress", recordedDays: 2 }, { id: "light-c", name: "Stair C", place: "Tower", status: "open", recordedDays: 38 }, { id: "light-park", name: "Parking stair", place: "Garage", status: "open", recordedDays: 96 }] },
];

function checkItems(labels: string[]): CheckItem[] {
  return labels.map((label, index) => ({ id: String(index + 1), label, state: "none" as const }));
}

function checkGroups(groups: Array<[string, string[]]>): CheckGroup[] {
  return groups.map(([title, labels], index) => ({ id: String(index + 1), title, items: checkItems(labels) }));
}

const CHECKLISTS: Record<string, CheckGroup[]> = {
  shower: checkGroups([["Door", ["Sweep meets the curb", "Latch holds", "Closer finishes the swing"]]]),
  "make-right": checkGroups([["Room", ["Items on the list are present", "Nothing is left for the next guest", "The room matches the standard"]]]),
  carpet: checkGroups([["Schedule", ["Rooms are booked", "Dry time clears the next arrival", "The crew has the floor plan"]]]),
  "way-of-clean": checkGroups([["Room", ["Surfaces match the standard", "The bathroom is complete", "The score is logged"]]]),
  garage: checkGroups([
    ["Lights", ["Deck fixtures are on", "No bay is dark", "Emergency lights answer"]],
    ["Gate and leaks", ["The gate cycles", "No standing water", "No oil on the deck"]],
  ]),
  "pool-lift": checkGroups([["Lift", ["The lift runs a full cycle", "The belt is intact", "The controls return to rest"]]]),
  dryer: checkGroups([["Lint path", ["The screen is clear", "The exhaust is open", "Nothing is stored against the dryer"]]]),
  thermistor: checkGroups([["Reading", ["The thermistor is in range", "The high-limit holds", "The reading is logged"]]]),
  blowdown: checkGroups([["Boiler", ["The blowdown is complete", "The sight glass is logged", "The valves are closed"]]]),
  extinguisher: checkGroups([["Extinguisher", ["The gauge is charged", "The pin and seal are in place", "The unit is unobstructed"]]]),
  ice: checkGroups([["Bin", ["The bin is empty", "The bin is sanitized", "The bin is rinsed"]]]),
  roof: checkGroups([["Drains", ["The drains are clear", "No ponding on the roof", "The scuppers are open"]]]),
  lights: checkGroups([["Fixtures", ["Each fixture answers the test", "A dark lamp is replaced", "The result is logged"]]]),
};

function checksFor(template: Template) {
  return template.checklist ?? CHECKLISTS[template.id] ?? [];
}

type HistoryRow = {
  id: string;
  name: string;
  place: string;
  /** Set when the check was done in one guestroom. */
  room?: string;
  cadence: string;
  assignee: string;
  initials: string;
  completed: string;
  minutes: number;
  notes?: string;
};

/** Completions inside the seven days ending Nov 6. The average of these minutes is 52. */
const RECENT: HistoryRow[] = [
  { id: "recent-shower", name: "Shower door PM", place: "Guestrooms", room: "214", cadence: "Quarterly", assignee: "Sarah", initials: "SM", completed: "Nov 5", minutes: 40, notes: "Door sweep is worn on 214." },
  { id: "recent-carpet", name: "Carpet cleaning", place: "Guestrooms", room: "318", cadence: "Quarterly", assignee: "Paul", initials: "PG", completed: "Nov 4", minutes: 48 },
  { id: "recent-blow", name: "Boiler blowdown", place: "Mechanical", cadence: "Weekly", assignee: "Sarah", initials: "SM", completed: "Nov 2", minutes: 55, notes: "Sight glass was cloudy. Logged and cleared." },
  { id: "recent-ext", name: "Fire extinguisher inspection", place: "Corridors", cadence: "Monthly", assignee: "Boris", initials: "B", completed: "Oct 31", minutes: 62, notes: "One tag is missing in the west corridor." },
  { id: "recent-lift", name: "ADA pool lift review", place: "Pool", cadence: "Weekly", assignee: "Paul", initials: "PG", completed: "Oct 30", minutes: 70 },
  { id: "recent-dryer", name: "Dryer lint screen", place: "Laundry", cadence: "Weekly", assignee: "Paul", initials: "PG", completed: "Oct 30", minutes: 37 },
];

const ROOM_LOG_MINUTES = 2255;
const ROOM_LOG_ROOMS = 41;

function assignPatch(value: string) {
  const person = ASSIGNEE_PEOPLE.find((item) => item.name === value);
  return {
    assignee: value === "unassigned" ? "Unassigned" : value,
    initials: value === "unassigned" ? "" : (person?.avatar ?? ""),
  };
}

function crewPatch(current: CrewMember[], name: string): Partial<Template> {
  const person = ASSIGNEE_PEOPLE.find((item) => item.name === name);
  const member = { name, initials: person?.avatar ?? "" };
  const crew = current.some((item) => item.name === name)
    ? current.filter((item) => item.name !== name)
    : [...current, member];
  const first = crew[0];
  return { crew, assignee: first?.name ?? "Unassigned", initials: first?.initials ?? "" };
}

function showCrewTip(host: HTMLElement) {
  const tip = host.querySelector<HTMLElement>(".tip");
  const anchor = host.querySelector(".pm-crew-faces") ?? host;
  if (!tip) return;
  const box = anchor.getBoundingClientRect();
  tip.style.position = "fixed";
  tip.style.left = `${box.left + box.width / 2}px`;
  tip.style.top = `${box.top - 8}px`;
  tip.style.bottom = "auto";
  tip.style.transform = "translate(-50%, -100%)";
  try {
    if (!tip.matches(":popover-open")) tip.showPopover();
  } catch {
    // The tip can already be opening as the pointer crosses the circles.
  }
}

function hideCrewTip(host: HTMLElement | null) {
  const tip = host?.querySelector<HTMLElement>(".tip");
  if (!tip?.matches(":popover-open")) return;
  try {
    tip.hidePopover();
  } catch {
    // The tip can already be closed when the pointer leaves.
  }
}

function CrewFaces({ people }: { people: CrewMember[] }) {
  const extra = people.length > 3 ? people.length - 2 : 0;
  const shown = extra > 0 ? people.slice(0, 2) : people.length > 0 ? people : [{ name: "Unassigned", initials: "" }];
  return (
    <span className="pm-crew-faces">
      {shown.map((person) => (
        <span key={person.name} className={["mini-pill", person.initials ? "" : "is-empty"].filter(Boolean).join(" ")}>
          <span className={["avatar", "mini", person.initials ? "" : "is-empty"].filter(Boolean).join(" ")}>{person.initials || null}</span>
        </span>
      ))}
      {extra > 0 ? (
        <span className="mini-pill is-more">
          <span className="avatar mini">{extra}+</span>
        </span>
      ) : null}
      <Icon name="chevron" size={10} className="sheet-edit" />
    </span>
  );
}

function CrewAssign({
  people,
  named = false,
  open,
  onToggle,
  onChange,
}: {
  people: CrewMember[];
  named?: boolean;
  open: boolean;
  onToggle: () => void;
  onChange: (name: string) => void;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const label = people.length > 0 ? people.map((person) => person.name).join(", ") : "Unassigned";
  useEffect(() => {
    if (!open) return;
    const close = (event: PointerEvent) => {
      const target = event.target;
      if (ref.current?.contains(target as Node) || (target instanceof Element && target.closest(".menu"))) return;
      onToggle();
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [open, onToggle]);
  return (
    <>
      <button
        ref={ref}
        type="button"
        className={named ? "pm-crew-names" : ["sheet-who", "pm-crew", "tip-host", people.length === 0 ? "is-empty" : ""].filter(Boolean).join(" ")}
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        onPointerDown={(event) => event.stopPropagation()}
        onClick={(event) => {
          event.stopPropagation();
          onToggle();
        }}
        onPointerEnter={() => {
          if (!named && ref.current) showCrewTip(ref.current);
        }}
        onPointerLeave={() => {
          if (!named) hideCrewTip(ref.current);
        }}
      >
        {named ? (
          people.length > 0 ? people.map((person) => <Person key={person.name} variant="pill" name={person.name} initials={person.initials} />) : <Person name="Unassigned" variant="unassigned" />
        ) : (
          <CrewFaces people={people} />
        )}
        {named ? <Icon name="chevron" size={10} className="sheet-edit" /> : null}
        {named ? null : (
          <span className="tip" popover="manual">
            {label}
          </span>
        )}
      </button>
      <OverlayMenu open={open} anchorRef={ref} label="Assigned" onPointerDown={(event) => event.stopPropagation()}>
        {ASSIGNEE_PEOPLE.map((person) => {
          const checked = people.some((item) => item.name === person.name);
          return (
            <button
              key={person.name}
              className="menu-item"
              type="button"
              role="menuitemcheckbox"
              aria-checked={checked}
              onClick={() => onChange(person.name)}
            >
              <Person variant="pill" name={person.name} initials={person.avatar} />
              <Icon name="check" size={14} className="check" />
            </button>
          );
        })}
      </OverlayMenu>
    </>
  );
}

function PlaceCell({
  value,
  open,
  onToggle,
  onChange,
}: {
  value: string;
  open: boolean;
  onToggle: () => void;
  onChange: (value: string) => void;
}) {
  const places = value && !PLACES.includes(value) ? [value, ...PLACES] : PLACES;
  return (
    <TableChip
      open={open}
      onToggle={onToggle}
      style={{ fontSize: "var(--text-14)", fontWeight: 400, lineHeight: "16px" }}
      menu={places.map((place) =>
        taskMenuItem(place, place === value, () => {
          onChange(place);
          onToggle();
        }, place),
      )}
    >
      <span style={value ? undefined : { color: "var(--black-50)" }}>{value || "Location"}</span>
    </TableChip>
  );
}

/** Widest header and value across the groups, so each table reserves the same column. */
const PERIOD_FLOOR = [...new Set(GROUPS.flatMap((group) => [...group.headers])), "102/145"];

function columnFloor(id: string, samples: readonly string[]) {
  return (
    <>
      {samples.map((sample) => (
        <span key={sample} data-col={id} className="sheet-when" style={{ display: "inline-block", whiteSpace: "nowrap" }}>
          {sample}
        </span>
      ))}
    </>
  );
}

function CountMark({ done, total, className }: { done: number; total: number; className: string }) {
  if (done === 1 && total === 1) {
    return (
      <span className={className} aria-label="1/1">
        <Icon name="check" size={14} />
      </span>
    );
  }
  return <span className={className} style={{ fontVariantNumeric: "var(--numeric)" }}>{done}/{total}</span>;
}

function PeriodCell({ mark, label, onOpen }: { mark: Mark; label: string; onOpen?: () => void }) {
  if (mark.kind === "empty" || !onOpen) {
    if (mark.kind === "ratio") return <CountMark done={mark.done} total={mark.total} className="sheet-when" />;
    if (mark.kind === "done") return <CountMark done={1} total={1} className="sheet-when" />;
    return <span className="sheet-when" style={{ color: "var(--black-50)" }}>—</span>;
  }
  if (mark.kind === "done") {
    return (
      <button type="button" className="chip chip-icon" aria-label={`Open ${label}, 1 of 1`} onClick={onOpen}>
        <Icon name="check" size={14} />
      </button>
    );
  }
  return (
    <button type="button" className="chip" aria-label={`Open ${label}, ${mark.done} of ${mark.total}`} onClick={onOpen}>
      {mark.done}/{mark.total}
    </button>
  );
}

function closedStamp(value: string) {
  if (value.includes("·")) return value;
  const time = value === "Nov 2" ? "6:14 PM" : "5:40 PM";
  return `${value}, 2026 · ${time}`;
}

function statusPatch(template: Template, status: StatusValue): Partial<Template> {
  if (status !== "complete") return { status, completedOn: undefined };
  return { status, completedOn: template.completedOn || "Nov 6", minutes: template.minutes || 52, cycleDone: template.cycleTotal };
}

function TemplateDetail({
  template,
  hidden,
  onClose,
  onExited,
  onPatch,
}: {
  template: Template;
  hidden: boolean;
  onClose: () => void;
  onExited: () => void;
  onPatch: (patch: Partial<Template>) => void;
}) {
  const [field, setField] = useState<"place" | "status" | "crew" | null>(null);
  const toggle = (next: "place" | "status" | "crew") => setField((current) => (current === next ? null : next));
  return (
    <DetailPanel label={template.name || "Template"} hidden={hidden} onClose={onClose} onExited={onExited} name={template.name || "Template"} noun="template">
      <div className="todo-side-desc">
        <span className="sheet-label">Notes</span>
        <EditText fill>
          <textarea
            className="text-well"
            rows={4}
            defaultValue={template.note}
            placeholder="Add a note"
            key={template.id}
            onBlur={(event) => onPatch({ note: event.target.value.trim() })}
          />
        </EditText>
      </div>
      <div className="todo-side-rule" />
      <div className="todo-side-meta">
        <FactRow label="Location">
          <PlaceCell value={template.place} open={field === "place"} onToggle={() => toggle("place")} onChange={(place) => onPatch({ place })} />
        </FactRow>
        <FactRow label="Assigned">
          {template.crew ? (
            <CrewAssign
              named
              people={template.crew}
              open={field === "crew"}
              onToggle={() => toggle("crew")}
              onChange={(name) => onPatch(crewPatch(template.crew ?? [], name))}
            />
          ) : (
            <TaskAssignee named name={template.assignee} initials={template.initials} style={{ background: "var(--sidebar-grey)" }} onSelect={(value) => onPatch(assignPatch(value))} />
          )}
        </FactRow>
        <FactRow label="Status">
          <StatusCell
            value={template.status}
            open={field === "status"}
            onToggle={() => toggle("status")}
            onChange={(status) => onPatch(statusPatch(template, status))}
          />
        </FactRow>
        <FactRow label="This cycle">
          <CountMark done={template.cycleDone} total={template.cycleTotal} className="sheet-when" />
        </FactRow>
        <FactRow label="Due">
          <span className="sheet-when" style={{ fontVariantNumeric: "var(--numeric)" }}>{template.due}</span>
        </FactRow>
      </div>
      <div className="todo-side-rule" />
      <ActivityFeed className="todo-side-activity" items={template.activity} />
    </DetailPanel>
  );
}

function BackTitle({
  parent,
  current,
  before,
  onBack,
}: {
  parent: string;
  current: string;
  before?: { label: string; onClick: () => void };
  onBack: () => void;
}) {
  return <PageTitle parent={parent} current={current} before={before} onBack={onBack} />;
}

function BackButton({ onBack }: { onBack: () => void }) {
  return (
    <Button variant="secondary" onClick={onBack}>
      <Icon name="chevron" size={14} className="pm-back-icon" />
      Back
    </Button>
  );
}

function isSingleCheck(template: Template) {
  return template.cycleTotal === 1;
}

/** The check page pushes in from the right. The header stays put. Keyboard and reduced motion land immediately. */
function shiftPage(direction: "forward" | "back", update: () => void) {
  const snap =
    document.documentElement.classList.contains("is-keys") ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (snap || typeof document.startViewTransition !== "function") {
    update();
    return;
  }
  document.documentElement.dataset.pmShift = direction;
  let transition: ViewTransition;
  try {
    transition = document.startViewTransition(() => {
      flushSync(update);
    });
  } catch {
    delete document.documentElement.dataset.pmShift;
    update();
    return;
  }
  transition.finished.finally(() => {
    if (document.documentElement.dataset.pmShift === direction) {
      delete document.documentElement.dataset.pmShift;
    }
  });
}

function CheckGroupTable({
  group,
  locked,
  idle,
  passed,
  allPassed,
  spot,
  leaving,
  grown,
  issue,
  photos,
  fileRef,
  onIssue,
  onPhotos,
  onCheckAll,
  onMark,
  onOpenMark,
  onLogFix,
}: {
  group: CheckGroup;
  locked?: boolean;
  idle?: boolean;
  passed: number;
  allPassed: boolean;
  spot: { groupId: string; itemId: string; kind: "open" | "fail" } | null;
  leaving: { groupId: string; itemId: string; kind: "open" | "fail" } | null;
  grown: boolean;
  issue: string;
  photos: string[];
  fileRef: RefObject<HTMLInputElement | null>;
  onIssue: (value: string) => void;
  onPhotos: (update: (current: string[]) => string[]) => void;
  onCheckAll: () => void;
  onMark: (itemId: string, state: CheckMark) => void;
  onOpenMark: (kind: "open" | "fail", item: CheckItem) => void;
  onLogFix: () => void;
}) {
  const columns = useMemo<DataColumn<CheckItem>[]>(() => [
    {
      id: "step",
      title: "Step",
      text: "primary",
      lines: 2,
      render: (item) => {
        const extended = spot?.groupId === group.id && spot.itemId === item.id;
        const panel = extended && spot ? spot : leaving?.groupId === group.id && leaving.itemId === item.id ? leaving : null;
        const statusKind = locked ? null : panel ? panel.kind : item.state === "open" || item.state === "fail" ? item.state : null;
        const photoCount = item.photos?.length ?? (item.photo ? 1 : 0);
        const photoLabel = photoCount === 0 ? "" : photoCount === 1 ? "1 photo" : `${photoCount} photos`;
        const caption = !extended && (item.issue?.trim() || photoLabel)
          ? [item.issue?.trim(), photoLabel].filter(Boolean).join(" · ")
          : "";
        return (
          <span className="pm-list-copy">
            <span className="pm-list-heading">
              <span>{item.label}</span>
              {statusKind ? (
                <span className="pm-list-status" data-mark={statusKind}>
                  {statusKind === "fail" ? "Needs work" : "Resolved on the spot"}
                </span>
              ) : null}
            </span>
            {caption ? <span className="pm-list-caption">{caption}</span> : null}
          </span>
        );
      },
    },
    {
      id: "marks",
      title: "",
      minWidth: 28 * 3 + 4 * 2 + 24,
      render: (item) => {
        const extended = spot?.groupId === group.id && spot.itemId === item.id;
        const pressed = extended && spot ? spot.kind : item.state;
        return (
          <span className="pm-list-marks">
            <button type="button" className="tip-host" data-mark="open" disabled={locked} aria-expanded={extended && spot?.kind === "open"} aria-pressed={!locked && pressed === "open"} aria-label="Resolved issue" onClick={() => onOpenMark("open", item)}>
              <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
                <circle cx="7" cy="7" r="5" fill="none" stroke="currentColor" strokeWidth="var(--icon-stroke)" />
              </svg>
              <span className="tip" role="tooltip" popover="manual">Resolved issue</span>
            </button>
            <button type="button" className="tip-host" disabled={locked} data-mark="pass" aria-pressed={locked || pressed === "pass"} aria-label="Done" onClick={() => onMark(item.id, "pass")}>
              <Icon name="check" size={14} />
              <span className="tip" role="tooltip" popover="manual">Done</span>
            </button>
            <button type="button" className="tip-host" disabled={locked} data-mark="fail" aria-expanded={extended && spot?.kind === "fail"} aria-pressed={!locked && pressed === "fail"} aria-label="Needs work" onClick={() => onOpenMark("fail", item)}>
              <Icon name="close" size={14} />
              <span className="tip" role="tooltip" popover="manual">Needs work</span>
            </button>
          </span>
        );
      },
    },
  ], [group.id, idle, leaving, locked, onMark, onOpenMark, spot]);

  return (
    <section className="pm-list-group" aria-label={group.title}>
      <div className="pm-list-head">
        <span>{group.title}</span>
        <span className="pm-list-count">{passed}/{group.items.length}</span>
        <button type="button" className="chip" disabled={locked} onClick={onCheckAll}>{allPassed ? "Uncheck all" : "Check all"}</button>
      </div>
      <DataTable
        variant="list"
        interactive={!locked && !idle}
        rows={group.items}
        columns={columns}
        empty="Nothing to show"
        wrapRow={(item, article) => {
          const extended = spot?.groupId === group.id && spot.itemId === item.id;
          const panel = extended && spot ? spot : leaving?.groupId === group.id && leaving.itemId === item.id ? leaving : null;
          if (!panel) return article;
          return (
            <>
              {article}
              <div className={extended && grown ? "pm-resolve-slot is-open" : "pm-resolve-slot"}>
                <div className="pm-resolve-clip">
                  <div className="pm-resolve">
                    <label>
                      <span className="sheet-label">What was wrong?</span>
                      <textarea
                        className="text-well"
                        rows={2}
                        value={issue}
                        placeholder="What you fixed"
                        onChange={(event) => onIssue(event.target.value)}
                      />
                    </label>
                    <div className="pm-resolve-foot">
                      <input
                        ref={extended ? fileRef : undefined}
                        type="file"
                        accept="image/*"
                        multiple
                        hidden
                        onChange={(event) => {
                          const names = [...(event.target.files ?? [])].map((file) => file.name);
                          if (names.length) onPhotos((current) => [...current, ...names]);
                          event.target.value = "";
                        }}
                      />
                      <Button variant="secondary" type="button" onClick={() => fileRef.current?.click()}>
                        {photos.length === 0 ? "Add photo" : photos.length === 1 ? "1 photo" : `${photos.length} photos`}
                      </Button>
                      <Button onClick={onLogFix}>
                        {panel.kind === "fail" ? "Submit work order" : "Log resolved fix"}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          );
        }}
      />
    </section>
  );
}

function Checklist({ groups, locked, idle, onChange, onNeedTimer }: { groups: CheckGroup[]; locked?: boolean; idle?: boolean; onChange: (groups: CheckGroup[]) => void; onNeedTimer?: () => void }) {
  const items = groups.flatMap((group) => group.items);
  const done = locked ? items.length : items.filter((item) => item.state === "pass").length;
  const total = items.length;
  const percent = total ? Math.round((done / total) * 100) : 0;
  const [spot, setSpot] = useState<{ groupId: string; itemId: string; kind: "open" | "fail" } | null>(null);
  const [leaving, setLeaving] = useState<typeof spot>(null);
  const [grown, setGrown] = useState(false);
  const [issue, setIssue] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (!idle || !spot) return;
    setSpot(null);
    setLeaving(null);
  }, [idle]);
  useEffect(() => {
    const onOver = (event: PointerEvent) => {
      const host = (event.target as Element | null)?.closest<HTMLElement>(".pm-list-marks .tip-host");
      if (!host) return;
      showCrewTip(host);
    };
    const onOut = (event: PointerEvent) => {
      const host = (event.target as Element | null)?.closest<HTMLElement>(".pm-list-marks .tip-host");
      if (!host) return;
      const next = event.relatedTarget;
      if (next instanceof Node && host.contains(next)) return;
      hideCrewTip(host);
    };
    document.addEventListener("pointerover", onOver);
    document.addEventListener("pointerout", onOut);
    return () => {
      document.removeEventListener("pointerover", onOver);
      document.removeEventListener("pointerout", onOut);
    };
  }, []);
  useEffect(() => {
    if (!leaving) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setLeaving(null);
      return;
    }
    const timer = window.setTimeout(() => setLeaving(null), 192);
    return () => window.clearTimeout(timer);
  }, [leaving]);
  useEffect(() => {
    if (!spot) {
      setGrown(false);
      return;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setGrown(true);
      return;
    }
    setGrown(false);
    let second = 0;
    const first = requestAnimationFrame(() => {
      second = requestAnimationFrame(() => setGrown(true));
    });
    return () => {
      cancelAnimationFrame(first);
      cancelAnimationFrame(second);
    };
  }, [spot?.groupId, spot?.itemId]);
  function dismiss() {
    if (spot) setLeaving(spot);
    setSpot(null);
  }
  function mark(groupId: string, itemId: string, state: CheckMark) {
    if (locked || idle) return;
    if (spot?.groupId === groupId && spot.itemId === itemId) dismiss();
    onChange(groups.map((group) => group.id !== groupId ? group : {
      ...group,
      items: group.items.map((item) => item.id !== itemId ? item : { ...item, state: item.state === state ? "none" : state }),
    }));
  }
  function checkAll(groupId: string) {
    if (locked || idle) return;
    if (spot?.groupId === groupId) dismiss();
    onChange(groups.map((group) => {
      if (group.id !== groupId) return group;
      const allPassed = group.items.every((item) => item.state === "pass");
      return {
        ...group,
        items: group.items.map((item) => ({ ...item, state: allPassed ? "none" : "pass" })),
      };
    }));
  }
  function openMark(kind: "open" | "fail", groupId: string, item: CheckItem) {
    if (locked || idle) return;
    const sameRow = spot?.groupId === groupId && spot.itemId === item.id;
    if (sameRow && spot.kind === kind) return;
    if (spot && !sameRow) setLeaving(spot);
    const same = item.state === kind;
    setIssue(same ? item.issue ?? "" : "");
    setPhotos(same ? item.photos ?? (item.photo ? [item.photo] : []) : []);
    if (fileRef.current) fileRef.current.value = "";
    if (item.state !== "none" && item.state !== kind) {
      onChange(groups.map((group) => group.id !== groupId ? group : {
        ...group,
        items: group.items.map((entry) => entry.id !== item.id ? entry : { ...entry, state: "none" }),
      }));
    }
    if (!sameRow) setGrown(false);
    setSpot({ groupId, itemId: item.id, kind });
  }
  function logFix() {
    if (!spot) return;
    onChange(groups.map((group) => group.id !== spot.groupId ? group : {
      ...group,
      items: group.items.map((item) => item.id !== spot.itemId ? item : {
        ...item,
        state: spot.kind,
        issue: issue.trim(),
        photo: undefined,
        photos: photos.length ? photos : undefined,
      }),
    }));
    dismiss();
  }
  if (groups.length === 0) return null;
  return (
    <div
      className={locked ? "pm-list is-locked" : idle ? "pm-list is-idle" : "pm-list"}
      onClick={(event) => {
        if (!idle) return;
        const target = event.target;
        if (!(target instanceof Element) || !target.closest(".pm-list-group")) return;
        onNeedTimer?.();
      }}
    >
      <div className="pm-list-progress">
        <div className="pm-list-progress-row">
          <span>Checklist progress</span>
          <span>{done} of {total} done · {percent}%</span>
        </div>
        <Meter value={done} max={total} label={`${done} of ${total} done`} />
      </div>
      <p className="pm-list-k">Checklist</p>
      {groups.map((group) => {
        const passed = locked ? group.items.length : group.items.filter((item) => item.state === "pass").length;
        const allPassed = group.items.length > 0 && passed === group.items.length;
        return (
          <CheckGroupTable
            key={group.id}
            group={group}
            locked={locked}
            idle={idle}
            passed={passed}
            allPassed={allPassed}
            spot={spot}
            leaving={leaving}
            grown={grown}
            issue={issue}
            photos={photos}
            fileRef={fileRef}
            onIssue={setIssue}
            onPhotos={setPhotos}
            onCheckAll={() => checkAll(group.id)}
            onMark={(itemId, state) => mark(group.id, itemId, state)}
            onOpenMark={(kind, item) => openMark(kind, group.id, item)}
            onLogFix={logFix}
          />
        );
      })}
    </div>
  );
}

function reorderById<T extends { id: string }>(list: T[], fromId: string, beforeId: string | null) {
  const from = list.findIndex((item) => item.id === fromId);
  if (from < 0) return list;
  const next = list.slice();
  const [item] = next.splice(from, 1);
  const index = beforeId ? next.findIndex((entry) => entry.id === beforeId) : next.length;
  if (index < 0) return list;
  next.splice(index, 0, item);
  return next;
}

/** The same drag as the sidebar: a grip, a lifted row, and a blue line where it will land. */
function useRowDrag(
  rootRef: RefObject<HTMLElement | null>,
  active: boolean,
  onMove: (kind: "group" | "step", groupId: string | null, fromId: string, beforeId: string | null) => void,
) {
  const onMoveRef = useRef(onMove);
  onMoveRef.current = onMove;

  useEffect(() => {
    if (!active) return;
    const root = rootRef.current;
    if (!root) return;
    let cancel = () => {};

    const onPointerDown = (event: PointerEvent) => {
      if (event.button !== 0) return;
      const grip = (event.target as Element | null)?.closest<HTMLElement>("[data-step-drag], [data-group-drag]");
      if (!grip || !root.contains(grip)) return;
      const step = grip.hasAttribute("data-step-drag");
      const item = step
        ? grip.closest<HTMLElement>("li[data-step-id]")
        : grip.closest<HTMLElement>("[data-group-id]");
      const list = step ? item?.closest<HTMLElement>(".pm-editor-rows") : item?.parentElement;
      if (!item || !list || !root.contains(list)) return;
      event.preventDefault();
      const rowSelector = step ? ":scope > li[data-step-id]" : ":scope > [data-group-id]";
      const originX = event.clientX;
      const originY = event.clientY;
      let drag: { ghost: HTMLElement; line: HTMLElement; originLeft: number; originTop: number; before: HTMLElement | null } | null = null;

      const placeLine = (clientY: number) => {
        if (!drag) return;
        const rows = [...list.querySelectorAll<HTMLElement>(rowSelector)];
        const from = rows.indexOf(item);
        let to = 0;
        let before: HTMLElement | null = null;
        for (const row of rows) {
          if (row === item) continue;
          const box = row.getBoundingClientRect();
          if (clientY < box.top + box.height / 2) {
            before = row;
            break;
          }
          to += 1;
        }
        if (to === from) {
          drag.line.hidden = true;
          drag.before = null;
          return;
        }
        const listBox = list.getBoundingClientRect();
        const edge = before ? before.getBoundingClientRect().top : rows.at(-1)!.getBoundingClientRect().bottom;
        drag.line.hidden = false;
        drag.line.style.top = `${edge - listBox.top}px`;
        drag.before = before;
      };

      const onPointerMove = (ev: PointerEvent) => {
        if (!drag) {
          if (Math.hypot(ev.clientX - originX, ev.clientY - originY) < 4) return;
          const box = item.getBoundingClientRect();
          const ghost = item.cloneNode(true) as HTMLElement;
          ghost.classList.add("pm-editor-drag");
          ghost.setAttribute("aria-hidden", "true");
          ghost.style.width = `${box.width}px`;
          ghost.style.left = `${box.left}px`;
          ghost.style.top = `${box.top}px`;
          const line = document.createElement("div");
          line.className = "pm-editor-drop";
          line.hidden = true;
          list.append(line);
          (root.closest(".editor-dialog") ?? document.body).append(ghost);
          document.body.classList.add("is-row-reordering");
          item.classList.add("is-dragging");
          drag = { ghost, line, originLeft: box.left, originTop: box.top, before: null };
        }
        drag.ghost.style.left = `${drag.originLeft + ev.clientX - originX}px`;
        drag.ghost.style.top = `${drag.originTop + ev.clientY - originY}px`;
        placeLine(ev.clientY);
      };

      const finish = () => {
        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("pointerup", finish);
        window.removeEventListener("pointercancel", finish);
        cancel = () => {};
        if (!drag) return;
        const { ghost, line, before } = drag;
        const moved = !line.hidden;
        drag = null;
        if (moved) {
          const fromId = step ? item.dataset.stepId ?? "" : item.dataset.groupId ?? "";
          const beforeId = before ? (step ? before.dataset.stepId ?? null : before.dataset.groupId ?? null) : null;
          if (fromId) onMoveRef.current(step ? "step" : "group", step ? list.dataset.group ?? null : null, fromId, beforeId);
        }
        ghost.remove();
        line.remove();
        item.classList.remove("is-dragging");
        document.body.classList.remove("is-row-reordering");
      };

      cancel = finish;
      try { grip.setPointerCapture(event.pointerId); } catch { /* the window listeners still receive the release */ }
      window.addEventListener("pointermove", onPointerMove);
      window.addEventListener("pointerup", finish);
      window.addEventListener("pointercancel", finish);
    };

    root.addEventListener("pointerdown", onPointerDown);
    return () => {
      root.removeEventListener("pointerdown", onPointerDown);
      cancel();
    };
  }, [active, rootRef]);
}

function responseLabel(value: StepResponse | undefined) {
  return RESPONSES.find((item) => item.value === value)?.label ?? "Check";
}

function StepName({ value, label, onChange }: { value: string; label: string; onChange: (value: string) => void }) {
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
      value={value}
      aria-label={label}
      onChange={(event) => onChange(event.target.value)}
      onKeyDown={(event) => {
        if (event.key === "Enter") event.preventDefault();
      }}
    />
  );
}

function groupsOf(template: Template): CheckGroup[] {
  return template.checklist ?? CHECKLISTS[template.id] ?? [];
}

function TemplateEditor({
  template,
  onClose,
  onPatch,
  onDelete,
  onRestore,
  onNotice,
  selectTitle,
}: {
  template: Template;
  onClose: () => void;
  onPatch: (patch: Partial<Template>) => void;
  onDelete: () => void;
  onRestore: () => void;
  onNotice: (notice: { message: string; action?: string | null; onAction?: () => void }) => void;
  selectTitle?: boolean;
}) {
  const [tab, setTab] = useState("details");
  const [menu, setMenu] = useState<string | null>(null);
  const [pending, setPending] = useState<{ noun: string; name: string; run: () => void; undo?: () => void } | null>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  const titleStarted = useRef(false);
  const [titleFocusId, setTitleFocusId] = useState<string | null>(null);
  const [stepDraft, setStepDraft] = useState<Record<string, string>>({});
  const [areaName, setAreaName] = useState("");
  const [areaPlace, setAreaPlace] = useState("");
  const groups = groupsOf(template);
  const stepCount = groups.reduce((sum, group) => sum + group.items.length, 0);
  const areas = template.areas ?? [];
  const name = template.name.trim() || "Template";

  function writeGroups(next: CheckGroup[]) {
    onPatch({ checklist: next });
  }

  function addCategory() {
    const id = `group-${Date.now()}`;
    writeGroups([...groups, { id, title: "", items: [] }]);
    setTitleFocusId(id);
  }

  const stepsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!selectTitle || titleStarted.current) return;
    titleStarted.current = true;
    const field = titleRef.current;
    field?.focus();
    field?.select();
  }, [selectTitle]);

  useEffect(() => {
    if (!titleFocusId || !stepsRef.current) return;
    const field = stepsRef.current.querySelector<HTMLInputElement>(`[data-group-id="${CSS.escape(titleFocusId)}"] .pm-editor-cat`);
    if (!field) return;
    field.focus();
    field.select();
    field.closest("section")?.scrollIntoView({ block: "nearest" });
    setTitleFocusId(null);
  }, [titleFocusId, groups]);
  const groupsRef = useRef(groups);
  groupsRef.current = groups;
  useRowDrag(stepsRef, tab === "steps", (kind, groupId, fromId, beforeId) => {
    const current = groupsRef.current;
    if (kind === "group") {
      writeGroups(reorderById(current, fromId, beforeId));
      return;
    }
    writeGroups(current.map((entry) => entry.id === groupId
      ? { ...entry, items: reorderById(entry.items, fromId, beforeId) }
      : entry));
  });

  function patchItem(groupId: string, itemId: string, patch: Partial<CheckItem>) {
    writeGroups(groups.map((entry) => entry.id !== groupId ? entry : {
      ...entry,
      items: entry.items.map((step) => step.id === itemId ? { ...step, ...patch } : step),
    }));
  }

  return (
    <>
      <EditorDialog
        kicker={selectTitle ? "Create template" : "Edit template"}
        className="pm-page"
        title={template.name}
        titlePlaceholder="Template name"
        titleRef={titleRef}
        onTitleChange={(value) => onPatch({ name: value })}
        subtitle={<>{cadenceLabel(template.cadence)} · {template.place || "Location"}</>}
        deleteLabel="Delete template"
        onDelete={() => setPending({ noun: "template", name, run: () => onDelete(), undo: () => onRestore() })}
        onClose={onClose}
        onEscape={() => {
          if (pending) return true;
          if (!menu) return false;
          setMenu(null);
          return true;
        }}
        tabs={{
          label: "Template",
          value: tab,
          onValueChange: setTab,
          items: [
            { value: "details", label: "Details" },
            { value: "steps", label: "Steps", count: stepCount },
            { value: "areas", label: "Areas", count: areas.length },
          ],
        }}
        bodyRef={stepsRef}
        footer={<Button onClick={() => { onNotice({ message: "Template saved" }); onClose(); }}>Save template</Button>}
      >
        {tab === "details" ? (
          <>
            <label className="pm-editor-field">
              <span className="sheet-label">Name</span>
              <input
                className="pm-editor-input"
                aria-label="Name"
                value={template.name}
                placeholder="Template name"
                onChange={(event) => onPatch({ name: event.target.value })}
              />
            </label>
            <label className="pm-editor-field">
              <span className="sheet-label">Description (optional)</span>
              <textarea
                className="text-well"
                rows={4}
                value={template.note}
                placeholder="What this check covers"
                onChange={(event) => onPatch({ note: event.target.value })}
              />
            </label>
            <div>
            <div className="pm-editor-pair">
              <div className="pm-editor-field">
                <span className="sheet-label">Frequency</span>
                <EditorPick
                  icon="calendar"
                  open={menu === "cadence"}
                  onToggle={() => setMenu((current) => (current === "cadence" ? null : "cadence"))}
                  value={cadenceLabel(template.cadence)}
                  menu={CADENCES.map((item) =>
                    taskMenuItem(item.label, item.value === template.cadence, () => {
                      onPatch({ cadence: item.value });
                      setMenu(null);
                    }, item.value),
                  )}
                />
              </div>
              <div className="pm-editor-field">
                <span className="sheet-label">Type</span>
                <EditorPick
                  icon="location"
                  open={menu === "place"}
                  onToggle={() => setMenu((current) => (current === "place" ? null : "place"))}
                  value={template.place || "Location"}
                  menu={(template.place && !PLACES.includes(template.place) ? [template.place, ...PLACES] : PLACES).map((place) =>
                    taskMenuItem(place, place === template.place, () => {
                      onPatch({ place });
                      setMenu(null);
                    }, place),
                  )}
                />
              </div>
            </div>
            </div>
          </>
        ) : null}
        {tab === "steps" ? (
          <>
            {groups.map((group) => (
              <section key={group.id} className="pm-editor-block" data-group-id={group.id} aria-label={group.title}>
                <div className="pm-editor-block-head">
                  <button type="button" className="pm-editor-grip" data-group-drag aria-label={`Reorder ${group.title}`}>
                    <Icon name="grip" size={14} />
                  </button>
                  <input
                    className="pm-editor-cat"
                    aria-label="Category"
                    placeholder="Category"
                    value={group.title}
                    onChange={(event) => writeGroups(groups.map((entry) => entry.id === group.id ? { ...entry, title: event.target.value } : entry))}
                  />
                  <span>{group.items.length} {group.items.length === 1 ? "step" : "steps"}</span>
                  <div className="pm-editor-block-tools">
                    <button type="button" className="pm-editor-remove" aria-label={`Remove ${group.title}`} onClick={() => {
                      const previous = groups;
                      setPending({
                        noun: "category",
                        name: group.title.trim() || "Untitled category",
                        run: () => writeGroups(previous.filter((entry) => entry.id !== group.id)),
                        undo: () => writeGroups(previous),
                      });
                    }}>
                      <Icon name="trash" size={14} />
                    </button>
                  </div>
                </div>
                <ul className="pm-editor-rows" data-group={group.id}>
                  {group.items.map((item) => {
                    const areaKey = `area:${group.id}:${item.id}`;
                    const responseKey = `response:${group.id}:${item.id}`;
                    const areaName = areas.find((area) => area.id === item.areaId)?.name;
                    const reading = item.response === "reading";
                    return (
                      <li key={item.id} data-step-id={item.id} className={reading ? "is-reading" : undefined}>
                        <button type="button" className="pm-editor-grip" data-step-drag aria-label={`Reorder ${item.label}`}>
                          <Icon name="grip" size={14} />
                        </button>
                        <div className="pm-editor-row-body">
                        <div className="pm-step-top">
                        <StepName
                          value={item.label}
                          label="Step"
                          onChange={(label) => patchItem(group.id, item.id, { label })}
                        />
                        <div className="pm-step-tools">
                          {areas.length > 0 ? (
                            <EditorPick
                              chip
                              open={menu === areaKey}
                              onToggle={() => setMenu((current) => (current === areaKey ? null : areaKey))}
                              value={areaName ?? "All areas"}
                              menu={[
                                taskMenuItem("all", !item.areaId, () => {
                                  patchItem(group.id, item.id, { areaId: undefined });
                                  setMenu(null);
                                }, "All areas"),
                                ...areas.map((area) => taskMenuItem(area.id, area.id === item.areaId, () => {
                                  patchItem(group.id, item.id, { areaId: area.id });
                                  setMenu(null);
                                }, area.name)),
                              ]}
                            />
                          ) : null}
                          <Button
                            variant={item.required ? "tertiary" : "secondary"}
                            aria-pressed={item.required === true}
                            onClick={() => patchItem(group.id, item.id, { required: !item.required })}
                          >
                            {item.required ? "Required" : "Optional"}
                          </Button>
                          <EditorPick
                            chip
                            variant={reading ? "tertiary" : "secondary"}
                            open={menu === responseKey}
                            onToggle={() => setMenu((current) => (current === responseKey ? null : responseKey))}
                            value={responseLabel(item.response)}
                            menu={RESPONSES.map((option) => taskMenuItem(option.value, (item.response ?? "check") === option.value, () => {
                              patchItem(group.id, item.id, { response: option.value });
                              setMenu(null);
                            }, option.label))}
                          />
                          <button
                            type="button"
                            className="pm-editor-remove"
                            aria-label={`Remove ${item.label}`}
                            onClick={() => {
                              const previous = groups;
                              setPending({
                                noun: "step",
                                name: item.label.trim() || "Untitled step",
                                run: () => writeGroups(previous.map((entry) => entry.id !== group.id ? entry : {
                                  ...entry,
                                  items: entry.items.filter((step) => step.id !== item.id),
                                })),
                                undo: () => writeGroups(previous),
                              });
                            }}
                          >
                            <Icon name="trash" size={14} />
                          </button>
                        </div>
                        </div>
                        {reading ? (
                          <div className="pm-step-range">
                            <input
                              className="sds line pm-step-unit"
                              aria-label="Unit"
                              placeholder="Unit (°F, psi)"
                              value={item.unit ?? ""}
                              onChange={(event) => patchItem(group.id, item.id, { unit: event.target.value })}
                            />
                            <input
                              className="sds line pm-step-bound"
                              aria-label="Minimum"
                              placeholder="Min"
                              value={item.min ?? ""}
                              onChange={(event) => patchItem(group.id, item.id, { min: event.target.value })}
                            />
                            <span aria-hidden="true">–</span>
                            <input
                              className="sds line pm-step-bound"
                              aria-label="Maximum"
                              placeholder="Max"
                              value={item.max ?? ""}
                              onChange={(event) => patchItem(group.id, item.id, { max: event.target.value })}
                            />
                            <span className="pm-step-range-note">expected range (optional)</span>
                          </div>
                        ) : null}
                        </div>
                      </li>
                    );
                  })}
                </ul>
                <form
                  className="pm-editor-compose"
                  onSubmit={(event) => {
                    event.preventDefault();
                    const label = (stepDraft[group.id] ?? "").trim();
                    if (!label) return;
                    writeGroups(groups.map((entry) => entry.id !== group.id ? entry : {
                      ...entry,
                      items: [...entry.items, { id: `${group.id}-${Date.now()}`, label, state: "none", response: "check" }],
                    }));
                    setStepDraft((current) => ({ ...current, [group.id]: "" }));
                  }}
                >
                  <input
                    className="sds line"
                    value={stepDraft[group.id] ?? ""}
                    placeholder="New step name..."
                    aria-label={`New step in ${group.title}`}
                    onChange={(event) => setStepDraft((current) => ({ ...current, [group.id]: event.target.value }))}
                  />
                  <Button variant="secondary" type="submit">Add</Button>
                </form>
              </section>
            ))}
            <button type="button" className="cash-new-location" onClick={addCategory}>
              <svg className="cash-new-stroke" aria-hidden="true">
                <rect x="0.5" y="0.5" width="calc(100% - 1px)" height="calc(100% - 1px)" rx="9.5" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="9 8" />
              </svg>
              <Icon name="plus" size={14} />
              Add category
            </button>
          </>
        ) : null}
        {tab === "areas" ? (
          <>
            <form
              className="pm-editor-compose"
              onSubmit={(event) => {
                event.preventDefault();
                const next = areaName.trim();
                if (!next) return;
                onPatch({ areas: [...areas, { id: `area-${Date.now()}`, name: next, place: areaPlace.trim() }] });
                setAreaName("");
                setAreaPlace("");
              }}
            >
              <input
                className="sds line"
                value={areaName}
                placeholder="Area name"
                aria-label="Area name"
                onChange={(event) => setAreaName(event.target.value)}
              />
              <input
                className="sds line"
                value={areaPlace}
                placeholder="Location (optional)"
                aria-label="Location"
                onChange={(event) => setAreaPlace(event.target.value)}
              />
              <Button variant="secondary" type="submit">Add</Button>
            </form>
            {areas.length === 0 ? (
              <Empty icon="wrench" title="No areas">
                Add one when this check covers more than one place.
              </Empty>
            ) : (
              <ul className="pm-editor-rows">
                {areas.map((area) => (
                  <li key={area.id}>
                    <span className="pm-editor-area">
                      <span>{area.name}</span>
                      {area.place ? <span>{area.place}</span> : null}
                    </span>
                    <button
                      type="button"
                      className="pm-editor-remove"
                      aria-label={`Remove ${area.name}`}
                      onClick={() => {
                        const previous = areas;
                        setPending({
                          noun: "area",
                          name: area.name.trim() || "Untitled area",
                          run: () => onPatch({ areas: previous.filter((entry) => entry.id !== area.id) }),
                          undo: () => onPatch({ areas: previous }),
                        });
                      }}
                    >
                      <Icon name="trash" size={14} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </>
        ) : null}
      </EditorDialog>
      <ConfirmDialog
        open={pending != null}
        name={pending?.name ?? name}
        noun={pending?.noun ?? "template"}
        onCancel={() => setPending(null)}
        onConfirm={() => {
          const current = pending;
          setPending(null);
          if (!current) return;
          current.run();
          const label = current.noun.charAt(0).toUpperCase() + current.noun.slice(1);
          onNotice({
            message: `${label} deleted`,
            action: "Undo",
            onAction: current.undo,
          });
        }}
      />
    </>
  );
}

function CheckHeading({
  template,
  area,
  periodLabel,
  when,
  onEdit,
  onPatch,
}: {
  template: Template;
  area?: { name: string; place: string };
  periodLabel?: string;
  when?: string;
  onEdit: () => void;
  onPatch: (patch: Partial<Template>) => void;
}) {
  const [field, setField] = useState<"status" | null>(null);
  const opened = template.activity[0]?.time;
  const name = template.name || "Check";
  const complete = template.status === "complete";
  return (
    <>
      <div className="pm-check-bar">
        <p className="pm-check-when">
          {opened ? <span>Created {opened}</span> : null}
          {complete && template.completedOn ? <span>Completed {template.completedOn}</span> : null}
        </p>
        <button type="button" className="pm-check-edit" onClick={onEdit}>
          <Icon name="edit" size={18} />
          Edit template
        </button>
      </div>
      <div className="pm-check-intro">
        <header className="pm-check-name">
          <h2>
            {area ? (
              <>
                {area.name}
                <span className="pm-check-dot"> · </span>
                {name}
              </>
            ) : (
              name
            )}
          </h2>
          <p>
            {periodLabel ? `${periodLabel} · ` : ""}
            {cadenceLabel(template.cadence)} · {template.place || "Category"}
          </p>
        </header>
        {template.note ? <p className="pm-check-copy">{template.note}</p> : null}
        <div className="pm-check-chips">
          <StatusCell
            value={template.status}
            open={field === "status"}
            onToggle={() => setField((current) => (current === "status" ? null : "status"))}
            onChange={(status) => onPatch(statusPatch(template, status))}
          />
          <span className="pm-check-range">
            <Icon name="calendar" size={14} />
            {when ?? cycleRange(template)}
          </span>
          {area ? (
            <span className="pm-check-range">
              <Icon name="location" size={14} />
              {area.name}
            </span>
          ) : null}
          <TaskAssignee named name={template.assignee} initials={template.initials} style={{ background: "var(--sidebar-grey)" }} onSelect={(value) => onPatch(assignPatch(value))} />
        </div>
      </div>
    </>
  );
}

const AREA_STATUSES = ["Open", "In progress", "Completed"] as const;

function areaStatusLabel(status: StatusValue | undefined) {
  if (status === "progress") return "In progress";
  if (status === "complete") return "Completed";
  return "Open";
}

function roomNumber(name: string) {
  return name.replace(/^Room\s+/, "");
}

function roomsAreAreas(template: Template, areas: { name: string }[]) {
  return template.group === "guestrooms" && areas.length > 0 && areas.every((area) => /^Room \d+$/.test(area.name));
}

function AreasPage({
  template,
  periodLabel,
  when,
  query,
  onQueryChange,
  statuses,
  onStatusesChange,
  onBack,
  onEdit,
  onOpen,
  onPatch,
}: {
  template: Template;
  periodLabel?: string;
  when?: string;
  query: string;
  onQueryChange: (value: string) => void;
  statuses: string[];
  onStatusesChange: (value: string[]) => void;
  onBack: () => void;
  onEdit: () => void;
  onOpen: (area: { id: string; name: string; place: string }) => void;
  onPatch: (patch: Partial<Template>) => void;
}) {
  const areas = template.areas ?? [];
  const rooms = roomsAreAreas(template, areas);
  const wanted = query.trim().toLowerCase();
  const visible = areas.filter((area) => {
    if (statuses.length > 0 && !statuses.includes(areaStatusLabel(area.status))) return false;
    if (!wanted) return true;
    const when = area.recordedDays != null ? recordedAgo(area.recordedDays) : "";
    return `${area.name} ${area.place} ${when} ${area.vacant ? "vacant" : ""}`.toLowerCase().includes(wanted);
  });
  const name = template.name || "Check";
  return (
    <PageLayout
      className="sheet-page pm-page"
      data-view="head"
      icon="wrench"
      title={<BackTitle parent="Preventive maintenance" current={name} onBack={onBack} />}
      actions={<BackButton onBack={onBack} />}
      bodyClassName="pm-shift-body"
    >
      <div className="pm-sub">
        <div className="pm-check">
          <CheckHeading template={template} periodLabel={periodLabel} when={when} onEdit={onEdit} onPatch={onPatch} />
          <section className="pm-check-block">
            <hr className="pm-check-rule" />
            <div className="pm-area-k">
              <p className="pm-list-k">{rooms ? "Rooms" : "Areas"}</p>
              {areas.length > 0 ? (
                <p className="pm-area-count">
                  <span>{areas.filter((area) => (area.status ?? "open") === "complete").length}/{areas.length}</span> completed
                </p>
              ) : null}
            </div>
            {areas.length > 0 ? (
              <div className="filter-row page-toolbar pm-area-tools">
                <SearchBox placeholder={rooms ? "Search rooms" : "Search areas"} label={rooms ? "Search rooms" : "Search areas"} value={query} onValueChange={onQueryChange} />
                <FilterMenu value={statuses} onValueChange={onStatusesChange} options={[...AREA_STATUSES]} />
                <div className="filter-chips">
                  {statuses.map((value) => (
                    <button key={value} className="chip chip-filter" type="button" onClick={() => onStatusesChange(statuses.filter((item) => item !== value))}>
                      <span className="chip-k">Status</span>: {value} <Glyph name="plus" size={10} className="x" />
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
            {areas.length === 0 ? (
              <Empty icon="wrench" title="No areas yet">
                Add them from Edit template.
              </Empty>
            ) : visible.length === 0 ? (
              <Empty icon="search" title="Nothing to show" />
            ) : rooms ? (
              <ul className="pm-room-grid">
                {[...visible].sort((a, b) => Number((a.status ?? "open") === "complete") - Number((b.status ?? "open") === "complete")).map((area) => {
                  const number = roomNumber(area.name);
                  const ago = area.recordedDays != null ? recordedAgo(area.recordedDays) : "";
                  const status = area.status ?? "open";
                  const vacant = area.vacant === true;
                  return (
                    <li key={area.id}>
                      <button
                        type="button"
                        className={["pm-room", status === "complete" ? "is-complete" : "", vacant ? "is-vacant" : ""].filter(Boolean).join(" ")}
                        aria-label={[`Room ${number}`, ago, vacant ? "Vacant" : ""].filter(Boolean).join(", ")}
                        onClick={() => onOpen(area)}
                      >
                        <span className="pm-room-top">
                          <span className="pm-room-no">{number}</span>
                          <Icon name="chevron" size={14} />
                        </span>
                        <span className="pm-room-foot">
                          <span className="pm-room-when">{ago}</span>
                          {vacant ? <span className="pm-room-vacant">Vacant</span> : null}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <ul className="pm-area-list">
                {visible.map((area) => (
                  <li key={area.id}>
                    <button type="button" className="pm-area-row" onClick={() => onOpen(area)}>
                      <span className="title-sub">
                        <span className="title-sub-field">{area.name}</span>
                        {area.recordedDays != null ? (
                          <span className="title-sub-note pm-area-when">{recordedAgo(area.recordedDays)}</span>
                        ) : area.place ? (
                          <span className="title-sub-note">{area.place}</span>
                        ) : null}
                      </span>
                      <Status status={area.status ?? "open"} />
                      <Icon name="chevron" size={14} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </PageLayout>
  );
}

function clock(total: number) {
  const seconds = Math.max(0, Math.floor(total));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const rest = seconds % 60;
  const body = `${String(minutes).padStart(2, "0")}:${String(rest).padStart(2, "0")}`;
  return hours > 0 ? `${hours}:${body}` : body;
}

function CheckPage({
  template,
  area,
  periodLabel,
  when,
  onBack,
  onEdit,
  onPatch,
  onNotice,
  titlePages,
}: {
  template: Template;
  area?: { name: string; place: string };
  periodLabel?: string;
  when?: string;
  onBack: () => void;
  onEdit: () => void;
  onPatch: (patch: Partial<Template>) => void;
  onNotice: (notice: { message: string; action?: string | null; onAction?: () => void }) => void;
  titlePages: TitlePage[];
}) {
  const [notes, setNotes] = useState(template.observations ?? "");
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [phase, setPhase] = useState<"idle" | "dirty" | "saving" | "saved">("idle");
  const patchRef = useRef(onPatch);
  patchRef.current = onPatch;
  const name = template.name || "Check";
  const complete = template.status === "complete";
  const savedNotes = template.observations ?? "";
  const notesEdited = notes.trim() !== savedNotes;
  useEffect(() => {
    setNotes(template.observations ?? "");
    setPhase("idle");
    setRunning(false);
    setElapsed(0);
  }, [template.id]);
  useEffect(() => {
    if (notes.trim() === (template.observations ?? "")) return;
    setPhase("dirty");
    let settle = 0;
    const handle = window.setTimeout(() => {
      setPhase("saving");
      settle = window.setTimeout(() => {
        const next = notes.trim();
        setNotes(next);
        patchRef.current({ observations: next });
        setPhase("saved");
      }, 600);
    }, 800);
    return () => {
      window.clearTimeout(handle);
      window.clearTimeout(settle);
    };
  }, [notes, template.observations]);
  useEffect(() => {
    if (!running) return;
    const tick = window.setInterval(() => setElapsed((value) => value + 1), 1000);
    return () => window.clearInterval(tick);
  }, [running]);
  return (
    <PageLayout
      className="sheet-page pm-page"
      data-view="head"
      icon="wrench"
      title={
        <PageTitle pages={titlePages} />
      }
      actions={<BackButton onBack={onBack} />}
      bodyClassName="pm-shift-body"
    >
      <div className="pm-sub">
        <div className="pm-check">
          <CheckHeading template={template} area={area} periodLabel={periodLabel} when={when} onEdit={onEdit} onPatch={onPatch} />
            <section className="pm-check-block">
              <hr className="pm-check-rule" />
              {complete ? null : (
                <div className={running ? "pm-timer is-running" : "pm-timer"}>
                  <span className="pm-timer-read">{clock(elapsed)}</span>
                  <Button variant={running ? "secondary" : "primary"} onClick={() => setRunning((value) => !value)}>
                    <Icon name={running ? "pause" : "play"} size={14} />
                    {running ? "Stop" : "Start timer"}
                  </Button>
                </div>
              )}
              <Checklist
                locked={complete}
                idle={!complete && !running}
                groups={checksFor(template)}
                onChange={(checklist) => onPatch({ checklist })}
                onNeedTimer={() => onNotice({
                  message: "Start the timer to complete this PM",
                  action: "Start",
                  onAction: () => setRunning(true),
                })}
              />
            </section>
            {complete ? (
              <section className="pm-check-block">
                <hr className="pm-check-rule" />
                <dl className="pm-check-close">
                  <div>
                    <dt>Closed by</dt>
                    <dd>
                      <span className="pm-check-who">
                        <Avatar initials={template.initials} size="mini" empty={!template.initials} />
                        {template.assignee}
                      </span>
                    </dd>
                  </div>
                  <div>
                    <dt>Closed</dt>
                    <dd>{template.completedOn ? closedStamp(template.completedOn) : null}</dd>
                  </div>
                  <div>
                    <dt>Time</dt>
                    <dd className={template.minutes ? undefined : "is-empty"}>{template.minutes ? durationLabel(template.minutes) : "—"}</dd>
                  </div>
                </dl>
              </section>
            ) : null}
            <section className="pm-check-block">
              <div className="pm-check-notes">
                <span className="sheet-label">Notes</span>
                <textarea
                  className="text-well"
                  rows={4}
                  value={notes}
                  placeholder="Observations, follow-up items..."
                  onChange={(event) => setNotes(event.target.value)}
                />
              </div>
            </section>
            <section className="pm-check-block">
              <div className="pm-check-foot">
                <span className="pm-check-status" aria-live="polite">
                  {phase === "dirty" ? "Unsaved changes" : phase === "saving" ? "Saving" : "All changes saved"}
                </span>
                <div className="pm-check-actions">
                  <Button variant="secondary" onClick={onBack}>Cancel</Button>
                  {notesEdited ? (
                    <Button
                      onClick={() => {
                        const next = notes.trim();
                        setNotes(next);
                        onPatch({ observations: next });
                        setPhase("saved");
                        onNotice({ message: "Notes saved" });
                        onBack();
                      }}
                    >
                      Save and close
                    </Button>
                  ) : null}
                </div>
              </div>
            </section>
          </div>
        </div>
    </PageLayout>
  );
}

function historyTitle(row: HistoryRow) {
  return row.room ? `Room ${row.room} · ${row.name}` : row.name;
}

function downloadHistory(rows: HistoryRow[]) {
  const header = ["Check", "Location", "Cadence", "Done by", "Date", "Time"];
  const body = rows.map((row) => [historyTitle(row), row.place, row.cadence, row.assignee, row.completed, durationLabel(row.minutes)]);
  const csv = [header, ...body]
    .map((line) => line.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(","))
    .join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "preventive-maintenance-history.csv";
  link.click();
  URL.revokeObjectURL(url);
}

function HistoryPage({ rows, onBack, onOpen }: { rows: HistoryRow[]; onBack: () => void; onOpen: (row: HistoryRow) => void }) {
  const [query, setQuery] = useState("");
  const [cadences, setCadences] = useState<string[]>([]);
  const visible = rows.filter((row) => {
    if (cadences.length > 0 && !cadences.includes(row.cadence)) return false;
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return `${historyTitle(row)} ${row.place} ${row.cadence} ${row.assignee} ${row.notes ?? ""}`.toLowerCase().includes(q);
  });
  const columns: Array<DataColumn<HistoryRow>> = [
    {
      id: "name",
      title: "Check",
      text: "primary",
      flex: true,
      lines: 1,
      labelInset: TITLE_TEXT_INSET,
      render: (row) => <span className="title-sub-field">{historyTitle(row)}</span>,
    },
    { id: "place", title: "Location", render: (row) => <span className="pm-fact pm-template-meta">{row.place}</span> },
    { id: "cadence", title: "Cadence", render: (row) => <span className="pm-fact pm-template-meta">{row.cadence}</span> },
    {
      id: "who",
      title: "Done by",
      labelInset: 0,
      measure: (row) => (
        <span className="sheet-who">
          <span className="mini-pill">
            <span className="avatar mini">{row.initials || "SM"}</span>
          </span>
        </span>
      ),
      render: (row) => <AssigneeCell name={row.assignee} initials={row.initials} />,
    },
    { id: "completed", title: "Date", render: (row) => <span className="sheet-when" style={{ fontVariantNumeric: "var(--numeric)" }}>{row.completed}</span> },
    { id: "time", title: "Time", render: (row) => <span className="sheet-when">{durationLabel(row.minutes)}</span> },
    { id: "status", title: "Status", role: "status", render: () => <Status status="complete" iconOnly /> },
  ];
  return (
    <PageLayout className="sheet-page pm-page" data-view="head" icon="wrench" title={<BackTitle parent="Preventive maintenance" current="History" onBack={onBack} />} count={visible.length} actions={<BackButton onBack={onBack} />}>
      <div className="pm-sub">
        <div className="filter-row page-toolbar pm-history-tools">
          <SearchBox placeholder="Search history" label="Search history" value={query} onValueChange={setQuery} />
          <FilterMenu value={cadences} onValueChange={setCadences} options={CADENCES.map((item) => item.label)} />
          <div className="filter-chips">
            {cadences.map((value) => (
              <button key={value} className="chip chip-filter" type="button" onClick={() => setCadences((current) => current.filter((item) => item !== value))}>
                <span className="chip-k">Cadence</span>: {value} <Glyph name="plus" size={10} className="x" />
              </button>
            ))}
          </div>
          <Button variant="secondary" className="pm-download" onClick={() => downloadHistory(visible)}>
            <Icon name="upload" size={14} />
            Download report
          </Button>
        </div>
        <div className="pm-table">
          <DataTable rows={visible} total={rows.length} columns={columns} empty="Nothing to show" interactive onRowClick={onOpen} />
        </div>
      </div>
    </PageLayout>
  );
}

function TemplatesPage({
  templates,
  selectedId,
  onBack,
  onPatch,
  onCreate,
  onDelete,
  onOpen,
}: {
  templates: Template[];
  selectedId: string | null;
  onBack: () => void;
  onPatch: (id: string, patch: Partial<Template>) => void;
  onCreate: () => void;
  onDelete: (template: Template) => void;
  onOpen: (template: Template) => void;
}) {
  const [query, setQuery] = useState("");
  const [statuses, setStatuses] = useState<string[]>([]);
  const wanted = query.trim().toLowerCase();
  const rows = [...templates]
    .filter((template) => {
      if (statuses.length > 0) {
        const status = template.active ? "Active" : "Inactive";
        if (!statuses.includes(status)) return false;
      }
      if (!wanted) return true;
      return `${template.name} ${cadenceLabel(template.cadence)} ${typeLabel(template.type)}`.toLowerCase().includes(wanted);
    })
    .sort((a, b) => Number(b.active) - Number(a.active));
  const columns: Array<DataColumn<Template>> = [
    {
      id: "name",
      title: "Template",
      text: "primary",
      flex: true,
      lines: 1,
      labelInset: TITLE_TEXT_INSET,
      render: (row) => <span className={row.name.trim() ? "pm-template-name" : "pm-template-name is-empty"}>{row.name.trim() || "Template"}</span>,
    },
    {
      id: "cadence",
      title: "Cadence",
      render: (row) => <span className="pm-fact pm-template-meta">{cadenceLabel(row.cadence)}</span>,
    },
    {
      id: "type",
      title: "Type",
      render: (row) => <span className="pm-fact pm-template-meta">{typeLabel(row.type)}</span>,
    },
    {
      id: "areas",
      title: "Areas",
      render: (row) => <span className="pm-fact pm-area-count">{areaCount(row)}</span>,
    },
    {
      id: "active",
      title: "Active",
      minWidth: 72,
      render: (row) => (
        <button
          type="button"
          className="sds theme-switch"
          aria-pressed={row.active}
          aria-label={row.active ? "Active" : "Inactive"}
          onPointerDown={(event) => event.stopPropagation()}
          onClick={(event) => {
            event.stopPropagation();
            event.currentTarget.classList.add("is-init");
            onPatch(row.id, { active: !row.active });
          }}
        >
          <span className="theme-switch-track" aria-hidden="true">
            <span className="theme-switch-knob" />
          </span>
        </button>
      ),
    },
  ];
  return (
    <PageLayout className="sheet-page pm-page" data-view="head" icon="wrench" title={<BackTitle parent="Preventive maintenance" current="Templates" onBack={onBack} />} count={rows.length} actions={<BackButton onBack={onBack} />}>
      <div className="pm-sub">
        <div className="filter-row page-toolbar">
          <SearchBox placeholder="Search templates" label="Search templates" value={query} onValueChange={setQuery} />
          <FilterMenu value={statuses} onValueChange={setStatuses} options={["Active", "Inactive"]} />
          <div className="filter-chips">
            {statuses.map((value) => (
              <button key={value} className="chip chip-filter" type="button" onClick={() => setStatuses((current) => current.filter((item) => item !== value))}>
                <span className="chip-k">Status</span>: {value} <Glyph name="plus" size={10} className="x" />
              </button>
            ))}
          </div>
          <Button onClick={onCreate}>
            <Icon name="plus-bold" size={14} />
            New template
          </Button>
        </div>
        <div className="pm-table">
          <DataTable rows={rows} total={templates.length} columns={columns} empty="Nothing to show" interactive selectedId={selectedId} onRowClick={onOpen} onDelete={onDelete} deleteNoun="template" rowName={(row) => row.name.trim() || "Template"} />
        </div>
      </div>
    </PageLayout>
  );
}

export default function PreventiveMaintenancePage() {
  const [templates, setTemplates] = useState(STARTER);
  const [scope, setScope] = useState<Scope>("all");
  const [frequencies, setFrequencies] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const menu = useTableMenu();
  const [view, setView] = useState<"list" | "history" | "templates" | "check" | "areas" | "edit">("list");
  const [checkId, setCheckId] = useState<string | null>(null);
  const [areaQuery, setAreaQuery] = useState("");
  const [areaStatuses, setAreaStatuses] = useState<string[]>([]);
  const [areaFilterId, setAreaFilterId] = useState<string | null>(null);
  if (areaFilterId !== checkId) {
    setAreaFilterId(checkId);
    setAreaQuery("");
    setAreaStatuses([]);
  }
  const [editingId, setEditingId] = useState<string | null>(null);
  const [nameId, setNameId] = useState<string | null>(null);
  const [pickedId, setPickedId] = useState<string | null>(null);
  const [areaId, setAreaId] = useState<string | null>(null);
  const [fromHistory, setFromHistory] = useState(false);
  const [period, setPeriod] = useState<{ group: GroupId; label: string } | null>(null);
  const editReturn = useRef<"check" | "areas">("check");
  const [enteringId, setEnteringId] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [present, setPresent] = useState(false);
  const [hidden, setHidden] = useState(true);
  const [notice, setNotice] = useState<{ id: number; message: string; action: string | null; onAction?: () => void } | null>(null);
  const retained = useRef<Template | null>(null);

  function tell(next: { message: string; action?: string | null; onAction?: () => void }) {
    setNotice({ id: Date.now(), message: next.message, action: next.action ?? null, onAction: next.onAction });
  }

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice((current) => (current?.id === notice.id ? null : current)), 4000);
    return () => window.clearTimeout(timer);
  }, [notice]);

  useEffect(() => {
    if (view !== "templates" || !pickedId) return;
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (target.closest(".sheet.is-open, .editor-dialog-card")) return;
      setPickedId(null);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [view, pickedId]);

  const matched = useMemo(() => {
    const q = query.trim().toLowerCase();
    const chosen = new Set(CADENCES.filter((item) => frequencies.includes(item.label)).map((item) => item.value));
    return templates.filter((template) => {
      if (!template.active) return false;
      if (chosen.size > 0 && !chosen.has(template.cadence)) return false;
      if (!q) return true;
      return `${template.name} ${template.place} ${cadenceLabel(template.cadence)} ${groupTitle(template.group)}`.toLowerCase().includes(q);
    });
  }, [frequencies, query, templates]);

  const upcoming = matched.filter(isUpcoming);
  const visible = scope === "upcoming" ? upcoming : matched;
  const open = visible.find((template) => template.id === selected) ?? null;
  if (open) retained.current = open;

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

  function patch(id: string, next: Partial<Template>) {
    setTemplates((list) => list.map((template) => (template.id === id ? { ...template, ...next } : template)));
  }

  function remove(template: Template) {
    const play = captureClose(document.querySelector(`[data-record="${CSS.escape(template.id)}"]`));
    flushSync(() => {
      setTemplates((list) => list.filter((item) => item.id !== template.id));
      setSelected((current) => (current === template.id ? null : current));
    });
    play();
  }

  const liveCompletions: HistoryRow[] = templates
    .filter((template) => template.completedOn === "Nov 6")
    .map((template) => ({
      id: template.id,
      name: template.name || "Template",
      place: template.place || "Location",
      cadence: cadenceLabel(template.cadence),
      assignee: template.assignee,
      initials: template.initials,
      completed: "Nov 6",
      minutes: template.minutes || 52,
      notes: template.observations?.trim() || undefined,
    }));
  const historyRows = [...liveCompletions, ...RECENT.filter((row) => !liveCompletions.some((live) => live.name === row.name && live.completed === row.completed))];
  const closedMinutes = historyRows.reduce((sum, row) => sum + row.minutes, 0);
  const averageMinutes = historyRows.length ? Math.round(closedMinutes / historyRows.length) : 0;
  const guestroom = templates.filter((template) => template.group === "guestrooms");
  const roomsDone = guestroom.reduce((sum, template) => sum + template.cycleDone, 0);
  const roomsTotal = guestroom.reduce((sum, template) => sum + template.cycleTotal, 0);
  const guestroomPercent = roomsTotal ? Math.round((roomsDone / roomsTotal) * 100) : 0;
  const extraRooms = Math.max(0, roomsDone - ROOM_LOG_ROOMS);
  const guestroomAverage = roomsDone ? Math.round((ROOM_LOG_MINUTES + extraRooms * 55) / (ROOM_LOG_ROOMS + extraRooms)) : 0;

  function createTemplate() {
    const id = `template-${Date.now()}`;
    const blank: Template = {
      id,
      group: "weekly",
      type: "building",
      active: true,
      name: "",
      cadence: "weekly",
      pace: "",
      periods: [empty, empty, empty],
      cycleDone: 0,
      cycleTotal: 1,
      due: "Nov 9",
      dueOrder: 20261109,
      place: "",
      note: "",
      status: "open",
      assignee: "Unassigned",
      initials: "",
      activity: scheduled("created this template", "Nov 6"),
    };
    setTemplates((list) => [blank, ...list]);
    setEditingId(id);
    setNameId(id);
    setPickedId(id);
    setEnteringId(id);
  }

  const openCheck = view === "check" || view === "areas" || view === "edit" ? templates.find((template) => template.id === checkId) ?? null : null;

  const noticeNode = notice ? createPortal(
    <div className="pm-toast">
      <Toast
        key={notice.id}
        message={notice.message}
        action={notice.action}
        onAction={() => {
          notice.onAction?.();
          setNotice(null);
        }}
      />
    </div>,
    document.body,
  ) : null;

  if (view === "history") return <>{noticeNode}<HistoryPage rows={historyRows} onBack={() => setView("list")} onOpen={(row) => {
    const template = templates.find((item) => item.id === row.id) ?? templates.find((item) => item.name === row.name);
    if (!template) return;
    shiftPage("forward", () => {
      setCheckId(template.id);
      setAreaId(null);
      setFromHistory(true);
      setPeriod(null);
      setView("check");
    });
  }} /></>;
  if (view === "templates") {
    const editing = templates.find((template) => template.id === editingId) ?? null;
    return (
      <>
      {noticeNode}
      <TemplatesPage
        templates={templates}
        onBack={() => {
          setEnteringId(null);
          setEditingId(null);
          setPickedId(null);
          setView("list");
        }}
        onPatch={patch}
        onCreate={createTemplate}
        onDelete={(template) => {
          remove(template);
          if (editingId === template.id) setEditingId(null);
          if (pickedId === template.id) setPickedId(null);
        }}
        onOpen={(template) => {
          setEditingId(template.id);
          setPickedId(template.id);
        }}
        selectedId={pickedId}
      />
      {editing ? (
        <TemplateEditor
          template={editing}
          selectTitle={nameId === editing.id}
          onClose={() => {
            setEditingId(null);
            setNameId(null);
          }}
          onPatch={(next) => patch(editing.id, next)}
          onDelete={() => {
            remove(editing);
            setEditingId(null);
            setPickedId(null);
          }}
          onRestore={() => {
            setTemplates((list) => (list.some((item) => item.id === editing.id) ? list : [editing, ...list]));
            setEditingId(editing.id);
            setPickedId(editing.id);
          }}
          onNotice={tell}
        />
      ) : null}
      </>
    );
  }
  if (openCheck) {
    const multi = !isSingleCheck(openCheck);
    const leaveCheck = () => {
      shiftPage("back", () => {
        setAreaId(null);
        if (fromHistory) {
          setFromHistory(false);
          setCheckId(null);
          setView("history");
          return;
        }
        if (multi) {
          setView("areas");
          return;
        }
        setCheckId(null);
        setPeriod(null);
        setView("list");
      });
    };
    const area = openCheck.areas?.find((item) => item.id === areaId);
    return (
      <>
        {view === "areas" || (view === "edit" && editReturn.current === "areas") ? (
          <AreasPage
            template={openCheck}
            periodLabel={period?.label}
            when={period ? periodRange(period.group, period.label) : undefined}
            query={areaQuery}
            onQueryChange={setAreaQuery}
            statuses={areaStatuses}
            onStatusesChange={setAreaStatuses}
            onBack={() => shiftPage("back", () => { setCheckId(null); setPeriod(null); setView("list"); })}
            onEdit={() => { editReturn.current = "areas"; setView("edit"); }}
            onOpen={(next) => shiftPage("forward", () => { setAreaId(next.id); setView("check"); })}
            onPatch={(next) => patch(openCheck.id, next)}
          />
        ) : (
          <CheckPage
            template={openCheck}
            area={area}
            periodLabel={period?.label}
            when={period ? periodRange(period.group, period.label) : undefined}
            onBack={leaveCheck}
            titlePages={[
              { label: "Preventive maintenance", onClick: () => shiftPage("back", () => { setAreaId(null); setCheckId(null); setFromHistory(false); setPeriod(null); setView("list"); }) },
              ...(fromHistory ? [{ label: "History", onClick: () => shiftPage("back", () => { setAreaId(null); setCheckId(null); setFromHistory(false); setView("history"); }) }] : []),
              ...(area ? [{ label: openCheck.name || "Check", onClick: () => shiftPage("back", () => { setAreaId(null); setView(fromHistory ? "check" : "areas"); }) }] : []),
              { label: area?.name || openCheck.name || "Check" },
            ]}
            onEdit={() => { editReturn.current = "check"; setView("edit"); }}
            onPatch={(next) => patch(openCheck.id, next)}
            onNotice={tell}
          />
        )}
        {view === "edit" ? (
          <TemplateEditor
            template={openCheck}
            onClose={() => setView(editReturn.current)}
            onPatch={(next) => patch(openCheck.id, next)}
            onDelete={() => {
              remove(openCheck);
              setCheckId(null);
              setPeriod(null);
              setView("list");
            }}
            onRestore={() => {
              setTemplates((list) => (list.some((item) => item.id === openCheck.id) ? list : [openCheck, ...list]));
              setCheckId(openCheck.id);
              setView(multi ? "areas" : "check");
            }}
            onNotice={tell}
          />
        ) : null}
        {noticeNode}
      </>
    );
  }

  const sections = GROUPS.map((group) => ({
    ...group,
    rows: visible.filter((template) => template.group === group.id),
    total: templates.filter((template) => template.active && template.group === group.id).length,
  })).filter((group) => group.rows.length > 0);

  function columnsFor(group: { id: GroupId; headers: [string, string, string] }): Array<DataColumn<Template>> {
    const headers = group.headers;
    return [
      {
        id: "status",
        title: "Status",
        role: "status",
        labelInset: CHIP_LABEL_INSET,
        minContent: (
          <>
            {(["open", "progress", "complete"] as const).map((status) => (
              <span key={status} data-col="status" style={{ display: "inline-flex", alignItems: "center", width: "max-content", padding: "2px 4px", whiteSpace: "nowrap" }}>
                <Status status={status} />
                <span style={{ display: "inline-flex", marginInlineStart: 4, flex: "none" }}>
                  <Icon name="chevron" size={10} />
                </span>
              </span>
            ))}
          </>
        ),
        render: (row) => (
          <StatusCell
            value={row.status}
            open={menu.isOpen(row.id, "status")}
            onToggle={() => menu.toggle(row.id, "status")}
            onChange={(status) => patch(row.id, statusPatch(row, status))}
          />
        ),
      },
      {
        id: "name",
        title: "Template",
        text: "primary",
        flex: true,
        lines: 2,
        labelInset: TITLE_TEXT_INSET,
        render: (row) => (
          <div className="title-sub">
            <span className="title-sub-field">{row.name || "Template"}</span>
            <span className="title-sub-note">{row.place}</span>
          </div>
        ),
      },
      ...headers.map((header, index) => ({
        id: `period-${index}`,
        title: header,
        minContent: (
          <>
            {columnFloor(`period-${index}`, PERIOD_FLOOR)}
            <span data-col={`period-${index}`} className="chip">102/145</span>
          </>
        ),
        render: (row: Template) => (
          <PeriodCell
            mark={row.periods[index]}
            label={header}
            onOpen={() => {
              shiftPage("forward", () => {
                setSelected(null);
                setCheckId(row.id);
                setAreaId(null);
                setFromHistory(false);
                setPeriod({ group: group.id, label: header });
                setView(isSingleCheck(row) ? "check" : "areas");
              });
            }}
          />
        ),
      })),
      {
        id: "cycle",
        title: "This cycle",
        minContent: columnFloor("cycle", ["102/145"]),
        render: (row) => <CountMark done={row.cycleDone} total={row.cycleTotal} className="sheet-when pm-cycle" />,
      },
      {
        id: "due",
        title: "Due",
        minContent: columnFloor("due", ["Dec 31"]),
        render: (row) => <span className="sheet-when">{row.due}</span>,
      },
      {
        id: "assignee",
        title: "Assigned",
        labelInset: 0,
        sortValue: (row) => (row.crew ? row.crew.map((person) => person.name).join(", ") : row.assignee),
        measure: (row) => (
          <span className="sheet-who">
            <span className="mini-pill">
              <span className="avatar mini">{row.initials || "MJ"}</span>
            </span>
          </span>
        ),
        render: (row) =>
          row.crew ? (
            <CrewAssign
              people={row.crew}
              open={menu.isOpen(row.id, "assignee")}
              onToggle={() => menu.toggle(row.id, "assignee")}
              onChange={(name) => patch(row.id, crewPatch(row.crew ?? [], name))}
            />
          ) : (
            <AssigneeCell
              name={row.assignee}
              initials={row.initials}
              isOpen={menu.isOpen(row.id, "assignee")}
              onOpenChange={() => menu.toggle(row.id, "assignee")}
              onSelect={(value) => patch(row.id, assignPatch(value))}
            />
          ),
      },
    ];
  }

  return (
    <>
    {noticeNode}
    <PageLayout
      className="sheet-page pm-page"
      data-view="head"
      icon="wrench"
      title="Preventive maintenance"
      count={visible.length}
      bodyClassName="pm-shift-body"
      actions={
        <>
          <Button className="pm-tool" variant="secondary" onClick={() => { setSelected(null); setView("history"); }}>
            <Icon name="clock" size={14} />
            History
          </Button>
          <Button className="pm-tool" variant="secondary" onClick={() => { setSelected(null); setView("templates"); }}>
            <Icon name="tune" size={14} />
            Manage templates
          </Button>
        </>
      }
      tabs={
        <Tabs
          label="Which PMs"
          value={scope}
          onValueChange={(value) => setScope(value as Scope)}
          items={[
            { value: "upcoming", label: "Upcoming", count: upcoming.length },
            { value: "all", label: "All", count: matched.length },
          ]}
        />
      }
      toolbar={
        <div className="filter-row page-toolbar">
          <SearchBox placeholder="Search PMs" label="Search PMs" value={query} onValueChange={setQuery} />
          <FilterMenu value={frequencies} onValueChange={setFrequencies} options={CADENCES.map((item) => item.label)} />
          <div className="filter-chips">
            {frequencies.map((value) => (
              <button key={value} className="chip chip-filter" type="button" onClick={() => setFrequencies((current) => current.filter((item) => item !== value))}>
                <span className="chip-k">Frequency</span>: {value} <Glyph name="plus" size={10} className="x" />
              </button>
            ))}
          </div>
        </div>
      }
    >
      <div className="sheet-stack">
        <section className="kb-health" aria-label="Preventive maintenance">
          <div className="kb-health-score pm-closed">
            <p className="kb-health-label">PMs closed in last 7d</p>
            <p className="kb-score-num">{historyRows.length}</p>
          </div>
          <div className="kb-health-rule" aria-hidden="true" />
          <div className="kb-health-questions">
            <dl className="kb-facts pm-facts">
              <div>
                <dt>Average time per PM</dt>
                <dd>{durationLabel(averageMinutes)}</dd>
              </div>
              <div>
                <dt>Guestrooms done</dt>
                <dd>{guestroomPercent}%</dd>
              </div>
              <div>
                <dt>Average time per guestroom</dt>
                <dd>{durationLabel(guestroomAverage)}</dd>
              </div>
            </dl>
          </div>
        </section>
        <div className="sheet-work pm-boards">
          {sections.length === 0 ? <Empty icon="wrench" title="Nothing to show" /> : sections.map((group) => (
            <section key={group.id} className="pm-section" aria-label={group.title}>
              <h2 className="sheet-group">
                {group.title}
                <span className="count">{group.rows.length}</span>
              </h2>
              <DataTable
                rows={group.rows}
                columns={columnsFor(group)}
                total={group.total}
                selectedId={selected}
                onRowClick={(row) => {
                  shiftPage("forward", () => {
                    setSelected(null);
                    setCheckId(row.id);
                    setAreaId(null);
                    setFromHistory(false);
                    setPeriod(null);
                    setView(isSingleCheck(row) ? "check" : "areas");
                  });
                }}
                empty="Nothing to show"
              />
            </section>
          ))}
        </div>
        {present && retained.current ? (
          <TemplateDetail
            key={retained.current.id}
            template={retained.current}
            hidden={hidden}
            onClose={() => setSelected(null)}
            onExited={() => setPresent(false)}
            onPatch={(next) => patch(retained.current?.id ?? "", next)}
          />
        ) : null}
      </div>
    </PageLayout>
    </>
  );
}
