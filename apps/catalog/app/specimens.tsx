"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Button, SegmentedControl, ThemeSwitch, type ButtonVariant } from "@lance-live/gallery-ui";

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

function VariantBlock({ variant, name }: { variant: ButtonVariant; name: string }) {
  const label = variant === "danger" ? "Delete" : "New";
  return (
    <section>
      <h2>{name}</h2>
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
        <Specimen k="Base">
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
    </section>
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

function ThemeToggle() {
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

export function Specimens() {
  return (
    <main className="mx-auto w-full max-w-[1120px] px-6 pt-10">
      <header className="mb-8 flex items-center justify-between gap-4">
        <h1 className="text-base font-medium">Gallery UI</h1>
        <ThemeToggle />
      </header>
      <div className="sds group">
      <h2>Buttons</h2>
      <VariantBlock variant="primary" name="Primary button" />
      <VariantBlock variant="secondary" name="Secondary button" />
      <VariantBlock variant="danger" name="Danger button" />
      <section>
        <h2>Secondary tabs 3 MAX</h2>
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
          <Specimen k="Hover">
            <SegmentedControl readOnly aria-label="Selected scheduled" value="scheduled" options={segments} />
          </Specimen>
        </div>
      </section>
      </div>
    </main>
  );
}
