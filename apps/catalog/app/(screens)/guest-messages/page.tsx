"use client";

import { Button, Chip, Day, DepartmentChip, Empty, FactRow, Icon, IconButton, Message, Resolved, Tabs } from "@lance-live/sds";
import { useRouter } from "next/navigation";
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { flushSync } from "react-dom";
import { useNotify } from "../action-toast";
import { clockTime, continuesRun, type ChatLine } from "../chat-data";
import { FilterGroupsMenu, SearchBox } from "../chrome";
import { hrefFor } from "../hrefs";
import { EditText } from "../edit-text";
import { ThreadReply } from "../messages";
import { PageLayout } from "../page-layout";

type Dept = "Front desk" | "Sales";

type Conversation = {
  id: string;
  phone: string;
  dept: Dept;
  /** Hours since the last line, for the time range. */
  age: number;
  date: string;
  unread: boolean;
  resolved: boolean;
  aiPaused: boolean;
  /** Lance gave the conversation back, and the guest is waiting for a person. */
  handoff?: boolean;
  firstTexted: string;
  name?: string;
  note?: string;
  calls?: Call[];
  lines: ChatLine[];
  draft?: boolean;
};

type Call = { id: string; time: string; summary: string };

const TABS = ["All", "Needs reply", "Resolved"] as const;
type Tab = (typeof TABS)[number];

const DEPTS: Dept[] = ["Front desk", "Sales"];
const DATE_HOURS: Record<string, number> = {
  "Last 24 hours": 24,
  "Last 7 days": 24 * 7,
  "Last 30 days": 24 * 30,
};

const LANCE = { name: "Lance", initials: "LA" };

/** The detail panel's width, and the narrowest conversation that still reads beside it. */
const GUEST_SIDE = 392;
const THREAD_MIN = 480;

function guest(phone: string, id: string, day: string, time: string, body: string): ChatLine {
  return { id, name: phone, initials: "", day, time, body };
}

function lance(id: string, day: string, time: string, body: string): ChatLine {
  return { id, ...LANCE, day, time, body };
}

const SEED: Conversation[] = [
  {
    id: "g1",
    phone: "+1 (317) 506-6225",
    dept: "Sales",
    age: 2,
    date: "Nov 12",
    unread: true,
    resolved: false,
    aiPaused: true,
    handoff: true,
    firstTexted: "Nov 12",
    name: "Dana Whitfield",
    calls: [
      {
        id: "c1",
        time: "Yesterday, 5:10 PM",
        summary: "The guest asked about a room block for a wedding on the 21st and was told a sales manager would follow up with group rates.",
      },
    ],
    lines: [
      guest("+1 (317) 506-6225", "1", "Today", "8:12 AM", "Hi, we have a block of 12 rooms for a wedding on the 21st."),
      lance("2", "Today", "8:12 AM", "Congratulations! I can help with that. Is the block under a group name?"),
      guest(
        "+1 (317) 506-6225",
        "3",
        "Today",
        "8:20 AM",
        "Please have someone reach out to me. Our reservation was split into two confirmations and the rate is different on each.",
      ),
    ],
  },
  {
    id: "g2",
    phone: "+1 (765) 412-0198",
    dept: "Front desk",
    age: 4,
    date: "Nov 12",
    unread: false,
    resolved: false,
    aiPaused: false,
    firstTexted: "Nov 12",
    lines: [
      guest("+1 (765) 412-0198", "1", "Today", "6:41 AM", "What time is check-in?"),
      lance("2", "Today", "6:41 AM", "Thanks for calling SpringHill Suites Belmont. Check-in starts at 3:00 PM, and early check-in is based on availability."),
    ],
  },
  {
    id: "g3",
    phone: "+1 (812) 555-0143",
    dept: "Front desk",
    age: 20,
    date: "Nov 11",
    unread: true,
    resolved: false,
    aiPaused: true,
    handoff: true,
    firstTexted: "Nov 7",
    calls: [
      {
        id: "c1",
        time: "Yesterday, 4:27 PM",
        summary: "The guest asked whether the hotel has a hot tub and was told there is no hot tub, but the indoor pool is open until 10:00 PM.",
      },
    ],
    lines: [
      lance(
        "1",
        "Yesterday",
        "4:28 PM",
        "Thanks for calling SpringHill Suites Belmont. You can text this number any time. Msg and data rates may apply. Reply STOP to opt out, HELP for help.",
      ),
      guest("+1 (812) 555-0143", "2", "Yesterday", "4:29 PM", "What is included in the free breakfast?"),
    ],
  },
  {
    id: "g4",
    phone: "+1 (463) 220-7781",
    dept: "Front desk",
    age: 30,
    date: "Nov 11",
    unread: true,
    resolved: false,
    aiPaused: true,
    handoff: true,
    firstTexted: "Nov 11",
    lines: [
      guest("+1 (463) 220-7781", "1", "Yesterday", "9:15 AM", "Room 412. Can we get two more towels and a crib?"),
      lance("2", "Yesterday", "9:15 AM", "I have sent your request to housekeeping. Is there anything else?"),
      guest("+1 (463) 220-7781", "3", "Yesterday", "10:40 AM", "Still waiting on the crib."),
    ],
  },
  {
    id: "g5",
    phone: "+1 (317) 884-3302",
    dept: "Front desk",
    age: 52,
    date: "Nov 10",
    unread: false,
    resolved: false,
    aiPaused: false,
    firstTexted: "Oct 28",
    calls: [
      {
        id: "c1",
        time: "Oct 28, 11:02 AM",
        summary: "The guest booked two nights and asked for a room near the pool.",
      },
      {
        id: "c2",
        time: "Nov 10, 7:21 PM",
        summary: "The guest asked about pool hours and was told it is open until 10:00 PM.",
      },
    ],
    lines: [
      guest("+1 (317) 884-3302", "1", "Tuesday, November 10", "7:30 PM", "Is the pool open late?"),
      lance("2", "Tuesday, November 10", "7:30 PM", "The pool is open until 10:00 PM every night."),
    ],
  },
  {
    id: "g6",
    phone: "+1 (219) 607-1145",
    dept: "Front desk",
    age: 74,
    date: "Nov 9",
    unread: true,
    resolved: false,
    aiPaused: false,
    firstTexted: "Nov 9",
    lines: [guest("+1 (219) 607-1145", "1", "Monday, November 9", "11:05 PM", "I left a charger in room 318 this morning. Did anyone find it?")],
  },
  {
    id: "g7",
    phone: "+1 (765) 290-5512",
    dept: "Sales",
    age: 120,
    date: "Nov 7",
    unread: false,
    resolved: false,
    aiPaused: false,
    firstTexted: "Nov 7",
    lines: [
      guest("+1 (765) 290-5512", "1", "Saturday, November 7", "2:14 PM", "Do you have a meeting room for 30 people?"),
      lance("2", "Saturday, November 7", "2:15 PM", "Yes. The Belmont Room seats 40. I can have our sales manager send you a quote."),
      guest("+1 (765) 290-5512", "3", "Saturday, November 7", "2:20 PM", "That would be great, thank you."),
    ],
  },
  {
    id: "g8",
    phone: "+1 (317) 741-0026",
    dept: "Front desk",
    age: 140,
    date: "Nov 7",
    unread: false,
    resolved: false,
    aiPaused: false,
    firstTexted: "Nov 7",
    name: "Marcus Lee",
    lines: [
      guest("+1 (317) 741-0026", "1", "Saturday, November 7", "8:02 AM", "Can I get a late checkout tomorrow?"),
      lance("2", "Saturday, November 7", "8:02 AM", "Late checkout until 1:00 PM is set for your room."),
    ],
  },
];

/** The guest wrote last, and nobody has resolved it. */
function needsReply(conversation: Conversation) {
  const last = conversation.lines[conversation.lines.length - 1];
  return !conversation.resolved && Boolean(last && last.name === conversation.phone);
}

/** Sales answers its own guests. The front desk can read the thread, but not reply, resolve it, or change its AI replies. */
function readOnly(conversation: Conversation) {
  return conversation.dept === "Sales";
}

/** The Messages list's time: hours today, days this week, then the date. */
function since(conversation: Conversation) {
  const { age } = conversation;
  if (age < 1) return "Now";
  if (age < 24) return `${Math.floor(age)}h`;
  if (age < 24 * 7) return `${Math.floor(age / 24)}d`;
  return conversation.date;
}

function preview(conversation: Conversation) {
  return conversation.lines[conversation.lines.length - 1]?.body ?? "No messages yet";
}

function inTab(conversation: Conversation, tab: Tab) {
  if (tab === "Needs reply") return needsReply(conversation);
  if (tab === "Resolved") return conversation.resolved;
  return true;
}

function ConversationLog({ conversation }: { conversation: Conversation }) {
  const logRef = useRef<HTMLDivElement>(null);
  const { lines } = conversation;

  useEffect(() => {
    const log = logRef.current;
    if (log) log.scrollTop = log.scrollHeight;
  }, [conversation.id, lines.length]);

  let day = "";
  const rows: ReactNode[] = [];
  lines.forEach((line, index) => {
    if (line.day && line.day !== day) {
      day = line.day;
      rows.push(<Day key={`day-${line.day}`} label={line.day} />);
    }
    const prev = lines[index - 1];
    const next = lines[index + 1];
    const follows = Boolean(prev && continuesRun(prev, line));
    const leads = Boolean(next && continuesRun(line, next));
    rows.push(
      <Message
        key={line.id}
        name={line.name}
        time={follows ? undefined : line.time}
        initials={line.initials}
        you={line.name === "You" || line.name === "Lance"}
        byline={line.name === "Lance" ? conversation.dept : "You"}
        body={line.body}
        continued={follows}
        latest={follows && !leads}
      />,
    );
  });

  return (
    <div className="thread-log" ref={logRef}>
      <div className="thread-log-body">{rows}</div>
    </div>
  );
}

/** The ticket note's card, pinned under the header. The conversation starts under it, and it fades out once someone acts. */
function Handoff({ dept, onSend, onHandled }: { dept: Dept; onSend: () => void; onHandled: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [leaving, setLeaving] = useState<(() => void) | null>(null);
  const other = DEPTS.find((name) => name !== dept) ?? dept;

  useLayoutEffect(() => {
    const card = ref.current;
    const sheet = card?.closest<HTMLElement>(".thread-sheet");
    if (!card || !sheet) return;
    if (leaving) {
      sheet.style.removeProperty("--ticket-overview-space");
      return;
    }
    const fit = () => sheet.style.setProperty("--ticket-overview-space", `${card.offsetHeight + 24}px`);
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(card);
    return () => {
      observer.disconnect();
      sheet.style.removeProperty("--ticket-overview-space");
    };
  }, [leaving]);

  function leave(action: () => void) {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) action();
    else setLeaving(() => action);
  }

  return (
    <div
      ref={ref}
      className={["sds", "ticket-overview", "guest-handoff", leaving ? "is-leaving" : ""].filter(Boolean).join(" ")}
      onTransitionEnd={(event) => {
        if (event.target === event.currentTarget && event.propertyName === "opacity") leaving?.();
      }}
    >
      <p className="guest-handoff-text">Lance handed this back. The guest is waiting.</p>
      <span className="guest-handoff-actions">
        <Button variant="secondary" onClick={() => leave(onSend)}>
          <Icon name="share" size={14} />
          Send to {other}
        </Button>
        <Button variant="secondary" onClick={() => leave(onHandled)}>
          <Icon name="check" size={14} />
          Mark handled
        </Button>
      </span>
    </div>
  );
}

/** Who the guest is, in the detail panel's body: the heading, typed facts, past calls, and a note for the next person. */
function GuestDetails({
  conversation,
  shown,
  over,
  onPatch,
  onHide,
}: {
  conversation: Conversation;
  /** Hidden stays mounted, so the panel can slide out before it leaves. */
  shown: boolean;
  /** Too narrow to sit beside the conversation, so it covers it, like the detail panel, and a click outside hides it. */
  over: boolean;
  onPatch: (patch: Partial<Conversation>, message: string) => void;
  onHide: () => void;
}) {
  const router = useRouter();
  const sideRef = useRef<HTMLElement>(null);
  const calls = conversation.calls ?? [];

  useEffect(() => {
    if (!over || !shown) return;
    const hide = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Element) || sideRef.current?.contains(target)) return;
      if (target.closest(".menu, .toast, .brief-list, .guest-thread .thread-banner-main")) return;
      onHide();
    };
    document.addEventListener("pointerdown", hide);
    return () => document.removeEventListener("pointerdown", hide);
  }, [over, shown, onHide]);

  return (
    <aside ref={sideRef} className={over ? "guest-side is-over" : "guest-side"} aria-label="Guest" hidden={!shown}>
      <div className="todo-side-scroll">
        <div className="todo-side-heading">
          <div className="todo-side-title-row">
            <h2>{conversation.name || conversation.phone}</h2>
            <IconButton icon="panel" aria-label="Hide guest details" onClick={onHide} />
          </div>
          <p className="guest-side-help">First texted {conversation.firstTexted}</p>
        </div>
        <div className="todo-side-rule" />
        <div className="todo-side-meta">
          <FactRow label="Name">
            <input
              key={conversation.id}
              className="sds line"
              aria-label="Guest name"
              placeholder="Empty"
              defaultValue={conversation.name ?? ""}
              onBlur={(event) => {
                const name = event.target.value.trim();
                if (name !== (conversation.name ?? "")) onPatch({ name }, name ? "Guest name saved" : "Guest name removed");
              }}
            />
          </FactRow>
          <FactRow label="Phone">
            <span className="todo-side-value">{conversation.phone}</span>
          </FactRow>
          <FactRow label="Channel">
            <span className="todo-side-value">SMS</span>
          </FactRow>
          <FactRow label="Department">
            <DepartmentChip name={conversation.dept} />
          </FactRow>
        </div>
        <div className="todo-side-rule" />
        <section className="guest-side-section" aria-label="Calls from this number">
          <span className="guest-side-title">
            Calls from this number
            {calls.length > 0 ? <span className="guest-side-count">{calls.length}</span> : null}
          </span>
          {calls.length > 0 ? (
            <>
              <ul className="guest-calls">
                {calls.map((call) => (
                  <li key={call.id} className="guest-call">
                    <span className="guest-call-head">
                      Answered
                      <time>{call.time}</time>
                    </span>
                    <p className="guest-call-summary">{call.summary}</p>
                  </li>
                ))}
              </ul>
              <Button variant="secondary" onClick={() => router.push("/calls")}>
                <Icon name="phone" size={14} />
                Open call history
              </Button>
            </>
          ) : (
            <p className="todo-side-value is-empty">No calls yet</p>
          )}
        </section>
        <div className="todo-side-rule" />
        <div className="todo-side-desc">
          <span className="sheet-label">Note</span>
          <EditText fill>
            <textarea
              key={conversation.id}
              className="text-well"
              rows={4}
              placeholder="Add a note"
              defaultValue={conversation.note ?? ""}
              onBlur={(event) => {
                const note = event.target.value.trim();
                if (note !== (conversation.note ?? "")) onPatch({ note }, note ? "Note saved" : "Note removed");
              }}
            />
          </EditText>
          <span className="guest-side-help">Anything the next person should know.</span>
        </div>
      </div>
    </aside>
  );
}

export default function GuestMessagesPage() {
  const notify = useNotify();
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>(SEED);
  const [tab, setTab] = useState<Tab>("All");
  const [dates, setDates] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [depts, setDepts] = useState<string[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  /** Until someone opens or hides it, the guest column shows only when the conversation keeps its room beside it. */
  const [details, setDetails] = useState<boolean | null>(null);
  const [roomy, setRoomy] = useState(true);
  const openRef = useRef<HTMLDivElement>(null);
  const showDetails = details ?? roomy;
  const phoneRef = useRef<HTMLInputElement>(null);
  const pendingFocus = useRef<string | null>(null);

  const inRange = useMemo(() => conversations.filter((conversation) => conversation.draft || conversation.age <= (DATE_HOURS[dates[0]] ?? Infinity)), [conversations, dates]);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return inRange.filter(
      (conversation) =>
        inTab(conversation, tab) &&
        (depts.length === 0 || depts.includes(conversation.dept)) &&
        (!needle || `${conversation.phone} ${conversation.lines.map((line) => line.body).join(" ")}`.toLowerCase().includes(needle)),
    );
  }, [inRange, tab, depts, query]);

  const open = visible.find((conversation) => conversation.id === selectedId) ?? null;

  useEffect(() => {
    if (!open || pendingFocus.current !== open.id) return;
    pendingFocus.current = null;
    phoneRef.current?.focus();
  }, [open]);

  const hasOpen = Boolean(open);
  useLayoutEffect(() => {
    const pane = openRef.current;
    if (!pane) return;
    const fit = () => setRoomy(pane.offsetWidth >= GUEST_SIDE + THREAD_MIN);
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(pane);
    return () => observer.disconnect();
  }, [hasOpen]);

  function update(id: string, patch: Partial<Conversation>) {
    setConversations((current) => current.map((conversation) => (conversation.id === id ? { ...conversation, ...patch } : conversation)));
  }

  function select(id: string) {
    setSelectedId(id);
    update(id, { unread: false });
  }

  function createConversation() {
    const id = `new-${Date.now()}`;
    pendingFocus.current = id;
    flushSync(() => {
      setTab("All");
      setQuery("");
      setDepts([]);
      setConversations((current) => [
        {
          id,
          phone: "",
          dept: "Front desk",
          age: 0,
          date: "Now",
          unread: false,
          resolved: false,
          aiPaused: true,
          firstTexted: "Today",
          lines: [],
          draft: true,
        },
        ...current,
      ]);
      setSelectedId(id);
    });
  }

  function send(conversation: Conversation) {
    const body = (drafts[conversation.id] ?? "").trim();
    if (!body) return;
    if (conversation.draft && !conversation.phone.trim()) {
      phoneRef.current?.focus();
      return;
    }
    const sentAt = new Date();
    const line: ChatLine = {
      id: `you-${sentAt.getTime()}`,
      name: "You",
      initials: "",
      day: "Today",
      time: clockTime(sentAt),
      at: sentAt.getTime(),
      body,
    };
    update(conversation.id, {
      lines: [...conversation.lines, line],
      age: 0,
      date: "Now",
      draft: false,
      aiPaused: true,
      handoff: false,
    });
    setDrafts((current) => ({ ...current, [conversation.id]: "" }));
    if (conversation.draft) notify("Conversation created");
  }

  function resolve(conversation: Conversation) {
    update(conversation.id, { resolved: true });
    notify({
      message: "Conversation resolved",
      action: "Undo",
      onAction: () => update(conversation.id, { resolved: false }),
    });
  }

  function toggleAi(conversation: Conversation) {
    update(conversation.id, conversation.aiPaused ? { aiPaused: false, handoff: false } : { aiPaused: true });
    notify(conversation.aiPaused ? "AI replies resumed" : "AI replies paused");
  }

  function sendToOther(conversation: Conversation) {
    const dept = DEPTS.find((name) => name !== conversation.dept) ?? conversation.dept;
    update(conversation.id, { dept, handoff: false });
    notify({
      message: `Sent to ${dept}`,
      action: "Undo",
      onAction: () => update(conversation.id, { dept: conversation.dept, handoff: true }),
    });
  }

  function markHandled(conversation: Conversation) {
    update(conversation.id, { handoff: false });
    notify({
      message: "Marked handled",
      action: "Undo",
      onAction: () => update(conversation.id, { handoff: true }),
    });
  }

  function openInSales() {
    const href = hrefFor("Sales");
    if (href) router.push(href);
    else notify("Sales doesn't have a page yet");
  }

  return (
    <PageLayout
      data-view="top"
      className="guest-page"
      icon="bubble-lines"
      title="Guest messages"
      count={visible.filter((conversation) => !conversation.draft).length}
      actions={
        <Button onClick={createConversation}>
          <Icon name="edit-square" size={14} />
          New message
        </Button>
      }
      tabs={
        <Tabs
          label="Conversations"
          value={tab}
          onValueChange={(value) => setTab(value as Tab)}
          items={TABS.map((name) => ({
            value: name,
            label: name,
            count: inRange.filter((conversation) => !conversation.draft && inTab(conversation, name)).length,
          }))}
        />
      }
      toolbar={
        <div className="filter-row">
          <div className="filter-tools">
            <SearchBox className="rail-search" placeholder="Search messages" label="Search messages" value={query} onValueChange={setQuery} />
            <div className="filter-actions">
              <FilterGroupsMenu
                groups={[
                  { name: "Department", options: DEPTS, value: depts, onValueChange: setDepts },
                  { name: "Date", options: Object.keys(DATE_HOURS), value: dates, onValueChange: setDates, single: true },
                ]}
              />
            </div>
          </div>
          <div className="filter-chips">
            {depts.map((value) => (
              <Chip key={value} filter={{ name: "Department", value }} onClick={() => setDepts((current) => current.filter((item) => item !== value))} />
            ))}
            {dates.map((value) => (
              <Chip key={value} filter={{ name: "Date", value }} onClick={() => setDates([])} />
            ))}
          </div>
        </div>
      }
    >
      <div className="stage brief">
        <div className="scroll-fade list-fade">
          <div className="brief-list" role="listbox" aria-label="Conversations">
            {visible.map((conversation) => (
              <button
                key={conversation.id}
                type="button"
                role="option"
                data-record={conversation.id}
                className={[conversation.unread ? "is-unread" : "", conversation.draft ? "is-untitled" : ""].filter(Boolean).join(" ")}
                aria-selected={open?.id === conversation.id}
                onClick={() => select(conversation.id)}
              >
                <span className="note-avatar-slot guest-mark" aria-hidden="true">
                  <Icon name="phone" size={16} />
                </span>
                <span className="note-copy">
                  <span className="note-line">
                    <DepartmentChip className="note-dept" name={conversation.dept} plain />
                    {conversation.aiPaused ? <span className="note-time">· AI paused</span> : null}
                  </span>
                  <span className="brief-title">{conversation.phone || "New message"}</span>
                  <span className="brief-preview">{preview(conversation)}</span>
                </span>
                <span className="notice-end">
                  <span className="notice-dot" aria-label={conversation.unread ? "Unread" : undefined} />
                  <time className="notice-time">{since(conversation)}</time>
                </span>
              </button>
            ))}
          </div>
        </div>
        <div className="brief-read">
          {open ? (
            <div className="guest-open" ref={openRef}>
              <section className="guest-thread" aria-label={open.phone || "New message"}>
                <div className="thread-banner">
                  {open.draft ? (
                    <div className="thread-banner-main">
                      <span className="note-avatar-slot guest-mark" aria-hidden="true">
                        <Icon name="phone" size={16} />
                      </span>
                      <span className="thread-id">
                        <EditText fill>
                          <input
                            ref={phoneRef}
                            className="thread-title guest-phone"
                            aria-label="Phone number"
                            placeholder="Phone number"
                            inputMode="tel"
                            value={open.phone}
                            onChange={(event) => update(open.id, { phone: event.target.value })}
                          />
                        </EditText>
                        <span className="thread-sub">SMS · {open.dept}</span>
                      </span>
                    </div>
                  ) : (
                    <button className="thread-banner-main" type="button" aria-label={`${open.phone}, show guest details`} onClick={() => setDetails(true)}>
                      <span className="note-avatar-slot guest-mark" aria-hidden="true">
                        <Icon name="phone" size={16} />
                      </span>
                      <span className="thread-id">
                        <span className="thread-title">{open.phone}</span>
                        <span className="thread-sub">SMS · {open.dept}</span>
                      </span>
                    </button>
                  )}
                  {open.draft || readOnly(open) ? null : (
                    <>
                      <Button
                        variant="secondary"
                        className="theme-switch"
                        aria-pressed={!open.aiPaused}
                        onClick={(event) => {
                          event.currentTarget.classList.add("is-init");
                          toggleAi(open);
                        }}
                      >
                        AI replies
                        <span className="theme-switch-track" aria-hidden="true">
                          <span className="theme-switch-knob" />
                        </span>
                      </Button>
                      {open.resolved ? null : (
                        <Button variant="secondary" onClick={() => resolve(open)}>
                          <Icon name="check" size={14} />
                          Resolve
                        </Button>
                      )}
                    </>
                  )}
                  {open.draft || showDetails ? null : <IconButton icon="panel" aria-label="Show guest details" onClick={() => setDetails(true)} />}
                </div>
                <div className="thread-sheet guest-sheet">
                  {open.handoff && !open.resolved && !readOnly(open) ? (
                    <Handoff key={open.id} dept={open.dept} onSend={() => sendToOther(open)} onHandled={() => markHandled(open)} />
                  ) : null}
                  {open.lines.length > 0 ? <ConversationLog conversation={open} /> : <div className="thread-log" />}
                  {readOnly(open) ? (
                    <Resolved
                      note="This is a Sales thread. Replies to this guest go out from Sales, so you can read it here but not reply."
                      actions={
                        <Button variant="secondary" onClick={openInSales}>
                          Open in Sales
                        </Button>
                      }
                    />
                  ) : open.resolved ? (
                    <Resolved onNew={createConversation} onReopen={() => update(open.id, { resolved: false })} />
                  ) : (
                    <>
                      <ThreadReply
                        draft={drafts[open.id] ?? ""}
                        setDraft={(value) =>
                          setDrafts((current) => ({
                            ...current,
                            [open.id]: value,
                          }))
                        }
                        send={() => send(open)}
                        placeholder="Reply to this guest"
                      />
                      <p className="guest-reply-hint">
                        {`${open.aiPaused ? "" : "Replying pauses AI replies for this guest. "}Signed SpringHill Suites Belmont ${open.dept.toLowerCase()}.`}
                      </p>
                    </>
                  )}
                </div>
              </section>
              {open.draft ? null : (
                <GuestDetails
                  conversation={open}
                  shown={showDetails}
                  over={!roomy}
                  onPatch={(patch, message) => {
                    update(open.id, patch);
                    notify(message);
                  }}
                  onHide={() => setDetails(false)}
                />
              )}
            </div>
          ) : (
            <Empty icon="bubble-lines" title={visible.length === 0 ? "No conversations" : "No conversation open"}>
              {visible.length === 0 ? "Nothing matches this view." : "Select a conversation to read it and reply."}
            </Empty>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
