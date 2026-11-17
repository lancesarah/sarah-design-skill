"use client";
import { useEffect, useRef, useState } from "react";
import { DataTable, DetailPanel, FactRow, SectionHeader, SegmentedControl } from "@lance-live/sds";
import { createPortal } from "react-dom";
import type { Staff } from "./data";
import { todayKey } from "./workflow-pages";
const categories = ["Call out", "Sick", "Medical", "Request off", "Vacation", "Paid time off", "Leave of absence"];
const fixtures = [
  { id: "a1", ago: 5, category: "Call out", days: 1, note: "Reported before the morning shift.", source: "Manager entry" },
  { id: "a2", ago: 18, category: "Sick", days: 2, note: "Two consecutive shifts missed.", source: "Approved request" },
  { id: "a3", ago: 48, category: "Vacation", days: 3, note: "Planned leave.", source: "Approved request" },
  { id: "a4", ago: 75, category: "Request off", days: 1, note: "Personal appointment.", source: "Approved request" },
  { id: "a5", ago: 160, category: "Paid time off", days: 2, note: "Planned time off.", source: "Approved request" },
];
export function AttendancePreview({ person }: { person: Staff }) {
  const sectionRef = useRef<HTMLElement>(null);
  const [period, setPeriod] = useState("90");
  const [category, setCategory] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const visible = fixtures.filter(item => item.ago <= Number(period));
  const records = visible.filter(item => category === "All records" || item.category === category).map(item => { const date = new Date(`${todayKey()}T12:00:00`); date.setDate(date.getDate() - item.ago); return { ...item, date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }) }; });
  const record = records.find(item => item.id === selected);
  useEffect(() => { if (!category) return; const close = (event: KeyboardEvent) => { if (event.key === "Escape") setCategory(null); }; document.addEventListener("keydown", close); return () => document.removeEventListener("keydown", close); }, [category]);
  return <section ref={sectionRef}><SectionHeader icon="calendar" title="Attendance" aside={<SegmentedControl aria-label="Attendance period" value={period} onValueChange={value => { setPeriod(value); setCategory(null); }} options={[{ value: "30", label: "30d" }, { value: "90", label: "90d" }, { value: "365", label: "12m" }]} />} /><DataTable rows={categories.map(label => ({ id: label, label, count: visible.filter(item => item.category === label).reduce((sum, item) => sum + item.days, 0) }))} onRowClick={row => { setCategory(row.label); setSelected(null); }} columns={[{ id: "type", title: "Type", text: "primary", render: row => row.label }, { id: "count", title: "Days", render: row => row.count || "—" }]} /><p className="hk-help">Sample attendance · Select a type to review its records.</p>
    {category && sectionRef.current?.closest("main") ? createPortal(<DetailPanel label={`${category} attendance`} showMore={false} onClose={() => setCategory(null)}><div className="todo-side-heading"><h2>{category}</h2><p className="hk-help">{person.name} · Past {period === "365" ? "12 months" : `${period}d`}</p></div><DataTable rows={records} empty="No attendance records in this period." onRowClick={row => setSelected(row.id)} selectedId={selected} columns={[{ id: "date", title: "Date", text: "primary", minWidth: 140, render: row => row.date }, { id: "days", title: "Days", render: row => row.days }]} />{record ? <div className="todo-side-meta"><FactRow label="Source">{record.source}</FactRow><FactRow label="Notes">{record.note}</FactRow></div> : null}</DetailPanel>, sectionRef.current.closest("main")!) : null}
  </section>;
}
