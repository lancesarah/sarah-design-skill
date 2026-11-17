"use client";

import { InfoTooltip, Avatar, Button, DetailPanel, FactRow, Icon, Person, SegmentedControl, SideRoom, Widget, WidgetList, type IconName } from "@lance-live/sds";
import { useContext, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { OpenDirectMessageContext } from "../shell-panels";
import { InspectionDetails } from "./inspection-details";
import { Tipped } from "./board-parts";
import { formatDuration, OTHER_BOARD_STAFF, type Room, type RoomActivity, type Service, type Staff } from "./data";

export const serviceNames: Record<Service, string> = {
  checkout: "Checkout Clean",
  refresh: "Refresh",
  full: "Full Clean",
  deep: "Deep Clean",
  well: "Well",
};

const serviceIcons: Record<Service, IconName> = {
  checkout: "clean-checkout",
  refresh: "clean-refresh",
  full: "clean-full",
  deep: "clean-deep",
  well: "clean-well",
};

const activityDate = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" });
const activityTime = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" });
const boardDateFormat = new Intl.DateTimeFormat("en-US", { dateStyle: "medium" });

const HOUR_MS = 60 * 60 * 1000;
const ACTIVITY_PERIODS = [{ value: "24", label: "24h" }, { value: "48", label: "48h" }];

export function RecentBoardActivity({ rooms, staff, now, previewStartedAt }: { rooms: Room[]; staff: Staff[]; now: number; previewStartedAt?: number }) {
  const [hours, setHours] = useState("24");
  const panelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    panelRef.current?.querySelector<HTMLButtonElement>('[role="tab"][aria-selected="true"]')?.focus({ preventScroll: true });
  }, []);

  const start = now - Number(hours) * HOUR_MS;
  const names = new Map([...OTHER_BOARD_STAFF, ...staff].map(person => [person.id, person.name]));
  const entries = rooms.flatMap((room, index) => {
    // Give the preview's undated seed records stable times for this session.
    const sampleAt = previewStartedAt === undefined ? undefined : previewStartedAt - (index % 4 === 0 ? 30 : 2) * HOUR_MS - index * 60000;
    const activity = (room.activity ?? []).flatMap((event, eventIndex) => {
      const at = event.at ?? (sampleAt === undefined ? undefined : sampleAt - eventIndex * 60000);
      if (at === undefined) return [];
      const label = {
        clean: `${serviceNames[event.service]} completed`,
        inspected: "Room inspected",
        dnd: "Marked Do not disturb",
        incomplete: "Marked not clean",
      }[event.kind];
      const name = event.cleaner ?? names.get(event.staffId);
      return [{ id: `${room.id}-${eventIndex}`, room: room.number, at, label: name ? `${label} · ${name}` : label }];
    });
    if (sampleAt !== undefined && room.strip) {
      const assignee = names.get(room.strip.assignee);
      if (assignee) activity.push({ id: `${room.id}-strip-assigned`, room: room.number, at: sampleAt - HOUR_MS, label: `Houseperson assigned · ${assignee}` });
      if (room.strip.completed) activity.push({ id: `${room.id}-strip-completed`, room: room.number, at: sampleAt, label: "Houseperson marked strip complete" });
    }
    return activity;
  }).filter(entry => entry.at >= start && entry.at <= now).sort((a, b) => b.at - a.at);

  return <div ref={panelRef}>
    <Widget title="Recent activity" action={<SegmentedControl aria-label="Activity period" value={hours} options={ACTIVITY_PERIODS} onValueChange={setHours} />}>
      <div className="board-recent-activity-scroll">
        {entries.length ? <WidgetList>
          {entries.map(entry => <li className="board-recent-activity-row" key={entry.id}>
            <span>{entry.room}</span>
            <span>{entry.label}</span>
            <time dateTime={new Date(entry.at).toISOString()} title={`${activityDate.format(entry.at)}, ${activityTime.format(entry.at)}`}>
              {new Date(entry.at).toDateString() === new Date(now).toDateString() ? activityTime.format(entry.at) : `${activityDate.format(entry.at)}, ${activityTime.format(entry.at)}`}
            </time>
          </li>)}
        </WidgetList> : <p className="board-recent-activity-empty" role="status">No room activity in the last {hours} hours.</p>}
      </div>
    </Widget>
  </div>;
}

function initials(name: string) {
  return name.split(" ").slice(0, 2).map((part) => part[0]).join("");
}

export function RoomActivityPanel({ room, staff, dateOffset, inspector, onInspectionSave, onEdit, onNotesChange, onClose, onPerson, onMore, moreOpen, hidden = false, onExited }: { inspector?: boolean; onInspectionSave?: (checks: string[]) => void; onEdit?: () => void; hidden?: boolean; onExited?: () => void; onMore: (anchor: HTMLElement) => void; moreOpen: boolean; room: Room; staff: Staff[]; dateOffset: number; onNotesChange: (notes: string) => void; onClose: () => void; onPerson: (name: string) => void }) {
  const id = useId();
  const boardDate = new Date();
  boardDate.setDate(boardDate.getDate() + dateOffset);
  const openDirectMessage = useContext(OpenDirectMessageContext);
  const messagePerson = openDirectMessage ? (name: string) => {
    onClose();
    openDirectMessage(name, initials(name));
  } : undefined;

  useLayoutEffect(() => {
    const panel = document.getElementById(id);
    const trigger = document.activeElement;
    panel?.querySelector("button")?.focus({ preventScroll: true });
    return () => {
      if (panel?.contains(document.activeElement) && trigger instanceof HTMLElement && trigger.isConnected) {
        trigger.focus({ preventScroll: true });
      }
    };
  }, [id]);

  useEffect(() => {
    if (hidden) return;
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key !== "Escape" || document.querySelector(".sds.menu")) return;
      event.preventDefault();
      onClose();
    }
    document.addEventListener("keydown", closeOnEscape, true);
    return () => document.removeEventListener("keydown", closeOnEscape, true);
  }, [onClose, hidden]);

  useEffect(() => {
    if (!hidden) return;
    const timeout = window.setTimeout(() => onExited?.(), window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 360);
    return () => window.clearTimeout(timeout);
  }, [hidden, onExited]);

  const activity = room.activity ?? [];
  const summary = room.activitySummary;
  const latestClean = activity.find((entry) => entry.kind === "clean");
  const cleaner = staff.find((person) => person.id === latestClean?.staffId)?.name ?? summary?.cleaner ?? latestClean?.cleaner;
  const assigned = staff.find((person) => person.id === room.housekeeper);
  const completed = room.state === "clean" || room.state === "inspected";
  const showAssignment = !summary && !completed && assigned !== undefined;
  const contact = showAssignment ? assigned.name : cleaner ?? assigned?.name;
  const durations = activity.flatMap((entry) => entry.kind !== "clean" || entry.minutes === undefined || (summary && entry.cleaner) ? [] : [entry.minutes]);
  const timedCleans = durations.length + (summary?.timedCleans ?? 0);
  const totalMinutes = durations.reduce((sum, minutes) => sum + minutes, (summary?.average ?? 0) * (summary?.timedCleans ?? 0));
  const average = timedCleans ? Math.round(totalMinutes / timedCleans) : null;

  return (
    <DetailPanel onEdit={onEdit} id={id} label={`Room ${room.number} activity`} hidden={hidden} onExited={onExited} onClose={onClose} showMore={false} actions={<button type="button" className="note-more" aria-label="Room options" aria-haspopup="menu" aria-expanded={moreOpen} onClick={event => onMore(event.currentTarget)}><Icon name="dots" size={14} /></button>}>
      <div className="board-activity-room">
        <SideRoom value={room.number} readOnly />
        <div className="todo-side-heading">
          <div className="todo-side-title-row"><h2>Room {room.number}</h2></div>
          <div className="todo-side-title-row board-activity-room-meta">
            <span className="todo-side-value is-quiet">{room.type}</span>
            <time dateTime={`${boardDate.getFullYear()}-${String(boardDate.getMonth() + 1).padStart(2, "0")}-${String(boardDate.getDate()).padStart(2, "0")}`}>
              {boardDateFormat.format(boardDate)}
            </time>
          </div>
        </div>
      </div>
      <div className="todo-side-rule" />
      <div className="todo-side-meta">
        {contact ? (
          <FactRow label={showAssignment || !cleaner ? "Assigned" : "Cleaned by"}>
            <div className="board-activity-contact">
              <button type="button" className="board-person-link" onClick={() => onPerson(contact)}><Person name={contact} initials={initials(contact)} variant="pill" /></button>
              {messagePerson && <ActivityMessageButton name={contact} onMessage={messagePerson} />}
            </div>
          </FactRow>
        ) : null}
        {inspector ? <><FactRow label="Planned">30m</FactRow><FactRow label="Actual">{room.minutes !== undefined ? formatDuration(room.minutes) : "Not timed"}</FactRow></> : null}
        <FactRow label="Service"><span className="todo-side-value">{serviceNames[room.service]}</span></FactRow>
        {average === null ? null : (
          <FactRow label="Avg clean">
            <span className="todo-side-value board-activity-average">
              {formatDuration(average)}
              <InfoTooltip label={`Across ${timedCleans} timed ${timedCleans === 1 ? "clean" : "cleans"}`} />
            </span>
          </FactRow>
        )}
        {room.pet && (
          <FactRow label="Pet">
            <span className="todo-side-value">Guest has a pet</span>
          </FactRow>
        )}
        {!!room.minibarTaken?.length && (
          <FactRow label="Minibar taken">
            <ul className="board-activity-minibar">
              {room.minibarTaken.map(({ name, quantity }) => (
                <li key={name} className="todo-side-value">{quantity} {name}</li>
              ))}
            </ul>
          </FactRow>
        )}
      </div>
      <div className="board-activity-notes">
        <label className="sheet-label" htmlFor={`${id}-notes`}>Notes</label>
        <textarea
          id={`${id}-notes`}
          className="text-well"
          placeholder="Add room notes…"
          value={room.notes ?? ""}
          onChange={(event) => onNotesChange(event.currentTarget.value)}
        />
      </div>
      <div className="todo-side-rule" />
      {inspector ? <InspectionDetails key={room.id} room={room} onSave={checks => onInspectionSave?.(checks)} /> : null}
      <RoomHistory entries={activity} staff={staff} onMessage={messagePerson} />
    </DetailPanel>
  );
}

function ActivityMessageButton({ name, onMessage }: { name: string; onMessage: (name: string) => void }) {
  return <Button variant="secondary" className="board-activity-message" aria-label={`Message ${name}`} onClick={() => onMessage(name)}>
    <Icon name="bubble" size={14} />Message
  </Button>;
}

function RoomHistory({ entries, staff, onMessage }: { entries: RoomActivity[]; staff: Staff[]; onMessage?: (name: string) => void }) {
  return (
    <section className="activity-feed" aria-label="Activity">
      <div className="activity-head">Activity</div>
      {entries.length ? (
        <ol className="board-history">
          {entries.map((entry, index) => {
            const person = staff.find((member) => member.id === entry.staffId);
            const name = entry.cleaner ?? person?.name;
            const duration = entry.minutes === undefined ? "Not timed" : entry.minutes === 0 ? "<1m" : formatDuration(entry.minutes);
            const timestamp = entry.at === undefined ? null : new Date(entry.at);
            const clean = entry.kind === "clean";
            const incomplete = entry.kind === "incomplete";
            const title = entry.kind === "dnd" ? "Marked as DND" : entry.kind === "inspected" ? "Inspection" : serviceNames[entry.service];
            const icon = entry.kind === "dnd" ? "moon" : entry.kind === "inspected" ? "eye" : serviceIcons[entry.service];

            return (
              <li key={index} className={`board-history-entry is-${entry.kind}`}>
                <span className="board-history-marker" aria-hidden="true">
                  <Icon name={icon} size={18} />
                </span>
                <div className="board-history-summary">
                  <div className="board-history-heading">
                    <h3 className="board-history-title">{title}</h3>
                    <div className="board-activity-contact">
                      <span className="sds mini-pill board-history-person">
                        <Avatar size="mini" photo={person?.photo} initials={person?.initials ?? (name ? initials(name) : "—")} />
                        {name ?? "Staff unrecorded"}
                      </span>
                      {name && onMessage && <ActivityMessageButton name={name} onMessage={onMessage} />}
                    </div>
                  </div>
                  {timestamp ? (
                    <time className="board-history-time" dateTime={timestamp.toISOString()}>
                      {activityDate.format(timestamp)}, {activityTime.format(timestamp).replace(/\s/g, "")}
                    </time>
                  ) : null}
                </div>
                {clean || incomplete || entry.paused || entry.timeRange || entry.inspectedBy ? (
                  <div className="board-history-details">
                    <div className="board-history-timing">
                      {entry.timeRange ? <span>{entry.timeRange.replace(/\s+(AM|PM)/g, "$1")}</span> : null}
                      {clean ? <span className="board-history-duration">{duration}</span> : null}
                      {incomplete ? <span>Not completed</span> : null}
                      {entry.paused ? <span className="board-history-pause">Paused {entry.paused}</span> : null}
                      {entry.inspectedBy ? (
                        <span className="board-history-inspector" aria-label={`Inspected by ${entry.inspectedBy}`}>
                          <Tipped label={`Inspected by ${entry.inspectedBy}`} focusable>
                            <Icon name="eye" size={16} />
                          </Tipped>
                          {entry.inspectedBy}
                        </span>
                      ) : null}
                    </div>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ol>
      ) : <p className="todo-side-value is-quiet">No activity recorded.</p>}
    </section>
  );
}
