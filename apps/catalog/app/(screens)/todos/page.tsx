"use client";

import { ASSIGNEE_PEOPLE, ActivityFeed, AssigneeCell, Button, DetailPanel, Icon, OverlayMenu, StatusCell, Tabs, TaskFact, TaskTable, TitleSubtitle, TypeCell, UrgencyCell, captureClose, taskMenuItem, type ActivityItem, type TaskRow } from "@lance-live/gallery-ui";
import { useEffect, useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { FilterMenu, SearchBox } from "../chrome";
import { Glyph } from "../glyph";
import { PageLayout } from "../page-layout";

type Todo = TaskRow & { bucket: "open" | "scheduled" | "completed"; activity: ActivityItem[] };

const PILLOWS: ActivityItem[] = [
  { kind: "comment", name: "Sarah", initials: "SM", time: "now", body: "asdfasdf" },
  { kind: "comment", name: "Mark", initials: "MJ", time: "Oct 29, 5:05 PM", body: "I'll bring feather pillows up to 426." },
  { kind: "status", name: "Sarah", initials: "SM", text: "assigned this to Mark", time: "Oct 29, 4:24 PM" },
  { kind: "status", name: "Manual", initials: "M", text: "created this to-do", time: "Oct 29, 4:22 PM" },
];

const ROOMS = ["426", "244", "103", "436"];
const PLACES = ["Guestroom", "Laundry", "Lobby", "Common area"];
const ITEMS = ["Pillows", "Bedding", "Dryer", "Towels", "Climate"];

const STARTER: Todo[] = [
  { id: "pillows", room: "426", note: "Requested feathered pillows", place: "Guestroom", item: "Pillows", type: "Housekeeping", urgency: "high", status: "open", bucket: "open", assignee: "Mark", initials: "MJ", opened: "now", activity: PILLOWS },
  { id: "dryer", room: "244", note: "Dryer in the laundry is loud", place: "Laundry", item: "Dryer", type: "Maintenance", urgency: "standard", status: "progress", bucket: "open", assignee: "Paul", initials: "PG", opened: "1h", activity: [{ kind: "status", name: "Sarah", initials: "SM", text: "created this to-do", time: "1h" }] },
  { id: "towels", room: "103", note: "Extra towels for a late arrival", place: "Guestroom", item: "Towels", type: "Housekeeping", urgency: "low", status: "open", bucket: "scheduled", assignee: "Sarah", initials: "SM", opened: "2h", activity: [{ kind: "status", name: "Sarah", initials: "SM", text: "created this to-do", time: "2h" }] },
  { id: "ac", room: "436", note: "Air conditioning is warm", place: "Guestroom", item: "Climate", type: "Maintenance", urgency: "urgent", status: "open", bucket: "open", assignee: "Boris", initials: "B", opened: "3h", activity: [{ kind: "status", name: "Sarah", initials: "SM", text: "created this to-do", time: "3h" }] },
];

function TodoDetail({
  todo,
  hidden,
  onClose,
  onExited,
  onDeleted,
  onAssigneeChange,
  onPatch,
}: {
  todo: Todo;
  hidden: boolean;
  onClose: () => void;
  onExited: () => void;
  onDeleted: () => void;
  onAssigneeChange?: (todo: Todo, value: string) => void;
  onPatch?: (patch: { place?: string; item?: string; room?: string }) => void;
}) {
  const [field, setField] = useState<"status" | "urgency" | "type" | null>(null);
  const [roomOpen, setRoomOpen] = useState(false);
  const roomRef = useRef<HTMLButtonElement>(null);
  const rooms = todo.room && !ROOMS.includes(todo.room) ? [todo.room, ...ROOMS] : ROOMS;
  useEffect(() => {
    if (!roomOpen) return;
    const close = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (roomRef.current?.contains(target) || (target instanceof Element && target.closest(".menu"))) return;
      setRoomOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setRoomOpen(false);
    };
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", onKey);
    };
  }, [roomOpen]);
  const [status, setStatus] = useState(todo.status);
  const [urgency, setUrgency] = useState(todo.urgency);
  const [type, setType] = useState(todo.type);
  const toggle = (next: "status" | "urgency" | "type") => setField((current) => (current === next ? null : next));
  return (
    <DetailPanel
      label="To-do details"
      name={todo.note}
      noun="to-do"
      hidden={hidden}
      onClose={onClose}
      onExited={onExited}
      onDeleted={onDeleted}
      actions={
        <button className="btn btn-secondary" type="button">
          <Glyph name="calendar" />
          Schedule for future
        </button>
      }
    >
        <div className="todo-side-intro">
          <button
            ref={roomRef}
            className={todo.room ? "todo-side-room" : "todo-side-room is-quiet"}
            type="button"
            aria-label="Room"
            aria-haspopup="menu"
            aria-expanded={roomOpen}
            onClick={() => setRoomOpen((open) => !open)}
          >
            {todo.room || "—"}
          </button>
          <OverlayMenu open={roomOpen} anchorRef={roomRef} label="Room" onPointerDown={(event) => event.stopPropagation()}>
            {rooms.map((room) => taskMenuItem(room, room === todo.room, () => {
              onPatch?.({ room });
              setRoomOpen(false);
            }, room))}
          </OverlayMenu>
          <div className="todo-side-title-row">
            <div className="todo-side-facts">
              <TitleSubtitle
                variant="dropdown"
                size="title"
                title={[
                  { value: todo.place ?? "", placeholder: "Location", options: PLACES, onChange: (value) => onPatch?.({ place: value }) },
                  { value: todo.item ?? "", placeholder: "Item", options: ITEMS, onChange: (value) => onPatch?.({ item: value }) },
                ]}
                subtitle=""
              />
            </div>
            <time>{todo.opened}</time>
          </div>
        </div>
        <div className="todo-side-desc">
          <label className="sheet-label" htmlFor="side-desc">Description</label>
          <textarea id="side-desc" data-side-desc rows={1} defaultValue={todo.note} placeholder="Add a note" />
        </div>
        <div className="todo-side-rule" />
        <div className="todo-side-meta">
          <div>
            <span className="sheet-label">Location</span>
            <TaskFact empty={!todo.place}>{todo.place || "Location"}</TaskFact>
          </div>
          <div>
            <span className="sheet-label">Item</span>
            <TaskFact empty={!todo.item}>{todo.item || "Item"}</TaskFact>
          </div>
          <div>
            <span className="sheet-label">Type</span>
            <TypeCell value={type} onChange={setType} open={field === "type"} onToggle={() => toggle("type")} />
          </div>
          <div>
            <span className="sheet-label">Assigned</span>
            <AssigneeCell name={todo.assignee} initials={todo.initials} named onSelect={(value) => onAssigneeChange?.(todo, value)} />
          </div>
          <div>
            <span className="sheet-label">Status</span>
            <StatusCell value={status} onChange={setStatus} open={field === "status"} onToggle={() => toggle("status")} />
          </div>
          <div>
            <span className="sheet-label">Urgency</span>
            <UrgencyCell value={urgency} onChange={setUrgency} open={field === "urgency"} onToggle={() => toggle("urgency")} />
          </div>
        </div>
        <div className="todo-side-rule" />
        <ActivityFeed className="todo-side-activity" items={todo.activity} />
    </DetailPanel>
  );
}

export default function TodosPage() {
  const [todos, setTodos] = useState(STARTER);
  const [bucket, setBucket] = useState("open");
  const [query, setQuery] = useState("");
  const [type, setType] = useState("");
  const [auto, setAuto] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [enteringId, setEnteringId] = useState<string | null>(null);
  const [present, setPresent] = useState(false);
  const [hidden, setHidden] = useState(true);
  const retained = useRef<Todo | null>(null);

  const visible = useMemo(
    () =>
      todos.filter(
        (todo) =>
          todo.bucket === bucket &&
          (!type || todo.type === type) &&
          `${todo.room} ${todo.note}`.toLowerCase().includes(query.trim().toLowerCase()),
      ),
    [todos, bucket, query, type],
  );
  const open = visible.find((todo) => todo.id === selected) ?? null;
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

  // Blank record: empty room, location, item, note, and assignee. Status, urgency, and type
  // stay on the cells' resting values so those controls can render.
  function createTodo() {
    const id = `todo-${Date.now()}`;
    const person = auto ? ASSIGNEE_PEOPLE.find((item) => item.name === "Mark") : undefined;
    const blank: Todo = {
      id,
      room: "",
      note: "",
      place: "",
      item: "",
      type: "Housekeeping",
      urgency: "standard",
      status: "open",
      bucket: "open",
      assignee: person?.name ?? "",
      initials: person?.avatar ?? "",
      opened: "now",
      activity: [],
    };
    setBucket("open");
    setQuery("");
    setType("");
    setTodos((list) => [blank, ...list]);
    setSelected(id);
    setEnteringId(id);
  }

  useEffect(() => {
    if (!present || !hidden || open) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timer = window.setTimeout(() => setPresent(false), reduce ? 0 : 360);
    return () => window.clearTimeout(timer);
  }, [present, hidden, open]);

  return (
    <PageLayout
      className="todos-page"
      icon="clipboard"
      title="To-Dos"
      count={visible.length}
      actions={
        <>
          <Button
            variant="secondary"
            className="theme-switch"
            aria-pressed={auto}
            onClick={(event) => {
              event.currentTarget.classList.add("is-init");
              setAuto((value) => !value);
            }}
          >
            Auto-assign
            <span className="theme-switch-track" aria-hidden="true">
              <span className="theme-switch-knob" />
            </span>
          </Button>
          <Button onClick={createTodo}>
            <Icon name="plus-bold" size={14} />
            New
          </Button>
        </>
      }
      tabs={
        <Tabs
          label="To-do status"
          value={bucket}
          onValueChange={setBucket}
          items={[
            { value: "open", label: "Open", count: todos.filter((todo) => todo.bucket === "open").length },
            { value: "scheduled", label: "Scheduled", count: todos.filter((todo) => todo.bucket === "scheduled").length },
            { value: "completed", label: "Completed", count: todos.filter((todo) => todo.bucket === "completed").length },
          ]}
        />
      }
    >
      <div className="sheet-stack">
        <div className="filter-row page-toolbar">
          <SearchBox placeholder="Search to-dos" label="Search to-dos" value={query} onValueChange={setQuery} />
          <FilterMenu value={type} onValueChange={setType} options={["Housekeeping", "Maintenance"]} />
          <div className="filter-chips">
            {type ? (
              <button className="chip chip-filter" type="button" onClick={() => setType("")}>
                <span className="chip-k">Type</span>: {type} <Glyph name="plus" size={10} className="x" />
              </button>
            ) : null}
          </div>
        </div>
        <div className="sheet-work">
          <TaskTable
            rows={visible}
            total={todos.length}
            selectedId={selected}
            enteringId={enteringId}
            placeOptions={PLACES}
            itemOptions={ITEMS}
            roomOptions={ROOMS}
            onRoomChange={(row, value) => {
              setTodos((list) => list.map((todo) => (todo.id === row.id ? { ...todo, room: value } : todo)));
            }}
            onRowClick={(row) => setSelected((current) => (current === row.id ? null : row.id))}
            onRowContextMenu={(row) => setSelected(row.id)}
            onDelete={(row) => {
              const play = captureClose(document.querySelector(`[data-record="${CSS.escape(row.id)}"]`));
              flushSync(() => {
                setTodos((list) => list.filter((todo) => todo.id !== row.id));
                setSelected((current) => (current === row.id ? null : current));
              });
              play();
            }}
            deleteNoun="to-do"
            rowName={(row) => row.note.trim() || "To-do"}
            onCopyChange={(row, patch) => {
              setTodos((list) => list.map((todo) => (todo.id === row.id ? { ...todo, ...patch } : todo)));
            }}
            onAssigneeChange={(row, value) => {
              const person = ASSIGNEE_PEOPLE.find((item) => item.name === value);
              setTodos((list) =>
                list.map((todo) =>
                  todo.id === row.id
                    ? { ...todo, assignee: value === "unassigned" ? "Unassigned" : value, initials: value === "unassigned" ? "" : (person?.avatar ?? todo.initials) }
                    : todo,
                ),
              );
            }}
          />
        </div>
        {present && retained.current ? (
          <TodoDetail
            key={retained.current.id}
            todo={retained.current}
            hidden={hidden}
            onClose={() => setSelected(null)}
            onExited={() => setPresent(false)}
            onPatch={(patch) => {
              const id = retained.current?.id;
              if (!id) return;
              setTodos((list) => list.map((item) => (item.id === id ? { ...item, ...patch } : item)));
            }}
            onAssigneeChange={(todo, value) => {
              const person = ASSIGNEE_PEOPLE.find((item) => item.name === value);
              setTodos((list) =>
                list.map((item) =>
                  item.id === todo.id
                    ? { ...item, assignee: value === "unassigned" ? "Unassigned" : value, initials: value === "unassigned" ? "" : (person?.avatar ?? item.initials) }
                    : item,
                ),
              );
            }}
            onDeleted={() => {
              const id = retained.current?.id;
              if (!id) return;
              const play = captureClose(document.querySelector(`[data-record="${CSS.escape(id)}"]`));
              flushSync(() => {
                setTodos((list) => list.filter((todo) => todo.id !== id));
                setSelected(null);
              });
              play();
            }}
          />
        ) : null}
      </div>
    </PageLayout>
  );
}
