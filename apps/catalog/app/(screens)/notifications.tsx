"use client";

import { Avatar, OverlayMenu, Tabs } from "@lance-live/gallery-ui";
import { useMemo, useRef, useState } from "react";
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

function noticeVerb(status: NoticeStatus) {
  if (status === "Assigned") return "assigned";
  if (status === "Updated") return "updated";
  return "opened";
}

export const NOTICE_COUNT = NOTICES.length;

export function NotificationsSide({ open }: { open: boolean }) {
  const [query, setQuery] = useState("");
  const [source, setSource] = useState<SourceFilter>("All");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const filterRef = useRef<HTMLButtonElement>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [notices, setNotices] = useState(NOTICES);
  const [box, setBox] = useState<"all" | "unread" | "read">("unread");

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

  const groups = useMemo(() => {
    const order: string[] = [];
    const byGroup = new Map<string, Notice[]>();
    for (const notice of visible) {
      const list = byGroup.get(notice.group);
      if (list) list.push(notice);
      else {
        order.push(notice.group);
        byGroup.set(notice.group, [notice]);
      }
    }
    return order.map((name) => ({ name, items: byGroup.get(name) ?? [] }));
  }, [visible]);

  return (
    <aside className="notifications-side sds" aria-label="Notifications" aria-hidden={!open} inert={open ? undefined : true}>
      <header className="notice-head">
        <h2>Notifications</h2>
        <button type="button" className="chip" disabled={notices.every((notice) => notice.read)} onClick={() => setNotices((current) => current.map((notice) => ({ ...notice, read: true })))}>
          Mark all as read
        </button>
      </header>
      <div className="page-filters">
        <Tabs
          label="Notifications"
          value={box}
          onValueChange={(value) => setBox(value as "all" | "unread" | "read")}
          items={[
            { value: "all", label: "All", count: scoped.length },
            { value: "unread", label: "Unread", count: unreadCount },
            { value: "read", label: "Read", count: readCount },
          ]}
        />
      </div>
      <div className="notice-sheet">
      <div className="page-toolbar">
        <SearchBox placeholder="Search notifications" label="Search notifications" value={query} onValueChange={setQuery} />
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
                onClick={() => setSource(option)}
              >
                {option}
                <Glyph name="check" className="check" />
              </button>
            ))}
          </OverlayMenu>
        </div>
      </div>
      <div className="notice-scroll">
        {groups.map((group) => (
          <section key={group.name} aria-label={group.name}>
            <div className="notice-list" role="listbox" aria-label={group.name}>
              {group.items.map((notice) => (
                <button
                  key={notice.id}
                  type="button"
                  role="option"
                  className={notice.read ? "notice-row" : "notice-row is-unread"}
                  aria-selected={selected === notice.id}
                  onClick={() => setSelected(notice.id)}
                >
                  <Avatar initials={notice.initials} />
                  <span className="notice-copy">
                    <span className="notice-sub">{notice.source}</span>
                    <span className="notice-title">
                      <span className="notice-who">{notice.who}</span> {noticeVerb(notice.status)} {notice.title}
                      {notice.room ? ` in Room ${notice.room}` : ""}
                    </span>
                    {notice.note ? <span className="notice-note">{notice.note}</span> : null}
                  </span>
                  <span className="notice-end">
                    <span className="notice-dot" aria-hidden="true" />
                    <time className="notice-time" dateTime={notice.time}>
                      {notice.time}
                    </time>
                  </span>
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>
      </div>
    </aside>
  );
}
