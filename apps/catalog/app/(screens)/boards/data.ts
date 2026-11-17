export type Role = "housekeeper" | "inspector";
export type Service = "checkout" | "refresh" | "full" | "deep" | "well";
/** Where the room is in the day: not started, someone is on it, cleaned, then inspected. */
export type RoomState = "dirty" | "cleaning" | "clean" | "inspected";
export type RoomType = "KSTE" | "QQST" | "SUIT";

/** A staff id, or one of the side lists. A custom list is `list:<id>`. */
export type Place = string;
export const UNASSIGNED = "unassigned";
export const DND_LIST = "dnd";

export type RoomActivity = {
  kind: "clean" | "inspected" | "dnd" | "incomplete";
  service: Service;
  staffId: Place;
  at?: number;
  minutes?: number;
  cleaner?: string;
  inspectedBy?: string;
  paused?: string;
  timeRange?: string;
};

export type Room = {
  inspectionChecks?: string[];
  id: string;
  number: string;
  type: RoomType;
  service: Service;
  state: RoomState;
  /** The guest has the sign out. */
  dnd: boolean;
  /** A pet is present in the room. */
  pet?: boolean;
  minibarTaken?: { name: string; quantity: number }[];
  strip?: { assignee: string; requestedBy: string; completed: boolean };
  /** The guest is still in the room. Vacant when this is false. */
  occupied: boolean;
  /** A note left on the room. The row shows the notes icon only when this is set. */
  notes?: string;
  /** A checkout whose guest has not left yet, and when they are due out. */
  dueOut?: string;
  /** Minutes the clean took, once it stops. */
  minutes?: number;
  /** Seconds on the running clean timer. */
  timer?: number;
  housekeeper: Place;
  inspector: Place;
  activity?: RoomActivity[];
  activitySummary?: { cleaner: string; average: number; timedCleans: number };
};

export type StaffPreferences = {
  training?: boolean; partTime?: boolean; language?: string; shift?: string;
  daysOff?: string[]; strictShift?: boolean; strictDaysOff?: boolean;
  maxHours?: number; maxConsecutive?: number; restrictedAvailability?: boolean;
  availability?: Record<string, { enabled: boolean; windows?: { start: string; end: string }[]; start?: string; end?: string }>;
  derivedAcknowledged?: string;
  derivedClearedDays?: string[];
  derived?: Record<string, { start: string; end: string }>;
  offboarded?: boolean;
};

export type Staff = {
  boardState?: "active" | "excluded" | "off-roster" | "retained-off";
  shiftEnd?: number;
  preferences?: StaffPreferences;
  id: string;
  name: string;
  initials: string;
  photo?: string;
  role: Role;
  onBoard: boolean;
  max?: number;
  selfInspect?: boolean;
  /** When today's shift started, in minutes after midnight. */
  shiftStart?: number;
  /** The rooms they would rather clean, as first and last room number. */
  prefer?: [number, number];
};

export function formatPrefer([first, last]: [number, number]) {
  return `Pref ${first}–${last}`;
}

export function prefers(staff: Staff, room: Room) {
  if (!staff.prefer) return false;
  const number = Number(room.number);
  return number >= staff.prefer[0] && number <= staff.prefer[1];
}

export const LIST_COLORS = ["Blue", "Green", "Orange", "Purple", "Pink"] as const;
export type ListColor = typeof LIST_COLORS[number];
export type CustomList = { id: string; name: string; role: Role };

export const SERVICES: Array<{ value: Service; label: string }> = [
  { value: "refresh", label: "RFSH" },
  { value: "checkout", label: "C/O" },
  { value: "full", label: "FULL" },
  { value: "deep", label: "DEEP CLEAN" },
  { value: "well", label: "WELL" },
];

export function serviceLabel(service: Service) {
  return SERVICES.find((item) => item.value === service)?.label ?? service;
}

/** The code on the row. Deep clean keeps its full name in the menu. */
export function serviceShort(service: Service) {
  return service === "deep" ? "DEEP" : serviceLabel(service);
}

/** The room type as it reads on a board. */
export function typeLabel(type: RoomType) {
  return type;
}

export function roomFloor(number: string) {
  return /^\d{3,}$/.test(number) ? number.slice(0, -2) : "";
}

/** Minutes a clean usually takes, for the time-left estimate. */
export const PACE: Record<Service, number> = { checkout: 35, full: 30, refresh: 15, deep: 50, well: 10 };

export const STAFF: Staff[] = [
  { id: "esme", name: "Esmeralda Soto", initials: "ES", role: "housekeeper", onBoard: true, max: 15, shiftStart: 7 * 60, prefer: [301, 318] },
  { id: "fred", name: "Fred Salas", initials: "FS", role: "housekeeper", onBoard: true, shiftStart: 7 * 60 + 30, prefer: [401, 412] },
  { id: "lupe", name: "Lupe Vargas", initials: "LV", role: "housekeeper", onBoard: true, selfInspect: true, shiftStart: 8 * 60, prefer: [501, 513] },
  { id: "rosa", name: "Rosa Mendez", initials: "RM", role: "housekeeper", onBoard: true, shiftStart: 9 * 60, prefer: [701, 712] },
  { id: "wendy", name: "Wendy Quan", initials: "WQ", role: "housekeeper", onBoard: false, shiftStart: 9 * 60, prefer: [601, 612] },
  { id: "tomas", name: "Tomás Rivera", initials: "TR", role: "housekeeper", onBoard: false, shiftStart: 10 * 60 },
  { id: "ana", name: "Ana Pérez", initials: "AP", role: "inspector", onBoard: true, shiftStart: 8 * 60 },
  { id: "kim", boardState: "off-roster", name: "Kim Nguyen", initials: "KN", role: "inspector", onBoard: true, shiftStart: 10 * 60 },
  { id: "jack", name: "Jack Arbildo", initials: "JA", role: "housekeeper", onBoard: false },
  { id: "maria", name: "Maria Claros", initials: "MC", role: "housekeeper", onBoard: false },
  { id: "mark", name: "Mark J", initials: "MJ", role: "housekeeper", onBoard: false },
  { id: "dana", name: "Dana Ortiz", initials: "DO", role: "inspector", onBoard: false, shiftStart: 10 * 60 },
];

/** Existing staff available to help either board in this demo. */
export const OTHER_BOARD_STAFF = [
  { id: "boris", name: "Boris Abarca", initials: "BA", department: "Maintenance" },
  { id: "tony", name: "Tony Avalos", initials: "TA", department: "Maintenance" },
  { id: "alejandro", name: "Alejandro Barrera", initials: "AB", department: "Maintenance" },
];

export const LISTS: CustomList[] = [{ id: "late", name: "Late checkout", role: "housekeeper" }];

type Seed = [string, RoomType, Service, RoomState, Place, Place, Partial<Room>?];

// The visible Room 601 history from the reference, used as demo data.
const ROOM_601_HISTORY: (Omit<RoomActivity, "kind" | "staffId"> & { kind?: RoomActivity["kind"] })[] = [
  { service: "checkout", cleaner: "Taina Dossman", at: Date.parse("2026-11-13T14:14:00-08:00"), minutes: 0, inspectedBy: "Jesika Ramirez", paused: "<1m", timeRange: "2:14 PM – 2:14 PM" },
  { service: "full", cleaner: "Rufina Flores", at: Date.parse("2026-11-11T16:09:00-08:00"), minutes: 21, paused: "<1m", timeRange: "4:09 PM – 4:09 PM" },
  { service: "refresh", cleaner: "Rufina Flores", at: Date.parse("2026-11-09T16:46:00-08:00"), minutes: 16, paused: "<1m", timeRange: "4:46 PM – 4:46 PM" },
  { kind: "dnd", service: "checkout", cleaner: "Rufina Flores", at: Date.parse("2026-11-08T17:13:00-08:00") },
  { service: "checkout", cleaner: "Rufina Flores", at: Date.parse("2026-11-07T15:27:00-08:00"), minutes: 0, inspectedBy: "Jesika Ramirez", paused: "<1m", timeRange: "3:27 PM – 3:27 PM" },
  { service: "checkout", cleaner: "Yoselyn Rodriguez", at: Date.parse("2026-11-06T09:57:00-08:00"), minutes: 30, inspectedBy: "Jesika Ramirez", paused: "<1m", timeRange: "9:57 AM – 9:57 AM" },
  { service: "checkout", cleaner: "Isabel Vasquez", at: Date.parse("2026-11-05T12:07:00-08:00"), minutes: 31, inspectedBy: "William Madeo", paused: "<1m", timeRange: "12:07 PM – 12:07 PM" },
  { service: "checkout", cleaner: "Yoselyn Rodriguez", at: Date.parse("2026-11-04T09:13:00-08:00"), minutes: 28, inspectedBy: "William Madeo", paused: "<1m", timeRange: "9:13 AM – 9:13 AM" },
  { service: "refresh", cleaner: "Bertha Varges", at: Date.parse("2026-11-03T16:47:00-08:00") },
  { kind: "incomplete", service: "refresh", cleaner: "Yoselyn Rodriguez", at: Date.parse("2026-11-02T16:00:00-08:00") },
];

const SEED: Seed[] = [
  ["301", "KSTE", "checkout", "clean", "esme", "ana", { minutes: 38, strip: { assignee: "tony", requestedBy: "esme", completed: true } }],
  ["302", "QQST", "checkout", "inspected", "esme", "ana", { minutes: 31 }],
  ["303", "QQST", "refresh", "clean", "esme", "ana", { minutes: 14 }],
  ["304", "KSTE", "full", "cleaning", "esme", "ana", {
    timer: 742,
    pet: true,
    minibarTaken: [{ name: "Icelandic Water Bottle", quantity: 2 }],
  }],
  ["305", "QQST", "checkout", "dirty", "esme", "ana", { dueOut: "11 AM", occupied: true, strip: { assignee: "tony", requestedBy: "esme", completed: false } }],
  ["306", "QQST", "refresh", "dirty", "esme", "ana", { notes: "Extra towels requested" }],
  ["307", "KSTE", "refresh", "dirty", "esme", "ana", { dnd: true, occupied: true }],
  ["308", "SUIT", "checkout", "dirty", "esme", "ana", { occupied: true, notes: "Late arrival, hold the room" }],
  ["310", "QQST", "full", "dirty", "esme", "ana"],
  ["401", "KSTE", "checkout", "inspected", "fred", "ana", { minutes: 41, strip: { assignee: "boris", requestedBy: "fred", completed: true } }],
  ["402", "KSTE", "checkout", "clean", "fred", "ana", { minutes: 36 }],
  ["403", "QQST", "refresh", "clean", "fred", "ana", { minutes: 17 }],
  ["404", "QQST", "checkout", "cleaning", "fred", "ana", { timer: 318, occupied: true }],
  ["406", "QQST", "full", "dirty", "fred", "ana"],
  ["407", "KSTE", "refresh", "dirty", "fred", "ana"],
  ["408", "SUIT", "checkout", "dirty", "fred", "ana", { dueOut: "12 PM", occupied: true, notes: "Guest asked for a late checkout" }],
  ["409", "QQST", "refresh", "dirty", "fred", "ana"],
  ["501", "KSTE", "full", "inspected", "lupe", "kim", { minutes: 29 }],
  ["502", "QQST", "checkout", "inspected", "lupe", "kim", { minutes: 33 }],
  ["503", "QQST", "refresh", "clean", "lupe", "kim", { minutes: 12 }],
  ["504", "QQST", "checkout", "clean", "lupe", "kim", { minutes: 40 }],
  ["505", "KSTE", "refresh", "clean", "lupe", "kim", { minutes: 15 }],
  ["507", "QQST", "checkout", "dirty", "lupe", "kim", { strip: { assignee: "boris", requestedBy: "lupe", completed: false } }],
  ["508", "KSTE", "refresh", "dirty", "lupe", "kim", { dnd: true }],
  ["601", "SUIT", "checkout", "cleaning", "rosa", "kim", {
    timer: 1290,
    occupied: true,
    activity: ROOM_601_HISTORY.map((entry) => ({ ...entry, kind: entry.kind ?? "clean", staffId: UNASSIGNED })),
    activitySummary: { cleaner: "Taina Dossman", average: 18, timedCleans: 10 },
  }],
  ["602", "KSTE", "refresh", "dirty", "rosa", "kim"],
  ["603", "QQST", "checkout", "dirty", "rosa", "kim", { dueOut: "11 AM" }],
  ["604", "QQST", "full", "dirty", "rosa", "kim"],
  ["605", "QQST", "refresh", "dirty", "rosa", "kim"],
  ["606", "KSTE", "checkout", "dirty", "rosa", "kim"],
  ["607", "QQST", "refresh", "clean", "rosa", "kim", { minutes: 16 }],
  ["701", "KSTE", "checkout", "dirty", UNASSIGNED, UNASSIGNED],
  ["702", "QQST", "refresh", "dirty", UNASSIGNED, UNASSIGNED],
  ["703", "QQST", "checkout", "dirty", UNASSIGNED, UNASSIGNED, { dueOut: "12 PM", occupied: true }],
  ["704", "QQST", "full", "dirty", UNASSIGNED, UNASSIGNED],
  ["705", "KSTE", "refresh", "dirty", UNASSIGNED, UNASSIGNED],
  ["706", "SUIT", "checkout", "dirty", UNASSIGNED, UNASSIGNED],
  ["612", "KSTE", "refresh", "dirty", DND_LIST, UNASSIGNED, { dnd: true }],
  ["318", "QQST", "refresh", "dirty", DND_LIST, UNASSIGNED, { dnd: true }],
  ["809", "SUIT", "checkout", "dirty", "list:late", UNASSIGNED, { dueOut: "2 PM", occupied: true, notes: "Checkout moved to 2 PM", strip: { assignee: "alejandro", requestedBy: "rosa", completed: false } }],
];

export const ROOMS: Room[] = SEED.map(([number, type, service, state, housekeeper, inspector, extra], index) => ({
  id: number,
  number,
  type,
  service,
  state,
  dnd: false,
  occupied: false,
  housekeeper,
  inspector,
  activity: [
    ...(state === "inspected" ? [{ kind: "inspected" as const, service, staffId: inspector }] : []),
    ...(state === "clean" || state === "inspected"
      ? [{ kind: "clean" as const, service, staffId: housekeeper, minutes: extra?.minutes }]
      : []),
    // Sample history for the existing boards. New rooms start with an empty history.
    ...([2, 5, 8].map((daysAgo, offset): RoomActivity => ({
      kind: "clean",
      service: offset === 1 ? "refresh" : service,
      staffId: STAFF.some((person) => person.id === housekeeper) ? housekeeper : STAFF[index % 4].id,
      at: Date.UTC(2026, 10, 13 - daysAgo, 18 + offset, (index * 7) % 60),
      minutes: offset === 1 ? 14 + index % 5 : PACE[service] + index % 7 - offset,
      inspectedBy: offset === 0 ? STAFF.find((person) => person.id === inspector)?.name : undefined,
      paused: offset === 2 ? "<1m" : undefined,
    }))),
    ...(["dnd", "incomplete"] as const).map((kind, offset): RoomActivity => ({
      kind,
      service,
      staffId: STAFF.some((person) => person.id === housekeeper) ? housekeeper : STAFF[index % 4].id,
      at: Date.UTC(2026, 10, 3 - offset, 22, (index * 7) % 60),
    })),
  ],
  ...extra,
}));

/** `40m`, `1h`, `1h 2m`. */
export function formatDuration(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const rest = Math.round(minutes % 60);
  if (!hours) return `${rest}m`;
  return rest ? `${hours}h ${rest}m` : `${hours}h`;
}

/** A running timer stays `mm:ss`. */
export function formatTimer(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function placeOf(room: Room, role: Role) {
  return role === "inspector" ? room.inspector : room.housekeeper;
}

export function isDone(room: Room, role: Role) {
  return role === "inspector" ? room.state === "inspected" : room.state === "clean" || room.state === "inspected";
}
