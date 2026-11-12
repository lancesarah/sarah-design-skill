"use client";

import { useEffect, useState } from "react";
import { Button, SegmentedControl, ThemeSwitch, type ButtonVariant } from "@lance-live/gallery-ui";
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
  const code = `import { Button } from "@lance-live/gallery-ui";

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

const SEGMENT_CODE = `import { SegmentedControl } from "@lance-live/gallery-ui";

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

export function Specimens({ page }: { page: string }) {
  if (page === "button") {
    return (
      <DocPage title="Button" description="A button starts an action. One primary button is the main action on a page. Secondary and danger sit beside it.">
        <VariantBlock variant="primary" name="Primary" description="Use a primary button for the action the page exists to do, such as creating a record." />
        <VariantBlock variant="secondary" name="Secondary" description="Use a secondary button for an action that is available, but is not the main one." />
        <VariantBlock variant="tertiary" name="Tertiary" description="Use a tertiary button for a choice that is on, such as Required on a step. It reads as selected without a stroke or a dark fill." />
        <VariantBlock variant="danger" name="Danger" description="Use a danger button for a destructive action, such as delete." />
        <VariantBlock variant="danger-light" name="Danger light" description="The quieter delete: red text and icon on a light red fill, with no hairline. It still opens the delete confirmation." />
        <Example id="icon" title="Icon only" description="An action with no room for a label, or a tool in a row. It needs an aria-label, and it is never the primary action." code={`import { Button } from "@lance-live/gallery-ui";

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
        <Example id="disabled" title="Disabled" description="An action that is not available yet. Every variant keeps its shape and fades." code={`import { Button } from "@lance-live/gallery-ui";

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
        <Example id="switch-example" title="Default" description="Dark mode. This one switches the gallery." code={`import { ThemeSwitch } from "@lance-live/gallery-ui";

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
        <Example id="segments-count" title="With counts" description="Each segment can carry a count, drawn like a tab count: a separate figure after the label." code={`import { SegmentedControl } from "@lance-live/gallery-ui";

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
