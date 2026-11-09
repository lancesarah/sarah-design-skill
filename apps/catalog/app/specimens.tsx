"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Button, SegmentedControl, ThemeSwitch, type ButtonVariant } from "@lance-live/gallery-ui";
import { DocPage, Example } from "./docs-example";

function Plus() {
  return (
    <svg className="i" width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
      <path d="M7 2.5v9M2.5 7h9" fill="none" stroke="currentColor" strokeWidth="var(--icon-stroke)" />
    </svg>
  );
}

function Specimen({ k, children }: { k: string; children: ReactNode }) {
  return (
    <div className="col">
      <span className="k">{k}</span>
      {children}
    </div>
  );
}

function VariantBlock({ variant, name, description }: { variant: ButtonVariant; name: string; description: string }) {
  const label = variant === "danger" ? "Delete" : "New";
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
      <div className="cols">
        <Specimen k="Interactive">
          <Button variant={variant}>
            <Plus />
            {label}
          </Button>
        </Specimen>
        <Specimen k="Base">
          <Button variant={variant}>
            <Plus />
            {label}
          </Button>
        </Specimen>
        <Specimen k="Icon">
          <Button variant={variant} icon aria-label={label}>
            <Plus />
          </Button>
        </Specimen>
        <Specimen k="Hover">
          <Button variant={variant} state="hover">
            <Plus />
            {label}
          </Button>
        </Specimen>
        <Specimen k="Disabled">
          <Button variant={variant} disabled>
            <Plus />
            {label}
          </Button>
        </Specimen>
      </div>
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
        <VariantBlock variant="danger" name="Danger" description="Use a danger button for a destructive action, such as delete." />
      </DocPage>
    );
  }
  if (page === "segments") {
    return (
      <DocPage title="Segmented control" description="A segmented control switches a view. Three options is the maximum.">
        <Example id="segments-default" title="Default" description="The selected segment is the current view. The others stay quiet until they are chosen." code={SEGMENT_CODE}>
          <div className="cols">
            <Specimen k="Interactive">
              <span className="frame">
                <InteractiveSegments />
              </span>
            </Specimen>
            <Specimen k="Base">
              <SegmentedControl readOnly aria-label="Base" value="open" options={segments} />
            </Specimen>
            <Specimen k="Hover">
              <SegmentedControl
                readOnly
                aria-label="Hover unselected"
                value="open"
                options={[
                  { value: "open", label: "Open" },
                  { value: "scheduled", label: "Scheduled", state: "hover" },
                  { value: "completed", label: "Completed" },
                ]}
              />
            </Specimen>
            <Specimen k="Selected">
              <SegmentedControl readOnly aria-label="Selected scheduled" value="scheduled" options={segments} />
            </Specimen>
          </div>
        </Example>
      </DocPage>
    );
  }
  return null;
}
