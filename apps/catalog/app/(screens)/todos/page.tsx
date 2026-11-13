"use client";

import { Chip, ASSIGNEE_PEOPLE, ActivityFeed, Button, DepartmentChip, DetailPanel, FactRow, Icon, Person, PhotoThumb, PhotoViewer, SideRoom, StatusCell, Tabs, TaskTable, UrgencyCell, captureClose, type ActivityItem } from "@lance-live/sds";
import { useEffect, useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { putBack, useNotify } from "../action-toast";
import { FilterMenu, SearchBox } from "../chrome";
import { PageLayout } from "../page-layout";
import { ITEMS, PLACES, ROOMS, TodoEditor, isAssigned, type Todo } from "./todo-editor";

const PILLOWS: ActivityItem[] = [
  { kind: "comment", name: "Sarah", initials: "SM", time: "now", body: "asdfasdf" },
  { kind: "comment", name: "Mark", initials: "MJ", time: "Oct 29, 5:05 PM", body: "I'll bring feather pillows up to 426." },
  { kind: "status", name: "Sarah", initials: "SM", text: "assigned this to Mark", time: "Oct 29, 4:24 PM" },
  { kind: "status", name: "Manual", initials: "M", text: "created this to-do", time: "Oct 29, 4:22 PM" },
];

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
  onEdit,
}: {
  todo: Todo;
  hidden: boolean;
  onClose: () => void;
  onExited: () => void;
  onDeleted: () => void;
  onEdit: () => void;
}) {
  const title = todo.title || [todo.place, todo.item].filter(Boolean).join(" · ");
  const [viewing, setViewing] = useState<number | null>(null);
  return (
    <DetailPanel
      label="To-do details"
      name={todo.note}
      noun="to-do"
      hidden={hidden}
      onClose={onClose}
      onExited={onExited}
      onDeleted={onDeleted}
      onEdit={onEdit}
      actions={
        <Button variant="secondary">
          <Icon name="calendar" size={14} />
          Schedule for future
        </Button>
      }
    >
        <div className="todo-side-intro">
          <SideRoom value={todo.room} readOnly />
          <div className="todo-side-heading">
            <div className="todo-side-title-row">
              <h2>{title || "New to-do"}</h2>
              <time>{todo.opened}</time>
            </div>
            <p className={todo.note ? "todo-side-value is-quiet" : "todo-side-value is-empty"}>{todo.note || "No description"}</p>
          </div>
        </div>
        <div className="todo-side-rule" />
        <div className="todo-side-meta">
          <FactRow label="Location">
            <span className={todo.place ? "todo-side-value" : "todo-side-value is-quiet"}>{todo.place || "–"}</span>
          </FactRow>
          <FactRow label="Item">
            <span className={todo.item ? "todo-side-value" : "todo-side-value is-quiet"}>{todo.item || "–"}</span>
          </FactRow>
          <FactRow label="Type">
            <DepartmentChip name={todo.type} />
          </FactRow>
          <FactRow label="Assigned">
            {isAssigned(todo) ? <Person name={todo.assignee} initials={todo.initials} variant="pill" /> : <Person name="Unassigned" variant="unassigned" />}
          </FactRow>
          <FactRow label="Status">
            <StatusCell value={todo.status} editable={false} />
          </FactRow>
          <FactRow label="Urgency">
            <UrgencyCell value={todo.urgency} editable={false} />
          </FactRow>
          {todo.photos?.length ? (
            <FactRow label="Photos">
              <div className="side-photos">
                {todo.photos.map((photo, index) => (
                  <figure className="side-photo" key={photo.src}>
                    <PhotoThumb photo={photo} onOpen={() => setViewing(index)} />
                  </figure>
                ))}
              </div>
              {viewing !== null ? <PhotoViewer photos={todo.photos} index={viewing} onIndex={setViewing} onClose={() => setViewing(null)} /> : null}
            </FactRow>
          ) : null}
        </div>
        <div className="todo-side-rule" />
        <ActivityFeed className="todo-side-activity" items={todo.activity} />
    </DetailPanel>
  );
}

export default function TodosPage() {
  const notify = useNotify();
  const [todos, setTodos] = useState(STARTER);
  const [bucket, setBucket] = useState("open");
  const [query, setQuery] = useState("");
  const [types, setTypes] = useState<string[]>([]);
  const [auto, setAuto] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [enteringId, setEnteringId] = useState<string | null>(null);
  const [present, setPresent] = useState(false);
  const [hidden, setHidden] = useState(true);
  const [editing, setEditing] = useState<{ id: string; creating: boolean } | null>(null);
  const retained = useRef<Todo | null>(null);

  const visible = useMemo(
    () =>
      todos.filter(
        (todo) =>
          todo.bucket === bucket &&
          (types.length === 0 || types.includes(todo.type)) &&
          `${todo.room} ${todo.note}`.toLowerCase().includes(query.trim().toLowerCase()),
      ),
    [todos, bucket, query, types],
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
    setTypes([]);
    setTodos((list) => [blank, ...list]);
    setSelected(id);
    setEnteringId(id);
    setEditing({ id, creating: true });
  }

  function removeTodo(id: string) {
    const index = todos.findIndex((todo) => todo.id === id);
    const removed = todos[index];
    const play = captureClose(document.querySelector(`[data-record="${CSS.escape(id)}"]`));
    flushSync(() => {
      setTodos((list) => list.filter((todo) => todo.id !== id));
      setSelected((current) => (current === id ? null : current));
      setEditing((current) => (current?.id === id ? null : current));
    });
    play();
    if (removed) notify({ message: "To-do deleted", action: "Undo", onAction: () => setTodos((list) => putBack(list, removed, index)) });
  }

  const edited = editing ? todos.find((todo) => todo.id === editing.id) ?? null : null;

  useEffect(() => {
    if (!present || !hidden || open) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timer = window.setTimeout(() => setPresent(false), reduce ? 0 : 360);
    return () => window.clearTimeout(timer);
  }, [present, hidden, open]);

  return (
    <PageLayout
      className="sheet-page todos-page"
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
          <FilterMenu value={types} onValueChange={setTypes} options={["Housekeeping", "Maintenance"]} />
          <div className="filter-chips">
            {types.map((value) => (
              <Chip key={value} filter={{ name: "Type", value }} onClick={() => setTypes((current) => current.filter((item) => item !== value))} />
            ))}
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
            onDelete={(row) => removeTodo(row.id)}
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
            onEdit={() => {
              const id = retained.current?.id;
              if (id) setEditing({ id, creating: false });
            }}
            onDeleted={() => {
              const id = retained.current?.id;
              if (id) removeTodo(id);
            }}
          />
        ) : null}
        {edited ? (
          <TodoEditor
            key={`edit-${edited.id}`}
            todo={edited}
            creating={editing?.creating}
            onClose={() => setEditing(null)}
            onSave={(next) => {
              setTodos((list) => list.map((todo) => (todo.id === next.id ? next : todo)));
              notify(editing?.creating ? "To-do created" : "To-do updated");
              setEditing(null);
            }}
            onDelete={() => removeTodo(edited.id)}
          />
        ) : null}
      </div>
    </PageLayout>
  );
}
