"use client";
import { useState } from "react";
import { Button, Checkbox, Icon, SectionHeader, SettingsCard } from "@lance-live/sds";
import type { Room } from "./data";

const groups = [
  { title: "Guestroom", items: ["Bedding and presentation", "Carpet and floor", "Furniture and surfaces", "Electronics", "Lights", "Odor", "Previous guest belongings"] },
  { title: "Bathroom", items: ["Shower and amenities", "Toilet", "Sink and amenities", "Towels", "Bathroom floor"] },
];
export function InspectionDetails({ room, onSave }: { room: Room; onSave: (checks: string[]) => void }) {
  const all = groups.flatMap(group => group.items);
  const [passed, setPassed] = useState<string[]>(room.inspectionChecks ?? (room.state === "inspected" ? all : all.filter(label => label !== "Towels")));
  const [saved, setSaved] = useState(false);
  return <section className="board-inspection" aria-label="Inspection checklist"><SectionHeader icon="clipboard" title="Inspection" aside={`${passed.length}/${all.length} passed`} />
    <p className="hk-help">{all.length - passed.length ? `${all.length - passed.length} ${all.length - passed.length === 1 ? "check needs" : "checks need"} attention.` : "All checks passed."}</p>
    {groups.map(group => <section key={group.title}><SectionHeader icon={group.title === "Guestroom" ? "bed" : "clean-full"} title={group.title} /><SettingsCard label={group.title}>{group.items.map(label => <label className="board-inspection-check" key={label}><Checkbox checked={passed.includes(label)} aria-label={`${label} passed`} onCheckedChange={checked => { setSaved(false); setPassed(current => checked ? [...current, label] : current.filter(item => item !== label)); }} /><span>{label}</span></label>)}</SettingsCard></section>)}
    <Button variant="secondary" disabled={saved} onClick={() => { onSave(passed); setSaved(true); }}><Icon name="check" size={14} />{saved ? "Saved in preview" : "Save inspection"}</Button>
  </section>;
}
