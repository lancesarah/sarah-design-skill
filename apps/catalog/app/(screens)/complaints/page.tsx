"use client";

import {
  ASSIGNEE_PEOPLE,
  ActivityFeed,
  Button,
  DetailPanel,
  Icon,
  OverlayMenu,
  StatusCell,
  Tabs,
  TaskAssignee,
  TaskTable,
  TitleSubtitle,
  TypeCell,
  UrgencyCell,
  captureClose,
  type ActivityItem,
  type StatusValue,
  type TaskRow,
  type UrgencyValue,
} from "@lance-live/gallery-ui";
import { useEffect, useMemo, useRef, useState } from "react";
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

function SideLine({
  label,
  value,
  placeholder,
  inputMode,
  onCommit,
}: {
  label: string;
  value: string;
  placeholder: string;
  inputMode?: "email" | "tel";
  onCommit: (value: string) => void;
}) {
  return (
    <textarea
      className="side-line"
      aria-label={label}
      placeholder={placeholder}
      rows={1}
      inputMode={inputMode}
      defaultValue={value}
      onChange={(event) => {
        const clean = event.target.value.replace(/\n+/g, " ");
        if (clean !== event.target.value) event.target.value = clean;
      }}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          event.currentTarget.blur();
        }
      }}
      onBlur={(event) => onCommit(event.target.value.trim())}
    />
  );
}

function MoodField({
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
  const ref = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (ref.current?.contains(target)) return;
      if (target instanceof Element && target.closest(".menu")) return;
      onToggle();
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onToggle();
    };
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onToggle]);
  return (
    <>
      <button
        ref={ref}
        className={["side-field", value ? "" : "is-empty"].filter(Boolean).join(" ")}
        type="button"
        data-menu-kind="mood"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={value ? `Guest mood, ${value}` : "Guest mood"}
        onClick={onToggle}
      >
        <span>{value || "Guest mood"}</span>
        <Icon name="chevron" size={10} className="sheet-edit" />
      </button>
      <OverlayMenu open={open} anchorRef={ref} label="Guest mood">
        {MOODS.map((mood) => (
          <button
            key={mood}
            className="menu-item"
            type="button"
            role="menuitemradio"
            aria-checked={mood === value}
            onClick={() => {
              onChange(mood);
              onToggle();
            }}
          >
            {mood}
            <Icon name="check" size={14} className="check" />
          </button>
        ))}
      </OverlayMenu>
    </>
  );
}

function ComplaintDetail({
  row,
  hidden,
  onClose,
  onExited,
  onDeleted,
  onPatch,
}: {
  row: Complaint;
  hidden: boolean;
  onClose: () => void;
  onExited: () => void;
  onDeleted: () => void;
  onPatch: (patch: Partial<Complaint>) => void;
}) {
  const [field, setField] = useState<"status" | "urgency" | "type" | "mood" | null>(null);
  const [status, setStatus] = useState(row.status);
  const [urgency, setUrgency] = useState(row.urgency);
  const [type, setType] = useState(row.type);
  const toggle = (next: "status" | "urgency" | "type" | "mood") => setField((current) => (current === next ? null : next));
  return (
    <DetailPanel
      label="Complaint details"
      name={row.complaint}
      noun="complaint"
      hidden={hidden}
      onClose={onClose}
      onExited={onExited}
      onDeleted={onDeleted}
      actions={
        <Button variant="secondary">
          <Icon name="calendar" size={14} />
          Schedule for future
        </Button>
      }
    >
      <div className="todo-side-intro">
        <button className={row.room ? "todo-side-room" : "todo-side-room is-quiet"} type="button" aria-label="Room">
          {row.room || "—"}
        </button>
        <div className="todo-side-title-row">
          <div className="todo-side-facts">
            <input
              className={row.guest ? "complaint-guest" : "complaint-guest is-empty"}
              aria-label="Guest"
              placeholder="Guest"
              value={row.guest}
              onChange={(event) => onPatch({ guest: event.target.value })}
            />
            <span className="sheet-dot" aria-hidden="true">·</span>
            <TitleSubtitle
              variant="dropdown"
              size="title"
              title={{
                value: row.title,
                placeholder: "Complaint",
                options: row.title && !(COMPLAINTS as readonly string[]).includes(row.title) ? [row.title, ...COMPLAINTS] : COMPLAINTS,
                onChange: (title) => onPatch({ title }),
              }}
              subtitle=""
            />
          </div>
          <time>{row.opened}</time>
        </div>
      </div>
      <div className="todo-side-desc">
        <label className="sheet-label" htmlFor="side-desc">Description</label>
        <textarea id="side-desc" data-side-desc rows={1} defaultValue={row.complaint} placeholder="Add a note" />
      </div>
      <div className="todo-side-rule" />
      <div className="todo-side-meta">
        <div>
          <span className="sheet-label">Phone</span>
          <SideLine label="Phone" value={row.phone} placeholder="Add a phone" inputMode="tel" onCommit={(phone) => onPatch({ phone })} />
        </div>
        <div>
          <span className="sheet-label">Email</span>
          <SideLine label="Email" value={row.email} placeholder="Add an email" inputMode="email" onCommit={(email) => onPatch({ email })} />
        </div>
        <div>
          <span className="sheet-label">Loyalty #</span>
          <SideLine label="Loyalty number" value={row.loyalty} placeholder="Add a number" onCommit={(loyalty) => onPatch({ loyalty })} />
        </div>
        <div>
          <span className="sheet-label">Guest mood</span>
          <MoodField value={row.mood} open={field === "mood"} onToggle={() => toggle("mood")} onChange={(mood) => onPatch({ mood })} />
        </div>
        <div>
          <span className="sheet-label">Type</span>
          <TypeCell
            value={type}
            onChange={(value) => {
              setType(value);
              onPatch({ type: value });
            }}
            open={field === "type"}
            onToggle={() => toggle("type")}
          />
        </div>
        <div>
          <span className="sheet-label">Assigned</span>
          <TaskAssignee
            named
            name={row.assignee}
            initials={row.initials}
            style={{ background: "var(--sidebar-grey)" }}
            onSelect={(value) => {
              const person = ASSIGNEE_PEOPLE.find((item) => item.name === value);
              onPatch({
                assignee: value === "unassigned" ? "Unassigned" : value,
                initials: value === "unassigned" ? "" : (person?.avatar ?? ""),
              });
            }}
          />
        </div>
        <div>
          <span className="sheet-label">Status</span>
          <StatusCell
            value={status}
            onChange={(value) => {
              setStatus(value);
              onPatch({ status: value });
            }}
            open={field === "status"}
            onToggle={() => toggle("status")}
          />
        </div>
        <div>
          <span className="sheet-label">Urgency</span>
          <UrgencyCell
            value={urgency}
            onChange={(value) => {
              setUrgency(value);
              onPatch({ urgency: value });
            }}
            open={field === "urgency"}
            onToggle={() => toggle("urgency")}
          />
        </div>
      </div>
      <div className="todo-side-rule" />
      <ActivityFeed className="todo-side-activity" items={row.activity} />
    </DetailPanel>
  );
}

export default function ComplaintsPage() {
  const [records, setRecords] = useState(STARTER);
  const [bucket, setBucket] = useState("open");
  const [query, setQuery] = useState("");
  const [urgency, setUrgency] = useState("");
  const [selected, setSelected] = useState<string | null>("faucet");
  const [enteringId, setEnteringId] = useState<string | null>(null);
  const [present, setPresent] = useState(false);
  const [hidden, setHidden] = useState(true);
  const retained = useRef<Complaint | null>(null);
  const visible = useMemo(
    () =>
      records.filter(
        (row) =>
          row.bucket === bucket &&
          (!urgency || row.urgency === urgency) &&
          `${row.guest} ${row.complaint} ${row.room}`.toLowerCase().includes(query.trim().toLowerCase()),
      ),
    [bucket, query, urgency, records],
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
    setUrgency("");
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
  }

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
          <FilterMenu value={urgency} onValueChange={setUrgency} options={["urgent", "high", "standard", "low"]} />
          <div className="filter-chips">
            {urgency ? (
              <button className="chip chip-filter" type="button" onClick={() => setUrgency("")}>
                <span className="chip-k">Urgency</span>: {URGENCY[urgency]} <Glyph name="plus" size={10} className="x" />
              </button>
            ) : null}
          </div>
        </div>
      }
    >
      <div className="sheet-work">
        <TaskTable
          layout="complaint"
          rows={tasks}
          total={records.length}
          empty="No complaints"
          selectedId={visible.some((row) => row.id === selected) ? selected : null}
          enteringId={enteringId}
          onRowClick={(row) => setSelected((current) => (current === row.id ? null : row.id))}
          onRowContextMenu={(row) => setSelected(row.id)}
          onDelete={(row) => {
            const play = captureClose(document.querySelector(`[data-record="${CSS.escape(row.id)}"]`));
            flushSync(() => {
              setRecords((list) => list.filter((item) => item.id !== row.id));
              setSelected((current) => (current === row.id ? null : current));
            });
            play();
          }}
          deleteNoun="complaint"
          rowName={(row) => row.description?.trim() || row.note.trim() || "Complaint"}
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
            onDeleted={() => {
              const id = retained.current?.id;
              if (!id) return;
              const play = captureClose(document.querySelector(`[data-record="${CSS.escape(id)}"]`));
              flushSync(() => {
                setRecords((list) => list.filter((row) => row.id !== id));
                setSelected(null);
              });
              play();
            }}
            onPatch={(patch) => {
              const id = retained.current?.id;
              if (!id) return;
              setRecords((list) => list.map((row) => (row.id === id ? { ...row, ...patch } : row)));
            }}
          />
        ) : null}
      </div>
    </PageLayout>
  );
}
