"use client";

import { ASSIGNEE_PEOPLE, Button, ConfirmDialog, DEPARTMENTS, DepartmentChip, EditorDialog, EditorPhotos, EditorPill, EditorPillRow, EditorPills, Icon, Person, PhotoPill, RequiredToast, RoomPill, SidePhotos, Status, Urgency, taskMenuItem, type ActivityItem, type Photo, type TaskRow } from "@lance-live/gallery-ui";
import { Fragment, useCallback, useState, type ReactNode } from "react";
import { EditorPick } from "../editor-pick";
import { useEditorStyle } from "../editor-style";

export type Todo = TaskRow & { bucket: "open" | "scheduled" | "completed"; activity: ActivityItem[]; photos?: Photo[] };

export const ROOMS = ["426", "244", "103", "436"];
export const PLACES = ["Guestroom", "Laundry", "Lobby", "Common area"];
export const ITEMS = ["Pillows", "Bedding", "Dryer", "Towels", "Climate"];

export const TYPES = DEPARTMENTS.map((item) => item.value);
export const STATUSES = [
  { value: "open", label: "Open" },
  { value: "progress", label: "In progress" },
  { value: "complete", label: "Completed" },
] as const;
export const URGENCIES = [
  { value: "urgent", label: "Urgent" },
  { value: "high", label: "High" },
  { value: "standard", label: "Standard" },
  { value: "low", label: "Low" },
] as const;

export function isAssigned(todo: Todo) {
  return Boolean(todo.assignee) && todo.assignee !== "Unassigned";
}

type Pick = "place" | "item" | "type" | "assignee" | "status" | "urgency";

type EditorField = { key: Pick; label: string; icon?: "location" | "tag"; value: ReactNode; quiet?: boolean; menu: ReactNode };

export function TodoEditor({
  todo,
  creating = false,
  noun = "to-do",
  onClose,
  onSave,
  onDelete,
}: {
  todo: Todo;
  creating?: boolean;
  /** What the record is called in the title, buttons, and delete confirm, such as "work order". */
  noun?: string;
  onClose: () => void;
  onSave: (next: Todo) => void;
  /** Leave out when there is nothing saved to delete yet. */
  onDelete?: () => void;
}) {
  const Noun = noun.charAt(0).toUpperCase() + noun.slice(1);
  const [draft, setDraft] = useState(todo);
  const [menu, setMenu] = useState<Pick | null>(null);
  const [confirm, setConfirm] = useState(false);
  const [tried, setTried] = useState(false);
  const [toast, setToast] = useState(0);
  const hideToast = useCallback(() => setToast(0), []);
  const photos = draft.photos ?? [];
  const guestroom = draft.place === "Guestroom";
  const missing = { place: !draft.place, room: guestroom && !draft.room?.trim(), note: !draft.note.trim() };
  const patch = (next: Partial<Todo>) => setDraft((current) => ({ ...current, ...next }));
  const toggle = (next: Pick) => setMenu((current) => (current === next ? null : next));
  const pickMenu = (key: Pick, options: readonly { value: string; label: ReactNode }[], current: string, onPick: (value: string) => void) =>
    options.map((option) =>
      taskMenuItem(option.value, option.value === current, () => {
        onPick(option.value);
        setMenu(null);
      }, option.label),
    );
  const listed = (options: readonly string[], value: string) => (value && !options.includes(value) ? [value, ...options] : options).map((item) => ({ value: item, label: item }));
  const pills = useEditorStyle() !== "fields";
  const place: EditorField = { key: "place", label: "Location", icon: "location", value: draft.place || "Location", quiet: !draft.place, menu: pickMenu("place", listed(PLACES, draft.place ?? ""), draft.place ?? "", (value) => patch({ place: value })) };
  const item: EditorField = { key: "item", label: "Item", icon: "tag", value: draft.item || "Item", quiet: !draft.item, menu: pickMenu("item", listed(ITEMS, draft.item ?? ""), draft.item ?? "", (value) => patch({ item: value })) };
  const department: EditorField = {
    key: "type",
    label: "Department",
    value: <DepartmentChip name={draft.type} plain />,
    menu: pickMenu("type", listed(TYPES, draft.type).map((entry) => ({ value: entry.value, label: <DepartmentChip name={entry.value} plain /> })), draft.type, (type) => patch({ type })),
  };
  const assignee: EditorField = {
    key: "assignee",
    label: "Assigned",
    value: isAssigned(draft) ? <Person name={draft.assignee} initials={draft.initials} variant="pill" /> : <Person name="Unassigned" variant="unassigned" />,
    menu: pickMenu(
      "assignee",
      [
        { value: "Unassigned", label: <Person name="Unassigned" variant="unassigned" /> },
        ...ASSIGNEE_PEOPLE.map((person) => ({ value: person.name, label: <Person name={person.name} initials={person.avatar} variant="pill" /> })),
      ],
      isAssigned(draft) ? draft.assignee : "Unassigned",
      (name) => {
        const person = ASSIGNEE_PEOPLE.find((entry) => entry.name === name);
        patch({ assignee: name, initials: person?.avatar ?? "" });
      },
    ),
  };
  const urgency: EditorField = {
    key: "urgency",
    label: "Urgency",
    value: <Urgency level={draft.urgency} />,
    menu: pickMenu("urgency", URGENCIES.map((entry) => ({ value: entry.value, label: <Urgency level={entry.value} /> })), draft.urgency, (value) => patch({ urgency: value as Todo["urgency"] })),
  };
  const status: EditorField = {
    key: "status",
    label: "Status",
    value: <Status status={draft.status} />,
    menu: pickMenu("status", STATUSES.map((entry) => ({ value: entry.value, label: <Status status={entry.value} /> })), draft.status, (value) => patch({ status: value as Todo["status"] })),
  };
  const fields = [place, item, department, assignee, status, urgency];
  const gridField = (field: EditorField) => (
    <div className="pm-editor-field">
      <span className="sheet-label">{field.label}</span>
      <EditorPick icon={field.icon} open={menu === field.key} onToggle={() => toggle(field.key)} value={field.value} quiet={field.quiet} menu={field.menu} />
    </div>
  );
  const roomInput = (className: string, placeholder: string) => (
    <input className={className} aria-label="Room number" inputMode="numeric" value={draft.room} placeholder={placeholder} onChange={(event) => patch({ room: event.target.value })} />
  );


  return (
    <>
      <EditorDialog
        kicker={`${creating ? "Create" : "Edit"} ${noun}`}
        layout={pills ? "pills" : "fields"}
        className="pm-page todo-editor"
        title={draft.title ?? ""}
        titlePlaceholder={`${Noun} title`}
        onTitleChange={(value) => patch({ title: value })}
        subtitle={draft.note}
        subtitlePlaceholder="Add a description"
        onSubtitleChange={(value) => patch({ note: value })}
        subtitleInvalid={tried && missing.note}
        deleteLabel={`Delete ${noun}`}
        onDelete={onDelete ? () => setConfirm(true) : undefined}
        onClose={onClose}
        onEscape={() => {
          if (confirm) return true;
          if (!menu) return false;
          setMenu(null);
          return true;
        }}
        footer={
          <>
            {pills ? <PhotoPill onAdd={(added) => setDraft((current) => ({ ...current, photos: [...(current.photos ?? []), ...added] }))} /> : null}
            <Button variant="secondary">
              <Icon name="calendar" size={14} />
              Schedule for future
            </Button>
            <Button
              onClick={() => {
                if (missing.place || missing.room || missing.note) {
                  setTried(true);
                  setToast(Date.now());
                  return;
                }
                onSave(draft);
              }}
            >
              Save {noun}
            </Button>
          </>
        }
      >
        {pills ? <EditorPhotos photos={photos} onRemove={(photo) => patch({ photos: photos.filter((item) => item.src !== photo.src) })} /> : null}
        {pills ? (
          <EditorPills>
            {fields.map((field) => {
              const pick = <EditorPill icon={field.icon} open={menu === field.key} onToggle={() => toggle(field.key)} value={field.value} quiet={field.quiet} invalid={tried && field.key === "place" && missing.place} menu={field.menu} />;
              if (field.key === "urgency") return null;
              if (field.key === "status") {
                return (
                  <EditorPillRow key={field.key}>
                    {pick}
                    <EditorPill icon={urgency.icon} open={menu === urgency.key} onToggle={() => toggle(urgency.key)} value={urgency.value} quiet={urgency.quiet} menu={urgency.menu} />
                  </EditorPillRow>
                );
              }
              if (field.key !== "place") return <Fragment key={field.key}>{pick}</Fragment>;
              return <RoomPill key={field.key} lead={pick} open={guestroom} value={draft.room ?? ""} onChange={(room) => patch({ room })} invalid={tried && missing.room} />;
            })}
          </EditorPills>
        ) : (
          <>
            <div className="pm-editor-pair">
              <div className="pm-editor-field">
                <span className="sheet-label">Location</span>
                <div className={guestroom ? "todo-editor-place has-room" : "todo-editor-place"}>
                  <EditorPick icon="location" open={menu === "place"} onToggle={() => toggle("place")} value={place.value} quiet={place.quiet} invalid={tried && missing.place} menu={place.menu} />
                  {guestroom ? roomInput("pm-editor-input", "Room number") : null}
                </div>
              </div>
              {gridField(item)}
            </div>
            <div className="pm-editor-pair">
              {gridField(department)}
              {gridField(assignee)}
            </div>
            <div className="pm-editor-pair">
              {gridField(urgency)}
              {gridField(status)}
            </div>
            <SidePhotos label="Photo" />
          </>
        )}
      </EditorDialog>
      {toast ? <RequiredToast id={toast} onDone={hideToast} /> : null}
      <ConfirmDialog
        open={confirm}
        name={draft.note.trim() || Noun}
        noun={noun}
        onCancel={() => setConfirm(false)}
        onConfirm={() => {
          setConfirm(false);
          onDelete?.();
        }}
      />
    </>
  );
}
