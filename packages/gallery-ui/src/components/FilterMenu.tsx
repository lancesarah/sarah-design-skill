"use client";

import { useRef, useState } from "react";
import { DEPARTMENTS, DepartmentChip } from "./DepartmentChip";
import { Icon } from "../icons";
import { OverlayMenu } from "./OverlayMenu";
import { Person } from "./People";
import { ASSIGNEE_PEOPLE } from "./table-columns";

export const FILTER_FIELDS = ["Type", "Status", "Urgency", "Assigned", "Room", "Area", "Item", "Detail", "Source"] as const;

export type FilterField = (typeof FILTER_FIELDS)[number];

export type FilterSelection = Partial<Record<FilterField, readonly string[]>>;

const PEOPLE = [
  { value: "Unassigned", initials: "" },
  ...ASSIGNEE_PEOPLE.map((person) => ({ value: person.name, initials: person.avatar })),
];

const OPTIONS: Record<FilterField, readonly string[]> = {
  Type: DEPARTMENTS.map((item) => item.value),
  Status: ["Open", "In progress", "Completed"],
  Urgency: ["Urgent", "High", "Standard", "Low"],
  Assigned: PEOPLE.map((person) => person.value),
  Room: ["426", "244", "103", "436"],
  Area: ["Guestroom", "Lobby", "Common area"],
  Item: ["Bedding", "Towels", "Dryer"],
  Detail: ["Guest request", "Inspection"],
  Source: ["Manual", "Guest"],
};

function OpenMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path d="M17 9a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z" fill="none" stroke="var(--urgency-high)" strokeWidth="2" />
    </svg>
  );
}

function ProgressMark() {
  return (
    <svg className="status-progress" width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path d="M17 9a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z" fill="none" stroke="var(--action)" strokeWidth="2" />
      <path d="M9 14.4a5.4 5.4 0 0 0 0-10.8V9l0 5.4Z" fill="var(--action)" />
    </svg>
  );
}

function CompleteMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path
        fill="var(--status-complete)"
        fillRule="evenodd"
        d="M9 0a9 9 0 1 0 0 18A9 9 0 0 0 9 0Zm3.65 6.66-1.05-.86-4 4.9-1.75-1.76-.95.96 2.8 2.8 4.95-6.04Z"
      />
    </svg>
  );
}

function OptionBody({ field, value }: { field: FilterField; value: string }) {
  if (field === "Type") return <DepartmentChip name={value} />;
  if (field === "Status") {
    return (
      <>
        {value === "Open" ? <OpenMark /> : null}
        {value === "In progress" ? <ProgressMark /> : null}
        {value === "Completed" ? <CompleteMark /> : null}
        <span className="menu-label">{value}</span>
      </>
    );
  }
  if (field === "Urgency") {
    const level = value.toLowerCase();
    return (
      <span className={`urgency urgency-${level}`}>
        {value === "Urgent" ? <Icon name="warn" size={14} /> : null}
        {value}
      </span>
    );
  }
  if (field === "Assigned") {
    const person = PEOPLE.find((item) => item.value === value);
    if (value === "Unassigned") return <Person name="Unassigned" variant="unassigned" />;
    return <Person name={value} initials={person?.initials} variant="pill" />;
  }
  return <span className="menu-label">{value}</span>;
}

export type FilterSubmenuProps = {
  field: FilterField;
  selected?: readonly string[];
  onSelectedChange?: (values: string[]) => void;
  readOnly?: boolean;
  className?: string;
};

export function FilterSubmenu({ field, selected = [], onSelectedChange, readOnly = false, className, bare = false }: FilterSubmenuProps & { bare?: boolean }) {
  const items = OPTIONS[field].map((value) => {
        const checked = selected.includes(value);
        return (
          <button
            key={value}
            className="menu-item"
            type="button"
            role="menuitemcheckbox"
            aria-checked={checked}
            onClick={() => {
              if (readOnly) return;
              const next = checked ? selected.filter((item) => item !== value) : [...selected, value];
              onSelectedChange?.(next);
            }}
          >
            <OptionBody field={field} value={value} />
            <Icon name="check" size={14} className="check" />
          </button>
        );
      });
  if (bare) return <>{items}</>;
  return (
    <div className={["sds", "menu", "filter-sub", className].filter(Boolean).join(" ")} role="menu" aria-label={field}>
      {items}
    </div>
  );
}

export type FilterMenuProps = {
  open?: boolean;
  branch?: FilterField | null;
  selected?: FilterSelection;
  onOpenChange?: (open: boolean) => void;
  onBranchChange?: (field: FilterField | null) => void;
  onSelectedChange?: (field: FilterField, values: string[]) => void;
  readOnly?: boolean;
  className?: string;
};

export function FilterMenu({
  open,
  branch,
  selected,
  onOpenChange,
  onBranchChange,
  onSelectedChange,
  readOnly = false,
  className,
}: FilterMenuProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [internalBranch, setInternalBranch] = useState<FilterField | null>(null);
  const [internalSelected, setInternalSelected] = useState<FilterSelection>({});
  const anchorRef = useRef<HTMLButtonElement>(null);
  const branchRef = useRef<HTMLButtonElement>(null);
  const shown = open ?? internalOpen;
  const active = branch === undefined ? internalBranch : branch;
  const picks = selected ?? internalSelected;

  const setShown = (next: boolean) => {
    if (readOnly) return;
    if (open === undefined) setInternalOpen(next);
    onOpenChange?.(next);
  };

  const setBranch = (next: FilterField | null) => {
    if (readOnly) return;
    if (branch === undefined) setInternalBranch(next);
    onBranchChange?.(next);
  };

  const setPicks = (field: FilterField, values: string[]) => {
    if (readOnly) return;
    if (selected === undefined) setInternalSelected((current) => ({ ...current, [field]: values }));
    onSelectedChange?.(field, values);
  };

  return (
    <div className={["sds", "sheet-page", "filter-menu-host", shown ? "is-open" : "", className].filter(Boolean).join(" ")}>
      <div className="filter-row">
        <div className={shown ? "drop is-open" : "drop"}>
          <button
            ref={anchorRef}
            className={shown ? "trigger is-hover" : "trigger"}
            type="button"
            aria-expanded={shown}
            aria-haspopup="menu"
            aria-label="Filters"
            onClick={() => setShown(!shown)}
          >
            <span className="pair">
              <Icon name="filter" size={14} />
              <span>Filters</span>
            </span>
            <Icon name="chevron" size={14} />
          </button>
          <OverlayMenu open={shown} anchorRef={anchorRef} className="filter-menu" label="Filters">
            {FILTER_FIELDS.map((field) => (
              <div key={field} className={active === field ? "menu-branch is-open" : "menu-branch"} onMouseEnter={() => setBranch(field)}>
                <button
                  ref={active === field ? branchRef : undefined}
                  className="menu-item"
                  type="button"
                  aria-haspopup="menu"
                  aria-expanded={active === field}
                  onClick={() => setBranch(field)}
                >
                  {field}
                  <Icon name="chevron" size={14} className="menu-next" />
                </button>
              </div>
            ))}
          </OverlayMenu>
          <OverlayMenu key={active ?? "closed"} open={shown && active != null} anchorRef={branchRef} className="filter-sub" label={active ?? undefined} placement="side">
            {active ? (
              <FilterSubmenu field={active} selected={picks[active]} readOnly={readOnly} onSelectedChange={(values) => setPicks(active, values)} bare />
            ) : null}
          </OverlayMenu>
        </div>
      </div>
    </div>
  );
}
