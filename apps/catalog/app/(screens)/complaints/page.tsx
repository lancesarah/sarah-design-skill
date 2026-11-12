"use client";

import {
  ASSIGNEE_PEOPLE,
  ActivityFeed,
  Button,
  ConfirmDialog,
  DEPARTMENTS,
  DepartmentChip,
  DetailPanel,
  EditorDialog,
  EditorField,
  EditorFields,
  EditorPill,
  EditorPills,
  FactRow,
  Icon,
  Person,
  PlacePill,
  RequiredToast,
  RoomPill,
  SideRoom,
  Status,
  StatusCell,
  Tabs,
  TaskTable,
  Urgency,
  UrgencyCell,
  captureClose,
  taskMenuItem,
  type ActivityItem,
  type StatusValue,
  type TaskRow,
  type UrgencyValue,
} from "@lance-live/gallery-ui";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { flushSync } from "react-dom";
import { FilterMenu, SearchBox } from "../chrome";
import { Glyph } from "../glyph";
import { PageLayout } from "../page-layout";

type Complaint = {
  id: string;
  bucket: "open" | "scheduled" | "completed";
  room: string;
  guest: string;
  title: string;
  complaint: string;
  phone: string;
  email: string;
  loyalty: string;
  mood: string;
  type: string;
  urgency: UrgencyValue;
  status: StatusValue;
  assignee: string;
  initials: string;
  opened: string;
  activity: ActivityItem[];
};

const STARTER: Complaint[] = [
  {
    id: "faucet",
    bucket: "open",
    room: "436",
    guest: "Noah Berg",
    title: "Faucet",
    complaint: "Bathroom faucet will not shut off all the way.",
    phone: "+1 (510) 555-0117",
    email: "noah.berg@email.com",
    loyalty: "Silver",
    mood: "Neutral",
    type: "Maintenance",
    urgency: "high",
    status: "open",
    assignee: "Unassigned",
    initials: "",
    opened: "3h",
    activity: [{ kind: "status", name: "Sarah", initials: "SM", text: "logged this complaint", time: "Nov 2, 12:15 PM" }],
  },
  {
    id: "noise",
    bucket: "completed",
    room: "208",
    guest: "Martin Hillerby",
    title: "Noise",
    complaint: "Complained about the noise last night and does not want to pay the full price. Very angry guest",
    phone: "+1 (415) 555-0148",
    email: "hillerby55@gmail.com",
    loyalty: "Gold",
    mood: "Extremely upset",
    type: "Front desk",
    urgency: "urgent",
    status: "complete",
    assignee: "Alondra",
    initials: "AG",
    opened: "Oct 18",
    activity: [
      { kind: "status", name: "Jocelyn Ciquini", initials: "JC", text: "logged this complaint", time: "Oct 18, 10:52 AM" },
      { kind: "status", name: "Jocelyn Ciquini", initials: "JC", text: "assigned this to Alondra", time: "Oct 18, 10:52 AM" },
    ],
  },
  {
    id: "hall",
    bucket: "open",
    room: "412",
    guest: "Dana Cho",
    title: "Noise",
    complaint: "Noise from the room above",
    phone: "+1 (628) 555-0194",
    email: "dana.cho@email.com",
    loyalty: "Member",
    mood: "Upset",
    type: "Front desk",
    urgency: "urgent",
    status: "open",
    assignee: "Mark",
    initials: "MJ",
    opened: "12m",
    activity: [{ kind: "status", name: "Sarah", initials: "SM", text: "logged this complaint", time: "12m" }],
  },
];

const COMPLAINTS = ["Cleanliness", "Noise", "Maintenance", "Temperature", "Amenities", "Service", "Billing", "Other"] as const;
const URGENCY: Record<string, string> = { urgent: "Urgent", high: "High", standard: "Standard", low: "Low" };
const MOODS = ["Extremely upset", "Upset", "Neutral", "Happy", "Extremely happy"];
const TYPES = DEPARTMENTS.map((item) => item.value);
const STATUSES = [
  { value: "open", label: "Open" },
  { value: "progress", label: "In progress" },
  { value: "complete", label: "Completed" },
] as const;
const URGENCIES = [
  { value: "urgent", label: "Urgent" },
  { value: "high", label: "High" },
  { value: "standard", label: "Standard" },
  { value: "low", label: "Low" },
] as const;

function isAssigned(row: Complaint) {
  return Boolean(row.assignee) && row.assignee !== "Unassigned";
}

function SideValue({ value }: { value: string }) {
  return <span className={value ? "todo-side-value" : "todo-side-value is-quiet"}>{value || "–"}</span>;
}

function ComplaintDetail({
  row,
  hidden,
  onClose,
  onExited,
  onDeleted,
  onEdit,
}: {
  row: Complaint;
  hidden: boolean;
  onClose: () => void;
  onExited: () => void;
  onDeleted: () => void;
  onEdit: () => void;
}) {
  const title = [row.guest, row.title].filter(Boolean).join(" · ");
  return (
    <DetailPanel
      label="Complaint details"
      name={row.complaint}
      noun="complaint"
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
        <SideRoom value={row.room} readOnly />
        <div className="todo-side-heading">
          <div className="todo-side-title-row">
            <h2>{title || "New complaint"}</h2>
            <time>{row.opened}</time>
          </div>
          <p className={row.complaint ? "todo-side-value is-quiet" : "todo-side-value is-empty"}>{row.complaint || "No description"}</p>
        </div>
      </div>
      <div className="todo-side-rule" />
      <div className="todo-side-meta">
        <FactRow label="Phone">
          <SideValue value={row.phone} />
        </FactRow>
        <FactRow label="Email">
          <SideValue value={row.email} />
        </FactRow>
        <FactRow label="Loyalty #">
          <SideValue value={row.loyalty} />
        </FactRow>
        <FactRow label="Guest mood">
          <SideValue value={row.mood} />
        </FactRow>
        <FactRow label="Type">{row.type ? <DepartmentChip name={row.type} /> : <SideValue value="" />}</FactRow>
        <FactRow label="Assigned">
          {isAssigned(row) ? <Person name={row.assignee} initials={row.initials} variant="pill" /> : <Person name="Unassigned" variant="unassigned" />}
        </FactRow>
        <FactRow label="Status">
          <StatusCell value={row.status} editable={false} />
        </FactRow>
        <FactRow label="Urgency">
          <UrgencyCell value={row.urgency} editable={false} />
        </FactRow>
      </div>
      <div className="todo-side-rule" />
      <ActivityFeed className="todo-side-activity" items={row.activity} />
    </DetailPanel>
  );
}

type Pick = "category" | "mood" | "type" | "assignee" | "status" | "urgency";

/** The complaint popup. Guest details are text entries, the rest are pills that open menus. */
function ComplaintEditor({
  row,
  creating = false,
  onClose,
  onSave,
  onDelete,
}: {
  row: Complaint;
  creating?: boolean;
  onClose: () => void;
  onSave: (next: Complaint) => void;
  onDelete: () => void;
}) {
  const [draft, setDraft] = useState(row);
  const [menu, setMenu] = useState<Pick | null>(null);
  const [confirm, setConfirm] = useState(false);
  const [tried, setTried] = useState(false);
  const [toast, setToast] = useState(0);
  const hideToast = useCallback(() => setToast(0), []);
  const missing = { title: !draft.title, mood: !draft.mood, complaint: !draft.complaint.trim() };
  const patch = (next: Partial<Complaint>) => setDraft((current) => ({ ...current, ...next }));
  const toggle = (next: Pick) => setMenu((current) => (current === next ? null : next));
  const pickMenu = (options: readonly { value: string; label: ReactNode }[], current: string, onPick: (value: string) => void) =>
    options.map((option) =>
      taskMenuItem(option.value, option.value === current, () => {
        onPick(option.value);
        setMenu(null);
      }, option.label),
    );
  const contactField = (label: string, key: "guest" | "phone" | "email" | "loyalty", inputMode?: "tel" | "email") => (
    <EditorField label={label} inputMode={inputMode} value={draft[key]} onChange={(value) => patch({ [key]: value })} />
  );
  const pick = (key: Pick, value: ReactNode, menuItems: ReactNode, quiet = false, invalid = false, icon?: "tag") => (
    <EditorPill icon={icon} open={menu === key} onToggle={() => toggle(key)} value={value} quiet={quiet} invalid={tried && invalid} menu={menuItems} />
  );
  const categories = draft.title && !(COMPLAINTS as readonly string[]).includes(draft.title) ? [draft.title, ...COMPLAINTS] : COMPLAINTS;

  return (
    <>
      <EditorDialog
        kicker={creating ? "Create complaint" : "Edit complaint"}
        layout="pills"
        className="pm-page todo-editor"
        title={draft.title}
        titlePlaceholder="Complaint category"
        subtitle={draft.complaint}
        subtitlePlaceholder="Add a description"
        onSubtitleChange={(complaint) => patch({ complaint })}
        subtitleInvalid={tried && missing.complaint}
        deleteLabel="Delete complaint"
        onDelete={() => setConfirm(true)}
        onClose={onClose}
        onEscape={() => {
          if (confirm) return true;
          if (!menu) return false;
          setMenu(null);
          return true;
        }}
        footer={
          <>
            <Button variant="secondary">
              <Icon name="calendar" size={14} />
              Schedule for future
            </Button>
            <Button
              onClick={() => {
                if (missing.title || missing.mood || missing.complaint) {
                  setTried(true);
                  setToast(Date.now());
                  return;
                }
                onSave(draft);
              }}
            >
              Save complaint
            </Button>
          </>
        }
      >
        <EditorFields>
          {contactField("Guest name", "guest")}
          {contactField("Phone", "phone", "tel")}
          {contactField("Email", "email", "email")}
          {contactField("Loyalty #", "loyalty")}
        </EditorFields>
        <EditorPills>
          {pick(
            "category",
            draft.title || "Category",
            pickMenu(categories.map((title) => ({ value: title, label: title })), draft.title, (title) => patch({ title })),
            !draft.title,
            missing.title,
            "tag",
          )}
          <RoomPill lead={<PlacePill>Guestroom</PlacePill>} value={draft.room} onChange={(room) => patch({ room })} />
          {pick(
            "mood",
            draft.mood || "Guest mood",
            pickMenu(MOODS.map((mood) => ({ value: mood, label: mood })), draft.mood, (mood) => patch({ mood })),
            !draft.mood,
            missing.mood,
          )}
          {pick(
            "type",
            draft.type ? <DepartmentChip name={draft.type} plain /> : "Department",
            pickMenu(TYPES.map((type) => ({ value: type, label: <DepartmentChip name={type} plain /> })), draft.type, (type) => patch({ type })),
            !draft.type,
          )}
          {pick(
            "assignee",
            isAssigned(draft) ? <Person name={draft.assignee} initials={draft.initials} variant="pill" /> : <Person name="Unassigned" variant="unassigned" />,
            pickMenu(
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
          )}
          {pick(
            "status",
            <Status status={draft.status} />,
            pickMenu(STATUSES.map((entry) => ({ value: entry.value, label: <Status status={entry.value} /> })), draft.status, (status) => patch({ status: status as StatusValue })),
          )}
          {pick(
            "urgency",
            <Urgency level={draft.urgency} />,
            pickMenu(URGENCIES.map((entry) => ({ value: entry.value, label: <Urgency level={entry.value} /> })), draft.urgency, (urgency) => patch({ urgency: urgency as UrgencyValue })),
          )}
        </EditorPills>
      </EditorDialog>
      {toast ? <RequiredToast id={toast} onDone={hideToast} /> : null}
      <ConfirmDialog
        open={confirm}
        name={draft.complaint.trim() || "Complaint"}
        noun="complaint"
        onCancel={() => setConfirm(false)}
        onConfirm={() => {
          setConfirm(false);
          onDelete();
        }}
      />
    </>
  );
}

export default function ComplaintsPage() {
  const [records, setRecords] = useState(STARTER);
  const [bucket, setBucket] = useState("open");
  const [query, setQuery] = useState("");
  const [urgencies, setUrgencies] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [enteringId, setEnteringId] = useState<string | null>(null);
  const [present, setPresent] = useState(false);
  const [hidden, setHidden] = useState(true);
  const [editing, setEditing] = useState<{ id: string; creating: boolean } | null>(null);
  const retained = useRef<Complaint | null>(null);
  const visible = useMemo(
    () =>
      records.filter(
        (row) =>
          row.bucket === bucket &&
          (urgencies.length === 0 || urgencies.includes(row.urgency)) &&
          `${row.guest} ${row.complaint} ${row.room}`.toLowerCase().includes(query.trim().toLowerCase()),
      ),
    [bucket, query, urgencies, records],
  );
  const tasks: TaskRow[] = visible.map((row) => ({
    id: row.id,
    room: row.room,
    guest: row.guest,
    title: row.title,
    note: row.title,
    description: row.complaint,
    email: row.email,
    mood: row.mood,
    type: row.type,
    urgency: row.urgency,
    status: row.status,
    assignee: row.assignee,
    initials: row.initials,
    opened: row.opened,
  }));
  const open = visible.find((row) => row.id === selected) ?? null;
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

  // Written fields start empty. Status and urgency keep the cells' resting values.
  function createComplaint() {
    const id = `complaint-${Date.now()}`;
    setBucket("open");
    setQuery("");
    setUrgencies([]);
    setRecords((list) => [
      {
        id,
        bucket: "open",
        room: "",
        guest: "",
        title: "",
        complaint: "",
        phone: "",
        email: "",
        loyalty: "",
        mood: "",
        type: "",
        urgency: "standard",
        status: "open",
        assignee: "",
        initials: "",
        opened: "now",
        activity: [],
      },
      ...list,
    ]);
    setSelected(id);
    setEnteringId(id);
    setEditing({ id, creating: true });
  }

  function removeComplaint(id: string) {
    const play = captureClose(document.querySelector(`[data-record="${CSS.escape(id)}"]`));
    flushSync(() => {
      setRecords((list) => list.filter((row) => row.id !== id));
      setSelected((current) => (current === id ? null : current));
      setEditing((current) => (current?.id === id ? null : current));
    });
    play();
  }

  const edited = editing ? records.find((row) => row.id === editing.id) ?? null : null;

  useEffect(() => {
    if (!present || !hidden || open) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timer = window.setTimeout(() => setPresent(false), reduce ? 0 : 360);
    return () => window.clearTimeout(timer);
  }, [present, hidden, open]);

  return (
    <PageLayout
      className="sheet-page complaints-page"
      data-view="head"
      icon="alert"
      title="Complaints"
      count={visible.length}
      actions={
        <Button onClick={createComplaint}>
          <Icon name="plus-bold" size={14} />
          New
        </Button>
      }
      tabs={
        <Tabs
          label="Complaint status"
          value={bucket}
          onValueChange={setBucket}
          items={[
            { value: "open", label: "Open", count: records.filter((row) => row.bucket === "open").length },
            { value: "scheduled", label: "Scheduled", count: records.filter((row) => row.bucket === "scheduled").length },
            { value: "completed", label: "Completed", count: records.filter((row) => row.bucket === "completed").length },
          ]}
        />
      }
      toolbar={
        <div className="filter-row page-toolbar">
          <SearchBox placeholder="Search complaints" label="Search complaints" value={query} onValueChange={setQuery} />
          <FilterMenu value={urgencies} onValueChange={setUrgencies} options={["urgent", "high", "standard", "low"]} />
          <div className="filter-chips">
            {urgencies.map((value) => (
              <button key={value} className="chip chip-filter" type="button" onClick={() => setUrgencies((current) => current.filter((item) => item !== value))}>
                <span className="chip-k">Urgency</span>: {URGENCY[value]} <Glyph name="plus" size={10} className="x" />
              </button>
            ))}
          </div>
        </div>
      }
    >
      <div className="sheet-work">
        <TaskTable
          layout="complaint"
          titleOptions={COMPLAINTS}
          rows={tasks}
          total={records.length}
          empty="No complaints"
          selectedId={visible.some((row) => row.id === selected) ? selected : null}
          enteringId={enteringId}
          onRowClick={(row) => setSelected((current) => (current === row.id ? null : row.id))}
          onRowContextMenu={(row) => setSelected(row.id)}
          onDelete={(row) => removeComplaint(row.id)}
          deleteNoun="complaint"
          rowName={(row) => row.description?.trim() || row.note.trim() || "Complaint"}
          onRoomChange={(row, room) => {
            setRecords((list) => list.map((item) => (item.id === row.id ? { ...item, room } : item)));
          }}
          onCopyChange={(row, patch) => {
            setRecords((list) =>
              list.map((item) =>
                item.id === row.id
                  ? {
                      ...item,
                      ...(patch.title !== undefined ? { title: patch.title } : {}),
                      ...(patch.description !== undefined ? { complaint: patch.description } : {}),
                      ...(patch.guest !== undefined ? { guest: patch.guest } : {}),
                    }
                  : item,
              ),
            );
          }}
        />
        {present && retained.current ? (
          <ComplaintDetail
            key={retained.current.id}
            row={retained.current}
            hidden={hidden}
            onClose={() => setSelected(null)}
            onExited={() => setPresent(false)}
            onEdit={() => {
              const id = retained.current?.id;
              if (id) setEditing({ id, creating: false });
            }}
            onDeleted={() => {
              const id = retained.current?.id;
              if (id) removeComplaint(id);
            }}
          />
        ) : null}
        {edited ? (
          <ComplaintEditor
            key={`edit-${edited.id}`}
            row={edited}
            creating={editing?.creating}
            onClose={() => setEditing(null)}
            onSave={(next) => {
              setRecords((list) => list.map((row) => (row.id === next.id ? next : row)));
              setEditing(null);
            }}
            onDelete={() => removeComplaint(edited.id)}
          />
        ) : null}
      </div>
    </PageLayout>
  );
}
