"use client";

import { Avatar, Empty, Icon, OverlayMenu, Tabs } from "@lance-live/gallery-ui";
import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { SearchBox } from "./chrome";
import { Glyph } from "./glyph";

export type NoticeStatus = "Assigned" | "Unassigned" | "Updated";
type NoticeSource = "To-Dos" | "Boards" | "Sales" | "Internal notes";

const SOURCES = ["All", "To-Dos", "Boards", "Sales", "Internal notes"] as const;
type SourceFilter = (typeof SOURCES)[number];

type Notice = {
  id: string;
  group: string;
  room?: string;
  title: string;
  status: NoticeStatus;
  time: string;
  source: NoticeSource;
  read: boolean;
  who: string;
  initials: string;
  note?: string;
};

const NOTICES: Notice[] = [
  { id: "902", group: "Hotel", room: "902", title: "C/O → RFSH", status: "Assigned", time: "30m", source: "Boards", read: false, who: "Sarah", initials: "SM" },
  { id: "todo-214", group: "Hotel", room: "214", title: "Replace the shower sweep", status: "Unassigned", time: "2h", source: "To-Dos", read: false, who: "Paul", initials: "PG", note: "The sweep is cracked along the bottom." },
  { id: "sales-906", group: "Hotel", room: "906", title: "Late checkout", status: "Assigned", time: "1h", source: "Sales", read: false, who: "Mark", initials: "MJ", note: "Hold the room until 2." },
  { id: "note-vip", group: "Hotel", title: "VIP arrival tonight", status: "Updated", time: "4h", source: "Internal notes", read: false, who: "Boris", initials: "B", note: "Arriving after 8. Keep the room quiet." },
  { id: "1013", group: "Hotel", room: "1013", title: "Removed from board", status: "Updated", time: "6h", source: "Boards", read: false, who: "Sarah", initials: "SM" },
  { id: "904", group: "Hotel", title: "Room 904 added", status: "Unassigned", time: "6h", source: "Boards", read: true, who: "Paul", initials: "PG" },
  { id: "608", group: "Hotel", title: "Room 608 added", status: "Unassigned", time: "6h", source: "Boards", read: true, who: "Mark", initials: "MJ" },
  { id: "805", group: "Hotel", title: "Room 805 added", status: "Unassigned", time: "6h", source: "Boards", read: true, who: "Boris", initials: "B" },
  { id: "812", group: "Hotel", title: "Room 812 added", status: "Unassigned", time: "6h", source: "Boards", read: true, who: "Sarah", initials: "SM" },
  { id: "1013-add", group: "Hotel", title: "Room 1013 added", status: "Unassigned", time: "6h", source: "Boards", read: true, who: "Paul", initials: "PG" },
  { id: "802", group: "Hotel", title: "Room 802 added", status: "Unassigned", time: "6h", source: "Boards", read: true, who: "Mark", initials: "MJ" },
  { id: "401", group: "Hotel", title: "Room 401 added", status: "Unassigned", time: "6h", source: "Boards", read: true, who: "Boris", initials: "B" },
  { id: "1101", group: "Hotel", title: "Room 1101 added", status: "Unassigned", time: "6h", source: "Boards", read: true, who: "Sarah", initials: "SM" },
  { id: "611", group: "Hotel", title: "Room 611 added", status: "Unassigned", time: "6h", source: "Boards", read: true, who: "Paul", initials: "PG" },
  { id: "408", group: "Hotel", title: "Room 408 added", status: "Unassigned", time: "6h", source: "Boards", read: true, who: "Mark", initials: "MJ" },
];

function noticeRoom(notice: Notice) {
  if (notice.room) return notice.room;
  const match = /^Room (\d+)\b/.exec(notice.title);
  return match?.[1];
}

export const NOTICE_COUNT = NOTICES.length;

function NoticeRow({ notice, selected, onSelect }: { notice: Notice; selected?: boolean; onSelect?: () => void }) {
  const room = noticeRoom(notice);
  return (
    <button
      type="button"
      role="option"
      className={[notice.read ? "notice-row" : "notice-row is-unread", room ? "is-room" : ""].filter(Boolean).join(" ")}
      aria-selected={selected}
      onClick={onSelect}
    >
      <Avatar initials={room ?? notice.initials} />
      <span className="notice-copy">
        <span className="notice-sub">{notice.source}</span>
        <span className="notice-title">{notice.title}</span>
        {notice.note ? <span className="notice-note">{notice.note}</span> : null}
      </span>
      <span className="notice-end">
        <span className="notice-dot" aria-hidden="true" />
        <time className="notice-time" dateTime={notice.time}>
          {notice.time}
        </time>
      </span>
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

export function NotificationsSide({ open }: { open: boolean }) {
  const [query, setQuery] = useState("");
  const [source, setSource] = useState<SourceFilter>("All");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const filterRef = useRef<HTMLButtonElement>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [notices, setNotices] = useState(NOTICES);
  const [box, setBox] = useState<"all" | "unread" | "read">("unread");
  const [page, setPage] = useState(0);
  const [starts, setStarts] = useState<number[]>([0]);
  const sheetRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);

  const scoped = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return notices.filter((notice) => {
      if (source !== "All" && notice.source !== source) return false;
      if (!needle) return true;
      return [notice.who, notice.room, notice.title, notice.note, notice.status, notice.source, notice.group].filter(Boolean).join(" ").toLowerCase().includes(needle);
    });
  }, [notices, query, source]);

  const unreadCount = scoped.filter((notice) => !notice.read).length;
  const readCount = scoped.length - unreadCount;
  const visible = scoped.filter((notice) => (box === "all" ? true : box === "read" ? notice.read : !notice.read));
  const visibleKey = visible.map((notice) => notice.id).join("|");
  const pageCount = Math.max(1, starts.length);
  const pageIndex = Math.min(page, pageCount - 1);
  const pageFrom = starts[pageIndex] ?? 0;
  const pageTo = starts[pageIndex + 1] ?? visible.length;
  const pageItems = visible.slice(pageFrom, pageTo);

  useLayoutEffect(() => {
    if (!open) return;
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
  }, [open, visibleKey]);

  const groups = useMemo(() => {
    const order: string[] = [];
    const byGroup = new Map<string, Notice[]>();
    for (const notice of pageItems) {
      const list = byGroup.get(notice.group);
      if (list) list.push(notice);
      else {
        order.push(notice.group);
        byGroup.set(notice.group, [notice]);
      }
    }
    return order.map((name) => ({ name, items: byGroup.get(name) ?? [] }));
  }, [pageItems]);

  return (
    <aside className="notifications-side sds" aria-label="Notifications" aria-hidden={!open} inert={open ? undefined : true}>
      <header className="notice-head">
        <h2>
          <span className="page-mark">
            <Icon name="bell" size={18} />
          </span>
          Notifications
        </h2>
        <button type="button" className="chip" disabled={notices.every((notice) => notice.read)} onClick={() => setNotices((current) => current.map((notice) => ({ ...notice, read: true })))}>
          Mark all as read
        </button>
      </header>
      <div className="page-filters">
        <Tabs
          label="Notifications"
          value={box}
          onValueChange={(value) => {
            setBox(value as "all" | "unread" | "read");
            setPage(0);
          }}
          items={[
            { value: "all", label: "All", count: scoped.length },
            { value: "unread", label: "Unread", count: unreadCount },
            { value: "read", label: "Read", count: readCount },
          ]}
        />
      </div>
      <div className="notice-sheet" ref={sheetRef}>
      <div className="notice-measure" ref={measureRef} aria-hidden="true" inert>
        <div className="notice-list">
          {visible.map((notice) => (
            <NoticeRow key={notice.id} notice={notice} />
          ))}
        </div>
        <div className="notice-pages">
          <span className="cal-nav" />
          <span className="notice-page" />
          <span className="cal-nav" />
        </div>
      </div>
      <div className="page-toolbar">
        <SearchBox placeholder="Search notifications" label="Search notifications" value={query} onValueChange={(value) => { setQuery(value); setPage(0); }} />
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
        {visible.length === 0 ? (
          <Empty icon={query.trim() || source !== "All" ? "search" : "bell"} title={box === "unread" && !query.trim() && source === "All" ? "No unread notifications" : box === "read" && !query.trim() && source === "All" ? "No read notifications" : "No notifications"}>
            {query.trim() || source !== "All" ? "Try another search or filter." : null}
          </Empty>
        ) : groups.map((group) => (
          <section key={group.name} aria-label={group.name}>
            <div className="notice-list" role="listbox" aria-label={group.name}>
              {group.items.map((notice) => (
                <NoticeRow key={notice.id} notice={notice} selected={selected === notice.id} onSelect={() => setSelected(notice.id)} />
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
    </aside>
  );
}
