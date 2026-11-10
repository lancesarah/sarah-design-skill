"use client";

import { Avatar, Button, Icon, OverlayMenu, Person, Status } from "@lance-live/gallery-ui";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useChat, type ChatLine } from "./chat-data";
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
  /** A group chat. The avatar is the people mark, not initials. */
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
  { id: "repairs", group: "Direct", title: "Othman Belkadi, Chris Law, Lupe Valdez", source: "Direct", time: "5d", read: false, initials: "OB", note: "Chris: Repairs" },
  { id: "no-shows", group: "Direct", title: "Sindiso Sibanda, Othman Belkadi, Cy Corbin, …", source: "Direct", time: "6d", read: true, initials: "SS", note: "Diana: Please if we have any group no-show's or group la…" },
  { id: "fred", group: "Direct", title: "Fred Senecal", source: "Direct", time: "Oct 30", read: true, initials: "FS", note: "Fred: Photo" },
  { id: "deleted", group: "Admin", title: "Deleted messages", source: "Admin", time: "", read: true, initials: "DM", sub: "Admin channel", muted: true },
];

export const MESSAGE_COUNT = THREADS.filter((thread) => !thread.read).length;

function ThreadRow({ thread, selected, onSelect }: { thread: Thread; selected?: boolean; onSelect?: () => void }) {
  return (
    <button
      type="button"
      role="option"
      className={["notice-row", thread.read ? "" : "is-unread", thread.support ? "is-support" : "", thread.groupChat ? "is-room" : "", thread.muted ? "is-muted" : ""].filter(Boolean).join(" ")}
      aria-selected={selected}
      onClick={onSelect}
    >
      {thread.photo ? (
        <span className="sds avatar is-photo" aria-hidden="true">
          <img src={thread.photo} alt="" />
          {thread.verified ? (
            <span className="avatar-verified">
              <Icon name="check" size={8} />
            </span>
          ) : null}
        </span>
      ) : thread.muted ? (
        <span className="notice-mark" aria-hidden="true">
          <Icon name="archive" size={18} />
        </span>
      ) : thread.groupChat ? (
        <span className="sds avatar" data-dept={thread.dept} aria-hidden="true">
          <Icon name="users" size={18} />
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
      {thread.support ? (
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

export function messageThread(id: string) {
  return THREADS.find((thread) => thread.id === id) ?? null;
}

function threadSubtitle(thread: Thread) {
  if (thread.sub) return thread.sub;
  if (thread.groupChat && thread.dept) return "Department channel";
  if (thread.groupChat) return "Group chat";
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
};

function ThreadMark({ thread, hero = false }: { thread: Thread; hero?: boolean }) {
  const icon = hero ? 32 : 18;
  if (thread.photo) {
    return (
      <span className="sds avatar thread-mark is-photo" aria-hidden="true">
        <img src={thread.photo} alt="" />
        {thread.verified ? (
          <span className="avatar-verified">
            <Icon name="check" size={8} />
          </span>
        ) : null}
      </span>
    );
  }
  if (thread.muted) {
    return (
      <span className="notice-mark" aria-hidden="true">
        <Icon name="archive" size={icon} />
      </span>
    );
  }
  if (thread.groupChat) {
    return (
      <span className="sds avatar thread-mark is-room" data-dept={thread.dept} aria-hidden="true">
        <Icon name="users" size={icon} />
      </span>
    );
  }
  return <Avatar initials={thread.initials} />;
}

function ColumnDetails({ thread }: { thread: Thread }) {
  const subtitle = threadSubtitle(thread);
  const members = MEMBERS[thread.id] ?? [];
  return (
    <div className="notice-sheet thread-sheet">
      <div className="thread-log">
        <div className="thread-hero">
          <div className="thread-hero-id">
            <ThreadMark thread={thread} hero />
            <span className="thread-hero-copy">
              <span className="thread-hero-title">{thread.title}</span>
              {subtitle ? <span className="thread-sub">{subtitle}</span> : null}
            </span>
          </div>
          <Button variant="secondary">Change Icon</Button>
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
    </div>
  );
}

function ColumnThread({ thread, pinned, onPin, onOpenDetails }: { thread: Thread; pinned: boolean; onPin: () => void; onOpenDetails: () => void }) {
  const { lines, draft, setDraft, send } = useChat(thread.id);
  const logRef = useRef<HTMLDivElement>(null);
  const subtitle = threadSubtitle(thread);

  useEffect(() => {
    const log = logRef.current;
    if (log) log.scrollTop = log.scrollHeight;
  }, [thread.id, lines.length]);

  let day = "";
  const rows: Array<{ kind: "day"; label: string } | { kind: "line"; line: ChatLine }> = [];
  for (const line of lines) {
    if (line.day && line.day !== day) {
      day = line.day;
      rows.push({ kind: "day", label: line.day });
    }
    rows.push({ kind: "line", line });
  }

  return (
    <div className="notice-sheet thread-sheet">
      <div className="thread-banner">
        {thread.groupChat ? (
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
      <div className="thread-log" ref={logRef}>
          <div className="thread-log-body">
            {rows.map((row) =>
              row.kind === "day" ? (
                <div className="thread-day" key={row.label}>{row.label}</div>
              ) : (
                <div className="thread-line" key={row.line.id}>
                  {row.line.photo ? (
                    <img className="avatar" src={row.line.photo} alt="" />
                  ) : (
                    <Avatar initials={row.line.initials} />
                  )}
                  <div className="thread-copy">
                    <div className="thread-bubble">
                      <span className="who">{row.line.name}</span>
                      <p>{row.line.body}</p>
                    </div>
                    <time>{row.line.time}</time>
                  </div>
                </div>
              ),
            )}
          </div>
        </div>
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
            <input
              aria-label="Write a message"
              placeholder="Write a message..."
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
            />
          </span>
          <button className="well" type="submit" aria-label="Send">
            <Icon name="up" size={16} />
          </button>
        </form>
      </div>
  );
}

const TICKETS: { id: string; title: string; status: "open" | "progress" | "complete"; number: string; time: string; email: string; unread?: boolean }[] = [
  { id: "2709", title: "Unable to take or view pictures on mobile app", status: "progress", number: "2709", time: "4h", email: "stephanie.samuels@hyatt.com", unread: true },
  { id: "2589", title: "Inquiry about creating checklists or recurring to-dos", status: "open", number: "2589", time: "Nov 2", email: "bernadette.kelley@hyatt.com", unread: true },
  { id: "2500", title: "Maintenance tasks not converting to English on mobile", status: "complete", number: "2500", time: "Oct 31", email: "stephanie.samuels@hyatt.com" },
  { id: "1085", title: "Add last completed date to PMs", status: "complete", number: "1085", time: "Oct 22", email: "isaac@lance.live" },
];

function SupportInbox() {
  return (
    <div className="notice-sheet thread-sheet">
      <div className="ticket-bar">
        <button className="ticket-new" type="button">
          <Icon name="plus" size={14} />
          New
        </button>
      </div>
      <div className="ticket-log">
        <h3 className="sds sheet-label">
          All tickets <span>{TICKETS.length}</span>
        </h3>
        {TICKETS.map((ticket) => (
          <div className="ticket-row" key={ticket.id}>
            <span className="sds avatar ticket-who" aria-hidden="true">
              <Icon name="user" size={18} />
            </span>
            <span className="ticket-copy">
              <span className="ticket-title">
                {ticket.unread ? <span className="ticket-dot" aria-hidden="true" /> : null}
                <span>{ticket.title}</span>
              </span>
              <span className="ticket-meta">
                <Status status={ticket.status} />
                <span>#{ticket.number}</span>
                <span>{ticket.time}</span>
              </span>
              <span className="ticket-mail">{ticket.email}</span>
            </span>
            <span className="ticket-go" aria-hidden="true">
              <Icon name="chevron" size={16} />
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function MessagesSide({
  open,
  openId,
  expanded,
  onOpen,
  onBack,
  onExpand,
  onCollapse,
}: {
  open: boolean;
  openId: string | null;
  expanded: boolean;
  onOpen: (id: string) => void;
  onBack: () => void;
  onExpand: () => void;
  onCollapse: () => void;
}) {
  const [query, setQuery] = useState("");
  const [source, setSource] = useState<SourceFilter>("All");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const filterRef = useRef<HTMLButtonElement>(null);
  const [pinned, setPinned] = useState(false);
  const [detailsFor, setDetailsFor] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [starts, setStarts] = useState<number[]>([0]);
  const sheetRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);

  const scoped = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return THREADS.filter((thread) => {
      if (source !== "All" && thread.source !== source) return false;
      if (!needle) return true;
      return [thread.title, thread.note, thread.sub, thread.source, thread.group].filter(Boolean).join(" ").toLowerCase().includes(needle);
    });
  }, [query, source]);

  const visibleKey = scoped.map((thread) => thread.id).join("|");
  const pageCount = Math.max(1, starts.length);
  const pageIndex = Math.min(page, pageCount - 1);
  const pageFrom = starts[pageIndex] ?? 0;
  const pageTo = starts[pageIndex + 1] ?? scoped.length;
  const pageItems = scoped.slice(pageFrom, pageTo);

  const showColumn = !expanded && openId !== null;
  const columnThread = showColumn && openId ? messageThread(openId) : null;
  const showDetails = Boolean(columnThread?.groupChat && detailsFor === columnThread.id);

  useLayoutEffect(() => {
    if (!open || showColumn) return;
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
  }, [open, visibleKey, showColumn]);

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
      <header className={["notice-head", showDetails || columnThread?.support ? "thread-detail-head" : ""].filter(Boolean).join(" ")}>
        {columnThread?.support ? (
          <>
            <button className="page-mark thread-back" type="button" aria-label="Back" onClick={() => { setDetailsFor(null); onBack(); }}>
              <Icon name="chevron" size={18} />
            </button>
            <ThreadMark thread={columnThread} />
            <span className="thread-id">
              <span className="thread-title">{columnThread.title}</span>
              <span className="thread-sub">Here to help</span>
            </span>
            <span className="notice-tools">
              <button className="side-icon" type="button" aria-label="Expand">
                <Icon name="fullscreen" size={18} />
              </button>
            </span>
          </>
        ) : showDetails && columnThread ? (
          <>
            <button className="page-mark thread-back" type="button" aria-label="Back" onClick={() => setDetailsFor(null)}>
              <Icon name="chevron" size={18} />
            </button>
            <ThreadMark thread={columnThread} />
            <span className="thread-id">
              <span className="thread-title">{columnThread.title}</span>
              {threadSubtitle(columnThread) ? <span className="thread-sub">{threadSubtitle(columnThread)}</span> : null}
            </span>
            <span className="notice-tools">
              <button className="side-icon" type="button" aria-label="Expand" onClick={onExpand}>
                <Icon name="fullscreen" size={18} />
              </button>
            </span>
          </>
        ) : (
        <>
        <h2>
          {columnThread ? (
            <button className="page-mark thread-back" type="button" aria-label="Back" onClick={() => { setDetailsFor(null); onBack(); }}>
              <Icon name="chevron" size={18} />
            </button>
          ) : (
            <span className="page-mark">
              <Icon name="bubble" size={18} />
            </span>
          )}
          Messages
        </h2>
        <span className="notice-tools">
          <button className="side-icon" type="button" aria-label={expanded ? "Exit full screen" : "Expand"} aria-pressed={expanded} onClick={() => { if (!openId) return; if (expanded) onCollapse(); else onExpand(); }}>
            <Icon name="fullscreen" size={18} />
          </button>
          {columnThread ? null : (
            <>
              <button className="side-icon" type="button" aria-label="Edit">
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
        <ColumnDetails thread={columnThread} />
      ) : columnThread?.support ? (
        <SupportInbox />
      ) : columnThread ? (
        <ColumnThread thread={columnThread} pinned={pinned} onPin={() => setPinned((next) => !next)} onOpenDetails={() => setDetailsFor(columnThread.id)} />
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
                  <ThreadRow key={thread.id} thread={thread} selected={!thread.support && openId === thread.id} onSelect={() => onOpen(thread.id)} />
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
    </aside>
  );
}
