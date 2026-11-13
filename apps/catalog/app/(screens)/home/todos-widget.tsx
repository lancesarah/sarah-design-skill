"use client";

import { ASSIGNEE_PEOPLE, Empty, Person, Status, TextIcon, Widget, WidgetEmpty, WidgetList, WidgetMore, WidgetRow, type StatusValue, type UrgencyValue } from "@lance-live/gallery-ui";
import Link from "next/link";
import { useState } from "react";
import { useNotify } from "../action-toast";
import { TodoEditor, type Todo } from "../todos/todo-editor";

type HomeTodo = {
  id: string;
  room: string;
  place: string;
  item: string;
  urgency: UrgencyValue;
  status: StatusValue;
  assignee: string;
  opened: string;
};

const ME = "Sarah";
/** A glance, not the list. The rest wait behind "+ N more". */
const LIMIT = 4;
const RANK: Record<UrgencyValue, number> = { urgent: 0, high: 1, standard: 2, low: 3 };

const TODOS: HomeTodo[] = [
  { id: "t1", room: "", place: "Hallway", item: "Ice machine", urgency: "urgent", status: "open", assignee: "Sarah", opened: "20m" },
  { id: "t2", room: "1021", place: "Guestroom", item: "Full service", urgency: "standard", status: "progress", assignee: "Sarah", opened: "1h" },
  { id: "t3", room: "816", place: "Guestroom", item: "Bug / insect", urgency: "high", status: "open", assignee: "", opened: "2h" },
  { id: "t4", room: "428", place: "Guestroom", item: "Pillows/Bedding", urgency: "low", status: "open", assignee: "Sarah", opened: "3h" },
  { id: "t5", room: "901", place: "Guestroom", item: "TV", urgency: "standard", status: "open", assignee: "Mark", opened: "5h" },
  { id: "t6", room: "612", place: "Guestroom", item: "Climate", urgency: "high", status: "open", assignee: "", opened: "6h" },
  { id: "t7", room: "", place: "Lobby", item: "Lighting", urgency: "standard", status: "open", assignee: "Sarah", opened: "8h" },
  { id: "t8", room: "305", place: "Guestroom", item: "Towels", urgency: "low", status: "progress", assignee: "Paul", opened: "1d" },
  { id: "t9", room: "", place: "Laundry", item: "Dryer", urgency: "standard", status: "open", assignee: "Paul", opened: "1d" },
];

function initialsOf(name: string) {
  return ASSIGNEE_PEOPLE.find((person) => person.name === name)?.avatar ?? "";
}

/** Open to-dos at a glance, most urgent first, with who has each one. */
export function TodosWidget() {
  const notify = useNotify();
  const [todos, setTodos] = useState(TODOS);
  const [draft, setDraft] = useState<Todo | null>(null);
  const shown = [...todos].sort((a, b) => RANK[a.urgency] - RANK[b.urgency]).slice(0, LIMIT);
  const more = todos.length - shown.length;

  return (
    <>
      <Widget
        icon="clipboard"
        title="To-dos"
        count={todos.length}
        action={
          <TextIcon
            icon="plus"
            size="sm"
            aria-label="New to-do"
            onClick={() =>
              setDraft({
                id: `home-todo-${Date.now()}`,
                room: "",
                note: "",
                place: "",
                item: "",
                type: "Housekeeping",
                urgency: "standard",
                status: "open",
                bucket: "open",
                assignee: ME,
                initials: initialsOf(ME),
                opened: "now",
                activity: [],
              })
            }
          />
        }
      >
        {shown.length ? (
          <WidgetList>
            {shown.map((todo) => (
              <WidgetRow
                key={todo.id}
                as={Link}
                href="/todos"
                lead={<Status status={todo.status} iconOnly />}
                title={todo.room || todo.place}
                subtitle={todo.item}
                meta={todo.opened}
                trail={todo.assignee ? <Person name={todo.assignee} initials={initialsOf(todo.assignee)} variant="pill" /> : <Person name="Unassigned" variant="unassigned" />}
              />
            ))}
            {more > 0 ? (
              <WidgetMore as={Link} href="/todos">
                + {more} more
              </WidgetMore>
            ) : null}
          </WidgetList>
        ) : (
          <WidgetEmpty>
            <Empty icon="todo" title="No open to-dos">
              Nothing is open right now.
            </Empty>
          </WidgetEmpty>
        )}
      </Widget>
      {draft ? (
        <TodoEditor
          key={draft.id}
          creating
          todo={draft}
          onClose={() => setDraft(null)}
          onSave={(next) => {
            setTodos((list) => [{ id: next.id, room: next.room, place: next.place ?? "", item: next.item ?? "", urgency: next.urgency, status: next.status, assignee: next.assignee, opened: next.opened }, ...list]);
            notify("To-do created");
            setDraft(null);
          }}
        />
      ) : null}
    </>
  );
}
