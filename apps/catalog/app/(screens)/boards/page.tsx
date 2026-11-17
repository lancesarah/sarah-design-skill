"use client";

import { Button, Checkbox, Chip, ConfirmDialog, Icon, IconButton, OverlayMenu, Person, Tabs, WidgetFigure } from "@lance-live/sds";
import { useEffect, useMemo, useRef, useState, type DragEvent, type MouseEvent as ReactMouseEvent } from "react";
import { useNotify } from "../action-toast";
import { FilterMenu, SearchBox } from "../chrome";
import { PageLayout } from "../page-layout";
import { BoardCalendar, BoardRoomStats, LimitsPage, RoomEditor, ShiftPage, ReportPage, defaultLimits, todayKey, dateLabel, type BoardLimits } from "./workflow-pages";
import { HousekeeperProfile } from "./housekeeper-profile";
import { UploadBoard, type UploadMode, type UploadRoom } from "./upload-board";
import { BulkEditDialog } from "./bulk-edit";
import { RecentBoardActivity, RoomActivityPanel } from "./room-activity";
import { printBoard } from "./print-board";
import { BoardCard, BoardSummary, CardMore, HeadFact, RoomRow, RoomSkeletons, RoomsEmpty, ServiceSplit, StaffLead, Tipped, useAnchoredMenu } from "./board-parts";
import {
  DND_LIST,
  LIST_COLORS,
  LISTS,
  ROOMS,
  SERVICES,
  STAFF,
  OTHER_BOARD_STAFF,
  UNASSIGNED,
  formatDuration,
  isDone,
  placeOf,
  prefers,
  roomFloor,
  type CustomList,
  type ListColor,
  type Place,
  type Role,
  type Room,
  type Service,
  type Staff,
} from "./data";

type Workflow = { kind: "stats"; group: "departures" | "stayovers" } | { kind: "limits"; person?: string } | { kind: "room"; room?: Room } | { kind: "shift"; person: Staff } | { kind: "report" };


const FILTER_OPTIONS = SERVICES.map((item) => item.label);
const LIST_COLORS_STORAGE = "boards-list-colors";

/** How long the skeletons glimmer before the rooms land, and how long the landing takes. Match the CSS in boards.css. */
const ASSIGN_HOLD_MS = 1000;
const ASSIGN_REVEAL_MS = 800;

/** Not started first, so the next room to clean is on top. Do not disturb stays in that order. */
function sortRooms(rooms: Room[], role: Role) {
  const rank = (room: Room) => (isDone(room, role) ? 2 : room.state === "cleaning" || (role === "inspector" && room.state === "clean") ? 0 : 1);
  return [...rooms].sort((a, b) => rank(a) - rank(b) || a.number.localeCompare(b.number, undefined, { numeric: true }));
}

function recordActivity(previous: Room, next: Room, at: number): Room {
  let kind: NonNullable<Room["activity"]>[number]["kind"];
  if (!previous.dnd && next.dnd) kind = "dnd";
  else if (previous.state !== next.state && next.state === "dirty") kind = "incomplete";
  else if (previous.state !== next.state && next.state === "inspected") kind = "inspected";
  else if (previous.state !== "clean" && previous.state !== "inspected" && next.state === "clean") kind = "clean";
  else return next;
  return {
    ...next,
    activity: [{
      kind,
      service: next.service,
      staffId: kind === "inspected" ? next.inspector : previous.housekeeper,
      at,
      minutes: kind === "clean" && previous.timer !== undefined ? Math.max(1, Math.round(previous.timer / 60)) : undefined,
    }, ...(previous.activity ?? [])],
  };
}

export default function BoardsPage() {
  const notify = useNotify();
  const [sideListsOpen, setSideListsOpen] = useState(true);
  const [profileName, setProfileName] = useState<string | null>(null);
  useEffect(() => {
    const readProfile = () => {
      const params = new URLSearchParams(window.location.hash.slice(1));
      setProfileName(params.get("inspector") ?? params.get("housekeeper"));
      if (params.has("inspector")) setRole("inspector");
    };
    readProfile();
    window.addEventListener("popstate", readProfile);
    window.addEventListener("hashchange", readProfile);
    return () => {
      window.removeEventListener("popstate", readProfile);
      window.removeEventListener("hashchange", readProfile);
    };
  }, []);
  function openProfile(name: string | null) {
    const profileRole = staff.find(person => person.name === name)?.role ?? "housekeeper";
    const hash = name ? `#${new URLSearchParams({ [profileRole]: name })}` : "";
    window.history.pushState(null, "", `${window.location.pathname}${window.location.search}${hash}`);
    setProfileName(name);
  }
  const [role, setRole] = useState<Role>("housekeeper");
  const [rooms, setRooms] = useState<Room[]>(ROOMS);
  const [staff, setStaff] = useState<Staff[]>(STAFF);
  const [lists, setLists] = useState<CustomList[]>(LISTS);
  const [listColors, setListColors] = useState<Record<string, ListColor>>({});
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(LIST_COLORS_STORAGE) ?? "{}");
      setListColors(Object.fromEntries(Object.entries(stored).filter((entry): entry is [string, ListColor] => LIST_COLORS.some(color => color === entry[1]))));
    } catch {
      // List colors still work in this session when browser storage is unavailable.
    }
  }, []);
  const [staffQuery, setStaffQuery] = useState("");
  const [query, setQuery] = useState("");
  const [services, setServices] = useState<string[]>([]);
  const [date, setDate] = useState(todayKey);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [bulkEditOpen, setBulkEditOpen] = useState(false);
  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [limits, setLimits] = useState<BoardLimits>(defaultLimits);
  const dayPreviews = useRef<Record<string, { rooms: Room[]; staff: Staff[]; lists: CustomList[] }>>({});

  function importBoard(incoming: UploadRoom[], mode: UploadMode) {
    const importId = crypto.randomUUID();
    setRooms(current => {
      const next = [...current];
      incoming.forEach((room, index) => {
        const existing = next.findIndex(item => item.number === room.number);
        if (existing >= 0 && mode === "skip_duplicates") return;
        if (existing >= 0 && mode === "upsert") {
          const previous = next[existing];
          next[existing] = { ...previous, ...room, timer: undefined, minutes: undefined };
          return;
        }
        next.push({
          ...room,
          id: `${importId}-${index}`,
          type: next[existing]?.type ?? "KSTE",
          dnd: false,
          housekeeper: UNASSIGNED,
          inspector: UNASSIGNED,
        });
      });
      return next;
    });
  }

  function markImportedDnd(numbers: string[]) {
    const marked = new Set(numbers);
    const at = Date.now();
    setRooms(current => current.map(room => marked.has(room.number)
      ? recordActivity(room, { ...room, dnd: true, housekeeper: room.housekeeper === UNASSIGNED ? DND_LIST : room.housekeeper }, at)
      : room,
    ));
  }

  function changeDate(next: string) {
    dayPreviews.current[date] = { rooms, staff, lists };
    const snapshot = dayPreviews.current[next];
    setRooms(snapshot?.rooms ?? structuredClone(ROOMS));
    setStaff(snapshot?.staff ?? structuredClone(STAFF));
    setLists(snapshot?.lists ?? structuredClone(LISTS));
    setDate(next);
    setSelected(new Set());
    setActivityRoomId(null);
    headMenu.close();
  }
  const [dragId, setDragId] = useState<string | null>(null);
  const [dropOn, setDropOn] = useState<Place | null>(null);
  const [editingRoom, setEditingRoom] = useState<string | null>(null);
  const [activityRoomId, setActivityRoomId] = useState<string | null>(null);
  const [activityClosing, setActivityClosing] = useState(false);
  function openRoomActivity(id: string) { setActivityClosing(false); setActivityRoomId(id); }
  const activityRoom = rooms.find((room) => room.id === activityRoomId);
  const [namingList, setNamingList] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<CustomList | null>(null);
  /** A red action waiting on its confirm card. */
  const [confirming, setConfirming] = useState<{ action: string; title: string; detail: string; run: () => void } | null>(null);
  const [folded, setFolded] = useState<Set<string>>(() => new Set());
  const [selected, setSelected] = useState<Set<string>>(() => new Set());
  const [contextIds, setContextIds] = useState<Set<string>>(() => new Set());
  const [lastPick, setLastPick] = useState<string | null>(null);
  const [assigning, setAssigning] = useState<Map<string, string> | null>(null);
  const [arrived, setArrived] = useState<Set<string>>(() => new Set());

  const serviceMenu = useAnchoredMenu<string>();
  const cardMenu = useAnchoredMenu<string>();
  const listMenu = useAnchoredMenu<string>();
  const listColorAnchor = useRef<HTMLButtonElement>(null);
  const [listColorOpen, setListColorOpen] = useState(false);
  const headMenu = useAnchoredMenu<"more" | "date" | "activity">();
  const [previewStartedAt] = useState(Date.now);
  const [activityOpenedAt, setActivityOpenedAt] = useState(0);
  const addMenu = useAnchoredMenu<"add">();
  const pickMenu = useAnchoredMenu<"move" | "service">();
  const roomMenu = useAnchoredMenu<"room">();
  const [roomMenuFromDetail, setRoomMenuFromDetail] = useState(false);

  useEffect(() => {
    if (!selected.size) return;
    const clear = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || event.defaultPrevented || document.querySelector(".sds.menu")) return;
      setSelected(new Set());
    };
    document.addEventListener("keydown", clear);
    return () => document.removeEventListener("keydown", clear);
  }, [selected.size]);

  const [clock, setClock] = useState<number | null>(null);

  useEffect(() => {
    const read = () => {
      const now = new Date();
      setClock(now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds());
    };
    read();
    const tick = window.setInterval(read, 1000);
    return () => window.clearInterval(tick);
  }, []);

  useEffect(() => {
    const tick = window.setInterval(() => {
      setRooms((current) => (current.some((room) => room.state === "cleaning") ? current.map((room) => (room.state === "cleaning" && room.timer !== undefined ? { ...room, timer: room.timer + 1 } : room)) : current));
    }, 1000);
    return () => window.clearInterval(tick);
  }, []);

  const crew = staff.filter((person) => person.role === role);
  const onBoard = crew.filter((person) => person.onBoard);
  const offBoard = crew.filter((person) => !person.onBoard && !person.preferences?.offboarded);
  const roleLists = lists.filter((list) => list.role === role);
  /** The rooms in the air: the whole selection when a picked room is dragged. */
  const lifted = dragId ? rooms.filter((room) => (selected.has(dragId) ? selected.has(room.id) : room.id === dragId)) : [];
  const unassigned = rooms.filter((room) => placeOf(room, role) === UNASSIGNED && !room.dnd);

  const matches = useMemo(() => {
    const q = query.trim();
    const picked = new Set(SERVICES.filter((item) => services.includes(item.label)).map((item) => item.value));
    return (room: Room) => (!q || room.number.startsWith(q)) && (!picked.size || picked.has(room.service));
  }, [query, services]);

  const fold = (place: Place) => {
    const key = `${role}:${place}`;
    return {
      open: !folded.has(key),
      onOpenChange: (open: boolean) =>
        setFolded((current) => {
          const next = new Set(current);
          if (open) next.delete(key);
          else next.add(key);
          return next;
        }),
    };
  };
  const cardPlaces = [...onBoard.map((person) => person.id), UNASSIGNED, ...(role === "housekeeper" ? [DND_LIST] : []), ...roleLists.map((list) => `list:${list.id}`)];
  const allFolded = cardPlaces.every((place) => folded.has(`${role}:${place}`));
  const foldAll = (shut: boolean) =>
    setFolded((current) => {
      const next = new Set(current);
      for (const place of cardPlaces) {
        if (shut) next.add(`${role}:${place}`);
        else next.delete(`${role}:${place}`);
      }
      return next;
    });

  const roomsIn = (place: Place) => sortRooms(rooms.filter((room) => placeOf(room, role) === place), role);
  const dndRooms = roomsIn(DND_LIST);
  const flaggedOnBoards = rooms.filter((room) => room.dnd && onBoard.some((person) => person.id === room.housekeeper));

  function move(roomId: string, place: Place) {
    moveMany(new Set([roomId]), place);
  }

  function moveMany(ids: Set<string>, place: Place) {
    const at = Date.now();
    setRooms((current) => current.map((room) => (ids.has(room.id) ? recordActivity(room, role === "inspector" ? { ...room, inspector: place } : { ...room, housekeeper: place, dnd: place === DND_LIST ? true : room.dnd }, at) : room)));
  }

  const placeName = (place: Place) =>
    place === UNASSIGNED ? "Unassigned" : place === DND_LIST ? "Do not disturb" : place.startsWith("list:") ? (lists.find((list) => `list:${list.id}` === place)?.name ?? "the list") : (staff.find((person) => person.id === place)?.name.split(" ")[0] ?? "the board");

  const picked = rooms.filter((room) => selected.has(room.id));
  const pickedNoun = `${picked.length} ${picked.length === 1 ? "room" : "rooms"}`;
  const pickedClean = picked.length > 0 && picked.every((room) => isDone(room, "housekeeper"));

  function actOnPicked(message: string, change: (room: Room) => Room) {
    const before = rooms;
    const at = Date.now();
    setRooms((current) => current.map((room) => (selected.has(room.id) ? recordActivity(room, change(room), at) : room)));
    setSelected(new Set());
    withUndo(message, before);
  }

  function applyBulkEdit(ids: Set<string>, patch: Partial<Room>) {
    const before = rooms;
    const at = Date.now();
    setRooms(current => current.map(room => {
      if (!ids.has(room.id)) return room;
      const next = { ...room, ...patch };
      if (patch.dnd !== undefined || patch.housekeeper !== undefined) {
        if (next.dnd && next.housekeeper === UNASSIGNED) next.housekeeper = DND_LIST;
        if (!next.dnd && next.housekeeper === DND_LIST) next.housekeeper = UNASSIGNED;
      }
      if (next.state !== room.state) {
        next.timer = next.state === "cleaning" ? 0 : undefined;
        if (!isDone(next, "housekeeper")) next.minutes = undefined;
        else if (room.timer !== undefined) next.minutes = Math.max(1, Math.round(room.timer / 60));
      }
      return recordActivity(room, next, at);
    }));
    setBulkEditOpen(false);
    withUndo(`${ids.size} ${ids.size === 1 ? "room" : "rooms"} updated`, before);
  }

  function movePicked(place: Place) {
    const before = rooms;
    moveMany(selected, place);
    setSelected(new Set());
    withUndo(`${pickedNoun} moved to ${placeName(place)}`, before);
  }

  function withUndo(message: string, before: Room[], extra?: () => void) {
    notify({
      message,
      action: "Undo",
      onAction: () => {
        setRooms(before);
        extra?.();
      },
    });
  }

  function autoAssign() {
    if (assigning || !onBoard.length || !unassigned.length) return;
    const before = rooms;
    const available = onBoard.filter(person => !person.boardState || person.boardState === "active");
    const workloads = new Map(available.map(person => [person.id, rooms.filter(room => placeOf(room, role) === person.id)]));
    const placed = new Map<string, string>();
    const overflow: Room[] = [];

    function withinLimits(person: Staff, room: Room) {
      const own = workloads.get(person.id)!;
      const cap = (key: keyof BoardLimits["global"]) => limits.personal[person.id]?.[key] ?? limits.global[key];
      const maxRooms = role === "inspector" ? person.max ?? cap("Rooms") : cap("Rooms");
      if (maxRooms !== undefined && own.length >= maxRooms) return false;
      if (role === "inspector") return true;
      const checks = [
        ["Checkouts", room.service === "checkout", own.filter(item => item.service === "checkout").length],
        ["Queens", room.type === "QQST", own.filter(item => item.type === "QQST").length],
        ["Suites", room.type === "SUIT", own.filter(item => item.type === "SUIT").length],
      ] as const;
      if (checks.some(([key, applies, count]) => applies && count >= (cap(key) ?? Infinity))) return false;
      return new Set([...own, room].map(item => roomFloor(item.number)).filter(Boolean)).size <= (cap("Floors") ?? Infinity);
    }

    function assign(room: Room, candidates: Staff[]) {
      if (!candidates.length) return false;
      const compare = (a: Staff, b: Staff) => {
        const aRooms = workloads.get(a.id)!;
        const bRooms = workloads.get(b.id)!;
        if (role === "housekeeper" && room.service === "checkout") {
          const checkoutDifference = aRooms.filter(item => item.service === "checkout").length - bRooms.filter(item => item.service === "checkout").length;
          if (checkoutDifference) return checkoutDifference;
        }
        return aRooms.length - bRooms.length;
      };
      const next = candidates.reduce((least, person) => compare(person, least) < 0 ? person : least);
      placed.set(room.id, next.id);
      workloads.get(next.id)!.push(room);
      return true;
    }

    for (const room of unassigned) {
      if (!assign(room, available.filter(person => withinLimits(person, room)))) overflow.push(room);
    }
    if (!limits.hard) {
      for (const room of overflow) assign(room, available);
    }
    if (!placed.size) return;
    const commit = () => {
      setRooms((current) => current.map((room) => (placed.has(room.id) ? (role === "inspector" ? { ...room, inspector: placed.get(room.id)! } : { ...room, housekeeper: placed.get(room.id)! }) : room)));
      withUndo(`${placed.size} ${placed.size === 1 ? "room" : "rooms"} assigned`, before);
    };
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return commit();
    setAssigning(placed);
    window.setTimeout(() => {
      commit();
      setAssigning(null);
      setArrived(new Set(placed.keys()));
      window.setTimeout(() => setArrived(new Set()), ASSIGN_REVEAL_MS);
    }, ASSIGN_HOLD_MS);
  }

  function unassignAll() {
    const before = rooms;
    const ids = new Set(onBoard.map((person) => person.id));
    setRooms((current) => current.map((room) => (ids.has(placeOf(room, role)) ? (role === "inspector" ? { ...room, inspector: UNASSIGNED } : { ...room, housekeeper: UNASSIGNED }) : room)));
    withUndo("Every room is unassigned", before);
  }

  function removeBoard(person: Staff) {
    const before = rooms;
    setStaff((current) => current.map((item) => (item.id === person.id ? { ...item, onBoard: false } : item)));
    setRooms((current) => current.map((room) => (placeOf(room, role) === person.id ? (role === "inspector" ? { ...room, inspector: UNASSIGNED } : { ...room, housekeeper: UNASSIGNED }) : room)));
    withUndo(`${person.name.split(" ")[0]} is off today's board`, before, () => setStaff((current) => current.map((item) => (item.id === person.id ? { ...item, onBoard: true } : item))));
  }

  function collectDnds() {
    const before = rooms;
    const ids = new Set(flaggedOnBoards.map((room) => room.id));
    setRooms((current) => current.map((room) => (ids.has(room.id) ? { ...room, housekeeper: DND_LIST } : room)));
    withUndo(`${ids.size} DND ${ids.size === 1 ? "room" : "rooms"} collected`, before);
  }

  function addRoom() { setWorkflow({ kind: "room" }); }

  function addList() {
    const id = `list-${Date.now()}`;
    setLists((current) => [...current, { id, name: "", role }]);
    setNamingList(id);
  }

  function changeListColor(id: string, color?: ListColor) {
    const next = { ...listColors };
    if (color) next[id] = color;
    else delete next[id];
    setListColors(next);
    try {
      localStorage.setItem(LIST_COLORS_STORAGE, JSON.stringify(next));
    } catch {
      // Keep the in-memory preference.
    }
  }

  function reorderList(list: CustomList, direction: -1 | 1) {
    setLists(current => {
      const sameRole = current.filter(item => item.role === list.role);
      const neighbor = sameRole[sameRole.findIndex(item => item.id === list.id) + direction];
      if (!neighbor) return current;
      const next = [...current];
      const from = current.findIndex(item => item.id === list.id);
      const to = current.indexOf(neighbor);
      [next[from], next[to]] = [next[to], next[from]];
      return next;
    });
    listMenu.close();
    listMenu.anchorRef.current?.focus();
  }

  function dropZone(place: Place) {
    return {
      dropping: dropOn === place,
      onDragOver: (event: DragEvent<HTMLElement>) => {
        if (!dragId) return;
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
        if (dropOn !== place) setDropOn(place);
      },
      onDragLeave: (event: DragEvent<HTMLElement>) => {
        if (event.currentTarget.contains(event.relatedTarget as Node | null)) return;
        setDropOn((current) => (current === place ? null : current));
      },
      onDrop: (event: DragEvent<HTMLElement>) => {
        event.preventDefault();
        const id = event.dataTransfer.getData("text/plain") || dragId;
        if (id && selected.has(id)) {
          moveMany(selected, place);
          setSelected(new Set());
        } else if (id) move(id, place);
        setDragId(null);
        setDropOn(null);
      },
    };
  }

  function toggleDnd(room: Room) {
    const at = Date.now();
    setRooms((current) =>
      current.map((item) => {
        if (item.id !== room.id) return item;
        const dnd = !item.dnd;
        return recordActivity(item, { ...item, dnd, housekeeper: !dnd && item.housekeeper === DND_LIST ? UNASSIGNED : item.housekeeper }, at);
      }),
    );
  }

  function openRoomMenu(event: ReactMouseEvent<HTMLDivElement>, roomId: string) {
    event.preventDefault();
    setRoomMenuFromDetail(false);
    setContextIds(selected.has(roomId) ? new Set(selected) : new Set([roomId]));
    roomMenu.open("room", event.currentTarget, { x: event.clientX, y: event.clientY });
  }

  function finishContext(message: string, change: (room: Room) => Room | null) {
    const ids = contextIds;
    const count = ids.size;
    const noun = `${count} ${count === 1 ? "room" : "rooms"}`;
    const before = rooms;
    const at = Date.now();
    setRooms((current) => current.flatMap((room) => {
      if (!ids.has(room.id)) return [room];
      const next = change(room);
      return next ? [recordActivity(room, next, at)] : [];
    }));
    setSelected((current) => {
      const next = new Set(current);
      for (const id of ids) next.delete(id);
      return next;
    });
    roomMenu.close();
    withUndo(`${noun} ${message}`, before);
  }

  function toggleOccupied(room: Room) {
    setRooms((current) => current.map((item) => (item.id === room.id ? { ...item, occupied: !item.occupied } : item)));
  }

  function setRoomSelection(ids: string[], on: boolean) {
    setSelected((current) => {
      const next = new Set(current);
      for (const id of ids) {
        if (on) next.add(id);
        else next.delete(id);
      }
      return next;
    });
  }

  function renderListSelection(list: Room[], label: string) {
    const ids = list.filter(matches).map((room) => room.id);
    const all = ids.length > 0 && ids.every((id) => selected.has(id));
    const some = ids.some((id) => selected.has(id));
    return (
      <Checkbox
        className="board-list-select"
        aria-label={`Select all rooms in ${label}`}
        aria-checked={all ? true : some ? "mixed" : false}
        checked={all}
        disabled={ids.length === 0}
        onCheckedChange={on => {
          setRoomSelection(ids, on);
          setLastPick(null);
        }}
      />
    );
  }

  function renderRows(list: Room[], empty: string, pending = 0) {
    const shown = list.filter(matches);
    if (!shown.length && !pending) return <RoomsEmpty>{list.length ? "No rooms match" : empty}</RoomsEmpty>;
    const landing = shown.filter((room) => arrived.has(room.id));
    const pick = (id: string, on: boolean, range: boolean) => {
      const from = range && lastPick ? shown.findIndex((room) => room.id === lastPick) : -1;
      const to = shown.findIndex((room) => room.id === id);
      const ids = from === -1 ? [id] : shown.slice(Math.min(from, to), Math.max(from, to) + 1).map((room) => room.id);
      setRoomSelection(ids, on);
      setLastPick(id);
    };
    return (
      <ul className="board-rooms">
        {shown.map((room) => (
          <RoomRow
            key={room.id}
            room={room}
            role={role}
            selected={selected.has(room.id)}
            onSelect={(on, range) => pick(room.id, on, range)}
            dragging={dragId === room.id || (dragId !== null && selected.has(dragId) && selected.has(room.id))}
            editing={editingRoom === room.id}
            serviceOpen={serviceMenu.target === room.id}
            onDragStart={(event) => {
              event.dataTransfer.setData("text/plain", room.id);
              event.dataTransfer.effectAllowed = "move";
              setDragId(room.id);
            }}
            onDragEnd={() => {
              setDragId(null);
              setDropOn(null);
            }}
            onServiceClick={(anchor) => serviceMenu.open(room.id, anchor)}
            onToggleDnd={() => toggleDnd(room)}
            onToggleOccupied={() => toggleOccupied(room)}
            onOpenActivity={() => openRoomActivity(room.id)}
            onNumberDone={(value) => {
              setEditingRoom(null);
              setRooms((current) => (value ? current.map((item) => (item.id === room.id ? { ...item, id: item.id, number: value } : item)) : current.filter((item) => item.id !== room.id)));
            }}
            onContextMenu={(event) => openRoomMenu(event, room.id)}
            motion={assigning?.has(room.id) ? "leaving" : arrived.has(room.id) ? "arriving" : undefined}
            order={landing.indexOf(room)}
          />
        ))}
        {pending ? <RoomSkeletons count={pending} /> : null}
      </ul>
    );
  }

  const menuRoom = rooms.find((room) => room.id === serviceMenu.target) ?? null;
  const menuStaff = staff.find((person) => person.id === cardMenu.target) ?? null;
  const menuList = lists.find((list) => list.id === listMenu.target) ?? null;
  const menuListColor = menuList ? listColors[menuList.id] : undefined;
  const menuListIndex = roleLists.findIndex(list => list.id === listMenu.target);
  const roleNoun = role === "inspector" ? "inspector" : "housekeeper";

  const profile = profileName ? staff.find(person => person.name === profileName) ?? {
    id: `history:${profileName}`, name: profileName, initials: profileName.split(" ").slice(0, 2).map(part => part[0]).join(""), role: "housekeeper" as const, onBoard: false,
  } : null;
  const roomActionsMenu = (<OverlayMenu open={roomMenu.target === "room"} anchorRef={roomMenu.anchorRef} marker={roomMenu.marker} point={roomMenu.point} label="Room actions">
        {(() => {
          const chosen = rooms.filter((room) => contextIds.has(room.id));
          const done = chosen.length > 0 && chosen.every((room) => isDone(room, role));
          return (
            <>
              {chosen.length === 1 ? <button type="button" className="menu-item" role="menuitem" onClick={() => { setWorkflow({ kind: "room", room: chosen[0] }); roomMenu.close(); setActivityRoomId(null); }}><Icon name="edit" size={14} />Edit room…</button> : null}
              {!roomMenuFromDetail ? <>
                <div className="board-menu-count">
                  {chosen.length} {chosen.length === 1 ? "room" : "rooms"} selected
                </div>
                <div className="menu-rule" role="separator" />
              </> : null}
              {chosen.some((room) => placeOf(room, role) !== UNASSIGNED) ? (
                <button className="menu-item" type="button" role="menuitem" onClick={() => finishContext("moved to Unassigned", (room) => (role === "inspector" ? { ...room, inspector: UNASSIGNED } : { ...room, housekeeper: UNASSIGNED }))}>
                  <Person name="Unassigned" variant="unassigned" />
                </button>
              ) : null}
              {onBoard
                .filter((person) => !(chosen.length && chosen.every((room) => placeOf(room, role) === person.id)))
                .map((person) => (
                  <button
                    key={person.id}
                    className="menu-item"
                    type="button"
                    role="menuitem"
                    onClick={() => finishContext(`moved to ${person.name.split(" ")[0]}`, (room) => (role === "inspector" ? { ...room, inspector: person.id } : { ...room, housekeeper: person.id }))}
                  >
                    <Person name={person.name} initials={person.initials} variant="pill" />
                    
                  </button>
                ))}
              <div className="menu-rule" role="separator" />
              <button
                className="menu-item"
                type="button"
                role="menuitem"
                onClick={() =>
                  finishContext(done ? "marked incomplete" : "marked complete", (room) =>
                    role === "inspector" ? { ...room, state: done ? "clean" : "inspected", timer: undefined } : { ...room, state: done ? "dirty" : "clean", timer: undefined },
                  )
                }
              >
                {done ? (
                  <svg className="i" width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
                    <circle cx="7" cy="7" r="5" fill="none" stroke="currentColor" strokeDasharray="2.4 1.8" strokeLinecap="round" style={{ strokeWidth: "var(--icon-stroke)" }} />
                  </svg>
                ) : (
                  <Icon name="check" size={14} />
                )}
                {done ? "Mark incomplete" : "Mark complete"}
              </button>
              <button className="menu-item danger" type="button" role="menuitem" onClick={() => {
                  roomMenu.close();
                  setConfirming({
                    action: "Delete",
                    title: chosen.length === 1 ? `Delete room ${chosen[0].number}?` : `Delete ${chosen.length} rooms?`,
                    detail: `${chosen.length === 1 ? "It comes" : "They come"} off today’s board for the whole team.`,
                    run: () => finishContext("deleted from the board", () => null),
                  });
                }}>
                <Icon name="trash" size={14} />
                Delete from board
              </button>
            </>
          );
        })()}
      </OverlayMenu>);
  const roomActionConfirmation = (<ConfirmDialog
        open={confirming !== null}
        name=""
        action={confirming?.action}
        title={confirming?.title}
        detail={confirming?.detail}
        onCancel={() => setConfirming(null)}
        onConfirm={() => {
          confirming?.run();
          setConfirming(null);
        }}
      />);
  const roomActivityPanel = activityRoom ? (
        <RoomActivityPanel
          room={activityRoom}
          onMore={(anchor) => { setRoomMenuFromDetail(true); setContextIds(new Set([activityRoom.id])); roomMenu.open("room", anchor); }}
          moreOpen={roomMenu.target === "room"}
          staff={staff}
          onPerson={openProfile}
          dateOffset={Math.round((Date.parse(`${date}T12:00:00`) - Date.parse(`${todayKey()}T12:00:00`)) / 86400000)}
          inspector={role === "inspector"}
          onInspectionSave={inspectionChecks => setRooms(current => current.map(room => room.id === activityRoom.id ? { ...room, inspectionChecks } : room))}
          onEdit={() => { setWorkflow({ kind: "room", room: activityRoom }); setActivityRoomId(null); }}
          onNotesChange={(notes) => setRooms((current) => current.map((room) => room.id === activityRoom.id ? { ...room, notes } : room))}
          hidden={activityClosing}
          onExited={() => { setActivityRoomId(null); setActivityClosing(false); }}
          onClose={() => setActivityClosing(true)}
        />
      ) : null;
  if (workflow?.kind === "stats") return <BoardRoomStats rooms={rooms} staff={staff} date={date} initial={workflow.group} onBack={() => setWorkflow(null)} />;
  if (workflow?.kind === "room" && workflow.room) return <RoomEditor room={workflow.room} rooms={rooms} staff={staff} onBack={() => setWorkflow(null)} onSave={next => { setRooms(current => current.some(room => room.id === next.id) ? current.map(room => room.id === next.id ? next : room) : [...current, next]); setWorkflow(null); notify("Room saved in this preview"); }} />;
  if (workflow?.kind === "shift") return <ShiftPage person={workflow.person} onBack={() => setWorkflow(null)} onSave={patch => { setStaff(current => current.map(person => person.id === workflow.person.id ? { ...person, ...patch } : person)); setWorkflow(null); }} />;
  if (workflow?.kind === "report") return <ReportPage rooms={rooms} staff={staff} date={date} onBack={() => setWorkflow(null)} />;
  if (profile) return <HousekeeperProfile key={profile.id} person={profile} onChange={patch => setStaff(current => current.map(person => person.id === profile.id ? { ...person, ...patch } : person))} onOffboard={() => {
    setStaff(current => current.map(person => person.id === profile.id ? { ...person, onBoard: false, preferences: { ...person.preferences, offboarded: true } } : person));
    setRooms(current => current.map(room => ({ ...room, housekeeper: room.housekeeper === profile.id ? UNASSIGNED : room.housekeeper, inspector: room.inspector === profile.id ? UNASSIGNED : room.inspector })));
  }} rooms={rooms} onBack={() => openProfile(null)} onRoom={openRoomActivity} overlay={<>{roomActivityPanel}{roomActionsMenu}{roomActionConfirmation}</>} />;

  return (
    <PageLayout
      className="sheet-page boards-page"
      data-view="head"
      icon="grid"
      title="Boards"
      count={rooms.filter((room) => room.number).length}
      actions={
        <>
          <Button variant="secondary" disabled={assigning !== null} aria-haspopup="menu" aria-expanded={headMenu.target === "date"} onClick={(event) => headMenu.open("date", event.currentTarget)}>
            <Icon name="calendar" size={14} />
            {dateLabel(date)}
          </Button>
          <Tipped label="Recent activity" below>
            <Button variant="secondary" icon aria-label="Recent activity" aria-haspopup="dialog" aria-expanded={headMenu.target === "activity"} onClick={event => {
              setActivityOpenedAt(Date.now());
              headMenu.open("activity", event.currentTarget);
            }}><Icon name="clock" size={14} /></Button>
          </Tipped>
          <Tipped label="Send HSK Opening Report" below><Button variant="secondary" icon aria-label="Send HSK Opening Report" onClick={() => setWorkflow({ kind: "report" })}><Icon name="mail" size={14} /></Button></Tipped>
          <Tipped label="Print boards" below><Button variant="secondary" icon aria-label="Print boards" onClick={() => printBoard(date, rooms, staff, lists)}><Icon name="print" size={14} /></Button></Tipped>
          <IconButton icon="dots" aria-label="More board actions" aria-haspopup="menu" aria-expanded={headMenu.target === "more"} onClick={(event) => headMenu.open("more", event.currentTarget)} />
          <Button onClick={() => setUploadOpen(true)}>
            <Icon name="upload" size={14} />
            Upload boards
          </Button>
        </>
      }
      tabs={
        <Tabs
          label="Boards"
          value={role}
          onValueChange={(value) => {
            setRole(value as Role);
            setSelected(new Set());
            roomMenu.close();
          }}
          items={[
            { value: "housekeeper", label: "Housekeepers", count: staff.filter((person) => person.role === "housekeeper" && person.onBoard).length },
            { value: "inspector", label: "Inspectors", count: staff.filter((person) => person.role === "inspector" && person.onBoard).length },
          ]}
        />
      }
    >
      <div className="boards-body">
        <div className={`boards-layout${sideListsOpen ? "" : " is-side-collapsed"}`}>
        <button type="button" className="boards-side-toggle" aria-label={sideListsOpen ? "Collapse side lists" : "Expand side lists"} aria-expanded={sideListsOpen} aria-controls="boards-side-lists" onClick={() => setSideListsOpen(open => !open)}><Icon name="chevron" size={16} /></button>
        <div className="boards-main">
        {
        picked.length ? (
          <div className="filter-row page-toolbar board-picked" role="toolbar" aria-label="Selected rooms">
            <span className="board-picked-count">{picked.length} rooms selected</span>
            <Button variant="secondary" aria-haspopup="menu" aria-expanded={pickMenu.target === "move"} onClick={(event) => pickMenu.open("move", event.currentTarget)}>
              <Icon name="board" size={14} />
              Move to
            </Button>
            {role === "housekeeper" ? (
              <Button variant="secondary" aria-haspopup="menu" aria-expanded={pickMenu.target === "service"} onClick={(event) => pickMenu.open("service", event.currentTarget)}>
                <Icon name="tag" size={14} />
                Service
              </Button>
            ) : null}
            <Button
              variant="secondary"
              onClick={() => actOnPicked(`${pickedNoun} marked ${pickedClean ? "not clean" : "clean"}`, (room) => ({ ...room, state: pickedClean ? "dirty" : "clean", timer: undefined }))}
            >
              <Icon name="check" size={14} />
              {pickedClean ? "Mark not clean" : "Mark clean"}
            </Button>
            {picked.some((room) => placeOf(room, role) !== UNASSIGNED) ? (
              <Button variant="secondary" onClick={() => movePicked(UNASSIGNED)}>
                <Icon name="close" size={14} />
                Unassign
              </Button>
            ) : null}
            <IconButton icon="close" size={16} className="board-picked-clear" aria-label="Clear selection" onClick={() => setSelected(new Set())} />
          </div>
        ) : (
        <div className="filter-row page-toolbar">
          <SearchBox placeholder="Search rooms" label="Search rooms" value={query} onValueChange={setQuery} />
          <FilterMenu value={services} onValueChange={setServices} options={FILTER_OPTIONS} />
          <div className="filter-chips">
            {services.map((value) => (
              <Chip key={value} filter={{ name: "Service", value }} onClick={() => setServices((current) => current.filter((item) => item !== value))} />
            ))}
          </div>
        </div>
        )
        }
        <div className="board-volume board-volume-overview" aria-label="Board statistics">
          <button type="button" className="board-volume-link" aria-label="View departures" onClick={() => setWorkflow({ kind: "stats", group: "departures" })}><WidgetFigure label="Departures" value={rooms.filter(room => room.service === "checkout").length} /></button>
          <button type="button" className="board-volume-link" aria-label="View stayovers" onClick={() => setWorkflow({ kind: "stats", group: "stayovers" })}><WidgetFigure label="Stayovers" value={rooms.filter(room => ["refresh", "full", "well"].includes(room.service)).length} /></button>
        </div>
        <div className="boards-grid">
          {onBoard.map((person) => {
            const own = roomsIn(person.id);
            const onShift = clock !== null && person.shiftStart !== undefined && clock >= person.shiftStart * 60 ? clock - person.shiftStart * 60 : null;
            const note =
              person.boardState && person.boardState !== "active" ? <span className="sds mini-pill">{{ excluded: "Excluded", "off-roster": "Off roster", "retained-off": "Off today" }[person.boardState]}</span> : person.selfInspect || onShift !== null ? (
                <>
                  {person.selfInspect ? <HeadFact icon="eye" label="Self inspects" /> : null}                  {onShift !== null ? <span className="board-shift" title="Time on shift">{formatDuration(Math.floor(onShift / 60))}</span> : null}
                </>
              ) : undefined;
            return (
              <BoardCard
                key={person.id}
                lead={<StaffLead staff={person} />}
                title={<button type="button" className="board-person-link" onClick={() => openProfile(person.name)}>{person.name}</button>}
                note={note}
                action={<CardMore label={`${person.name.split(" ")[0]}'s board options`} open={cardMenu.target === person.id} onOpen={(anchor) => cardMenu.open(person.id, anchor)} />}
                summary={<BoardSummary rooms={own} role={role} name={person.name} />}
                foot={<ServiceSplit rooms={own} prefer={person.prefer} />}
                className={lifted.some((room) => prefers(person, room)) ? "is-preferred" : undefined}
                {...fold(person.id)}
                {...dropZone(person.id)}
              >
                {renderRows(own, "No rooms yet", assigning ? [...assigning.values()].filter((id) => id === person.id).length : 0)}
              </BoardCard>
            );
          })}
          <button
            type="button"
            className="cash-new-location boards-add"
            aria-haspopup="menu"
            aria-expanded={addMenu.target === "add"}
            onClick={(event) => { setStaffQuery(""); addMenu.open("add", event.currentTarget); }}
          >
            <svg className="cash-new-stroke" aria-hidden="true">
              <rect x="0.5" y="0.5" width="calc(100% - 1px)" height="calc(100% - 1px)" rx="9.5" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="9 8" />
            </svg>
            <Icon name="plus" size={14} />
            Add {roleNoun}
          </button>
        </div>
        </div>

        <aside id="boards-side-lists" className="boards-side" aria-label="Side lists" aria-hidden={!sideListsOpen} inert={!sideListsOpen}>
          <BoardCard
            selection={renderListSelection(unassigned, "Unassigned")}
            title="Unassigned"
            count={unassigned.length}
            headerAction={
              unassigned.length && onBoard.length ? (
                <Button variant="tertiary" disabled={assigning !== null} onClick={autoAssign}>
                  <Icon name="sparkle" size={14} />
                  Auto-assign
                </Button>
              ) : null
            }
            {...fold(UNASSIGNED)}
            {...dropZone(UNASSIGNED)}
          >
            {renderRows(sortRooms(unassigned, role), "Every room is assigned")}
          </BoardCard>
          {role === "housekeeper" ? (
            <BoardCard
              selection={renderListSelection(dndRooms, "Do not disturb")}
              lead={<Icon name="moon" size={16} className="board-card-icon" />}
              title="Do not disturb"
              count={dndRooms.length}
              headerAction={
                flaggedOnBoards.length ? (
                  <Button variant="tertiary" onClick={collectDnds}>
                    <Icon name="up" size={14} className="board-collect-arrow" />
                    Collect {flaggedOnBoards.length} {flaggedOnBoards.length === 1 ? "DND" : "DNDs"}
                  </Button>
                ) : null
              }
              {...fold(DND_LIST)}
              {...dropZone(DND_LIST)}
            >
              {renderRows(dndRooms, "No rooms on DND")}
            </BoardCard>
          ) : null}
          {roleLists.map((list) => {
            const place = `list:${list.id}`;
            const color = listColors[list.id];
            return (
              <BoardCard
                key={list.id}
                className={color ? `board-custom-list list-color-${color.toLowerCase()}` : undefined}
                title={
                  namingList === list.id ? (
                    <input
                      className="board-list-name"
                      autoFocus
                      placeholder="List name"
                      aria-label="List name"
                      defaultValue={list.name}
                      onBlur={(event) => {
                        const name = event.currentTarget.value.trim();
                        setNamingList(null);
                        setLists((current) => (name ? current.map((item) => (item.id === list.id ? { ...item, name } : item)) : current.filter((item) => item.id !== list.id)));
                      }}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") event.currentTarget.blur();
                      }}
                    />
                  ) : (
                    list.name
                  )
                }
                count={namingList === list.id ? undefined : roomsIn(place).length}
                action={<CardMore label={`${list.name || "List"} options`} open={listMenu.target === list.id} onOpen={anchor => {
                  setListColorOpen(false);
                  listMenu.open(list.id, anchor);
                }} />}
                {...fold(place)}
                {...dropZone(place)}
              >
                {renderRows(roomsIn(place), "Drag rooms here")}
              </BoardCard>
            );
          })}
          <button type="button" className="cash-new-location" onClick={addList}>
            <svg className="cash-new-stroke" aria-hidden="true">
              <rect x="0.5" y="0.5" width="calc(100% - 1px)" height="calc(100% - 1px)" rx="9.5" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="9 8" />
            </svg>
            <Icon name="plus" size={14} />
            New list
          </button>
        </aside>
        </div>
      </div>

      <OverlayMenu open={serviceMenu.target !== null} anchorRef={serviceMenu.anchorRef} marker={serviceMenu.marker} label="Service">
        {SERVICES.map((item) => (
          <button
            key={item.value}
            className="menu-item"
            type="button"
            role="menuitemradio"
            aria-checked={menuRoom?.service === item.value}
            onClick={() => {
              const id = serviceMenu.target;
              setRooms((current) => current.map((room) => (room.id === id ? { ...room, service: item.value as Service } : room)));
              serviceMenu.close();
            }}
          >
            {item.label}
            <Icon name="check" size={14} className="check" />
          </button>
        ))}
      </OverlayMenu>

      <OverlayMenu open={cardMenu.target !== null} anchorRef={cardMenu.anchorRef} marker={cardMenu.marker} align="end" label="Board options">
        {menuStaff ? (
          <>
            {role === "housekeeper" ? (
              <button
                className="menu-item"
                type="button"
                role="menuitem"
                onClick={() => {
                  cardMenu.close();
                  setStaff((current) => current.map((item) => (item.id === menuStaff.id ? { ...item, selfInspect: !item.selfInspect } : item)));
                }}
              >
                <Icon name="eye" size={14} />
                {menuStaff.selfInspect ? "Disable self inspect" : "Enable self inspect"}
              </button>
            ) : null}
            <button
              className="menu-item"
              type="button"
              role="menuitem"
              onClick={() => {
                cardMenu.close();
                setWorkflow({ kind: "limits", person: menuStaff.id });
              }}
            >
              <Icon name="tune" size={14} />
              Edit limits…
            </button>
            {menuStaff.boardState === "excluded" && <button type="button" role="menuitem" className="menu-item" onClick={() => { setStaff(current => current.map(person => person.id === menuStaff.id ? { ...person, boardState: "active" } : person)); cardMenu.close(); }}><Icon name="eye" size={14} />Include in auto-assign</button>}
            <button type="button" role="menuitem" className="menu-item" onClick={() => { setWorkflow({ kind: "shift", person: menuStaff }); cardMenu.close(); }}><Icon name="clock" size={14} />Activate shift…</button>
            <button type="button" role="menuitem" className="menu-item" onClick={() => { setStaff(current => current.map(person => person.id === menuStaff.id ? { ...person, boardState: "retained-off" } : person)); cardMenu.close(); }}><Icon name="calendar" size={14} />Mark off today</button>
            <div className="menu-rule" role="separator" />
            <button
              className="menu-item danger"
              type="button"
              role="menuitem"
              onClick={() => {
                cardMenu.close();
                const person = menuStaff;
                setConfirming({
                  action: "Remove",
                  title: `Remove ${person.name}?`,
                  detail: `${person.name.split(" ")[0]} comes off today’s board, and their rooms go back to Unassigned.`,
                  run: () => removeBoard(person),
                });
              }}
            >
              <Icon name="trash" size={14} />
              Remove
            </button>
          </>
        ) : null}
      </OverlayMenu>

      <OverlayMenu open={listMenu.target !== null} anchorRef={listMenu.anchorRef} marker={listMenu.marker} align="end" label="List options" className="board-list-options">
        {menuList ? (
          <>
            <button
              className="menu-item"
              type="button"
              role="menuitem"
              onClick={() => {
                listMenu.close();
                setNamingList(menuList.id);
              }}
            >
              <Icon name="edit" size={14} />
              Rename
            </button>
            <button ref={listColorAnchor} className="menu-item" type="button" role="menuitem" aria-haspopup="menu" aria-expanded={listColorOpen} onClick={() => setListColorOpen(open => !open)}>
              <span className={`board-list-swatch list-color-${menuListColor?.toLowerCase() ?? "none"}`} aria-hidden="true" />
              List color
              <Icon name="chevron" className="board-list-color-chevron" size={14} />
            </button>
            <button className="menu-item" type="button" role="menuitem" disabled={menuListIndex <= 0} onClick={() => reorderList(menuList, -1)}>
              <Icon name="up" size={14} />Move up
            </button>
            <button className="menu-item" type="button" role="menuitem" disabled={menuListIndex >= roleLists.length - 1} onClick={() => reorderList(menuList, 1)}>
              <Icon name="up" className="board-list-arrow-down" size={14} />Move down
            </button>
            <div className="menu-rule" role="separator" />
            <button
              className="menu-item danger"
              type="button"
              role="menuitem"
              onClick={() => {
                listMenu.close();
                setDeleting(menuList);
              }}
            >
              <Icon name="trash" size={14} />
              Delete
            </button>
          </>
        ) : null}
      </OverlayMenu>

      <OverlayMenu open={Boolean(menuList) && listColorOpen} anchorRef={listColorAnchor} marker={listMenu.marker} placement="side" label="List color">
        {([undefined, ...LIST_COLORS]).map(color => (
          <button key={color ?? "none"} className="menu-item" type="button" role="menuitemradio" aria-checked={menuListColor === color} onClick={() => {
            if (menuList) changeListColor(menuList.id, color);
            setListColorOpen(false);
            listMenu.close();
            listMenu.anchorRef.current?.focus();
          }}>
            <span className={`board-list-swatch list-color-${color?.toLowerCase() ?? "none"}`} aria-hidden="true" />
            {color ?? "No color"}
            {menuListColor === color && <Icon name="check" className="board-list-color-chevron" size={14} />}
          </button>
        ))}
      </OverlayMenu>

      <OverlayMenu open={headMenu.target === "date"} anchorRef={headMenu.anchorRef} marker={headMenu.marker} align="end" label="Board date" className="board-calendar-menu">
        <BoardCalendar value={date} onChange={changeDate} />
      </OverlayMenu>

      <OverlayMenu open={headMenu.target === "activity"} anchorRef={headMenu.anchorRef} marker={headMenu.marker} align="end" role="dialog" label="Recent activity" className="board-recent-activity-menu">
        <RecentBoardActivity rooms={rooms} staff={staff} now={activityOpenedAt} previewStartedAt={date === todayKey() ? previewStartedAt : undefined} />
      </OverlayMenu>

      <OverlayMenu open={headMenu.target === "more"} anchorRef={headMenu.anchorRef} marker={headMenu.marker} align="end" label="More board actions">
        {[
          { icon: "plus", label: "Add room", run: addRoom },
          { icon: "edit", label: "Bulk edit", run: () => setBulkEditOpen(true) },
          { icon: "tune", label: "Edit limits", run: () => setWorkflow({ kind: "limits" }) },
          { icon: "chevron", label: allFolded ? "Expand all" : "Collapse all", run: () => foldAll(!allFolded) },
        ].map((item) => (
          <button
            key={item.label}
            className="menu-item"
            type="button"
            role="menuitem"
            onClick={() => {
              headMenu.close();
              item.run();
            }}
          >
            <Icon name={item.icon as "plus"} size={14} />
            {item.label}
          </button>
        ))}
        <div className="menu-rule" role="separator" />
        <button
          className="menu-item danger"
          type="button"
          role="menuitem"
          onClick={() => {
            headMenu.close();
            setConfirming({
              action: "Unassign all",
              title: "Unassign every room?",
              detail: `Every room on the ${roleNoun} boards goes back to Unassigned.`,
              run: unassignAll,
            });
          }}
        >
          <Icon name="close" size={14} />
          Unassign all
        </button>
      </OverlayMenu>

      <OverlayMenu open={addMenu.target === "add"} anchorRef={addMenu.anchorRef} marker={addMenu.marker} label={`Add ${roleNoun}`}>
        <label className="menu-search">
          <Icon name="search" size={18} />
          <input type="search" autoFocus placeholder="Search staff…" aria-label="Search staff" value={staffQuery} onChange={event => setStaffQuery(event.target.value)} />
        </label>
        <span className="menu-rule" role="separator" />
        <div className="board-staff-options">
          {[
            { title: `Off-duty ${role === "housekeeper" ? "housekeepers" : "inspectors"}`, people: offBoard.filter(person => !OTHER_BOARD_STAFF.some(other => person.id === `${role}:${other.id}`)).map(person => ({ ...person, department: "" })) },
            { title: "Other staff", people: OTHER_BOARD_STAFF.map(person => ({ ...person, id: `${role}:${person.id}`, role, onBoard: false })).filter(person => !staff.some(existing => existing.id === person.id && (existing.onBoard || existing.preferences?.offboarded))) },
          ].map(group => {
            const people = group.people.filter(person => `${person.name} ${person.department}`.toLowerCase().includes(staffQuery.trim().toLowerCase()));
            return people.length ? <div key={group.title} role="group" aria-label={group.title}>
              <span className="menu-section-title">{group.title}</span>
              {people.map(person => <button key={person.id} className="menu-item" type="button" role="menuitem" onClick={() => {
                setStaff(current => current.some(item => item.id === person.id)
                  ? current.map(item => item.id === person.id ? { ...item, onBoard: true } : item)
                  : [...current, { ...person, onBoard: true }]);
                addMenu.close();
              }}>
                <Person name={person.name} initials={person.initials} variant="pill" />
                {person.department ? <span className="menu-label-suffix">{person.department}</span> : null}
              </button>)}
            </div> : null;
          })}
          <p className="board-menu-note board-staff-empty">{staffQuery.trim() ? "No matching staff" : "Everyone is on the board"}</p>
        </div>
      </OverlayMenu>

      <OverlayMenu open={pickMenu.target === "move"} anchorRef={pickMenu.anchorRef} marker={pickMenu.marker} label={`Move ${pickedNoun} to`}>
        {onBoard.map((person) => (
          <button
            key={person.id}
            className="menu-item"
            type="button"
            role="menuitem"
            onClick={() => {
              pickMenu.close();
              movePicked(person.id);
            }}
          >
            <Person name={person.name} initials={person.initials} variant="pill" />
            
          </button>
        ))}
        <div className="menu-rule" role="separator" />
        <button
          className="menu-item"
          type="button"
          role="menuitem"
          onClick={() => {
            pickMenu.close();
            movePicked(UNASSIGNED);
          }}
        >
          <Person name="Unassigned" variant="unassigned" />
        </button>
        {[...(role === "housekeeper" ? [DND_LIST] : []), ...roleLists.filter((list) => list.name).map((list) => `list:${list.id}`)].map((place) => (
          <button
            key={place}
            className="menu-item"
            type="button"
            role="menuitem"
            onClick={() => {
              pickMenu.close();
              movePicked(place);
            }}
          >
            <Icon name={place === DND_LIST ? "moon" : "list"} size={14} />
            {placeName(place)}
          </button>
        ))}
      </OverlayMenu>

      {roomActionsMenu}

      <OverlayMenu open={pickMenu.target === "service"} anchorRef={pickMenu.anchorRef} marker={pickMenu.marker} label="Service">
        {SERVICES.map((item) => (
          <button
            key={item.value}
            className="menu-item"
            type="button"
            role="menuitemradio"
            aria-checked={picked.length > 0 && picked.every((room) => room.service === item.value)}
            onClick={() => {
              pickMenu.close();
              actOnPicked(`${pickedNoun} set to ${item.label}`, (room) => ({ ...room, service: item.value as Service }));
            }}
          >
            {item.label}
            <Icon name="check" size={14} className="check" />
          </button>
        ))}
      </OverlayMenu>

      {roomActionConfirmation}

      <ConfirmDialog
        open={deleting !== null}
        name={deleting?.name ?? ""}
        noun="list"
        onCancel={() => setDeleting(null)}
        onConfirm={() => {
          if (!deleting) return;
          const place = `list:${deleting.id}`;
          setRooms((current) => current.map((room) => (room.housekeeper === place ? { ...room, housekeeper: UNASSIGNED } : room.inspector === place ? { ...room, inspector: UNASSIGNED } : room)));
          setLists((current) => current.filter((list) => list.id !== deleting.id));
          setDeleting(null);
        }}
      />
      {roomActivityPanel}
      {bulkEditOpen ? <BulkEditDialog rooms={rooms} staff={staff} onClose={() => setBulkEditOpen(false)} onApply={applyBulkEdit} /> : null}
      {workflow?.kind === "limits" ? <LimitsPage value={limits} staff={staff.filter(person => person.role === "housekeeper" && (person.onBoard || person.id === workflow.person))} selected={workflow.person} onBack={() => setWorkflow(null)} onSave={next => { setLimits(next); setWorkflow(null); notify("Limits updated in this preview"); }} /> : null}
      {uploadOpen ? <UploadBoard
        date={date}
        roomNumbers={rooms.map(room => room.number)}
        onImport={importBoard}
        onMarkDnd={markImportedDnd}
        onClose={() => setUploadOpen(false)}
      /> : null}
      {workflow?.kind === "room" && !workflow.room ? <RoomEditor rooms={rooms} staff={staff} onBack={() => setWorkflow(null)} onSave={next => { setRooms(current => [...current, next]); setWorkflow(null); notify("Room saved in this preview"); }} /> : null}
    </PageLayout>
  );
}
