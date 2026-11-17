"use client";

import { useContext, useRef, useState, type ReactNode } from "react";
import { InfoTooltip, SectionHeader, Avatar, Button, DataTable, DepartmentChip, Icon, SegmentedControl, Tabs, TaskTable, Widget, type TaskRow } from "@lance-live/sds";
import { HousekeeperSettings } from "./housekeeper-settings";
import { PageLayout, PageTitle } from "../page-layout";
import { OpenDirectMessageContext } from "../shell-panels";
import { formatDuration, isDone, type Room, type Staff } from "./data";
import { ChartTooltip } from "../chart-tooltip";
import { useChartHover } from "../use-chart-hover";
import { Stars } from "../home/voice-widget";
import { WidgetBarChart } from "../home/activity-widget";
import { RoomRow, RoomsEmpty } from "./board-parts";
import { serviceNames } from "./room-activity";

const dayFormat = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Los_Angeles", year: "numeric", month: "2-digit", day: "2-digit" });
const timeFormat = new Intl.DateTimeFormat("en-US", { timeZone: "America/Los_Angeles", hour: "numeric", minute: "2-digit" });
const dayKey = (at: number) => dayFormat.format(at);

/** Sections and completion-gap averages follow lance-hotels-v1.2's
 * staff-profile-panel.tsx and lib/housekeeping/staff-profile-stats.ts.
 * The profile preview includes explicitly requested demo ratings and schedules.
 */
export function housekeeperHistory(rooms: Room[], person: Staff, now: number, days: number) {
  const start = new Date(now);
  start.setDate(start.getDate() - days + 1);
  const entries = rooms.flatMap(room => (room.activity ?? []).filter(entry =>
    entry.kind === "clean" && (entry.cleaner ? entry.cleaner === person.name : entry.staffId === person.id) &&
    entry.at !== undefined && dayKey(entry.at) >= dayKey(start.getTime()) && dayKey(entry.at) <= dayKey(now)
  ).map(entry => ({ ...entry, room: room.number })));
  const byDay = new Map<string, number[]>();
  entries.forEach(entry => {
    const key = dayKey(entry.at!);
    byDay.set(key, [...(byDay.get(key) ?? []), entry.at!]);
  });
  const gaps = [...byDay.values()].flatMap(times => {
    times.sort((a, b) => a - b);
    return times.slice(1).map((time, index) => (time - times[index]) / 60000);
  });
  return {
    entries,
    byDay,
    roomsPerDay: byDay.size ? (entries.length / byDay.size).toFixed(1) : "—",
    average: gaps.length ? formatDuration(Math.round(gaps.reduce((sum, value) => sum + value, 0) / gaps.length)) : "—",
  };
}

function Stats({ items }: { items: { label: string; value: ReactNode; detail: string }[] }) {
  return <dl className="housekeeper-stats">{items.map(item => <div key={item.label}>
    <dt>{item.label}</dt><dd>{item.value}</dd><span>{item.detail}</span>
  </div>)}</dl>;
}

export function HousekeeperProfile({ person, rooms, onBack, onRoom, overlay, onChange, onOffboard }: { onChange: (patch: Partial<Staff>) => void; onOffboard: () => void; overlay?: ReactNode; person: Staff; rooms: Room[]; onBack: () => void; onRoom: (id: string) => void }) {
  const [tab, setTab] = useState("analytics");
  const [statsPeriod, setStatsPeriod] = useState("today");
  const [range, setRange] = useState("7");
  const [now] = useState(() => Date.now());
  const message = useContext(OpenDirectMessageContext);
  const isInspector = person.role === "inspector";
  const assigned = rooms.filter(room => room[person.role] === person.id);
  const completed = assigned.filter(room => isDone(room, person.role));
  const [todos, setTodos] = useState<TaskRow[]>(() => (isInspector ? [
    { title: "Review room readiness", note: "Check amenities and presentation before arrival.", urgency: "standard", status: "open" },
    { title: "Follow up on inspection issue", note: "Confirm the reported issue has been resolved.", urgency: "high", status: "progress" },
    { title: "Complete quality checks", note: "Review the assigned rooms for today's arrivals.", urgency: "standard", status: "open" },
  ] : [
    { title: "Restock bathroom amenities", note: "Refill shampoo, conditioner and body wash.", urgency: "standard", status: "open" },
    { title: "Deliver extra towels", note: "Guest requested two bath towels.", urgency: "high", status: "progress" },
    { title: "Replace feather pillows", note: "Prepare hypoallergenic pillows before arrival.", urgency: "standard", status: "open" },
  ]).map((task, index) => ({ ...task, id: `${person.id}-todo-${index}`, room: assigned[index]?.number ?? "", type: "Housekeeping", assignee: person.name, initials: person.initials, opened: "11:15AM" } as TaskRow)));

  const history = housekeeperHistory(rooms, person, now, Number(range));
  const today = housekeeperHistory(rooms, person, now, 1);
  const week = housekeeperHistory(rooms, person, now, 7);
  // The demo's completed rooms predate timestamp tracking. Give the pace
  // preview sample completion times without changing the room history.
  const samplePace = today.entries.length < 2 && completed.length > 1;
  let elapsed = 0;
  const sampleStart = new Date(`${dayKey(now)}T09:00:00-08:00`).getTime();
  const pace = samplePace ? completed.map(room => {
    elapsed += room.minutes ?? 25;
    return { at: sampleStart + elapsed * 60000 };
  }) : [...today.entries].sort((a, b) => a.at! - b.at!);
  const weekly = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(now);
    date.setDate(date.getDate() - 6 + index);
    return { current: index === 6, label: date.toLocaleDateString("en-US", { weekday: "short", timeZone: "America/Los_Angeles" }), count: index === 6 ? completed.length : week.byDay.get(dayKey(date.getTime()))?.length ?? 0 };
  });
  // Preview fixtures for information not supplied by the board model.
  const timed = completed.filter(room => room.minutes !== undefined);
  const avgMinutes = timed.length ? Math.round(timed.reduce((sum, room) => sum + room.minutes!, 0) / timed.length) : 28;
  const credits = completed.reduce((sum, room) => sum + ({ checkout: 1, refresh: 0.5, full: 1.25, deep: 2, well: 1 }[room.service]), 0);
  const rating = person.id.charCodeAt(0) % 2 ? "4.8" : "4.9";
  const shift = { hours: "8h", time: "9:00AM – 5:00PM" };
  return <PageLayout className="sheet-page" data-view="head" icon="grid" title={<PageTitle parent="Boards" current={person.name} onBack={onBack} />} actions={<Button variant="secondary" aria-label="Back to boards" onClick={onBack}><Icon name="chevron" size={14} className="pm-back-icon" />Back</Button>} bodyClassName="housekeeper-scroll">
    <div className="housekeeper-page">
      <header className="housekeeper-intro">
        <Avatar initials={person.initials} photo={person.photo} size="lg" />
        <div><div className="housekeeper-name-row"><h1>{person.name}</h1><DepartmentChip name="Housekeeping" plain /></div><p className="housekeeper-shift"><Icon name="calendar" size={14} /><span>Today</span><span className="housekeeper-shift-time">{shift.time}</span><span>({shift.hours})</span></p></div>
        {message ? <Button variant="secondary" onClick={() => message(person.name, person.initials)}><Icon name="bubble" size={14} />Message</Button> : null}
      </header>
      <Tabs label={isInspector ? "Inspector details" : "Housekeeper details"} value={tab} onValueChange={setTab} items={[{ value: "analytics", label: "Analytics" }, { value: "rooms", label: "Tasks & rooms", count: assigned.length + todos.length }, { value: "profile", label: "Profile" }]} />
      {tab === "analytics" && isInspector ? <div className="housekeeper-sections housekeeper-analytics">
        <Widget icon="gauge" title="Performance">
          <div className="housekeeper-performance">
            <Stats items={[
              { label: "Active tasks", value: todos.filter(task => task.status !== "complete").length, detail: "today" },
              { label: "Hours", value: shift.hours, detail: shift.time },
            ]} />
          </div>
        </Widget>
      </div> : tab === "analytics" ? <div className="housekeeper-sections housekeeper-analytics">
        <Widget icon="gauge" title={<>Performance{statsPeriod === "historical" ? <InfoTooltip className="housekeeper-performance-info" label={`${history.entries.length} recorded cleans across ${history.byDay.size} work days in the past ${range} days.`} /> : null}</>} action={<div className="housekeeper-performance-controls">
          <div className="housekeeper-history-range" style={{ visibility: statsPeriod === "historical" ? "visible" : "hidden" }} inert={statsPeriod !== "historical"} aria-hidden={statsPeriod !== "historical"}>
            <SegmentedControl aria-label="History range" value={range} onValueChange={setRange} options={[7, 30, 90].map(days => ({ value: String(days), label: `${days}d` }))} />
          </div>
          <SegmentedControl aria-label="Stats period" value={statsPeriod} onValueChange={setStatsPeriod} options={[{ value: "today", label: "Today" }, { value: "historical", label: "Historical" }]} />
        </div>}>
          <div className="housekeeper-performance">
            <Stats items={statsPeriod === "today" ? [
          { label: "Rooms done", value: `${completed.length}/${assigned.length}`, detail: "completed" },
          { label: "Avg time", value: formatDuration(avgMinutes), detail: "per room" },
          { label: "Credits", value: credits.toFixed(1), detail: "today" },
          { label: "Hours", value: shift.hours, detail: shift.time },
          { label: "Rating", value: <span role="img" aria-label={`${rating} out of 5 stars`}><Stars value={Number(rating)} /></span>, detail: `${rating} / 5 · inspector rating` },
        ] : [
          { label: "Rooms/day", value: history.roomsPerDay, detail: "per active work day" },
          { label: "Avg time", value: history.average, detail: "between completions" },
          { label: "Issues/day", value: range === "7" ? "0.2" : "0.3", detail: "per active work day" },
          { label: "Inspection", value: range === "7" ? "96%" : "94%", detail: "pass rate" },
          { label: "Rating", value: <span role="img" aria-label={`${rating} out of 5 stars`}><Stars value={Number(rating)} /></span>, detail: `${rating} / 5 · inspector rating` },
        ]} />
          </div>
        </Widget>
        <div className="housekeeper-charts">
          <section><h2 className="hk-heading-label"><Icon name="clock" size={16} />Pace today</h2>{pace.length ? <PaceChart points={pace.map(entry => entry.at!)} /> : <p className="housekeeper-chart-empty">No completed rooms today.</p>}</section>
          <section><h2 className="hk-heading-label"><Icon name="calendar" size={16} />Weekly trend</h2><WidgetBarChart label="Rooms completed this week" bars={weekly.map(day => ({ label: day.label, current: day.current, description: `${day.label}: ${day.count} rooms completed`, segments: [{ value: day.count, className: "is-call" }] }))} /></section>
        </div>
        <section aria-label="Clean types"><h2 className="hk-heading-label"><Icon name="clean-full" size={16} />Clean types</h2>
          <DataTable
            rows={Object.entries(serviceNames).map(([id, label]) => {
              const cleans = history.entries.filter(entry => entry.service === id);
              const timed = cleans.filter(entry => entry.minutes !== undefined);
              return { id, label, completed: cleans.length, average: timed.length ? formatDuration(Math.round(timed.reduce((total, entry) => total + entry.minutes!, 0) / timed.length)) : "—" };
            })}
            columns={[
              { id: "service", title: "Service", text: "primary", render: row => row.label },
              { id: "completed", title: "Completed", text: "short", render: row => row.completed },
              { id: "average", title: "Avg clean", text: "short", render: row => row.average },
            ]}
          />
        </section>
      </div> : tab === "rooms" ? <div className="housekeeper-sections">
        <section aria-label="To-dos"><SectionHeader icon="clipboard" title="To-dos" /><TaskTable
          todoMinWidth={120}
          rows={todos}
          roomOptions={assigned.map(room => room.number)}
          onRoomChange={(row, value) => setTodos(current => current.map(todo => todo.id === row.id ? { ...todo, room: value } : todo))}
          onCopyChange={(row, patch) => setTodos(current => current.map(todo => todo.id === row.id ? { ...todo, ...patch } : todo))}
        /></section>
        <section aria-label="Rooms today"><h2 className="hk-heading-label"><Icon name="bed" size={16} />Rooms today</h2>
          <div className="sds widget">
            {assigned.length ? <ul className="board-rooms">
              {[...assigned].sort((a, b) => Number(isDone(a, person.role)) - Number(isDone(b, person.role))).map(room => <RoomRow key={room.id} room={room} role={person.role} readOnly onOpenActivity={() => onRoom(room.id)} />)}
            </ul> : <RoomsEmpty>No rooms assigned.</RoomsEmpty>}
          </div>
        </section></div> : <HousekeeperSettings person={person} onChange={onChange} onOffboard={onOffboard} />}
    </div>
    {overlay}
  </PageLayout>;
}

function PaceChart({ points }: { points: number[] }) {
  const chartRef = useRef<HTMLDivElement>(null);
  useChartHover(chartRef, points);
  const end = points.at(-1)!;
  const start = points[0] - 30 * 60000;
  const x = (time: number) => 28 + (time - start) / Math.max(1, end - start) * 304;
  const y = (count: number) => 196 - count / points.length * 192;
  const ticks = Array.from({ length: points.length + 1 }, (_, count) => count);
  return <div className="housekeeper-pace-wrap" ref={chartRef}><svg className="housekeeper-pace" viewBox="0 0 340 220" preserveAspectRatio="none" aria-hidden="true">
    {ticks.map(count => <g key={count}><path className="housekeeper-axis" d={`M28 ${y(count)}H332`} /><text x="20" y={y(count) + 4} textAnchor="end">{count}</text></g>)}
    <polyline points={[[start, 0], ...points.map((at, i) => [at, i + 1])].map(([at, count]) => `${x(at)},${y(count)}`).join(" ")} />

    {[start, start + (end - start) / 2, end].map((at, i) => <text key={i} x={x(at)} y="216" textAnchor={i === 0 ? "start" : i === 2 ? "end" : "middle"}>{timeFormat.format(at).replace(/\s/g, "")}</text>)}
  </svg><span className="readings-guide" hidden />
    <div className="readings-points">{points.map((at, i) => <button type="button" key={`${at}-${i}`} data-chart-point className="readings-point tip-host" style={{ left: `${x(at) / 340 * 100}%`, top: `${y(i + 1) / 220 * 100}%` }} aria-label={`${timeFormat.format(at).replace(/\s/g, "")}, ${i + 1} ${i ? "rooms" : "room"} completed`}>
      <ChartTooltip label={timeFormat.format(at).replace(/\s/g, "")} value={`${i + 1} ${i ? "rooms" : "room"} completed`} />
    </button>)}</div>
  </div>;
}
