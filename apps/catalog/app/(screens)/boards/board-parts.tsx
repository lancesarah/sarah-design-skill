"use client";

import { Avatar, Checkbox, Icon, IconButton, WidgetNote, WidgetSummary, TooltipTarget } from "@lance-live/sds";
import { useEffect, useId, useRef, useState, type CSSProperties, type DragEvent, type MouseEvent, type ReactNode } from "react";
import { useGrowClip } from "../inset-card";
import { formatDuration, formatPrefer, formatTimer, isDone, serviceLabel, serviceShort, typeLabel, type Role, type Room, type Staff } from "./data";

export type MenuPoint = { x: number; y: number } | null;

/** One menu open at a time for a page full of rows: it remembers what it is for and the control it opened from. */
export function useAnchoredMenu<T>({ closeOnEscape = true } = {}) {
  const [target, setTarget] = useState<T | null>(null);
  const [point, setPoint] = useState<MenuPoint>(null);
  const anchorRef = useRef<HTMLElement | null>(null);
  const marker = useId().replace(/:/g, "");

  useEffect(() => {
    if (target === null) return;
    const close = (event: PointerEvent) => {
      const node = event.target;
      if (!(node instanceof Element)) return;
      if (anchorRef.current?.contains(node) || node.closest(`[data-menu="${marker}"]`)) return;
      setTarget(null);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setTarget(null);
      anchorRef.current?.focus();
    };
    document.addEventListener("pointerdown", close);
    if (closeOnEscape) document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", escape);
    };
  }, [target, marker, closeOnEscape]);

  return {
    target,
    point,
    anchorRef,
    marker,
    open(next: T, anchor: HTMLElement, at: MenuPoint = null) {
      anchorRef.current = anchor;
      setPoint(at);
      setTarget((current) => (current === next && !at ? null : next));
    },
    close() {
      setTarget(null);
    },
  };
}

function stateWords(room: Room, role: Role) {
  if (room.dnd) return "Do not disturb";
  if (role === "inspector") return room.state === "inspected" ? "Inspected" : room.state === "clean" ? "Ready to inspect" : "Not clean yet";
  return room.state === "dirty" ? "Not started" : room.state === "cleaning" ? "Cleaning" : "Clean";
}

/** The one fact on the right: the running clock, the time it took, or when a checkout is due out. */
function RoomFact({ room }: { room: Room }) {
  if (room.state === "cleaning" && room.timer !== undefined) return <span className="board-room-timer">{formatTimer(room.timer)}</span>;
  if (room.minutes !== undefined && room.state !== "dirty") return <span>{formatDuration(room.minutes)}</span>;
  if (room.dueOut)
    return (
      <Tipped label={`Checkout at ${room.dueOut}`} className="board-room-due">
        {room.dueOut.replace(" ", "")}
      </Tipped>
    );
  return null;
}

let blankImage: HTMLImageElement | null = null;

/** The browser's drag image is see-through. Hide it, and carry a solid copy of the row under the pointer instead. */
function liftRoom(event: DragEvent<HTMLDivElement>) {
  const row = event.currentTarget;
  const box = row.getBoundingClientRect();
  const dx = event.clientX - box.left;
  const dy = event.clientY - box.top;
  const ghost = row.cloneNode(true) as HTMLElement;
  ghost.classList.remove("is-dragging");
  ghost.classList.add("board-drag-ghost");
  ghost.removeAttribute("aria-label");
  ghost.setAttribute("aria-hidden", "true");
  ghost.style.width = `${box.width}px`;
  const place = (x: number, y: number) => {
    ghost.style.transform = `translate(${Math.round(x - dx)}px, ${Math.round(y - dy)}px)`;
  };
  place(event.clientX, event.clientY);
  document.body.appendChild(ghost);
  if (blankImage?.complete) event.dataTransfer.setDragImage(blankImage, 0, 0);

  const follow = (next: globalThis.DragEvent) => {
    if (next.clientX || next.clientY) place(next.clientX, next.clientY);
  };
  const drop = () => {
    ghost.remove();
    document.removeEventListener("dragover", follow);
    document.removeEventListener("drop", drop);
    document.removeEventListener("dragend", drop);
  };
  document.addEventListener("dragover", follow);
  document.addEventListener("drop", drop);
  document.addEventListener("dragend", drop);
}

export function RoomRow({
  room,
  readOnly = false,
  role,
  selected,
  dragging,
  editing,
  serviceOpen,
  onSelect,
  onDragStart,
  onDragEnd,
  onServiceClick,
  onToggleDnd,
  onToggleOccupied,
  onNumberDone,
  onOpenActivity,
  onContextMenu,
  motion,
  order = 0,
}: {
  room: Room;
  /** Profile list: retain board facts and room navigation without board editing. */
  readOnly?: boolean;
  role: Role;
  selected?: boolean;
  /** Auto-assign: the room dims where it leaves, then fades in where it lands. */
  motion?: "leaving" | "arriving";
  order?: number;
  onSelect?: (selected: boolean, range: boolean) => void;
  dragging?: boolean;
  editing?: boolean;
  serviceOpen?: boolean;
  onDragStart?: (event: DragEvent<HTMLDivElement>) => void;
  onDragEnd?: () => void;
  onServiceClick?: (anchor: HTMLElement) => void;
  onToggleDnd?: () => void;
  onToggleOccupied?: () => void;
  onNumberDone?: (value: string) => void;
  onOpenActivity: () => void;
  onContextMenu?: (event: MouseEvent<HTMLDivElement>) => void;
}) {
  const done = isDone(room, role);
  useEffect(() => {
    if (blankImage) return;
    blankImage = new Image();
    blankImage.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
  }, []);
  return (
    <li>
      <div
        className={["board-room", done ? "is-done" : "", room.dnd ? "is-dnd" : "", selected ? "is-selected" : "", dragging ? "is-dragging" : "", motion ? `is-${motion}` : "", motion === "arriving" ? "t-skel-content is-revealed" : ""].filter(Boolean).join(" ")}
        data-readonly={readOnly || undefined}
        style={motion ? ({ "--sk-i": order } as CSSProperties) : undefined}
        draggable={!readOnly && !editing && !motion}
        onClick={(event) => {
          if ((event.target as Element).closest("button, input")) return;
          if (!readOnly) onSelect?.(!selected, event.shiftKey);
        }}
        onDragStart={(event) => {
          if ((event.target as Element).closest("button")) {
            event.preventDefault();
            return;
          }
          onDragStart?.(event);
          liftRoom(event);
        }}
        onDragEnd={onDragEnd}
        onContextMenu={onContextMenu}
        aria-label={`Room ${room.number || "new"}, ${typeLabel(room.type)}, ${serviceLabel(room.service)}, ${room.occupied ? "occupied" : "vacant"}, ${stateWords(room, role)}${room.dueOut ? `, checkout at ${room.dueOut}` : ""}`}
      >
        <span className="board-room-lead">
          {readOnly ? null : <Checkbox
            checked={selected}
            aria-label={`Select room ${room.number || "new"}`}
            onClick={(event) => {
              event.preventDefault();
              if (!readOnly) onSelect?.(!selected, event.shiftKey);
            }}
          />}
        </span>
        {editing ? (
          <input
            className="board-room-number board-room-input"
            autoFocus
            inputMode="numeric"
            placeholder="Room"
            aria-label="Room number"
            defaultValue={room.number}
            onBlur={(event) => onNumberDone?.(event.currentTarget.value.trim())}
            onKeyDown={(event) => {
              if (event.key === "Enter") event.currentTarget.blur();
            }}
          />
        ) : (
          <button type="button" className="board-room-number board-room-link" aria-label={`View activity for room ${room.number}`} onClick={onOpenActivity}>
            {room.number}
          </button>
        )}
        <span className="board-room-type">{typeLabel(room.type)}</span>
        <span className="board-room-service">
          <button
            type="button"
            className="board-chip"
            aria-haspopup="menu"
            aria-expanded={serviceOpen}
            aria-label={`Service, ${serviceLabel(room.service)}`}
            disabled={readOnly || role === "inspector"}
            onClick={(event) => onServiceClick?.(event.currentTarget)}
          >
            {serviceShort(room.service)}
            {role === "inspector" ? null : <Icon name="chevron" size={10} />}
          </button>
        </span>
        <span className="board-room-trail">
          {room.pet || !!room.minibarTaken?.length ? (
            <span className="board-room-indicators">
              {room.pet && (
                <Tipped label="Guest has a pet" focusable>
                  <Icon name="paw" size={12} />
                </Tipped>
              )}
              {!!room.minibarTaken?.length && (
                <Tipped label={`Minibar taken: ${room.minibarTaken.map(({ name, quantity }) => `${quantity} ${name}`).join(", ")}`} focusable>
                  <Icon name="minibar" size={12} />
                </Tipped>
              )}
            </span>
          ) : null}
          <RoomFact room={room} />
        </span>
        <span className="board-room-flags">
          {room.notes ? (
            <span className="board-room-note" title={room.notes} aria-label={`Note: ${room.notes}`}>
              <Icon name="bubble" size={12} />
            </span>
          ) : (
            <span className="board-room-note" aria-hidden="true" />
          )}
          <button
            type="button"
            className="board-flag board-room-moon"
            aria-pressed={room.dnd}
            aria-label={room.dnd ? "Clear do not disturb" : "Set do not disturb"}
            disabled={readOnly}
            onClick={onToggleDnd}
          >
            {room.dnd ? (
              <svg className="i" width="12" height="12" viewBox="0 0 14 14" aria-hidden="true">
                <path fill="currentColor" stroke="currentColor" strokeLinejoin="round" style={{ strokeWidth: "var(--icon-stroke)" }} d="M12 6.87A5 5 0 1 1 7.13 2A3.5 3.5 0 0 0 12 6.87Z" />
              </svg>
            ) : (
              <Icon name="moon" size={12} />
            )}
          </button>
          <button
            type="button"
            className="board-stay"
            aria-pressed={room.occupied}
            aria-label={room.occupied ? "Occupied, mark vacant" : "Vacant, mark occupied"}
            disabled={readOnly}
            onClick={onToggleOccupied}
          >
            {room.occupied ? "O" : "V"}
          </button>
        </span>
      </div>
    </li>
  );
}

/** The rooms auto-assign is about to place, one bar per row. */
export function RoomSkeletons({ count }: { count: number }) {
  return (
    <>
      {Array.from({ length: count }, (_, index) => (
        <li key={index} aria-hidden="true">
          <div className="board-room board-room-skeleton t-skel" style={{ "--sk-i": index } as CSSProperties}>
            <span className="board-sk" />
          </div>
        </li>
      ))}
    </>
  );
}

/** A board, a side list, or the DND list. The card takes a drop; the head says whose it is. */
export function BoardCard({
  selection,
  lead,
  title,
  count,
  note,
  action,
  headerAction,
  summary,
  foot,
  open,
  onOpenChange,
  dropping,
  onDragOver,
  onDragLeave,
  onDrop,
  className,
  children,
}: {
  selection?: ReactNode;
  lead?: ReactNode;
  title: ReactNode;
  count?: number;
  note?: ReactNode;
  action?: ReactNode;
  headerAction?: ReactNode;
  /** Stays when the card folds, so a shut board still says how far along it is. */
  summary?: ReactNode;
  /** A small line under the rooms. It stays when the card folds. */
  foot?: ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dropping: boolean;
  onDragOver: (event: DragEvent<HTMLElement>) => void;
  onDragLeave: (event: DragEvent<HTMLElement>) => void;
  onDrop: (event: DragEvent<HTMLElement>) => void;
  className?: string;
  children?: ReactNode;
}) {
  const id = useId();
  const clip = useGrowClip(open);
  return (
    <section
      className={["sds", "widget", "board-card", open ? "is-open" : "", dropping ? "is-drop" : "", className].filter(Boolean).join(" ")}
      aria-labelledby={id}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <div className="widget-head">
        {selection}
        <h2 id={id}>
          {lead}
          <span className="board-card-title">{title}</span>
          {count === undefined ? null : <span className="widget-count">{count}</span>}
        </h2>
        <span className="board-card-tools">
          {note ? <WidgetNote>{note}</WidgetNote> : null}
          {action}
          <IconButton
            icon="chevron"
            size={16}
            className="board-card-chevron"
            aria-expanded={open}
            aria-controls={`${id}-body`}
            aria-label={open ? "Collapse" : "Expand"}
            onClick={() => onOpenChange(!open)}
          />
        </span>
      </div>
      {headerAction ? <div className="board-card-header-action">{headerAction}</div> : null}
      {summary}
      <div className="board-card-clip" ref={clip} inert={open ? undefined : true}>
        <div id={`${id}-body`}>{children}</div>
      </div>
      {foot}
    </section>
  );
}

export function CardMore({ label, open, onOpen }: { label: string; open: boolean; onOpen: (anchor: HTMLElement) => void }) {
  return (
    <IconButton
      icon="dots"
      size={16}
      aria-label={label}
      aria-haspopup="menu"
      aria-expanded={open}
      className="board-card-more"
      onClick={(event) => onOpen(event.currentTarget)}
    />
  );
}

/** Done out of the rooms that can be worked. A DND room is set aside, not behind. */
function boardProgress(rooms: Room[], role: Role, name: string) {
  const open = rooms.filter((room) => !room.dnd);
  const done = open.filter((room) => isDone(room, role)).length;
  const noun = role === "inspector" ? "inspected" : "clean";
  return { done, total: open.length, label: `${name}: ${done} of ${open.length} ${noun}` };
}

function percentOf(done: number, total: number) {
  return total ? Math.round((done / total) * 100) : 0;
}

/** One fill: how much of the board is done. */
function BoardBar({ done, total, label }: { done: number; total: number; label: string }) {
  return (
    <div className="board-bar" role="img" aria-label={label}>
      <span style={{ width: `${percentOf(done, total)}%` }} />
    </div>
  );
}

/** How far along one board is: what is left and how long it should take, the done count, then the bar. */
export function BoardSummary({ rooms, role, name }: { rooms: Room[]; role: Role; name: string }) {
  const progress = boardProgress(rooms, role, name);
  const left = rooms.filter((room) => !room.dnd && !isDone(room, role)).length;
  const lead =
    role === "inspector"
      ? `${rooms.filter((room) => !room.dnd && room.state === "clean").length} to inspect`
      : left
        ? `${left} ${left === 1 ? "room" : "rooms"} left`
        : "Every room is clean";
  return (
    <WidgetSummary className="board-summary">
      <p className="board-summary-line">
        <span>{lead}</span>
        <span className="board-percent">{percentOf(progress.done, progress.total)}%</span>
      </p>
      <BoardBar {...progress} />
    </WidgetSummary>
  );
}

const SPLIT_ORDER: Room["service"][] = ["checkout", "refresh", "full", "deep", "well"];

/** The board's mix of work, smallest type: `3 C/O · 2 RFSH · 3 FULL`, with the rooms they prefer at the end. */
export function ServiceSplit({ rooms, prefer }: { rooms: Room[]; prefer?: [number, number] }) {
  const parts = SPLIT_ORDER.map((service) => ({ service, count: rooms.filter((room) => room.service === service).length })).filter((part) => part.count);
  if (!parts.length && !prefer) return null;
  return (
    <p className="board-split">
      <span className="board-split-mix">
        {parts.map((part, index) => (
          <span key={part.service}>
            {index ? " · " : null}
            <b>{part.count}</b> {serviceShort(part.service)}
          </span>
        ))}
      </span>
      {prefer ? (
        <span className="board-pref" title="Rooms they prefer">
          {formatPrefer(prefer)}
        </span>
      ) : null}
    </p>
  );
}

/** A short mark whose meaning is in the gallery tip, centered above it on hover or focus. */
export function Tipped({ label, className, focusable, below = false, children }: { label: string; className?: string; focusable?: boolean; below?: boolean; children: ReactNode }) {
  return <TooltipTarget label={label} className={["board-tipped", className].filter(Boolean).join(" ")} focusable={focusable} placement={below ? "below" : "above"}>
    {children}
  </TooltipTarget>;
}

/** A fact about the person as an icon in the head; the tip names it. */
export function HeadFact({ icon, label }: { icon: "eye"; label: string }) {
  return (
    <Tipped label={label} className="board-fact" focusable>
      <Icon name={icon} size={14} />
    </Tipped>
  );
}

export function StaffLead({ staff }: { staff: Staff }) {
  return <Avatar initials={staff.initials} size="mini" className="board-card-avatar" />;
}

/** The empty for a list or a board that holds no rooms. The board's own one-line empty, like a table's. */
export function RoomsEmpty({ children }: { children: ReactNode }) {
  return <p className="board-empty">{children}</p>;
}
