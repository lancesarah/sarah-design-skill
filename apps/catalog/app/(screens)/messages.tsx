"use client";

import { Chip, Avatar, Button, Checkbox, ConfirmDialog, Day, Empty, Icon, Message, OverlayMenu, Person, Resolved, SegmentedControl, Status, Ticket, TicketNote, Typing, type IconName } from "@lance-live/gallery-ui";
import { Fragment, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore, type ReactNode, type RefObject } from "react";
import { useNotify } from "./action-toast";
import { clockTime, continuesRun, useChat, type ChatLine } from "./chat-data";
import { SearchBox } from "./chrome";
import { Glyph } from "./glyph";

type MessageSource = "Channels" | "Direct" | "Lance" | "Admin";

const SOURCES = ["All", "Channels", "Direct", "Lance", "Admin"] as const;
type SourceFilter = (typeof SOURCES)[number];

type Thread = {
  id: string;
  group: string;
  title: string;
  source: MessageSource;
  time: string;
  read: boolean;
  initials: string;
  sub?: string;
  note?: string;
  /** A teammate on support, drawn as a person rather than a channel. */
  support?: boolean;
  /** A portrait, used instead of initials. */
  photo?: string;
  /** A verified mark on the portrait. */
  verified?: boolean;
  /** A group chat. A direct message with more than one person is one too. The avatar is the people mark, not initials. */
  groupChat?: boolean;
  /** A department channel. The people mark uses that department’s color. */
  dept?: "Front desk" | "Housekeeping" | "Maintenance" | "Food & Beverage" | "Sales" | "Management";
  /** An archive row. The mark is a bare icon and the words are muted. */
  muted?: boolean;
};

export const THREADS: Thread[] = [
  { id: "gavin", group: "Lance", title: "Gavin from Lance", source: "Lance", time: "", read: true, initials: "GV", sub: "0 open tickets", support: true, photo: "/avatar-gavin.png", verified: true },
  { id: "todays-team", group: "Messages", title: "Today's Team", source: "Channels", time: "4d", read: false, initials: "TT", note: "Fred: I will be done in room 1013 in 10 more minutes", groupChat: true },
  { id: "food", group: "Messages", title: "Food & Beverage", source: "Channels", time: "1d", read: false, initials: "FB", note: "Othman: As of now no communication has been instored …", groupChat: true, dept: "Food & Beverage" },
  { id: "front-desk", group: "Messages", title: "Front Desk", source: "Channels", time: "5d", read: true, initials: "FD", note: "Bernadette: Can I get some help with Booking messages please", groupChat: true, dept: "Front desk" },
  { id: "housekeeping", group: "Messages", title: "Housekeeping", source: "Channels", time: "4h", read: false, initials: "HK", note: "Esmeralda: 1120 done", groupChat: true, dept: "Housekeeping" },
  { id: "maintenance", group: "Messages", title: "Maintenance", source: "Channels", time: "4d", read: true, initials: "MN", note: "Robin: Done", groupChat: true, dept: "Maintenance" },
  { id: "management", group: "Messages", title: "Management", source: "Channels", time: "Oct 30", read: true, initials: "MG", note: "Bobby: Rm 917, Yogesh Delal, upset w/ the smoking going …", groupChat: true, dept: "Management" },
  { id: "sales", group: "Messages", title: "Sales", source: "Channels", time: "", read: true, initials: "SA", sub: "Department channel", groupChat: true, dept: "Sales" },
  { id: "repairs", group: "Direct", title: "Othman Belkadi, Chris Law, Lupe Valdez", source: "Direct", time: "5d", read: false, initials: "OB", note: "Chris: Repairs", groupChat: true },
  { id: "no-shows", group: "Direct", title: "Sindiso Sibanda, Othman Belkadi, Cy Corbin, …", source: "Direct", time: "6d", read: true, initials: "SS", note: "Diana: Please if we have any group no-show's or group la…", groupChat: true },
  { id: "fred", group: "Direct", title: "Fred Senecal", source: "Direct", time: "Oct 30", read: true, initials: "FS", note: "Fred: Photo" },
  { id: "deleted", group: "Admin", title: "Deleted messages", source: "Admin", time: "", read: true, initials: "DM", sub: "Admin channel", muted: true },
];

const DELETED: Thread[] = [
  { id: "deleted-note", group: "Admin", title: "Front Desk", source: "Channels", time: "Nov 4", read: true, initials: "FD", note: "Bernadette: Ignore the last note. I sent it to the wrong channel.", groupChat: true, dept: "Front desk" },
];

export const MESSAGE_COUNT = THREADS.filter((thread) => !thread.read).length;

function ThreadRow({ thread, selected, onSelect }: { thread: Thread; selected?: boolean; onSelect?: () => void }) {
  return (
    <button
      type="button"
      role="option"
      className={["notice-row", thread.read ? "" : "is-unread", thread.support ? "is-support" : "", isGroupChat(thread) ? "is-room" : "", thread.muted ? "is-muted" : ""].filter(Boolean).join(" ")}
      aria-selected={selected}
      onClick={onSelect}
    >
      {thread.photo ? (
        <Avatar photo={thread.photo}>
          {thread.verified ? (
            <span className="avatar-verified">
              <Icon name="check" size={8} />
            </span>
          ) : null}
        </Avatar>
      ) : thread.muted ? (
        <span className="notice-mark" aria-hidden="true">
          <Icon name="archive" size={18} />
        </span>
      ) : isGroupChat(thread) ? (
        <span className="sds avatar" data-dept={thread.dept} aria-hidden="true">
          <Icon name={groupIcon(thread)} size={18} />
        </span>
      ) : (
        <Avatar initials={thread.initials} />
      )}
      {thread.support ? (
        <span className="person-copy person-title">
          <span className="title">{thread.title}</span>
          {thread.sub ? <span className="sub">{thread.sub}</span> : null}
        </span>
      ) : (
        <span className="notice-copy">
          {thread.sub ? <span className="notice-sub">{thread.sub}</span> : null}
          <span className="notice-title">{thread.title}</span>
          {thread.note ? <span className="notice-sub">{thread.note}</span> : null}
        </span>
      )}
      {thread.support || thread.muted ? (
        <span className="ticket-go" aria-hidden="true">
          <Icon name="chevron" size={16} />
        </span>
      ) : (
        <span className="notice-end">
          <span className="notice-dot" aria-hidden="true" />
          {thread.time ? (
            <time className="notice-time" dateTime={thread.time}>
              {thread.time}
            </time>
          ) : null}
        </span>
      )}
    </button>
  );
}

/** Split row heights into pages that each fill the budget. A row taller than the budget still gets a page. */
function pageStarts(heights: number[], budget: number) {
  const starts = [0];
  let used = 0;
  for (let index = 0; index < heights.length; index += 1) {
    const height = heights[index];
    const start = starts[starts.length - 1];
    if (index > start && used + height > budget + 0.5) {
      starts.push(index);
      used = height;
    } else {
      used += height;
    }
  }
  return starts;
}

/** Conversations started from New message. They sit at the top of the direct messages. */
let started: Thread[] = [];
let removedIds: string[] = [];
const NONE_STARTED: Thread[] = [];
const NONE_REMOVED: string[] = [];
const startedWatchers = new Set<() => void>();

function watchStarted(run: () => void) {
  startedWatchers.add(run);
  return () => {
    startedWatchers.delete(run);
  };
}

function emitThreads() {
  startedWatchers.forEach((run) => run());
}

function startThread(thread: Thread) {
  started = [thread, ...started];
  emitThreads();
}

function removeThread(id: string) {
  const next = started.filter((thread) => thread.id !== id);
  if (next.length !== started.length) started = next;
  if (!removedIds.includes(id)) removedIds = [...removedIds, id];
  emitThreads();
}

function useThreads() {
  const extra = useSyncExternalStore(watchStarted, () => started, () => NONE_STARTED);
  const removed = useSyncExternalStore(watchStarted, () => removedIds, () => NONE_REMOVED);
  return useMemo(() => {
    const base = THREADS.filter((thread) => !removed.includes(thread.id));
    const added = extra.filter((thread) => !removed.includes(thread.id));
    if (added.length === 0) return base;
    const at = base.findIndex((thread) => thread.group === "Direct");
    const index = at === -1 ? base.length : at;
    return [...base.slice(0, index), ...added, ...base.slice(index)];
  }, [extra, removed]);
}

export function messageThread(id: string) {
  if (removedIds.includes(id)) return null;
  return THREADS.find((thread) => thread.id === id) ?? started.find((thread) => thread.id === id) ?? null;
}

/** One person is a direct message. More than one person is a group chat, so the name opens the people. */
const DEPT_ICON: Record<NonNullable<Thread["dept"]>, IconName> = {
  "Food & Beverage": "cup",
  "Front desk": "bell",
  Housekeeping: "bed",
  Maintenance: "wrench",
  Management: "user",
  Sales: "card",
};

function groupIcon(thread: Thread): IconName {
  return thread.dept ? DEPT_ICON[thread.dept] : "users";
}

function isGroupChat(thread: Thread) {
  if (thread.groupChat) return true;
  if (thread.source !== "Direct" || thread.support || thread.muted) return false;
  return thread.title.split(", ").filter((name) => name !== "…").length > 1;
}

function threadSubtitle(thread: Thread) {
  if (thread.sub) return thread.sub;
  if (isGroupChat(thread) && thread.dept) return "Department channel";
  if (isGroupChat(thread)) return "Group chat";
  return null;
}

const MEMBERS: Record<string, { name: string; initials: string; role: string }[]> = {
  "front-desk": [
    { name: "Chip Cathrall", initials: "CC", role: "Front Desk" },
    { name: "Amaal Chin", initials: "AC", role: "Front Desk" },
    { name: "Cy Corbin", initials: "CC", role: "Night Audit, Front Desk" },
    { name: "Jacqueline Rebollo", initials: "JR", role: "Supervisor, Front Desk" },
    { name: "Sindiso Sibanda", initials: "SS", role: "Front Desk" },
    { name: "Chantal Smith", initials: "CS", role: "Night Audit, Front Desk" },
    { name: "Bobby Taylor", initials: "BT", role: "Management, Front Desk Supervisor" },
    { name: "Richele Taylor", initials: "RT", role: "Front Desk" },
    { name: "Liz Wells", initials: "LW", role: "Front Desk" },
  ],
  "todays-team": [
    { name: "Sarah Mou", initials: "SM", role: "Front Desk" },
    { name: "Fred Senecal", initials: "FS", role: "Maintenance" },
    { name: "Esmeralda", initials: "ES", role: "Housekeeping" },
  ],
  food: [
    { name: "Othman Belkadi", initials: "OB", role: "Food & Beverage" },
    { name: "Bernadette", initials: "BE", role: "Food & Beverage" },
  ],
  housekeeping: [
    { name: "Esmeralda", initials: "ES", role: "Housekeeping" },
    { name: "Robin", initials: "RB", role: "Housekeeping" },
  ],
  maintenance: [
    { name: "Robin", initials: "RB", role: "Maintenance" },
    { name: "Fred Senecal", initials: "FS", role: "Maintenance" },
  ],
  management: [
    { name: "Bobby Taylor", initials: "BT", role: "Management" },
  ],
  sales: [
    { name: "Bernadette", initials: "BE", role: "Sales" },
  ],
  repairs: [
    { name: "Othman Belkadi", initials: "OB", role: "Food & Beverage" },
    { name: "Chris Law", initials: "CL", role: "" },
    { name: "Lupe Valdez", initials: "LV", role: "" },
  ],
  "no-shows": [
    { name: "Sindiso Sibanda", initials: "SS", role: "Front Desk" },
    { name: "Othman Belkadi", initials: "OB", role: "Food & Beverage" },
    { name: "Cy Corbin", initials: "CC", role: "Night Audit, Front Desk" },
  ],
};

const DEPARTMENTS = THREADS.filter((thread) => thread.dept);

/** Everyone a message can go to, once each, by last name. A person in two departments keeps both roles. */
const PEOPLE = (() => {
  const byName = new Map<string, { name: string; initials: string; roles: string[] }>();
  for (const members of Object.values(MEMBERS)) {
    for (const member of members) {
      if (member.name === "Sarah Mou") continue;
      const person = byName.get(member.name) ?? { name: member.name, initials: member.initials, roles: [] };
      for (const role of member.role.split(", ")) {
        if (role && !person.roles.includes(role)) person.roles.push(role);
      }
      byName.set(member.name, person);
    }
  }
  const last = (name: string) => name.split(" ").pop() ?? name;
  return [...byName.values()]
    .map((person) => ({ name: person.name, initials: person.initials, role: person.roles.join(", ") }))
    .sort((a, b) => last(a.name).localeCompare(last(b.name)) || a.name.localeCompare(b.name));
})();

function peopleCount(count: number) {
  return count === 1 ? "1 person" : `${count} people`;
}

/** The people a new message is addressed to. A department stands for the people already in it. */
function peopleFor(to: Recipient[]) {
  const found: { name: string; initials: string; role: string }[] = [];
  const add = (member: { name: string; initials: string; role: string }) => {
    if (!found.some((item) => item.name === member.name)) found.push(member);
  };
  for (const item of to) {
    if (item.threadId) {
      for (const member of MEMBERS[item.threadId] ?? []) add(member);
      continue;
    }
    add(PEOPLE.find((person) => person.name === item.name) ?? { name: item.name, initials: item.initials, role: "" });
  }
  return found;
}

function ThreadMark({ thread, hero = false }: { thread: Thread; hero?: boolean }) {
  const icon = hero ? 24 : 18;
  if (thread.photo) {
    return (
      <Avatar className="thread-mark" photo={thread.photo}>
        {thread.verified ? (
          <span className="avatar-verified">
            <Icon name="check" size={8} />
          </span>
        ) : null}
      </Avatar>
    );
  }
  if (thread.muted) {
    return (
      <span className="notice-mark" aria-hidden="true">
        <Icon name="archive" size={icon} />
      </span>
    );
  }
  if (isGroupChat(thread)) {
    return (
      <span className="sds avatar thread-mark is-room" data-dept={thread.dept} aria-hidden="true">
        <Icon name={groupIcon(thread)} size={icon} />
      </span>
    );
  }
  return <Avatar initials={thread.initials} />;
}

const ICON_COLORS: NonNullable<Thread["dept"]>[] = ["Front desk", "Housekeeping", "Maintenance", "Food & Beverage", "Sales", "Management"];

function ColumnDetails({ thread, onDelete, onLook, sheet = true, actions = true }: { thread: Thread; onDelete: () => void; onLook: (look: { name: string; dept?: Thread["dept"] }) => void; sheet?: boolean; actions?: boolean }) {
  const subtitle = threadSubtitle(thread);
  const nameField = useRef<HTMLInputElement>(null);
  const [name, setName] = useState(thread.title);
  const [tint, setTint] = useState<Thread["dept"] | undefined>(thread.dept);
  useEffect(() => {
    setName(thread.title);
    setTint(thread.dept);
  }, [thread.id, thread.title, thread.dept]);
  useEffect(() => {
    onLook({ name, dept: tint });
  }, [name, tint, onLook]);
  const listed = MEMBERS[thread.id] ?? [];
  const members = listed.length > 0 ? listed : thread.title.split(", ").flatMap((personName) => {
    const person = PEOPLE.find((item) => item.name === personName);
    return person ? [person] : [];
  });
  const shown = tint ? { ...thread, dept: tint } : { ...thread, dept: undefined };
  const body = (
      <div className="thread-log">
        <div className="thread-hero">
          <div className="thread-hero-id">
            <ThreadMark thread={shown} hero />
            <span className="thread-hero-copy">
              <span className="thread-hero-title">{name}</span>
              {subtitle ? <span className="thread-sub">{subtitle}</span> : null}
            </span>
          </div>
          <div className="thread-rename">
            <input
              ref={nameField}
              className="sds line"
              value={name}
              aria-label="Group chat name"
              placeholder="Group chat name"
              onChange={(event) => setName(event.target.value)}
            />
            <button className="thread-rename-edit" type="button" aria-label="Rename" onClick={() => nameField.current?.focus()}>
              <Icon name="edit" size={16} />
            </button>
          </div>
          <div className="thread-icon-tools">
            <div className="thread-swatches" role="group" aria-label="Icon color">
              {ICON_COLORS.map((dept) => (
                <button key={dept} className="sds thread-swatch" type="button" data-dept={dept} aria-label={dept} aria-pressed={tint === dept} onClick={() => setTint(dept)} />
              ))}
              <button className="sds thread-swatch is-grey" type="button" aria-label="Grey" aria-pressed={tint === undefined} onClick={() => setTint(undefined)} />
            </div>
            <Button variant="secondary">Change icon</Button>
          </div>
          {actions ? (
            <div className="thread-hero-actions">
              <Button variant="danger-light" onClick={onDelete}>Delete chat</Button>
            </div>
          ) : null}
        </div>
        <section className="thread-people" aria-label="People">
          <h3 className="sds sheet-label">People</h3>
          {members.map((member) => (
            <div className="thread-person" key={member.name}>
              <Person name={member.name} initials={member.initials} role={member.role} variant="role" />
            </div>
          ))}
        </section>
      </div>
  );
  if (!sheet) return body;
  return <div className="notice-sheet thread-sheet">{body}</div>;
}

/** The conversation: a day rule where the day changes, then each line. A record that belongs to the conversation sits after the lines that came before it. In a ticket, only Gavin and the person signed in are talking, so every line that is not Gavin's is theirs. Lines from the same person inside two minutes share one header and sit together. */
function ThreadLog({ id, lines, record, support = false, typing = false }: { id: string; lines: ChatLine[]; record?: { after: number; node: ReactNode }; support?: boolean; typing?: boolean }) {
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const log = logRef.current;
    if (log) log.scrollTop = log.scrollHeight;
  }, [id, lines.length, typing]);

  let day = "";
  const rows: ReactNode[] = [];
  lines.forEach((line, index) => {
    if (record && index === record.after) rows.push(<Fragment key="record">{record.node}</Fragment>);
    if (line.day && line.day !== day) {
      day = line.day;
      rows.push(<Day key={line.day} label={line.day} />);
    }
    const prev = lines[index - 1];
    const next = lines[index + 1];
    const splitBefore = Boolean(record && index === record.after);
    const splitAfter = Boolean(record && index + 1 === record.after);
    const follows = Boolean(prev && !splitBefore && continuesRun(prev, line));
    const leads = Boolean(next && !splitAfter && continuesRun(line, next));
    const yours = support && line.name !== "Gavin from Lance";
    rows.push(
      <Message
        key={line.id}
        name={line.name}
        time={follows || !line.time ? undefined : line.time}
        initials={line.initials}
        photo={yours || follows ? undefined : line.photo}
        you={yours}
        body={line.body}
        continued={follows}
        latest={follows && !leads}
      />,
    );
  });
  if (record && record.after >= lines.length) rows.push(<Fragment key="record">{record.node}</Fragment>);

  return (
    <div className="thread-log" ref={logRef}>
      <div className="thread-log-body">
        {rows}
        {typing ? <Typing photo="/avatar-gavin.png" label="Gavin is typing" /> : null}
      </div>
    </div>
  );
}

/** A new support conversation. Gavin types, then says hello. The clock sits on the day line. */
function NewSupportChat({ bindActions, onReplace }: { bindActions: (actions: { resolve: () => void } | null) => void; onReplace?: () => void }) {
  const id = useState(() => `support-new-${Date.now()}`)[0];
  const { lines, draft, setDraft, send } = useChat(id);
  const [greeting, setGreeting] = useState<ChatLine | null>(null);
  const [typing, setTyping] = useState(true);
  const [resolved, setResolved] = useState(false);

  useEffect(() => {
    const sentAt = new Date();
    const line: ChatLine = {
      id: "gavin-hello",
      name: "Gavin from Lance",
      initials: "GV",
      photo: "/avatar-gavin.png",
      day: `Today ${clockTime(sentAt)}`,
      time: "",
      at: sentAt.getTime(),
      body: "Hi, how can I help?",
    };
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setTyping(false);
      setGreeting(line);
      return;
    }
    const timer = window.setTimeout(() => {
      setTyping(false);
      setGreeting(line);
    }, 1100);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (resolved) {
      bindActions(null);
      return () => bindActions(null);
    }
    bindActions({ resolve: () => setResolved(true) });
    return () => bindActions(null);
  }, [resolved, bindActions]);

  return (
    <div className="notice-sheet thread-sheet">
      <ThreadLog id={id} lines={greeting ? [greeting, ...lines] : lines} support typing={typing && !resolved} />
      {resolved ? (
        <Resolved onNew={() => { if (onReplace) onReplace(); else setResolved(false); }} onReopen={() => setResolved(false)} />
      ) : (
        <ThreadReply draft={draft} setDraft={setDraft} send={send} placeholder="Message Lance Support Team" />
      )}
    </div>
  );
}

export function MessageField({ label, value, onValueChange, onSubmit }: { label: string; value: string; onValueChange: (value: string) => void; onSubmit: () => void }) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useLayoutEffect(() => {
    const field = ref.current;
    if (!field) return;
    const fit = () => {
      field.style.height = "0px";
      field.style.height = `${field.scrollHeight}px`;
    };
    fit();
    let width = field.offsetWidth;
    const observer = new ResizeObserver(() => {
      if (field.offsetWidth === width) return;
      width = field.offsetWidth;
      fit();
    });
    observer.observe(field);
    return () => observer.disconnect();
  }, [value]);

  return (
    <textarea
      ref={ref}
      rows={1}
      aria-label={label}
      placeholder={`${label}...`}
      value={value}
      onChange={(event) => onValueChange(event.target.value)}
      onKeyDown={(event) => {
        if (event.key === "Enter" && !event.shiftKey) {
          event.preventDefault();
          onSubmit();
        }
      }}
    />
  );
}

export function ThreadReply({ draft, setDraft, send, placeholder = "Write a message" }: { draft: string; setDraft: (value: string) => void; send: () => void; placeholder?: string }) {
  return (
    <form
      className={["sds", "msg", "is-fill", draft.trim() ? "has-value" : ""].filter(Boolean).join(" ")}
      onSubmit={(event) => {
        event.preventDefault();
        send();
      }}
    >
      <span className="lead">
        <button className="well" type="button" aria-label="Add">
          <Icon name="plus" size={16} />
        </button>
        <MessageField label={placeholder} value={draft} onValueChange={setDraft} onSubmit={send} />
      </span>
      <button className="well" type="submit" aria-label="Send">
        <Icon name="up" size={16} />
      </button>
    </form>
  );
}

function ColumnThread({ thread, pinned, onPin, onOpenDetails }: { thread: Thread; pinned: boolean; onPin: () => void; onOpenDetails: () => void }) {
  const { lines, draft, setDraft, send } = useChat(thread.id);
  const subtitle = threadSubtitle(thread);

  return (
    <div className="notice-sheet thread-sheet">
      <div className="thread-banner">
        {isGroupChat(thread) ? (
          <button className="thread-banner-main" type="button" onClick={onOpenDetails}>
            <ThreadMark thread={thread} />
            <span className="thread-id">
              <span className="thread-title">{thread.title}</span>
              {subtitle ? <span className="thread-sub">{subtitle}</span> : null}
            </span>
          </button>
        ) : (
          <div className="thread-banner-main">
            <ThreadMark thread={thread} />
            <span className="thread-id">
              <span className="thread-title">{thread.title}</span>
              {subtitle ? <span className="thread-sub">{subtitle}</span> : null}
            </span>
          </div>
        )}
        <button className="side-icon" type="button" aria-label={pinned ? "Unpin" : "Pin"} aria-pressed={pinned} onClick={onPin}>
          <Icon name={pinned ? "pin-filled" : "pin"} size={18} />
        </button>
      </div>
      <ThreadLog id={thread.id} lines={lines} />
      <ThreadReply draft={draft} setDraft={setDraft} send={send} />
    </div>
  );
}

type Recipient = {
  key: string;
  name: string;
  initials: string;
  /** A department already has a channel. A message to that department alone goes there. */
  threadId?: string;
};

/** A new message. Search, then who it can go to: a conversation that already exists, a department, or a person. A conversation opens. A department or a person is picked, and Create chat starts the conversation once someone is. */
function NewMessage({ threads, openId, onOpen, onStart }: { threads: Thread[]; openId: string | null; onOpen: (id: string) => void; onStart: (to: Recipient[]) => void }) {
  const [query, setQuery] = useState("");
  const [to, setTo] = useState<Recipient[]>([]);
  const toolsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    toolsRef.current?.querySelector("input")?.focus();
  }, []);

  const needle = query.trim().toLowerCase();
  const has = (...words: (string | undefined)[]) => words.some((word) => word?.toLowerCase().includes(needle));
  const conversations = needle ? threads.filter((thread) => !thread.muted && has(thread.title, ...(MEMBERS[thread.id] ?? []).map((member) => member.name))) : [];
  const departments = DEPARTMENTS.filter((thread) => !needle || has(thread.title));
  const people = PEOPLE.filter((person) => !needle || has(person.name, person.role));
  const picked = (key: string) => to.some((item) => item.key === key);
  const toggle = (next: Recipient) => setTo((current) => (current.some((item) => item.key === next.key) ? current.filter((item) => item.key !== next.key) : [...current, next]));
  const coveredBy = (name: string, items: Recipient[]) => items.filter((item) => item.threadId && (MEMBERS[item.threadId] ?? []).some((member) => member.name === name));
  /** A person is picked on their own, or because a department they belong to is picked. */
  const personOn = (name: string) => picked(`person:${name}`) || coveredBy(name, to).length > 0;
  const setPerson = (person: { name: string; initials: string }, on: boolean) => {
    const key = `person:${person.name}`;
    setTo((current) => {
      const covering = coveredBy(person.name, current);
      if (on) {
        if (current.some((item) => item.key === key) || covering.length > 0) return current;
        return [...current, { key, name: person.name, initials: person.initials }];
      }
      /* Leaving one person out of a department drops that department and keeps the rest of its people. */
      let next = current.filter((item) => item.key !== key && !covering.some((dept) => dept.key === item.key));
      const added = new Set(next.map((item) => item.key));
      for (const dept of covering) {
        for (const member of MEMBERS[dept.threadId!] ?? []) {
          if (member.name === person.name || member.name === "Sarah Mou") continue;
          const memberKey = `person:${member.name}`;
          if (added.has(memberKey) || coveredBy(member.name, next).length > 0) continue;
          added.add(memberKey);
          next = [...next, { key: memberKey, name: member.name, initials: member.initials }];
        }
      }
      return next;
    });
  };

  return (
    <div className="notice-sheet thread-sheet">
      <div className="page-toolbar" ref={toolsRef}>
        <SearchBox placeholder="Search people or departments" label="Search people or departments" value={query} onValueChange={setQuery} />
        {to.length > 0 ? (
          <div className="filter-chips">
            {to.map((item) => (
              <Chip key={item.key} filter={{ name: "To", value: item.name }} onClick={() => toggle(item)} />
            ))}
          </div>
        ) : null}
      </div>
      <div className="thread-log">
        {conversations.length > 0 ? (
          <section className="compose-group" aria-label="Conversations">
            <h3 className="sds sheet-label">Conversations</h3>
            <div className="notice-list" role="listbox" aria-label="Conversations">
              {conversations.map((thread) => (
                <ThreadRow key={thread.id} thread={thread} selected={openId === thread.id} onSelect={() => onOpen(thread.id)} />
              ))}
            </div>
          </section>
        ) : null}
        {departments.length > 0 ? (
          <section className="compose-group" aria-label="Departments">
            <h3 className="sds sheet-label">Departments</h3>
            <div className="notice-list">
              {departments.map((thread) => {
                const key = `dept:${thread.id}`;
                return (
                  <Checkbox key={key} size="lg" className="notice-row is-room" checked={picked(key)} onCheckedChange={() => toggle({ key, name: thread.title, initials: thread.initials, threadId: thread.id })}>
                    <span className="sds avatar" data-dept={thread.dept} aria-hidden="true">
                      <Icon name={groupIcon(thread)} size={18} />
                    </span>
                    <span className="notice-copy">
                      <span className="notice-title">{thread.title}</span>
                      <span className="notice-sub">{peopleCount((MEMBERS[thread.id] ?? []).length)}</span>
                    </span>
                  </Checkbox>
                );
              })}
            </div>
          </section>
        ) : null}
        {people.length > 0 ? (
          <section className="compose-group" aria-label="People">
            <h3 className="sds sheet-label">People</h3>
            <div className="notice-list">
              {people.map((person) => {
                const key = `person:${person.name}`;
                return (
                  <Checkbox key={key} size="lg" className="notice-row" checked={personOn(person.name)} onCheckedChange={(on) => setPerson(person, on)}>
                    <Avatar initials={person.initials} />
                    <span className="notice-copy">
                      <span className="notice-title">{person.name}</span>
                      <span className="notice-sub">{person.role}</span>
                    </span>
                  </Checkbox>
                );
              })}
            </div>
          </section>
        ) : null}
        {conversations.length + departments.length + people.length === 0 ? (
          <Empty icon="search" title="No one found">
            Try another name or department.
          </Empty>
        ) : null}
      </div>
      <div className="compose-foot">
        <Button disabled={to.length === 0} onClick={() => onStart(to)}>
          Create chat
        </Button>
      </div>
    </div>
  );
}

type Ticket = {
  id: string;
  title: string;
  status: "open" | "progress" | "complete";
  number: string;
  time: string;
  email: string;
  /** The person who filed the ticket. */
  name: string;
  initials: string;
  /** What the ticket is: something to add, something broken, or a question. */
  kind: "Request" | "Issue" | "Question";
  /** When each step happened, in the order of TICKET_STEPS. A step with no time has not happened yet. */
  steps: string[];
  /** How many lines of the conversation came before the ticket was created. */
  createdAfter: number;
  unread?: boolean;
  /** Filed by the person signed in. */
  mine?: boolean;
};

const TICKET_STEPS = ["Submitted", "Routed to team", "The team is on it", "Resolved"];

const TICKETS: Ticket[] = [
  { id: "2709", title: "Unable to take or view pictures on mobile app", status: "progress", number: "2709", time: "4h", email: "stephanie.samuels@hyatt.com", name: "Stephanie Samuels", initials: "SS", kind: "Issue", steps: ["5:48 AM", "5:48 AM", "6:02 AM"], createdAfter: 3, unread: true, mine: true },
  { id: "2589", title: "Inquiry about creating checklists or recurring to-dos", status: "open", number: "2589", time: "Nov 2", email: "bernadette.kelley@hyatt.com", name: "Bernadette Kelley", initials: "BK", kind: "Question", steps: ["Nov 2", "Nov 2"], createdAfter: 1, unread: true },
  { id: "2500", title: "Maintenance tasks not converting to English on mobile", status: "complete", number: "2500", time: "Oct 31", email: "stephanie.samuels@hyatt.com", name: "Stephanie Samuels", initials: "SS", kind: "Issue", steps: ["Oct 29", "Oct 29", "Oct 30", "Oct 31"], createdAfter: 1, mine: true },
  { id: "1085", title: "Add last completed date to PMs", status: "complete", number: "1085", time: "Oct 22", email: "isaac@lance.live", name: "Isaac", initials: "IS", kind: "Request", steps: ["Oct 19", "Oct 19", "Oct 20", "Oct 22"], createdAfter: 1 },
];

let removedTicketIds: string[] = [];
const NONE_REMOVED_TICKETS: string[] = [];
const ticketWatchers = new Set<() => void>();

function watchTickets(run: () => void) {
  ticketWatchers.add(run);
  return () => {
    ticketWatchers.delete(run);
  };
}

function removeTicket(id: string) {
  if (removedTicketIds.includes(id)) return;
  removedTicketIds = [...removedTicketIds, id];
  ticketWatchers.forEach((run) => run());
}

function useTickets() {
  const removed = useSyncExternalStore(watchTickets, () => removedTicketIds, () => NONE_REMOVED_TICKETS);
  return useMemo(() => TICKETS.filter((ticket) => !removed.includes(ticket.id)), [removed]);
}

function TicketCard({ ticket }: { ticket: Ticket }) {
  return (
    <Ticket
      number={ticket.number}
      title={ticket.title}
      kind={ticket.kind}
      steps={TICKET_STEPS.map((label, index) => ({ label, time: ticket.steps[index] }))}
    />
  );
}

/** A glance at the ticket, pinned under the header: what it is, and where it stands. It floats over the conversation, so the card's own edge is what covers the messages. Dismiss fades it out, then removes it. */
function TicketOverview({ ticket, onDismiss }: { ticket: Ticket; onDismiss: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [leaving, setLeaving] = useState(false);

  useLayoutEffect(() => {
    const card = ref.current;
    const sheet = card?.closest<HTMLElement>(".thread-sheet");
    if (!card || !sheet) return;
    if (leaving) {
      const space = getComputedStyle(sheet).getPropertyValue("--space-16").trim() || "16px";
      sheet.style.setProperty("--ticket-overview-space", space);
      return () => sheet.style.removeProperty("--ticket-overview-space");
    }
    const fit = () => sheet.style.setProperty("--ticket-overview-space", `${card.offsetHeight + 24}px`);
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(card);
    return () => {
      observer.disconnect();
      if (!ref.current) sheet.style.removeProperty("--ticket-overview-space");
    };
  }, [leaving]);

  function dismiss() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      onDismiss();
      return;
    }
    setLeaving(true);
  }

  return (
    <TicketNote
      ref={ref}
      number={ticket.number}
      title={ticket.title}
      status={ticket.status}
      leaving={leaving}
      onDismiss={dismiss}
      onTransitionEnd={(event) => {
        if (event.target === event.currentTarget && event.propertyName === "opacity") onDismiss();
      }}
    />
  );
}

function TicketThread({ ticket, bindActions }: { ticket: Ticket; bindActions: (actions: { resolve: () => void } | null) => void }) {
  const id = `ticket-${ticket.id}`;
  const { lines, draft, setDraft, send } = useChat(id);
  const [mode, setMode] = useState<"resolved" | "reply" | "new">(ticket.status === "complete" ? "resolved" : "reply");
  const [overview, setOverview] = useState(true);
  const [chatKey, setChatKey] = useState(0);

  useEffect(() => {
    if (mode === "new") return;
    if (mode === "resolved") {
      bindActions(null);
      return () => bindActions(null);
    }
    bindActions({ resolve: () => setMode("resolved") });
    return () => bindActions(null);
  }, [mode, bindActions]);

  if (mode === "new") {
    return (
      <NewSupportChat
        key={chatKey}
        bindActions={bindActions}
        onReplace={() => setChatKey((key) => key + 1)}
      />
    );
  }

  return (
    <div className="notice-sheet thread-sheet">
      {overview ? <TicketOverview ticket={ticket} onDismiss={() => setOverview(false)} /> : null}
      <ThreadLog id={id} lines={lines} support record={{ after: ticket.createdAfter, node: <TicketCard ticket={ticket} /> }} />
      {mode === "resolved" ? (
        <Resolved onNew={() => setMode("new")} onReopen={() => setMode("reply")} />
      ) : (
        <ThreadReply draft={draft} setDraft={setDraft} send={send} placeholder="Message Lance Support Team" />
      )}
    </div>
  );
}

type TicketScope = "all" | "mine";

function SupportInbox({ scope, setScope, onOpen, onNew }: { scope: TicketScope; setScope: (scope: TicketScope) => void; onOpen: (id: string) => void; onNew: () => void }) {
  const all = useTickets();
  const mine = all.filter((ticket) => ticket.mine);
  const tickets = scope === "mine" ? mine : all;

  return (
    <div className="notice-sheet thread-sheet">
      <div className="ticket-bar">
        <SegmentedControl
          className="ticket-scope"
          aria-label="Tickets"
          value={scope}
          onValueChange={(value) => setScope(value as TicketScope)}
          options={[
            { value: "all", label: "All tickets", count: all.length },
            { value: "mine", label: "My tickets", count: mine.length },
          ]}
        />
        <Button onClick={onNew}>
          <Icon name="plus-bold" size={14} />
          New ticket
        </Button>
      </div>
      <div className="ticket-log">
        {tickets.map((ticket) => (
          <button type="button" className={["ticket-row", ticket.unread ? "is-unread" : ""].filter(Boolean).join(" ")} key={ticket.id} onClick={() => onOpen(ticket.id)}>
            <Avatar initials={ticket.initials} />
            <span className="ticket-copy">
              <span className="ticket-title">{ticket.title}</span>
              <span className="ticket-meta">
                <Status status={ticket.status} />
                <span>#{ticket.number}</span>
              </span>
              <span className="ticket-mail">{ticket.email}</span>
            </span>
            <span className="notice-end">
              <span className="notice-dot" aria-hidden="true" />
              <time className="notice-time" dateTime={ticket.time}>
                {ticket.time}
              </time>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

/** The open conversation, beside the messages column. The column itself stays as it is. */
export function MessagesBoard({
  openId,
  ticketId,
  deletedId,
  detailsFor,
  onDetails,
  fresh,
  freshKey,
  onReplace,
  onNew,
  bindActions,
}: {
  openId: string | null;
  ticketId: string | null;
  deletedId: string | null;
  detailsFor: string | null;
  onDetails: (id: string | null) => void;
  fresh: boolean;
  freshKey: number;
  onReplace: () => void;
  onNew: () => void;
  bindActions: (actions: { resolve: () => void } | null) => void;
}) {
  const notify = useNotify();
  const threads = useThreads();
  const tickets = useTickets();
  const thread = openId ? threads.find((item) => item.id === openId) ?? null : null;
  const ticket = thread?.support && ticketId ? tickets.find((item) => item.id === ticketId) ?? null : null;
  const deleted = thread?.muted && deletedId ? DELETED.find((item) => item.id === deletedId) ?? null : null;
  const showDetails = Boolean(thread && !thread.support && !thread.muted && isGroupChat(thread) && detailsFor === thread.id);

  return (
    <main className="notes-page sds messages-board">
      {thread?.support && fresh ? (
        <NewSupportChat key={freshKey} bindActions={bindActions} onReplace={onReplace} />
      ) : ticket ? (
        <TicketThread ticket={ticket} bindActions={bindActions} />
      ) : deleted ? (
        <DeletedThread thread={deleted} board />
      ) : showDetails && thread ? (
        <BoardDetails thread={thread} onBack={() => onDetails(null)} onDelete={() => { removeThread(thread.id); notify("Conversation deleted"); }} />
      ) : thread && !thread.support && !thread.muted ? (
        <BoardThread thread={thread} onDelete={() => { removeThread(thread.id); notify("Conversation deleted"); }} onOpenDetails={() => onDetails(thread.id)} />
      ) : (
        <Empty
          icon="bubble"
          title="Select a conversation"
          action={
            <Button onClick={onNew}>
              <Icon name="plus-bold" size={14} />
              New message
            </Button>
          }
        >
          Choose a message from the left, or start a new one.
        </Empty>
      )}
    </main>
  );
}

function DeletedEmpty() {
  return (
    <Empty icon="archive" title="No deleted messages">
      Messages an admin deletes from any conversation are kept here and can be restored.
    </Empty>
  );
}

function DeletedThread({ thread, board = false }: { thread: Thread; board?: boolean }) {
  const { lines, draft, setDraft, send } = useChat(thread.id);
  const [replying, setReplying] = useState(false);
  const subtitle = threadSubtitle(thread);
  const sheet = (
    <div className="notice-sheet thread-sheet">
      <div className="thread-banner">
        <div className="thread-banner-main">
          <ThreadMark thread={thread} />
          <span className="thread-id">
            <span className="thread-title">{thread.title}</span>
            {subtitle ? <span className="thread-sub">{subtitle}</span> : null}
          </span>
        </div>
      </div>
      <ThreadLog id={thread.id} lines={lines} />
      {replying ? (
        <ThreadReply draft={draft} setDraft={setDraft} send={send} placeholder="Message" />
      ) : (
        <Resolved note="This message was deleted." onReopen={() => setReplying(true)} />
      )}
    </div>
  );
  if (!board) return sheet;
  return <section className="messages-pane" aria-label={thread.title}>{sheet}</section>;
}

function DeletedList({ selectedId, onOpen }: { selectedId: string | null; onOpen: (id: string) => void }) {
  return (
    <div className="notice-sheet">
      <div className="notice-list">
        {DELETED.map((thread) => (
          <ThreadRow key={thread.id} thread={thread} selected={selectedId === thread.id} onSelect={() => onOpen(thread.id)} />
        ))}
      </div>
    </div>
  );
}

/** The more menu on an open conversation or ticket. Delete is last, and it asks before it removes anything. */
function MoreMenu({
  label,
  open,
  onOpenChange,
  anchorRef,
  onDelete,
  children,
}: {
  label: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  anchorRef: RefObject<HTMLButtonElement | null>;
  onDelete?: () => void;
  children?: ReactNode;
}) {
  if (!children && !onDelete) return null;
  return (
    <div className="drop">
      <button ref={anchorRef} className="side-icon" type="button" aria-expanded={open} aria-haspopup="menu" aria-label={label} onClick={() => onOpenChange(!open)}>
        <Icon name="dots" size={18} />
      </button>
      <OverlayMenu open={open} anchorRef={anchorRef} align="end" label={label}>
        {children}
        {children && onDelete ? <span className="menu-rule" /> : null}
        {onDelete ? (
          <button className="menu-item danger" type="button" role="menuitem" onClick={onDelete}>
            <Icon name="trash" size={18} />
            Delete
          </button>
        ) : null}
      </OverlayMenu>
    </div>
  );
}

/** The same details as the column, on the page. Back returns to the conversation. */
function BoardDetails({ thread, onBack, onDelete }: { thread: Thread; onBack: () => void; onDelete: () => void }) {
  const [look, setLook] = useState<{ name: string; dept?: Thread["dept"] }>({ name: thread.title, dept: thread.dept });
  const onLook = useCallback((next: { name: string; dept?: Thread["dept"] }) => setLook(next), []);
  const shown = { ...thread, title: look.name, dept: look.dept };

  return (
    <section className="messages-pane" aria-label={look.name}>
      <div className="notice-sheet thread-sheet">
        <div className="thread-banner">
          <button className="page-mark thread-back" type="button" aria-label="Back" onClick={onBack}>
            <Icon name="chevron" size={18} />
          </button>
          <div className="thread-banner-main">
            <ThreadMark thread={shown} />
            <span className="thread-id">
              <span className="thread-title">{look.name}</span>
              {threadSubtitle(thread) ? <span className="thread-sub">{threadSubtitle(thread)}</span> : null}
            </span>
          </div>
          <Button variant="danger-light" onClick={onDelete}>Delete chat</Button>
        </div>
        <ColumnDetails thread={thread} sheet={false} actions={false} onLook={onLook} onDelete={onDelete} />
      </div>
    </section>
  );
}

function BoardThread({ thread, onDelete, onOpenDetails }: { thread: Thread; onDelete: () => void; onOpenDetails: () => void }) {
  const { lines, draft, setDraft, send } = useChat(thread.id);
  const subtitle = threadSubtitle(thread);
  const [menuOpen, setMenuOpen] = useState(false);
  const [asking, setAsking] = useState(false);
  const menuRef = useRef<HTMLButtonElement>(null);
  const identity = (
    <>
      <ThreadMark thread={thread} />
      <span className="thread-id">
        <span className="thread-title">{thread.title}</span>
        {subtitle ? <span className="thread-sub">{subtitle}</span> : null}
      </span>
    </>
  );

  return (
    <section className="messages-pane" aria-label={thread.title}>
      <div className="notice-sheet thread-sheet">
        <div className="thread-banner">
          {isGroupChat(thread) ? (
            <button className="thread-banner-main" type="button" onClick={onOpenDetails}>
              {identity}
            </button>
          ) : (
            <div className="thread-banner-main">{identity}</div>
          )}
          <MoreMenu label="Conversation options" open={menuOpen} onOpenChange={setMenuOpen} anchorRef={menuRef} onDelete={() => { setMenuOpen(false); setAsking(true); }} />
        </div>
        <ThreadLog id={thread.id} lines={lines} />
        <ThreadReply draft={draft} setDraft={setDraft} send={send} placeholder="Message" />
      </div>
      <ConfirmDialog open={asking} name={thread.title} noun="conversation" onCancel={() => setAsking(false)} onConfirm={() => { setAsking(false); onDelete(); }} />
    </section>
  );
}

export function MessagesSide({
  open,
  openId,
  expanded,
  ticketId,
  onTicketId,
  freshChat,
  onFreshChat,
  deletedId,
  onDeletedId,
  detailsFor,
  onDetails,
  conversationActions,
  bindActions,
  onOpen,
  onBack,
  onExpand,
  onCollapse,
}: {
  open: boolean;
  openId: string | null;
  expanded: boolean;
  ticketId: string | null;
  onTicketId: (id: string | null) => void;
  freshChat: boolean;
  onFreshChat: (fresh: boolean) => void;
  deletedId: string | null;
  onDeletedId: (id: string | null) => void;
  detailsFor: string | null;
  onDetails: (id: string | null) => void;
  conversationActions: { resolve: () => void } | null;
  bindActions: (actions: { resolve: () => void } | null) => void;
  onOpen: (id: string) => void;
  onBack: () => void;
  onExpand: () => void;
  onCollapse: () => void;
}) {
  const notify = useNotify();
  const [query, setQuery] = useState("");
  const [source, setSource] = useState<SourceFilter>("All");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const filterRef = useRef<HTMLButtonElement>(null);
  const [pinned, setPinned] = useState(false);
  const [look, setLook] = useState<{ id: string; name: string; dept?: Thread["dept"] } | null>(null);
  const onLook = useCallback((next: { name: string; dept?: Thread["dept"] }) => {
    if (!detailsFor) return;
    setLook({ id: detailsFor, ...next });
  }, [detailsFor]);
  const [ticketScope, setTicketScope] = useState<TicketScope>("all");
  const [freshKey, setFreshKey] = useState(0);
  const [optionsOpen, setOptionsOpen] = useState(false);
  const optionsRef = useRef<HTMLButtonElement>(null);
  const [page, setPage] = useState(0);
  const [starts, setStarts] = useState<number[]>([0]);
  const sheetRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const [composing, setComposing] = useState(false);
  const [pending, setPending] = useState<{ noun: string; name: string; run: () => void } | null>(null);
  const threads = useThreads();
  const tickets = useTickets();
  useEffect(() => {
    if (openId !== "gavin") onFreshChat(false);
  }, [openId, onFreshChat]);

  useEffect(() => {
    if (openId === "deleted" && expanded && !deletedId && DELETED[0]) onDeletedId(DELETED[0].id);
    if (openId !== "deleted" && deletedId) onDeletedId(null);
  }, [openId, expanded, deletedId, onDeletedId]);

  useEffect(() => {
    if (openId && !threads.some((thread) => thread.id === openId)) onBack();
  }, [openId, threads, onBack]);

  useEffect(() => {
    if (ticketId && !tickets.some((ticket) => ticket.id === ticketId)) onTicketId(null);
  }, [ticketId, tickets, onTicketId]);

  const scoped = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return threads.filter((thread) => {
      if (source !== "All" && thread.source !== source) return false;
      if (!needle) return true;
      return [thread.title, thread.note, thread.sub, thread.source, thread.group].filter(Boolean).join(" ").toLowerCase().includes(needle);
    });
  }, [query, source, threads]);

  const visibleKey = scoped.map((thread) => thread.id).join("|");
  const pageCount = Math.max(1, starts.length);
  const pageIndex = Math.min(page, pageCount - 1);
  const pageFrom = starts[pageIndex] ?? 0;
  const pageTo = starts[pageIndex + 1] ?? scoped.length;
  const pageItems = scoped.slice(pageFrom, pageTo);

  const opened = openId ? threads.find((thread) => thread.id === openId) ?? null : null;
  const showColumn = !expanded && openId !== null;
  const columnThread = showColumn ? opened : null;
  const showDetails = Boolean(columnThread && isGroupChat(columnThread) && detailsFor === columnThread.id);
  const openTicket = opened?.support && ticketId ? tickets.find((ticket) => ticket.id === ticketId) ?? null : null;
  const showTicketOverview = expanded && Boolean(opened?.support);
  const showDeleted = Boolean(opened?.muted);
  const deletedMessage = showDeleted && deletedId ? DELETED.find((item) => item.id === deletedId) ?? null : null;
  const showDeletedThread = Boolean(deletedMessage && !expanded);
  /* New message takes the place of the conversation list. Anything opened over the list closes it. */
  const composeOpen = composing && open && !columnThread && !showTicketOverview && !showDeleted;

  useEffect(() => {
    if (composing && !composeOpen) setComposing(false);
  }, [composing, composeOpen]);

  /** One department goes to its channel. People who already share a conversation go to that one. Anyone else starts a new one. */
  function startConversation(to: Recipient[]) {
    if (to.length === 0) return;
    const title = to.map((item) => item.name).join(", ");
    const people = peopleFor(to);
    const channel = to.length === 1 ? to[0].threadId : undefined;
    let id = channel ?? threads.find((thread) => thread.group === "Direct" && thread.title === title)?.id;
    if (!id) {
      id = `new-${Date.now()}`;
      const group = people.length > 1;
      startThread({ id, group: "Direct", title, source: "Direct", time: "", read: true, initials: to[0].initials, groupChat: group || undefined });
      if (group) MEMBERS[id] = people;
    }
    setComposing(false);
    onOpen(id);
  }

  useLayoutEffect(() => {
    if (!open || showColumn || composeOpen) return;
    const scroll = scrollRef.current;
    const measure = measureRef.current;
    const sheet = sheetRef.current;
    if (!scroll || !measure || !sheet) return;

    const apply = () => {
      const rows = [...measure.querySelectorAll<HTMLElement>(".notice-row")];
      const heights = rows.map((row) => row.getBoundingClientRect().height);
      const pager = measure.querySelector<HTMLElement>(".notice-pages");
      const pagerHeight = pager?.getBoundingClientRect().height ?? 0;
      const shownPager = sheet.querySelector<HTMLElement>(":scope > .notice-pages")?.getBoundingClientRect().height ?? 0;
      const full = scroll.clientHeight + shownPager;
      if (full <= 0 || heights.length === 0) {
        setStarts((current) => (current.length === 1 && current[0] === 0 ? current : [0]));
        return;
      }
      const reserved = shownPager || pagerHeight;
      let next = pageStarts(heights, full);
      if (next.length > 1) next = pageStarts(heights, Math.max(0, full - reserved));
      setStarts((current) => (current.length === next.length && current.every((start, index) => start === next[index]) ? current : next));
      setPage((current) => Math.min(current, Math.max(0, next.length - 1)));
    };

    apply();
    const observer = new ResizeObserver(apply);
    observer.observe(scroll);
    observer.observe(sheet);
    return () => observer.disconnect();
  }, [open, visibleKey, showColumn, composeOpen]);

  const groups = useMemo(() => {
    const order: string[] = [];
    const byGroup = new Map<string, Thread[]>();
    for (const thread of pageItems) {
      const list = byGroup.get(thread.group);
      if (list) list.push(thread);
      else {
        order.push(thread.group);
        byGroup.set(thread.group, [thread]);
      }
    }
    return order.map((name) => ({ name, items: byGroup.get(name) ?? [] }));
  }, [pageItems]);

  return (
    <aside className="notifications-side sds" aria-label="Messages" aria-hidden={!open} inert={open ? undefined : true}>
      <header className={["notice-head", showDetails || columnThread?.support || showTicketOverview || showDeleted ? "thread-detail-head" : ""].filter(Boolean).join(" ")}>
        {showDeletedThread && deletedMessage ? (
          <>
            <button className="page-mark thread-back" type="button" aria-label="Back" onClick={() => onDeletedId(null)}>
              <Icon name="chevron" size={18} />
            </button>
            <ThreadMark thread={deletedMessage} />
            <span className="thread-id">
              <span className="thread-title">{deletedMessage.title}</span>
              {threadSubtitle(deletedMessage) ? <span className="thread-sub">{threadSubtitle(deletedMessage)}</span> : null}
            </span>
            <span className="notice-tools">
              <button className="side-icon" type="button" aria-label={expanded ? "Exit full screen" : "Expand"} aria-pressed={expanded} onClick={() => { if (expanded) onCollapse(); else onExpand(); }}>
                <Icon name={expanded ? "minimize" : "fullscreen"} size={18} />
              </button>
            </span>
          </>
        ) : showDeleted && opened ? (
          <>
            <button className="page-mark thread-back" type="button" aria-label="Back" onClick={() => { onDetails(null); onBack(); }}>
              <Icon name="chevron" size={18} />
            </button>
            <ThreadMark thread={opened} />
            <span className="thread-id">
              <span className="thread-title">{opened.title}</span>
              {opened.sub ? <span className="thread-sub">{opened.sub}</span> : null}
            </span>
            <span className="notice-tools">
              <button className="side-icon" type="button" aria-label={expanded ? "Exit full screen" : "Expand"} aria-pressed={expanded} onClick={() => { if (expanded) onCollapse(); else onExpand(); }}>
                <Icon name={expanded ? "minimize" : "fullscreen"} size={18} />
              </button>
            </span>
          </>
        ) : columnThread?.support || (showTicketOverview && opened) ? (
          <>
            {/* Back goes up one level: from a ticket to the tickets, from the tickets to the messages. In full screen the ticket stays on the page, so back returns to the conversation list. */}
            <button className="page-mark thread-back" type="button" aria-label="Back" onClick={() => { if (showTicketOverview) { onFreshChat(false); onTicketId(null); onBack(); return; } if (freshChat) { onFreshChat(false); return; } if (openTicket) { onTicketId(null); return; } onDetails(null); onBack(); }}>
              <Icon name="chevron" size={18} />
            </button>
            <ThreadMark thread={(columnThread ?? opened)!} />
            <span className="thread-id">
              <span className="thread-title">{(columnThread ?? opened)!.title}</span>
              <span className="thread-sub">Here to help</span>
            </span>
            <span className="notice-tools">
              <MoreMenu
                label={openTicket ? "Ticket options" : "Conversation options"}
                open={optionsOpen}
                onOpenChange={setOptionsOpen}
                anchorRef={optionsRef}
                onDelete={openTicket
                  ? () => { setOptionsOpen(false); setPending({ noun: "ticket", name: openTicket.title, run: () => removeTicket(openTicket.id) }); }
                  : undefined}
              >
                {conversationActions && !showTicketOverview ? (
                  <button className="menu-item" type="button" role="menuitem" onClick={() => { conversationActions.resolve(); setOptionsOpen(false); }}>
                    Resolve conversation
                  </button>
                ) : null}
              </MoreMenu>
              <button className="side-icon" type="button" aria-label={expanded ? "Exit full screen" : "Expand"} aria-pressed={expanded} onClick={() => { if (expanded) onCollapse(); else onExpand(); }}>
                <Icon name={expanded ? "minimize" : "fullscreen"} size={18} />
              </button>
            </span>
          </>
        ) : showDetails && columnThread ? (
          <>
            <button className="page-mark thread-back" type="button" aria-label="Back" onClick={() => onDetails(null)}>
              <Icon name="chevron" size={18} />
            </button>
            <ThreadMark thread={look?.id === columnThread.id ? { ...columnThread, title: look.name, dept: look.dept } : columnThread} />
            <span className="thread-id">
              <span className="thread-title">{look?.id === columnThread.id ? look.name : columnThread.title}</span>
              {threadSubtitle(columnThread) ? <span className="thread-sub">{threadSubtitle(columnThread)}</span> : null}
            </span>
            <span className="notice-tools">
              <button className="side-icon" type="button" aria-label="Expand" onClick={onExpand}>
                <Icon name={expanded ? "minimize" : "fullscreen"} size={18} />
              </button>
            </span>
          </>
        ) : (
        <>
        <h2>
          {composeOpen ? (
            <button className="page-mark thread-back" type="button" aria-label="Back" onClick={() => setComposing(false)}>
              <Icon name="chevron" size={18} />
            </button>
          ) : columnThread ? (
            <button className="page-mark thread-back" type="button" aria-label="Back" onClick={() => { onDetails(null); onBack(); }}>
              <Icon name="chevron" size={18} />
            </button>
          ) : (
            <span className="page-mark">
              <Icon name="bubble" size={18} />
            </span>
          )}
          {composeOpen ? "New message" : "Messages"}
        </h2>
        <span className="notice-tools">
          {columnThread ? (
            <MoreMenu
              label="Conversation options"
              open={optionsOpen}
              onOpenChange={setOptionsOpen}
              anchorRef={optionsRef}
              onDelete={() => { setOptionsOpen(false); setPending({ noun: "conversation", name: columnThread.title, run: () => removeThread(columnThread.id) }); }}
            />
          ) : null}
          <button className="side-icon" type="button" aria-label={expanded ? "Exit full screen" : "Expand"} aria-pressed={expanded} onClick={() => { if (expanded) onCollapse(); else onExpand(); }}>
            <Icon name={expanded ? "minimize" : "fullscreen"} size={18} />
          </button>
          {columnThread || composeOpen ? null : (
            <>
              <button className="side-icon" type="button" aria-label="New message" onClick={() => setComposing(true)}>
                <Icon name="edit-square" size={18} />
              </button>
              <button className="side-icon" type="button" aria-label={pinned ? "Unpin" : "Pin"} aria-pressed={pinned} onClick={() => setPinned((next) => !next)}>
                <Icon name={pinned ? "pin-filled" : "pin"} size={18} />
              </button>
            </>
          )}
        </span>
        </>
        )}
      </header>
      {showDetails && columnThread ? (
        <ColumnDetails thread={columnThread} onLook={onLook} onDelete={() => setPending({ noun: "conversation", name: look?.id === columnThread.id ? look.name : columnThread.title, run: () => removeThread(columnThread.id) })} />
      ) : showDeletedThread && deletedMessage ? (
        <DeletedThread thread={deletedMessage} />
      ) : showDeleted ? (
        DELETED.length > 0 ? <DeletedList selectedId={deletedId} onOpen={onDeletedId} /> : (
          <div className="notice-sheet thread-sheet">
            <DeletedEmpty />
          </div>
        )
      ) : showTicketOverview ? (
        <SupportInbox scope={ticketScope} setScope={setTicketScope} onOpen={(id) => { onFreshChat(false); onTicketId(id); }} onNew={() => { onTicketId(null); onFreshChat(true); }} />
      ) : freshChat && columnThread?.support ? (
        <NewSupportChat key={freshKey} bindActions={bindActions} onReplace={() => { setFreshKey((key) => key + 1); }} />
      ) : openTicket ? (
        <TicketThread ticket={openTicket} bindActions={bindActions} />
      ) : columnThread?.support ? (
        <SupportInbox scope={ticketScope} setScope={setTicketScope} onOpen={(id) => { onFreshChat(false); onTicketId(id); }} onNew={() => { onTicketId(null); onFreshChat(true); }} />
      ) : columnThread ? (
        <ColumnThread thread={columnThread} pinned={pinned} onPin={() => setPinned((next) => !next)} onOpenDetails={() => onDetails(columnThread.id)} />
      ) : composeOpen ? (
        <NewMessage threads={threads} openId={openId} onOpen={(id) => { setComposing(false); onOpen(id); }} onStart={startConversation} />
      ) : (
      <div className="notice-sheet" ref={sheetRef}>
        <div className="notice-measure" ref={measureRef} aria-hidden="true" inert>
          <div className="notice-list">
            {scoped.map((thread) => (
              <ThreadRow key={thread.id} thread={thread} />
            ))}
          </div>
          <div className="notice-pages">
            <span className="cal-nav" />
            <span className="notice-page" />
            <span className="cal-nav" />
          </div>
        </div>
        <div className="page-toolbar">
          <SearchBox placeholder="Search messages" label="Search messages" value={query} onValueChange={(value) => { setQuery(value); setPage(0); }} />
          <div className="drop">
            <button ref={filterRef} className="trigger" type="button" aria-expanded={filtersOpen} aria-haspopup="menu" aria-label="Filters" onClick={() => setFiltersOpen((next) => !next)}>
              <span className="pair">
                <Glyph name="filter" />
                <span className="fit-label">Filters</span>
              </span>
              <Glyph name="chevron" />
            </button>
            <OverlayMenu open={filtersOpen} anchorRef={filterRef} align="end" label="Filters">
              {SOURCES.map((option) => (
                <button
                  key={option}
                  className="menu-item"
                  type="button"
                  role="menuitemradio"
                  aria-checked={source === option}
                  onClick={() => { setSource(option); setPage(0); }}
                >
                  {option}
                  <Glyph name="check" className="check" />
                </button>
              ))}
            </OverlayMenu>
          </div>
        </div>
        <div className="notice-scroll" ref={scrollRef}>
          {groups.map((group) => (
            <section key={group.name} aria-label={group.name}>
              <div className="notice-list" role="listbox" aria-label={group.name}>
                {group.items.map((thread) => (
                  <ThreadRow key={thread.id} thread={thread} selected={openId === thread.id} onSelect={() => onOpen(thread.id)} />
                ))}
              </div>
            </section>
          ))}
        </div>
        {pageCount > 1 ? (
          <div className="notice-pages">
            <button
              type="button"
              className="cal-nav"
              data-cal-prev=""
              aria-label="Previous page"
              disabled={pageIndex === 0}
              onClick={() => setPage(pageIndex - 1)}
            >
              <Glyph name="chevron" size={14} />
            </button>
            <div role="tablist" aria-label="Pages">
              {Array.from({ length: pageCount }, (_, index) => (
                <button
                  key={index}
                  type="button"
                  className="notice-page"
                  role="tab"
                  aria-label={`Page ${index + 1}`}
                  aria-selected={index === pageIndex}
                  onClick={() => setPage(index)}
                />
              ))}
            </div>
            <button
              type="button"
              className="cal-nav"
              data-cal-next=""
              aria-label="Next page"
              disabled={pageIndex >= pageCount - 1}
              onClick={() => setPage(pageIndex + 1)}
            >
              <Glyph name="chevron" size={14} />
            </button>
          </div>
        ) : null}
      </div>
      )}
      <ConfirmDialog
        open={pending !== null}
        name={pending?.name ?? ""}
        noun={pending?.noun}
        onCancel={() => setPending(null)}
        onConfirm={() => {
          if (pending) {
            pending.run();
            notify(pending.noun === "ticket" ? "Ticket deleted" : "Conversation deleted");
          }
          setPending(null);
        }}
      />
    </aside>
  );
}
