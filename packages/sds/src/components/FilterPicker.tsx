"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { Icon } from "../icons";
import { OverlayMenu } from "./OverlayMenu";

export type FilterChoices = {
  options: readonly { value: string; label: string; content?: ReactNode }[];
  selected: readonly string[];
  onSelectedChange?: (values: string[]) => void;
  mode?: "multiple" | "single" | "single-toggle";
};

export function FilterOptions({ options, selected, onSelectedChange, mode = "multiple" }: FilterChoices) {
  return <>{options.map(({ value, label, content }) => {
    const checked = selected.includes(value);
    return <button key={value} type="button" className="menu-item"
      role={mode === "multiple" ? "menuitemcheckbox" : "menuitemradio"} aria-checked={checked}
      onClick={() => {
        if (mode === "multiple") onSelectedChange?.(checked ? selected.filter(item => item !== value) : [...selected, value]);
        else onSelectedChange?.(mode === "single-toggle" && checked ? [] : [value]);
      }}>
      {content ?? label}<Icon name="check" size={14} className="check" />
    </button>;
  })}</>;
}

type FilterBranch = FilterChoices & { id: string; label: string };

export function FilterPicker({ groups, sections, compact = false, triggerClassName, open, onOpenChange, branch, onBranchChange, readOnly }: {
  groups?: readonly FilterBranch[];
  sections?: readonly FilterChoices[];
  compact?: boolean;
  triggerClassName?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  branch?: string | null;
  onBranchChange?: (branch: string | null) => void;
  readOnly?: boolean;
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [internalBranch, setInternalBranch] = useState<string | null>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const branchAnchor = useRef<HTMLButtonElement>(null);
  const marker = useId();
  const shown = open ?? internalOpen;
  const currentBranch = branch === undefined ? internalBranch : branch;
  const active = groups?.find(group => group.id === currentBranch);

  function setOpen(next: boolean) {
    if (readOnly) return;
    if (open === undefined) setInternalOpen(next);
    onOpenChange?.(next);
  }

  function setBranch(next: string | null) {
    if (readOnly) return;
    if (branch === undefined) setInternalBranch(next);
    onBranchChange?.(next);
  }

  useEffect(() => {
    if (!shown || readOnly) return;
    function close() {
      if (open === undefined) setInternalOpen(false);
      onOpenChange?.(false);
    }
    function onPointer(event: PointerEvent) {
      const target = event.target;
      if (target instanceof Element && !trigger.current?.contains(target) && !target.closest(`[data-menu="${marker}"]`)) close();
    }
    function onKey(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      close();
      trigger.current?.focus();
    }
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [shown, readOnly, open, onOpenChange, marker]);

  return <div className={shown ? "sds drop is-open" : "sds drop"}>
    <button ref={trigger} type="button" className={["trigger", triggerClassName].filter(Boolean).join(" ")}
      aria-haspopup="menu" aria-label="Filters" aria-expanded={shown} onClick={() => { setOpen(!shown); setBranch(null); }}>
      {compact ? <Icon name="filter" size={14} /> : <span className="pair"><Icon name="filter" size={14} /><span className="fit-label">Filters</span></span>}
      <Icon name="chevron" size={14} />
    </button>
    <OverlayMenu open={shown} anchorRef={trigger} className={groups ? "filter-menu" : undefined} label="Filters" marker={marker}>
      {sections?.map((section, index) => <div key={index}>
        {index > 0 && <div className="menu-rule" role="separator" />}
        <FilterOptions {...section} />
      </div>)}
      {groups?.map(group => <div key={group.id} className={active === group ? "menu-branch is-open" : "menu-branch"} onMouseEnter={() => setBranch(group.id)}>
        <button ref={active === group ? branchAnchor : undefined} className="menu-item" type="button"
          role="menuitem" aria-haspopup="menu" aria-expanded={active === group} onClick={() => setBranch(group.id)}>
          {group.label}<Icon name="chevron" size={14} className="menu-next" />
        </button>
      </div>)}
    </OverlayMenu>
    {active && <OverlayMenu open={shown} anchorRef={branchAnchor} className="filter-sub" label={active.label} placement="side" marker={marker}>
      <FilterOptions {...active} />
    </OverlayMenu>}
  </div>;
}
