"use client";

import { Chip, Button, ConfirmDialog, DEPARTMENTS, DepartmentChip, Empty, Icon, OverlayMenu, Tabs, ViewedMenu, captureClose, type Viewer } from "@lance-live/sds";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { putBack, useNotify } from "../action-toast";
import { FilterMenu, ReplyForm, SearchBox } from "../chrome";
import { EditText } from "../edit-text";
import { Glyph } from "../glyph";
import { PageLayout } from "../page-layout";

const PERSON = {
  name: "Sarah Mou",
  dept: "Front Desk",
  src: "/avatar-sarah.png",
};

const TITLE_PLACEHOLDER = "New note";
const BODY_PLACEHOLDER = "Write a note...";

/** The name sits above the photo. The tip is in the top layer, so the list does not clip it. */
function placeAuthorTip(host: HTMLElement) {
  const tip = host.querySelector<HTMLElement>(":scope > .tip");
  if (!tip) return null;
  const gap = Number.parseFloat(getComputedStyle(host).getPropertyValue("--tip-gap")) || 8;
  const box = host.getBoundingClientRect();
  tip.style.left = `${box.left + box.width / 2}px`;
  tip.style.top = `${box.top - gap}px`;
  return tip;
}

type Note = {
  id: string;
  dept: string;
  deptLabel: string;
  time: string;
  title: string;
  preview: string;
  body: string;
  comment: boolean;
  draft?: boolean;
};

const NOTES: Note[] = [
  {
    id: "gss",
    dept: "Front Desk",
    deptLabel: "Front desk",
    time: "Today · 10:38 AM",
    title: "GSS scores",
    preview: "Total/Benchmark",
    body: "Total/Benchmark\n\n# of responses 231/26,447\nIntent to Recommend 57.7/63.3\nElite Appreciation 58.5/64.3\nCleanliness 66.1/77.2\nStaff Service 64.0/74.7\nFood and Bev 52.7/57.9",
    comment: true,
  },
  {
    id: "enroll",
    dept: "Front Desk",
    deptLabel: "Front desk",
    time: "Today · 10:38 AM",
    title: "Eligible enrollments 10/19/26",
    preview: "31 Eligible enrollments",
    body: "31 Eligible enrollments",
    comment: true,
  },
  {
    id: "qviana",
    dept: "Front Desk",
    deptLabel: "Front desk",
    time: "Today · 9:14 AM",
    title: "Qviana called out today 10/19/26",
    preview: "No body yet.",
    body: "No body yet.",
    comment: false,
  },
  {
    id: "elite",
    dept: "Front Desk",
    deptLabel: "Front desk",
    time: "Yesterday · 8:20 AM",
    title: "Elite Arrivals 10/19/26",
    preview: "63 Elite Arrivals Ambassador – 1 Titanium – 11 Platinum – 14",
    body: "63 Elite Arrivals Ambassador – 1 Titanium – 11 Platinum – 14 Gold – 23 Silver – 14",
    comment: false,
  },
];

const DEPTS = ["All", "Front Desk", "Housekeeping", "Maintenance", "Food & Beverage", "Sales", "Management"];

const READERS: Array<Viewer & { seen: string[] }> = [
  { name: "Sarah Mou", src: "/avatar-sarah.png", seen: ["gss", "enroll"] },
  { name: "Jordan Hale", src: "/avatar-sarah.png", seen: ["gss", "enroll"] },
  { name: "Priya Shah", src: "/avatar-sarah.png", seen: [] },
  { name: "Luis Ortega", src: "/avatar-sarah.png", seen: [] },
  { name: "Mina Park", src: "/avatar-sarah.png", seen: [] },
  { name: "Owen Brooks", src: "/avatar-sarah.png", seen: [] },
  { name: "Elena Voss", src: "/avatar-sarah.png", seen: [] },
  { name: "Chris Adeyemi", src: "/avatar-sarah.png", seen: [] },
];

function noteStamp() {
  const time = new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  return `Today · ${time}`;
}

function personDepartment() {
  return DEPARTMENTS.find((item) => item.dept === PERSON.dept) ?? DEPARTMENTS[0];
}

function fitTitle(field: HTMLTextAreaElement | null) {
  if (!field) return;
  field.style.height = "auto";
  field.style.height = `${field.scrollHeight}px`;
}

function revealNewCard(list: Element, id: string, before: Map<string, number>) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const movers = [...list.querySelectorAll<HTMLElement>(":scope > button")];
  for (const row of movers) {
    const top = row.dataset.record ? before.get(row.dataset.record) : undefined;
    const delta = top == null ? -row.getBoundingClientRect().height : top - row.getBoundingClientRect().top;
    row.style.transition = "none";
    row.style.transform = `translateY(${delta}px)`;
  }
  list.getBoundingClientRect();
  requestAnimationFrame(() => {
    for (const row of movers) {
      if (!row.isConnected) continue;
      row.style.transition = "transform 180ms var(--ease-out)";
      row.style.transform = "translateY(0)";
    }
  });
  window.setTimeout(() => {
    for (const row of movers) {
      if (!row.isConnected) continue;
      row.style.transition = "";
      row.style.transform = "";
    }
  }, 220);
  void id;
}

export default function NotesPage() {
  const notify = useNotify();
  const [records, setRecords] = useState(NOTES);
  const [dept, setDept] = useState("All");
  const [query, setQuery] = useState("");
  const [ranges, setRanges] = useState<string[]>(["7d"]);
  const [rooms, setRooms] = useState(["Room 12", "Room 18", "Room 12"]);
  const [selected, setSelected] = useState<string | null>(NOTES[0]?.id ?? null);
  const [menu, setMenu] = useState(false);
  const [menuPoint, setMenuPoint] = useState<{ x: number; y: number } | null>(null);
  const [pending, setPending] = useState<{ id: string; name: string } | null>(null);
  const [deptOpen, setDeptOpen] = useState(false);
  const [deptById, setDeptById] = useState<Record<string, string>>({});
  const menuAnchor = useRef<HTMLButtonElement>(null);
  const deptAnchor = useRef<HTMLButtonElement>(null);
  const titleRef = useRef<HTMLTextAreaElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const pendingFocus = useRef<string | null>(null);
  const [bodyFocused, setBodyFocused] = useState(false);

  const notes = useMemo(
    () =>
      records.map((note) => {
        const filed = deptById[note.id] ?? note.dept;
        const match = DEPARTMENTS.find((item) => item.dept === filed);
        return { ...note, dept: filed, deptLabel: match?.value ?? note.deptLabel };
      }),
    [records, deptById],
  );
  const visible = useMemo(
    () => notes.filter((note) => (dept === "All" || note.dept === dept) && note.title.toLowerCase().includes(query.trim().toLowerCase())),
    [notes, dept, query],
  );
  const open = selected ? (notes.find((note) => note.id === selected) ?? null) : null;
  const commentsLocked = Boolean(open?.draft && !open.title.trim() && !open.body.trim());

  useEffect(() => {
    if (visible.some((note) => note.id === selected)) return;
    setSelected(visible[0]?.id ?? null);
  }, [visible, selected]);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    let current: HTMLElement | null = null;
    const show = (host: HTMLElement) => {
      const tip = placeAuthorTip(host);
      if (!tip) return;
      current = host;
      try {
        if (!tip.matches(":popover-open")) tip.showPopover();
      } catch {
        // The tip can already be opening as the pointer crosses the photo.
      }
    };
    const hide = (host: HTMLElement | null) => {
      const tip = host?.querySelector<HTMLElement>(":scope > .tip");
      try {
        if (tip?.matches(":popover-open")) tip.hidePopover();
      } catch {
        // The tip can already be closed when the pointer leaves.
      }
      if (current === host) current = null;
    };
    const onOver = (event: PointerEvent) => {
      const host = (event.target as Element | null)?.closest<HTMLElement>(".note-author");
      if (!host || !list.contains(host) || host.contains(event.relatedTarget as Node)) return;
      show(host);
    };
    const onOut = (event: PointerEvent) => {
      const host = (event.target as Element | null)?.closest<HTMLElement>(".note-author");
      if (!host || !list.contains(host) || host.contains(event.relatedTarget as Node)) return;
      if (host.matches(":hover")) return;
      hide(host);
    };
    const follow = () => {
      if (current?.matches(":hover")) placeAuthorTip(current);
    };
    list.addEventListener("pointerover", onOver);
    list.addEventListener("pointerout", onOut);
    list.addEventListener("scroll", follow);
    window.addEventListener("resize", follow);
    return () => {
      hide(current);
      list.removeEventListener("pointerover", onOver);
      list.removeEventListener("pointerout", onOut);
      list.removeEventListener("scroll", follow);
      window.removeEventListener("resize", follow);
    };
  }, []);

  useEffect(() => {
    setBodyFocused(false);
  }, [open?.id]);

  useLayoutEffect(() => {
    fitTitle(titleRef.current);
    if (!open || pendingFocus.current !== open.id) return;
    pendingFocus.current = null;
    const field = titleRef.current;
    field?.focus();
    field?.select();
  }, [open]);

  useEffect(() => {
    if (!deptOpen) return;
    const close = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (deptAnchor.current?.contains(target)) return;
      if (target instanceof Element && target.closest(".note-dept-menu")) return;
      setDeptOpen(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [deptOpen]);

  useEffect(() => {
    if (!menu) return;
    const close = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (target.closest(".note-menu, .menu, .confirm-dialog")) return;
      setMenu(false);
      setMenuPoint(null);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [menu]);

  function updateNote(id: string, patch: Partial<Note>) {
    setRecords((current) => current.map((note) => (note.id === id ? { ...note, ...patch } : note)));
  }

  // Home's plus lands here with ?new and starts a note. A frame later, so the list has painted.
  const startedFromHome = useRef(false);
  useEffect(() => {
    if (startedFromHome.current || !new URLSearchParams(window.location.search).has("new")) return;
    startedFromHome.current = true;
    window.history.replaceState(null, "", window.location.pathname);
    requestAnimationFrame(() => createNote());
  }, []);

  function createNote() {
    const list = document.querySelector(".brief-list");
    const before = new Map<string, number>();
    if (list) {
      list.scrollTop = 0;
      for (const row of list.querySelectorAll<HTMLElement>(":scope > button")) {
        if (row.dataset.record) before.set(row.dataset.record, row.getBoundingClientRect().top);
      }
    }
    const filed = personDepartment();
    const id = `new-${Date.now()}`;
    pendingFocus.current = id;
    flushSync(() => {
      setRecords((current) => [
        {
          id,
          dept: filed.dept,
          deptLabel: filed.value,
          time: noteStamp(),
          title: "",
          preview: "",
          body: "",
          comment: false,
          draft: true,
        },
        ...current,
      ]);
      setSelected(id);
      setDept((current) => (current === "All" || current === filed.dept ? current : filed.dept));
      setQuery("");
      setMenu(false);
      setMenuPoint(null);
      setDeptOpen(false);
    });
    if (list) revealNewCard(list, id, before);
    titleRef.current?.focus();
    titleRef.current?.select();
    notify("Note created");
  }

  function removeNote(id: string) {
    const index = records.findIndex((note) => note.id === id);
    const removed = records[index];
    const play = captureClose(document.querySelector(`.brief-list [data-record="${CSS.escape(id)}"]`));
    const remaining = records.filter((note) => note.id !== id);
    flushSync(() => {
      setRecords(remaining);
      setSelected((current) => (current === id ? remaining[0]?.id ?? "" : current));
    });
    play();
    if (removed) notify({ message: "Note deleted", action: "Undo", onAction: () => setRecords((current) => putBack(current, removed, index)) });
  }

  return (
    <PageLayout
      data-view="top"
      icon="doc"
      title="Internal notes"
      count={visible.length}
      actions={
        <>
          <Button variant="secondary">
            <Icon name="print" size={14} />
            Print
          </Button>
          <Button onClick={createNote}>
            <Icon name="plus-bold" size={14} />
            New
          </Button>
        </>
      }
      tabs={
        <Tabs
          label="Departments"
          value={dept}
          onValueChange={setDept}
          items={DEPTS.map((name) => ({
            value: name,
            label: name,
            count: notes.filter((note) => name === "All" || note.dept === name).length,
          }))}
        />
      }
      toolbar={
        <div className="filter-row">
          <div className="filter-tools">
            <SearchBox className="rail-search" placeholder="Search notes" label="Search notes" value={query} onValueChange={setQuery} />
            <div className="filter-actions">
              <FilterMenu value={ranges} onValueChange={setRanges} options={["7d", "24h", "30d"]} />
            </div>
          </div>
          <div className="filter-chips">
            {rooms.map((room, index) => (
              <Chip key={`${room}-${index}`} filter={{ name: "Room", value: room }} onClick={() => setRooms((current) => current.filter((_, item) => item !== index))} />
            ))}
          </div>
        </div>
      }
    >
      <div className="stage brief">
        <div className="scroll-fade list-fade">
          <div className="brief-list" role="listbox" aria-label="Notes" ref={listRef}>
            {visible.map((note) => {
              const untitled = Boolean(note.draft && !note.title.trim());
              const ready = Boolean(note.title.trim() || note.body.trim());
              const preview = note.draft ? note.body.trim().split("\n").find(Boolean) || BODY_PLACEHOLDER : note.preview;
              return (
              <button
                key={note.id}
                type="button"
                role="option"
                data-record={note.id}
                className={[untitled ? "is-untitled" : "", note.draft && ready ? "is-ready" : ""].filter(Boolean).join(" ")}
                aria-selected={open?.id === note.id}
                onClick={() => setSelected(note.id)}
                onContextMenu={(event) => {
                  event.preventDefault();
                  setSelected(note.id);
                  setMenuPoint({ x: event.clientX, y: event.clientY });
                  setMenu(true);
                }}
              >
                <span className={note.draft ? "note-avatar-slot tip-host note-author" : "tip-host note-author"}>
                  <img className={note.draft ? undefined : "note-avatar"} src={PERSON.src} alt="" />
                  <span className="tip" popover="manual">{PERSON.name}</span>
                </span>
                <span className="note-copy">
                  <span className="note-line">
                    <span className="note-time">{note.time}</span>
                    <DepartmentChip className="note-dept" name={note.deptLabel} plain />
                  </span>
                  <span className="brief-title">{note.title.trim() || (note.draft ? TITLE_PLACEHOLDER : note.title)}</span>
                  <span className="brief-preview">{preview}</span>
                </span>
              </button>
              );
            })}
          </div>
        </div>
        <div className="brief-read">
          {open ? (
            <article className="detail">
              <div className="brief-top">
                {open.draft ? (
                  <EditText fill>
                    <textarea
                      ref={titleRef}
                      className="note-title"
                      aria-label="Title"
                      placeholder={TITLE_PLACEHOLDER}
                      rows={1}
                      value={open.title}
                      onChange={(event) => {
                        updateNote(open.id, { title: event.target.value });
                        fitTitle(event.currentTarget);
                      }}
                    />
                  </EditText>
                ) : (
                  <h2>{open.title}</h2>
                )}
                <div className="drop note-menu">
                  <button
                    ref={menuAnchor}
                    className="note-more"
                    type="button"
                    aria-expanded={menu}
                    aria-haspopup="menu"
                    aria-label="More"
                    onClick={() => {
                      setMenuPoint(null);
                      setMenu((next) => !next);
                    }}
                  >
                    <Glyph name="dots" />
                  </button>
                  <OverlayMenu open={menu} anchorRef={menuAnchor} point={menuPoint}>
                    <button className="menu-item" type="button" role="menuitem">
                      <Glyph name="share" />
                      Share
                    </button>
                    <button className="menu-item" type="button" role="menuitem">
                      <Glyph name="link" />
                      Copy link
                    </button>
                    <span className="menu-rule" />
                    <button
                      className="menu-item danger"
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        if (!open) return;
                        setMenu(false);
                        setMenuPoint(null);
                        setPending({ id: open.id, name: open.title.trim() || (open.draft ? TITLE_PLACEHOLDER : open.title) });
                      }}
                    >
                      <Icon name="trash" size={18} />
                      Delete
                    </button>
                  </OverlayMenu>
                </div>
              </div>
              <dl className="note-meta">
                <div>
                  <dt>Timestamp</dt>
                  <dd>{open.time}</dd>
                </div>
                <div>
                  <dt>Department</dt>
                  <dd>
                    <span className="dept-slot">
                      <span className="dept dept-sizer" aria-hidden="true">
                        <span className="meta-fit">
                          {DEPARTMENTS.map((item) => (
                            <span key={item.dept}>{item.value}</span>
                          ))}
                        </span>
                        <Icon name="chevron" size={10} className="meta-chevron" />
                      </span>
                      <DepartmentChip
                        as="button"
                        ref={deptAnchor}
                        className="dept-pick"
                        name={open.deptLabel}
                        type="button"
                        aria-haspopup="menu"
                        aria-expanded={deptOpen}
                        onClick={() => setDeptOpen((next) => !next)}
                      />
                    </span>
                    <OverlayMenu open={deptOpen} anchorRef={deptAnchor} label="Department" className="note-dept-menu">
                      {DEPARTMENTS.map((item) => (
                        <button
                          key={item.dept}
                          className="menu-item"
                          type="button"
                          role="menuitemradio"
                          aria-checked={open.dept === item.dept}
                          onClick={() => {
                            setDeptById((current) => ({ ...current, [open.id]: item.dept }));
                            setDeptOpen(false);
                          }}
                        >
                          <DepartmentChip name={item.value} plain />
                          <Icon name="check" size={14} className="check" />
                        </button>
                      ))}
                    </OverlayMenu>
                  </dd>
                </div>
                <div>
                  <dt>Author</dt>
                  <dd>{PERSON.name}</dd>
                </div>
                <div>
                  <dt>Viewed</dt>
                  <dd>
                    <ViewedMenu
                      viewed={READERS.filter((person) => person.seen.includes(open.id))}
                      notViewed={READERS.filter((person) => !person.seen.includes(open.id))}
                    />
                  </dd>
                </div>
              </dl>
              <div className="brief-main">
                <p className="brief-meta">{open.dept}</p>
                {open.draft ? (
                  <EditText fill>
                    <textarea
                      className="note-draft"
                      aria-label="Note"
                      placeholder={bodyFocused ? "" : BODY_PLACEHOLDER}
                      value={open.body}
                      onFocus={() => setBodyFocused(true)}
                      onBlur={() => setBodyFocused(false)}
                      onChange={(event) => updateNote(open.id, { body: event.target.value })}
                    />
                  </EditText>
                ) : (
                  <p className="brief-body">{open.body}</p>
                )}
                <section className="brief-replies" aria-label="Comments">
                  <h3>Comments</h3>
                  {open.comment ? (
                    <div className="comment">
                      <img className="note-avatar" src={PERSON.src} alt="" />
                      <span className="person-copy">
                        <span className="mini-line">
                          Sarah <span className="meta-k">now</span>
                        </span>
                        <p>okay</p>
                      </span>
                    </div>
                  ) : null}
                  <ReplyForm label="Write a comment" locked={commentsLocked} />
                </section>
              </div>
            </article>
          ) : visible.length === 0 ? (
            <Empty icon="doc" title="No notes" />
          ) : null}
        </div>
      </div>
      <ConfirmDialog
        open={pending != null}
        name={pending?.name ?? ""}
        noun="note"
        onCancel={() => setPending(null)}
        onConfirm={() => {
          const id = pending?.id;
          setPending(null);
          if (id) removeNote(id);
        }}
      />
    </PageLayout>
  );
}
