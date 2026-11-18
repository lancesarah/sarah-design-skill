"use client";

import { useState } from "react";
import { InfoTooltip, Button, ConfirmDialog, DataTable, Icon, SegmentedControl, SettingsCard, SettingsSections, SettingsRow, SettingsToggleRow, SettingsMenuRow, SettingsInputRow, SectionHeader } from "@lance-live/sds";
import { AttendancePreview } from "./attendance-preview";
import { DerivedScheduleDay } from "./derived-schedule-day";
import { Availability } from "./availability";
import { formatDuration, type Staff, type StaffPreferences } from "./data";


const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
// Illustrative schedule only; not inferred from attendance or contract records.
const demoDerived: NonNullable<StaffPreferences["derived"]> = {
  Mon: { start: "09:00", end: "17:00" },
  Tue: { start: "09:00", end: "17:00" },
  Wed: { start: "08:30", end: "16:30" },
  Thu: { start: "09:00", end: "17:00" },
  Fri: { start: "07:00", end: "15:00" },
};
const languages = [["en", "English", "🇺🇸"], ["es", "Español", "🇪🇸"], ["zh", "中文", "🇨🇳"], ["fr", "Français", "🇫🇷"], ["pt", "Português", "🇵🇹"], ["ko", "한국어", "🇰🇷"], ["ja", "日本語", "🇯🇵"]];

export function HousekeeperSettings({ person, onChange, onOffboard }: { person: Staff; onChange: (patch: Partial<Staff>) => void; onOffboard: () => void }) {
  const prefs = person.preferences ?? {};
  const derived = prefs.derived ?? demoDerived;
  const derivedSnapshot = JSON.stringify({ derived, cleared: prefs.derivedClearedDays ?? [] });
  const acknowledged = prefs.derivedAcknowledged === derivedSnapshot;
  const weeklyMinutes = Object.values(derived).reduce((total, shift) => {
    const minutes = (time: string) => Number(time.slice(0, 2)) * 60 + Number(time.slice(3));
    return total + (minutes(shift.end) - minutes(shift.start) + 1440) % 1440;
  }, 0);
  const update = (patch: Partial<StaffPreferences>) => onChange({ preferences: { ...prefs, ...patch } });
  const [confirm, setConfirm] = useState(false);
  const [sectionStart, setSectionStart] = useState(String(person.prefer?.[0] ?? ""));
  const [sectionEnd, setSectionEnd] = useState(String(person.prefer?.[1] ?? ""));
  const validSection = !sectionStart && !sectionEnd || Number(sectionStart) > 0 && Number(sectionEnd) >= Number(sectionStart);
  function saveSection() {
    if (validSection) onChange({ prefer: sectionStart ? [Number(sectionStart), Number(sectionEnd)] : undefined });
  }
  const toggle = (label: string, value: boolean, change: (value: boolean) => void, description?: string, info?: string, inlineDescription = false) => <SettingsToggleRow label={label} value={value} onValueChange={change} description={description} inlineDescription={inlineDescription} info={info ? <InfoTooltip label={info} /> : undefined} />;
  const numberField = (label: string, value: number | undefined, change: (value: number | undefined) => void) => <SettingsInputRow label={label} input={{ type: "number", min: 1, placeholder: "No cap", value: value ?? "", onChange: event => change(event.target.value ? Math.max(1, Number(event.target.value)) : undefined) }} />;
  return <SettingsSections spacing="areas" className="housekeeper-sections hk-settings">
    <section aria-label="Work preferences"><SectionHeader variant="described" title="Work preferences" description="Set room assignments, language, and work status for this team member." />
    <SettingsSections className="hk-work-overview">
    <section className="hk-preference-section" aria-label="Assignments"><SectionHeader level={3} icon="tune" title="Assignments" /><SettingsSections><SettingsCard label="Work preferences">
      <SettingsRow label="Preferred section" description={!validSection ? "Enter a start and an end at or above it." : undefined}><div className="hk-inline hk-section-range">
        <label className="hk-number"><input className="sds line" id="hk-section-start" type="number" min="1" aria-label="Preferred section start" placeholder="Start" value={sectionStart} onChange={event => setSectionStart(event.target.value)} onBlur={saveSection} /></label><span>–</span>
        <label className="hk-number"><input className="sds line" type="number" min={sectionStart || 1} aria-label="Preferred section end" placeholder="End" value={sectionEnd} onChange={event => setSectionEnd(event.target.value)} onBlur={saveSection} /></label>
      </div></SettingsRow>
      {numberField("Room limit", person.max, max => onChange({ max }))}

    </SettingsCard>
    <SettingsCard label="Language preference"><SettingsMenuRow label="Language preference" icon="globe" menuClassName="hk-language-menu" value={prefs.language ?? "en"} onValueChange={language => update({ language })} items={languages.map(([value, label, flag]) => ({ value, label: `${flag} ${label}`, suffix: value.toUpperCase() }))} /></SettingsCard></SettingsSections></section>
    <section className="hk-preference-section" aria-label="Work status"><SectionHeader level={3} icon="user" title="Work status" /><SettingsCard label="Work status">
      {toggle("Training", !!prefs.training, training => update({ training }))}
      {toggle("Part-time", !!prefs.partTime, partTime => update({ partTime }))}
      {toggle("Self-inspect", !!person.selfInspect, selfInspect => onChange({ selfInspect }), undefined, "Inspects their own rooms")}
    </SettingsCard></section>
    </SettingsSections></section>
    <section className="hk-preference-section" aria-label="Schedule preferences"><SectionHeader variant="described" title="Schedule preferences" description="Set preferred shifts, days off, and availability for the AI schedule generator." /><SettingsSections className="hk-schedule-cards"><section><SectionHeader level={3} icon="clock" title="Shift" /><SettingsCard label="Preferred shift">
      <SettingsMenuRow label="Preferred shift" value={prefs.shift ?? "none"} onValueChange={shift => update({ shift })} items={[
        { value: "none", label: "No preference" },
        { value: "08:30-17:00", label: "8:30AM – 5:00PM", section: "Shift times", dividerBefore: true },
        { value: "07:00-15:30", label: "7:00AM – 3:30PM" },
        { value: "15:00-23:30", label: "3:00PM – 11:30PM" },
        { value: "09:00-17:30", label: "9:00AM – 5:30PM" },
        { value: "06:00-14:30", label: "6:00AM – 2:30PM" },
        { value: "10:00-18:30", label: "10:00AM – 6:30PM" },
        { value: "19:00-03:30", label: "7:00PM – 3:30AM" },
        ...["LOBBY", "HOUSEPERSON", "LAUNDRY", "INSP", "ASN", "HSM", "LNDY"].map((value, index) => ({ value, label: value, ...(index === 0 ? { section: "Roles", dividerBefore: true } : {}) })),
      ]} />
      {toggle("Always use preferred shift", !!prefs.strictShift, strictShift => update({ strictShift }), undefined, "“Always” makes a preference a strict rule the generator can never break.")}
    </SettingsCard></section><section><SectionHeader level={3} icon="calendar" title="Days off" /><SettingsCard label="Preferred days off">
      <SettingsRow layout="stacked" label="Preferred days off" className="hk-days-off"><div className="hk-inline">{days.map(day => <Button key={day} variant="secondary" aria-pressed={prefs.daysOff?.includes(day) ?? false} onClick={() => update({ daysOff: prefs.daysOff?.includes(day) ? prefs.daysOff.filter(item => item !== day) : [...prefs.daysOff ?? [], day] })}>{day}</Button>)}</div></SettingsRow>
      {toggle("Always keep preferred days off", !!prefs.strictDaysOff, strictDaysOff => update({ strictDaysOff }), undefined, "“Always” makes a preference a strict rule the generator can never break.")}
    </SettingsCard></section><section><SectionHeader level={3} icon="tune" title="Limits and availability" /><SettingsCard label="Work limits and availability">
      {numberField("Max hours / week", prefs.maxHours, maxHours => update({ maxHours }))}
      {numberField("Max consecutive days", prefs.maxConsecutive, maxConsecutive => update({ maxConsecutive }))}
      {toggle("Availability", !!prefs.restrictedAvailability, restrictedAvailability => update({ restrictedAvailability }), prefs.restrictedAvailability ? "Custom hours · Multiple windows per day" : "Open — schedulable any time.", undefined, true)}
      {prefs.restrictedAvailability ? <Availability value={prefs.availability} onChange={availability => update({ availability })} /> : null}
    </SettingsCard></section></SettingsSections></section>

    <section><SectionHeader variant="described" title="Derived schedule profile" description="Review the suggested work pattern before acknowledging it." info={<InfoTooltip label="From 35 weeks of history" />} aside={<span className="sds mini-pill">Confidence ≥ 75%</span>} /><SettingsCard label="Derived schedule profile" className="hk-derived-card"><SettingsRow layout="stacked" label="Suggested contract" description="Suggestions do not change contract or part-time status."><span className="hk-contract-summary"><span className="sds mini-pill hk-contract-pill">Full-time</span><span className="hk-help">(demo) · {formatDuration(weeklyMinutes)} / week</span></span></SettingsRow><SettingsRow layout="stacked" label="Typical week" description="Select a day to review its typical shift."><div className="hk-week">{days.map(day => <DerivedScheduleDay key={day} day={day} shift={derived[day]} cleared={prefs.derivedClearedDays?.includes(day) ?? false} onAction={action => {
      const next = { ...derived };
      if (action === "working") next[day] = demoDerived[day] ?? { start: "09:00", end: "17:00" };
      else delete next[day];
      const cleared = (prefs.derivedClearedDays ?? []).filter(item => item !== day);
      update({ derived: next, derivedClearedDays: action === "clear" ? [...cleared, day] : cleared });
    }} />)}</div>
    </SettingsRow><div className="hk-derived-content"><div className="hk-derived-actions"><Button variant="secondary" disabled={acknowledged} onClick={() => update({ derivedAcknowledged: derivedSnapshot })}><Icon name="check" size={14} />{acknowledged ? "Acknowledged" : "Acknowledge"}</Button></div>
    </div></SettingsCard>
    </section>
    <AttendancePreview person={person} />
    <section><h2 className="hk-heading-label"><Icon name="clock" size={16} />Time Off</h2><p className="hk-help">No time-off requests.</p></section>
    <section aria-label="Offboard"><SettingsCard label="Offboard" variant="destructive"><SettingsRow label="Offboard" icon="user-x" description="Removes them from the demo board and unassigns their rooms. History is kept. Account access and future schedules are not connected."><Button variant="danger-light" disabled={!!prefs.offboarded} onClick={() => setConfirm(true)}><Icon name="close" size={14} />{prefs.offboarded ? "Offboarded" : "Offboard"}</Button></SettingsRow></SettingsCard></section>
    <ConfirmDialog open={confirm} name={person.name} action="Offboard" title={`Offboard ${person.name}?`} detail="Their rooms will become unassigned and their board will be removed. Cleaning history is kept." onCancel={() => setConfirm(false)} onConfirm={() => { setConfirm(false); onOffboard(); }} />
  </SettingsSections>;
}
