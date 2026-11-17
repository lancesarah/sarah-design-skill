"use client";

import { useEffect, useState } from "react";
import { InfoTooltip, TimePicker, SettingsCard, SettingsRow, SettingsToggleRow, SettingsMenuRow, SettingsInputRow, SectionHeader, Button, IconButton, SegmentedControl, ThemeSwitch, type ButtonVariant } from "@lance-live/sds";
import { DocPage, Example } from "./docs-example";

function Plus() {
  return (
    <svg className="i" width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
      <path d="M7 2.5v9M2.5 7h9" fill="none" stroke="currentColor" strokeWidth="var(--icon-stroke)" />
    </svg>
  );
}

function VariantBlock({ variant, name, description }: { variant: ButtonVariant; name: string; description: string }) {
  const label = variant === "danger" || variant === "danger-light" ? "Delete" : variant === "tertiary" ? "Required" : "New";
  const code = `import { Button } from "@lance-live/sds";

export function ${name.replace(/\s/g, "")}() {
  return (
    <Button variant="${variant}">
      <PlusIcon />
      ${label}
    </Button>
  );
}`;
  return (
    <Example id={variant} title={name} description={description} code={code}>
      <Button variant={variant}>
        <Plus />
        {label}
      </Button>
    </Example>
  );
}

const segments = [
  { value: "open", label: "Open" },
  { value: "scheduled", label: "Scheduled" },
  { value: "completed", label: "Completed" },
];

function InteractiveSegments() {
  const [value, setValue] = useState("open");
  return (
    <SegmentedControl aria-label="Status" value={value} onValueChange={setValue} options={segments} />
  );
}

function CountedSegments() {
  const [value, setValue] = useState("open");
  return (
    <SegmentedControl
      aria-label="Status"
      value={value}
      onValueChange={setValue}
      options={[
        { value: "open", label: "Open", count: 4 },
        { value: "scheduled", label: "Scheduled", count: 2 },
        { value: "completed", label: "Completed", count: 9 },
      ]}
    />
  );
}

export function ThemeToggle() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const sync = () => setDark(document.documentElement.dataset.theme === "dark");
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, []);
  return (
    <ThemeSwitch
      pressed={dark}
      label={dark ? "Light mode" : "Dark mode"}
      onPressedChange={(next) => {
        if (next) document.documentElement.dataset.theme = "dark";
        else delete document.documentElement.dataset.theme;
      }}
    />
  );
}

const SEGMENT_CODE = `import { SegmentedControl } from "@lance-live/sds";

export function StatusSegments() {
  return (
    <SegmentedControl
      aria-label="Status"
      value="open"
      options={[
        { value: "open", label: "Open" },
        { value: "scheduled", label: "Scheduled" },
        { value: "completed", label: "Completed" },
      ]}
    />
  );
}`;

function TimePickerExample() {
  const [time, setTime] = useState("09:00");
  return <div style={{ width: 200 }}><TimePicker label="Start time" value={time} onValueChange={setTime} /></div>;
}

function SettingsExample() {
  const [training, setTraining] = useState(false);
  const [language, setLanguage] = useState("en");
  const [limit, setLimit] = useState("15");
  const [days, setDays] = useState<string[]>([]);
  return <div style={{ width: "100%", maxWidth: 720 }}>
    <SectionHeader icon="tune" title="Work preferences" info={<InfoTooltip label="Settings apply to this team member." />} aside="Applies to this team member." />
    <SettingsCard label="Work preferences example">
      <SettingsInputRow label="Room limit" input={{ type: "number", min: 1, value: limit, onChange: event => setLimit(event.target.value) }} />
      <SettingsToggleRow label="Training" value={training} onValueChange={setTraining} />
      <SettingsMenuRow label="Language preference" icon="globe" value={language} onValueChange={setLanguage} items={[{ value: "en", label: "🇺🇸 English", suffix: "EN" }, { value: "es", label: "🇪🇸 Español", suffix: "ES" }]} />
      <SettingsRow label="Preferred days off"><div style={{ display: "flex", gap: "var(--space-4)", flexWrap: "wrap" }}>{["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(day => <Button key={day} variant="secondary" style={{ width: 40 }} aria-pressed={days.includes(day)} onClick={() => setDays(current => current.includes(day) ? current.filter(value => value !== day) : [...current, day])}>{day}</Button>)}</div></SettingsRow>
    </SettingsCard>
    <div style={{ marginTop: "var(--space-25)" }}><SettingsCard label="Destructive setting example" variant="destructive"><SettingsRow label="Reset preferences" icon="tune" description="Restore the example values."><Button variant="danger-light" onClick={() => { setTraining(false); setLanguage("en"); setLimit("15"); setDays([]); }}>Reset</Button></SettingsRow></SettingsCard></div>
  </div>;
}

export function Specimens({ page }: { page: string }) {
  if (page === "time-picker") return <DocPage title="Time picker" description="Type an exact time or choose a half-hour suggestion."><Example id="time-picker" title="Editable time" description="Uses the shared line field and menu. Supports AM/PM or 24-hour input, keyboard navigation, and minute precision." code={'<TimePicker label="Start time" value={time} onValueChange={setTime} />'}><TimePickerExample /></Example></DocPage>;
  if (page === "settings-card") {
    return <DocPage title="Settings card" description="Related settings in consistent rows, introduced by a separate page-surface section header.">
      <Example id="settings-variants" title="Row variants" description="Text entry, toggle, dropdown, grouped controls, and a standalone destructive action with the standard grey border and 16px vertical padding. Toggle rows are clickable; other rows leave interaction to their controls." code={'<SectionHeader icon="tune" title="Work preferences" aside="Optional context" />\n<SettingsCard label="Work preferences">\n  <SettingsToggleRow label="Training" value={training} onValueChange={setTraining} />\n  <SettingsInputRow label="Room limit" input={{ type: "number", value: limit, onChange: handleChange }} />\n</SettingsCard>'}>
        <SettingsExample />
      </Example>
    </DocPage>;
  }
  if (page === "button") {
    return (
      <DocPage title="Button" description="A button starts an action. One primary button is the main action on a page. Secondary and danger sit beside it.">
        <VariantBlock variant="primary" name="Primary" description="Use a primary button for the action the page exists to do, such as creating a record." />
        <VariantBlock variant="secondary" name="Secondary" description="Use a secondary button for an action that is available, but is not the main one." />
        <VariantBlock variant="tertiary" name="Tertiary" description="Use a tertiary button for a choice that is on, such as Required on a step. It reads as selected without a stroke or a dark fill." />
        <VariantBlock variant="danger" name="Danger" description="Use a danger button for a destructive action, such as delete." />
        <VariantBlock variant="danger-light" name="Danger light" description="The quieter delete: red text and icon on a light red fill, with no hairline. It still opens the delete confirmation." />
        <Example id="icon" title="Icon only" description="An action with no room for a label, or a tool in a row. It needs an aria-label, and it is never the primary action." code={`import { Button } from "@lance-live/sds";

export function AddButton() {
  return (
    <Button variant="secondary" icon aria-label="New">
      <PlusIcon />
    </Button>
  );
}`}>
          <Button variant="secondary" icon aria-label="New">
            <Plus />
          </Button>
        </Example>
        <Example id="icon-button" title="Header icon" description="A tool in a header or a panel bar, such as a panel toggle. The glyph is grey, with no fill or stroke until hover. Every panel toggle uses it." code={`import { IconButton } from "@lance-live/sds";

export function DetailsToggle({ onClick }: { onClick: () => void }) {
  return <IconButton icon="panel" aria-label="Show details" onClick={onClick} />;
}`}>
          <IconButton icon="panel" aria-label="Show details" />
          <IconButton icon="panel" aria-label="Show details" state="hover" />
          <IconButton icon="fullscreen" aria-label="Expand" />
          <IconButton icon="clock" aria-label="History" />
        </Example>
        <Example id="disabled" title="Disabled" description="An action that is not available yet. Every variant keeps its shape and fades." code={`import { Button } from "@lance-live/sds";

export function SaveLater() {
  return <Button disabled>Save</Button>;
}`}>
          <Button disabled>Save</Button>
          <Button variant="secondary" disabled>Cancel</Button>
        </Example>
      </DocPage>
    );
  }
  if (page === "switch") {
    return (
      <DocPage title="Switch" description="A switch turns one setting on or off. The label says what it sets. On is the one blue.">
        <Example id="switch-example" title="Default" description="Dark mode. This one switches the gallery." code={`import { ThemeSwitch } from "@lance-live/sds";

export function DarkMode() {
  const [dark, setDark] = useState(false);
  return <ThemeSwitch pressed={dark} onPressedChange={setDark} label="Dark mode" />;
}`}>
          <ThemeToggle />
        </Example>
      </DocPage>
    );
  }
  if (page === "segments") {
    return (
      <DocPage title="Segmented control" description="A segmented control switches a view. Three options is the maximum.">
        <Example id="segments-default" title="Default" description="The selected segment is the current view. The others stay quiet until they are chosen." code={SEGMENT_CODE}>
          <InteractiveSegments />
        </Example>
        <Example id="segments-count" title="With counts" description="Each segment can carry a count, drawn like a tab count: a separate figure after the label." code={`import { SegmentedControl } from "@lance-live/sds";

export function CountedSegments() {
  return (
    <SegmentedControl
      aria-label="Status"
      value="open"
      options={[
        { value: "open", label: "Open", count: 4 },
        { value: "scheduled", label: "Scheduled", count: 2 },
        { value: "completed", label: "Completed", count: 9 },
      ]}
    />
  );
}`}>
          <CountedSegments />
        </Example>
      </DocPage>
    );
  }
  return null;
}
