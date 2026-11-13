"use client";

import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode, type RefObject } from "react";
import { Icon } from "../icons";
import { type DataColumn, type DataTextDisplay, type DataTextSize } from "./DataTable";
import { DEPARTMENTS, DepartmentChip } from "./DepartmentChip";
import { Status, Urgency } from "./Feedback";
import { OverlayMenu } from "./OverlayMenu";
import { Person } from "./People";

/** Chip label sits this far inside the chip. Headers line up with the label, not the chip edge. */
export const CHIP_LABEL_INSET = 4;

export const STATUS_OPTIONS = ["open", "progress", "complete"] as const;
export const URGENCY_OPTIONS = ["urgent", "high", "standard", "low"] as const;
export type StatusValue = (typeof STATUS_OPTIONS)[number];
export type UrgencyValue = (typeof URGENCY_OPTIONS)[number];

export const taskQuietStyle: CSSProperties = {
  background: "transparent",
  padding: 0,
  height: "auto",
  gap: 6,
  position: "relative",
  top: 0,
  alignSelf: "center",
};

function chipStyle(keepShadow = false): CSSProperties {
  return {
    display: "inline-flex",
    alignItems: "center",
    gap: 0,
    width: "max-content",
    maxWidth: "100%",
    boxSizing: "border-box",
    height: 20,
    minHeight: 20,
    margin: 0,
    padding: "2px 4px",
    lineHeight: "16px",
    borderRadius: 4,
    ...(keepShadow ? {} : { boxShadow: "none" }),
    justifyContent: "flex-start",
    textAlign: "left",
    position: "relative",
    top: 0,
    alignSelf: "flex-start",
  };
}

/** Detail fields keep the chevron visible. Table chips still reveal it on hover. */
function useDetailChevron(ref: RefObject<HTMLElement | null>) {
  const [inDetail, setInDetail] = useState(false);
  useLayoutEffect(() => {
    setInDetail(Boolean(ref.current?.closest(".todo-side")));
  }, [ref]);
  return inDetail;
}

function chevronStyle(shown: boolean, open = false, inset = 4): CSSProperties {
  return {
    width: shown ? 10 : 0,
    height: 10,
    minWidth: shown ? 10 : 0,
    maxWidth: shown ? 10 : 0,
    flex: "none",
    margin: 0,
    marginInlineStart: shown ? inset : 0,
    overflow: "hidden",
    opacity: shown ? 1 : 0,
    color: "var(--black-50)",
    pointerEvents: "none",
    transform: open ? "rotate(180deg)" : undefined,
  };
}

const clip: CSSProperties = {
  minWidth: 0,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

export function useTaskChipFill(surface: "row" | "panel" = "row") {
  const [fill, setFill] = useState(surface === "panel" ? "var(--sidebar-grey)" : "var(--grey)");
  useEffect(() => {
    const read = () => {
      const dark = document.documentElement.dataset.theme === "dark";
      setFill(surface === "panel" ? (dark ? "var(--grey)" : "var(--sidebar-grey)") : dark ? "var(--black-12)" : "var(--grey)");
    };
    read();
    const observer = new MutationObserver(read);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, [surface]);
  return fill;
}

export type TableMenu = {
  isOpen: (rowId: string, field: string) => boolean;
  toggle: (rowId: string, field: string) => void;
};

export function useTableMenu(): TableMenu {
  const [open, setOpen] = useState<{ rowId: string; field: string } | null>(null);
  return {
    isOpen: (rowId, field) => open?.rowId === rowId && open.field === field,
    toggle: (rowId, field) => setOpen((current) => (current?.rowId === rowId && current.field === field ? null : { rowId, field })),
  };
}

/** Chip-style dropdown shared by Status, Room, Urgency, and Type. The menu overlays the page. */
export function TableChip({
  open,
  onToggle,
  className,
  dataType,
  children,
  menu,
  style,
}: {
  open: boolean;
  onToggle: () => void;
  fill?: string;
  className?: string;
  dataType?: string;
  children: ReactNode;
  menu: ReactNode;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const [hot, setHot] = useState(false);
  const inDetail = useDetailChevron(ref);
  const shown = inDetail || hot || open;

  useEffect(() => {
    if (!open) return;
    const close = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (ref.current?.contains(target) || (target instanceof Element && target.closest(".menu"))) return;
      onToggle();
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onToggle();
    };
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onToggle]);

  return (
    <>
      <button
        ref={ref}
        type="button"
        className={["sheet-chip", className].filter(Boolean).join(" ")}
        data-type={dataType}
        aria-haspopup="menu"
        aria-expanded={open}
        style={{ ...chipStyle(className === "sheet-type"), ...style }}
        onPointerDown={(event) => event.stopPropagation()}
        onMouseEnter={() => setHot(true)}
        onMouseLeave={() => setHot(false)}
        onClick={onToggle}
      >
        {children}
        <span className="sheet-chevron" style={chevronStyle(shown, open)}>
          <Icon name="chevron" size={10} />
        </span>
      </button>
      <OverlayMenu open={open} anchorRef={ref} onPointerDown={(event) => event.stopPropagation()}>
        {menu}
      </OverlayMenu>
    </>
  );
}

export const ChipDropdown = TableChip;

export function taskMenuItem(key: string, selected: boolean, onPick: () => void, children: ReactNode) {
  return (
    <button key={key} className="menu-item" type="button" role="menuitemradio" aria-checked={selected} onClick={onPick}>
      {children}
      <Icon name="check" size={14} className="check" />
    </button>
  );
}

function measureChip(id: string, node: ReactNode, className?: string) {
  return (
    <span data-col={id} className={className} style={chipStyle(className === "sheet-type")}>
      {node}
      <span className="sheet-chevron" style={chevronStyle(true)}>
        <Icon name="chevron" size={10} />
      </span>
    </span>
  );
}

type ChipCellProps<V extends string> = {
  value?: V;
  defaultValue?: V;
  options: readonly V[];
  open?: boolean;
  onToggle?: () => void;
  onChange?: (value: V) => void;
  editable?: boolean;
  className?: string;
  dataType?: string;
  renderValue: (value: V) => ReactNode;
  renderOption?: (value: V) => ReactNode;
  dataTypeFor?: (value: V) => string | undefined;
};

function ChipCell<V extends string>({
  value,
  defaultValue,
  options,
  open: openProp,
  onToggle,
  onChange,
  editable = true,
  className,
  dataType,
  renderValue,
  renderOption,
  dataTypeFor,
}: ChipCellProps<V>) {
  const controlledValue = value !== undefined;
  const [inner, setInner] = useState<V>(value ?? defaultValue ?? options[0]);
  const current = controlledValue ? value : inner;
  const controlledOpen = onToggle !== undefined;
  const [localOpen, setLocalOpen] = useState(false);
  const open = controlledOpen ? Boolean(openProp) : localOpen;
  const fill = useTaskChipFill();
  const toggle = () => {
    if (!editable) return;
    if (controlledOpen) onToggle();
    else setLocalOpen((next) => !next);
  };
  const pick = (next: V) => {
    if (!controlledValue) setInner(next);
    onChange?.(next);
    if (controlledOpen) onToggle();
    else setLocalOpen(false);
  };
  const label = renderValue(current);
  const roomQuiet = className?.includes("sheet-room") && !current ? "cell-quiet" : "";
  const chipClass = [className, roomQuiet].filter(Boolean).join(" ");
  if (!editable) return <span className={chipClass} style={chipStyle(className === "sheet-type")}>{label}</span>;
  return (
    <ChipDropdown
      open={open}
      onToggle={toggle}
      fill={fill}
      className={chipClass}
      dataType={dataTypeFor?.(current) ?? dataType}
      menu={options.map((option) => taskMenuItem(option, option === current, () => pick(option), renderOption ? renderOption(option) : renderValue(option)))}
    >
      {label}
    </ChipDropdown>
  );
}

export function StatusCell({
  value,
  defaultValue,
  options = STATUS_OPTIONS,
  open,
  onToggle,
  onChange,
  editable = true,
}: {
  value?: StatusValue;
  defaultValue?: StatusValue;
  options?: readonly StatusValue[];
  open?: boolean;
  onToggle?: () => void;
  onChange?: (value: StatusValue) => void;
  editable?: boolean;
}) {
  return (
    <ChipCell
      value={value}
      defaultValue={defaultValue}
      options={options}
      open={open}
      onToggle={onToggle}
      onChange={onChange}
      editable={editable}
      renderValue={(status) => <Status status={status} />}
    />
  );
}

export function RoomCell({
  value,
  defaultValue,
  onChange,
  editable = true,
}: {
  value?: string;
  defaultValue?: string;
  /** Kept so existing callers still compile. The number is typed. */
  options?: readonly string[];
  open?: boolean;
  onToggle?: () => void;
  onChange?: (value: string) => void;
  editable?: boolean;
}) {
  const controlled = value !== undefined;
  const [inner, setInner] = useState(defaultValue ?? "");
  const current = controlled ? (value ?? "") : inner;
  const quiet = current ? "" : " cell-quiet";
  if (!editable) return <span className={`sheet-room${quiet}`}>{current || "—"}</span>;
  return (
    <input
      className={`sheet-room${quiet}`}
      aria-label="Room"
      value={current}
      placeholder="—"
      onPointerDown={(event) => event.stopPropagation()}
      onClick={(event) => event.stopPropagation()}
      onChange={(event) => {
        const next = event.target.value;
        if (!controlled) setInner(next);
        onChange?.(next);
      }}
    />
  );
}

export function UrgencyCell({
  value,
  defaultValue,
  options = URGENCY_OPTIONS,
  open,
  onToggle,
  onChange,
  editable = true,
}: {
  value?: UrgencyValue;
  defaultValue?: UrgencyValue;
  options?: readonly UrgencyValue[];
  open?: boolean;
  onToggle?: () => void;
  onChange?: (value: UrgencyValue) => void;
  editable?: boolean;
}) {
  return (
    <ChipCell
      value={value}
      defaultValue={defaultValue}
      options={options}
      open={open}
      onToggle={onToggle}
      onChange={onChange}
      editable={editable}
      renderValue={(level) => <Urgency level={level} style={taskQuietStyle} />}
    />
  );
}

export function TypeCell({
  value,
  defaultValue,
  options = DEPARTMENTS.map((item) => item.value),
  open,
  onToggle,
  onChange,
  editable = true,
}: {
  value?: string;
  defaultValue?: string;
  options?: readonly string[];
  open?: boolean;
  onToggle?: () => void;
  onChange?: (value: string) => void;
  editable?: boolean;
}) {
  return (
    <ChipCell
      value={value}
      defaultValue={defaultValue}
      options={options}
      open={open}
      onToggle={onToggle}
      onChange={onChange}
      editable={editable}
      className="sheet-type"
      dataTypeFor={(name) => DEPARTMENTS.find((item) => item.value === name || item.dept === name)?.dept}
      renderValue={(name) => {
        const label = DEPARTMENTS.find((item) => item.value === name || item.dept === name)?.value;
        return <span style={label ? undefined : { color: "var(--black-50)" }}>{label || "Type"}</span>;
      }}
      renderOption={(name) => <DepartmentChip name={name} plain />}
    />
  );
}

export type AssigneePerson = {
  name: string;
  avatar: string;
  fullName: string;
};

export const ASSIGNEE_PEOPLE: readonly AssigneePerson[] = [
  { name: "Mark", avatar: "MJ", fullName: "Mark" },
  { name: "Paul", avatar: "PG", fullName: "Paul" },
  { name: "Boris", avatar: "B", fullName: "Boris" },
  { name: "Sarah", avatar: "SM", fullName: "Sarah" },
];

const UNASSIGNED = "unassigned";

function isUnassigned(value: string) {
  return value === UNASSIGNED || value === "Unassigned" || value.trim() === "";
}

function assigneeRoster(value: string, initials: string | undefined, people: readonly AssigneePerson[]) {
  const list = people.filter((person) => !isUnassigned(person.name));
  if (!isUnassigned(value) && !list.some((person) => person.name === value)) {
    return [{ name: value, avatar: initials ?? "", fullName: value }, ...list];
  }
  return [...list];
}

function revealAssigneeTip(host: HTMLElement) {
  const tip = host.querySelector<HTMLElement>(".tip");
  if (!tip) return;
  const gap = Number.parseFloat(getComputedStyle(host).getPropertyValue("--tip-gap")) || 8;
  const anchor = host.querySelector(".avatar") ?? host;
  const box = anchor.getBoundingClientRect();
  tip.style.position = "fixed";
  tip.style.left = `${box.left + box.width / 2}px`;
  tip.style.top = `${box.top - gap}px`;
  tip.style.transform = "translate(-50%, -100%)";
  try {
    if (!tip.matches(":popover-open")) tip.showPopover();
  } catch {
    // The tip can already be opening as the pointer crosses the circle.
  }
}

function hideAssigneeTip(host: HTMLElement | null) {
  const tip = host?.querySelector<HTMLElement>(".tip");
  if (!tip?.matches(":popover-open")) return;
  try {
    tip.hidePopover();
  } catch {
    // The tip can already be closed when the pointer leaves.
  }
}

function useAssigneeChoice(value: string, isOpen: boolean | undefined, onOpenChange?: (isOpen: boolean) => void) {
  const [current, setCurrent] = useState(value);
  const [localOpen, setLocalOpen] = useState(false);
  const open = isOpen ?? localOpen;
  const ref = useRef<HTMLButtonElement>(null);
  const openRef = useRef(open);
  const onOpenChangeRef = useRef(onOpenChange);
  openRef.current = open;
  onOpenChangeRef.current = onOpenChange;
  const controlled = isOpen !== undefined;

  useEffect(() => {
    setCurrent(value);
  }, [value]);

  const setOpen = (next: boolean) => {
    if (!controlled) setLocalOpen(next);
    if (next !== openRef.current) onOpenChangeRef.current?.(next);
  };
  const setOpenRef = useRef(setOpen);
  setOpenRef.current = setOpen;

  useEffect(() => {
    if (!open) return;
    const close = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (ref.current?.contains(target) || (target instanceof Element && target.closest(".menu"))) return;
      setOpenRef.current(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpenRef.current(false);
    };
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return { current, setCurrent, open, setOpen, ref };
}

function AssigneeChoices({
  open,
  anchorRef,
  roster,
  current,
  onPick,
}: {
  open: boolean;
  anchorRef: RefObject<HTMLButtonElement | null>;
  roster: readonly AssigneePerson[];
  current: string;
  onPick: (value: string) => void;
}) {
  const empty = isUnassigned(current);
  return (
    <OverlayMenu open={open} anchorRef={anchorRef} label="Assigned" onPointerDown={(event) => event.stopPropagation()}>
      {[
        taskMenuItem(UNASSIGNED, empty, () => onPick(UNASSIGNED), <Person name="Unassigned" variant="unassigned" />),
        ...roster.map((person) =>
          taskMenuItem(
            person.name,
            person.name === current,
            () => onPick(person.name),
            <Person name={person.name} initials={person.avatar} variant="pill" />,
          ),
        ),
      ]}
    </OverlayMenu>
  );
}

export function AssignedDropdown({
  people = ASSIGNEE_PEOPLE,
  value = UNASSIGNED,
  initials,
  isOpen,
  onSelect,
  onOpenChange,
  style,
}: {
  people?: readonly AssigneePerson[];
  value?: string;
  /** Initials for a value that is not already in people. */
  initials?: string;
  isOpen?: boolean;
  onSelect?: (value: string) => void;
  onOpenChange?: (isOpen: boolean) => void;
  style?: CSSProperties;
}) {
  const roster = assigneeRoster(value, initials, people);
  const { current, setCurrent, open, setOpen, ref } = useAssigneeChoice(value, isOpen, onOpenChange);
  const empty = isUnassigned(current);
  const person = roster.find((item) => item.name === current);
  const avatar = empty ? "" : (person?.avatar ?? initials ?? "");
  const tip = empty ? "Unassigned" : (person?.fullName ?? current);
  const pick = (next: string) => {
    setCurrent(next);
    onSelect?.(next);
    setOpen(false);
  };

  useEffect(() => {
    const host = ref.current;
    if (!host) return;
    const place = () => {
      if (host.matches(":hover, :focus-visible")) revealAssigneeTip(host);
    };
    window.addEventListener("scroll", place, true);
    window.addEventListener("resize", place);
    return () => {
      window.removeEventListener("scroll", place, true);
      window.removeEventListener("resize", place);
    };
  }, [ref]);

  return (
    <>
      <button
        ref={ref}
        className={["sheet-who", "tip-host", empty ? "is-empty" : ""].filter(Boolean).join(" ")}
        type="button"
        aria-label={tip}
        aria-haspopup="menu"
        aria-expanded={open}
        style={style}
        onPointerDown={(event) => event.stopPropagation()}
        onClick={(event) => {
          event.stopPropagation();
          setOpen(!open);
        }}
        onPointerEnter={() => {
          if (ref.current) revealAssigneeTip(ref.current);
        }}
        onPointerLeave={(event) => {
          const host = ref.current;
          const next = event.relatedTarget;
          if (host && next instanceof Node && host.contains(next)) return;
          hideAssigneeTip(host);
        }}
        onFocus={() => {
          if (ref.current) revealAssigneeTip(ref.current);
        }}
        onBlur={() => hideAssigneeTip(ref.current)}
      >
        <span className={["mini-pill", empty ? "is-empty" : ""].filter(Boolean).join(" ")}>
          <span className={["avatar", "mini", empty ? "is-empty" : ""].filter(Boolean).join(" ")}>{empty ? null : avatar}</span>
          <span className="who-name">{tip}</span>
          <Icon name="chevron" size={10} className="sheet-edit" />
        </span>
        <span className="tip" popover="manual">
          {tip}
        </span>
      </button>
      <AssigneeChoices open={open} anchorRef={ref} roster={roster} current={current} onPick={pick} />
    </>
  );
}

function NamedAssignee({
  name,
  initials,
  people = ASSIGNEE_PEOPLE,
  isOpen,
  onSelect,
  onOpenChange,
  style,
}: {
  name: string;
  initials: string;
  people?: readonly AssigneePerson[];
  isOpen?: boolean;
  onSelect?: (value: string) => void;
  onOpenChange?: (isOpen: boolean) => void;
  style?: CSSProperties;
}) {
  const value = name || UNASSIGNED;
  const roster = assigneeRoster(value, initials, people);
  const choice = useAssigneeChoice(value, isOpen, onOpenChange);
  const [hot, setHot] = useState(false);
  const inDetail = useDetailChevron(choice.ref);
  const empty = isUnassigned(choice.current);
  const person = roster.find((item) => item.name === choice.current);
  const avatar = empty ? "" : (person?.avatar ?? initials);
  const label = empty ? "Unassigned" : (person?.name ?? choice.current);
  const pick = (next: string) => {
    choice.setCurrent(next);
    onSelect?.(next);
    choice.setOpen(false);
  };
  return (
    <>
      <button
        ref={choice.ref}
        className={["mini-pill", empty ? "is-empty" : ""].filter(Boolean).join(" ")}
        type="button"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={choice.open}
        style={{ width: "max-content", maxWidth: "100%", justifySelf: "start", gap: 6, height: 20, padding: "2px 4px", borderRadius: 4, fontWeight: 400, ...style }}
        onPointerDown={(event) => event.stopPropagation()}
        onMouseEnter={() => setHot(true)}
        onMouseLeave={() => setHot(false)}
        onClick={(event) => {
          event.stopPropagation();
          choice.setOpen(!choice.open);
        }}
      >
        <span className={["avatar", "mini", empty ? "is-empty" : ""].filter(Boolean).join(" ")}>{empty ? null : avatar}</span>
        <span>{label}</span>
        {/* The pill already gaps 6px. Detail chevrons sit 4px from the label, so pull this one back 2px. */}
        <span className="sheet-chevron" style={chevronStyle(inDetail || hot || choice.open, choice.open, inDetail ? -2 : 4)}>
          <Icon name="chevron" size={10} />
        </span>
      </button>
      <AssigneeChoices open={choice.open} anchorRef={choice.ref} roster={roster} current={choice.current} onPick={pick} />
    </>
  );
}

export function TaskAssignee({
  name,
  initials,
  named = false,
  people,
  isOpen,
  onSelect,
  onOpenChange,
  style,
}: {
  name: string;
  initials: string;
  named?: boolean;
  people?: readonly AssigneePerson[];
  isOpen?: boolean;
  onSelect?: (value: string) => void;
  onOpenChange?: (isOpen: boolean) => void;
  style?: CSSProperties;
}) {
  if (named) {
    return <NamedAssignee name={name} initials={initials} people={people} isOpen={isOpen} onSelect={onSelect} onOpenChange={onOpenChange} style={style} />;
  }
  return (
    <AssignedDropdown
      people={people}
      value={name || UNASSIGNED}
      initials={initials}
      isOpen={isOpen}
      onSelect={onSelect}
      onOpenChange={onOpenChange}
      style={style}
    />
  );
}

export function AssigneeCell({
  name,
  initials,
  named = false,
  people,
  isOpen,
  onSelect,
  onOpenChange,
}: {
  name: string;
  initials: string;
  named?: boolean;
  people?: readonly AssigneePerson[];
  isOpen?: boolean;
  onSelect?: (value: string) => void;
  onOpenChange?: (isOpen: boolean) => void;
}) {
  return <TaskAssignee name={name} initials={initials} named={named} people={people} isOpen={isOpen} onSelect={onSelect} onOpenChange={onOpenChange} />;
}

export function DateCell({ value, accessory }: { value: ReactNode; accessory?: ReactNode }) {
  return (
    <span className="col-reserve" style={{ display: "inline-grid", width: "100%", alignItems: "center" }}>
      <span className="sheet-when" style={{ display: "block", ...clip, textAlign: "left" }}>{value}</span>
      {accessory}
    </span>
  );
}

type ColumnAccess<T> = {
  id?: string;
  title?: string;
  sortable?: boolean;
  rowId?: (row: T) => string;
  menu?: TableMenu;
  editable?: boolean | ((row: T) => boolean);
};

function bindMenu<T>(menu: TableMenu | undefined, rowId: ((row: T) => string) | undefined, field: string, row: T) {
  if (!menu || !rowId) return {};
  const id = rowId(row);
  return { open: menu.isOpen(id, field), onToggle: () => menu.toggle(id, field) };
}

function canEdit<T>(editable: boolean | ((row: T) => boolean) | undefined, row: T) {
  if (typeof editable === "function") return editable(row);
  return editable !== false;
}

export function statusColumn<T>(config: ColumnAccess<T> & { value: (row: T) => StatusValue; onChange?: (row: T, value: StatusValue) => void; options?: readonly StatusValue[] }): DataColumn<T> {
  const id = config.id ?? "status";
  const options = config.options ?? STATUS_OPTIONS;
  return {
    id,
    title: config.title ?? "Status",
    role: "status",
    labelInset: CHIP_LABEL_INSET,
    sortable: config.sortable,
    sortValue: (row) => config.value(row),
    minContent: <>{options.map((option) => <span key={option}>{measureChip(id, <Status status={option} />)}</span>)}</>,
    render: (row) => (
      <StatusCell
        defaultValue={config.value(row)}
        options={options}
        editable={canEdit(config.editable, row)}
        onChange={config.onChange ? (next) => config.onChange?.(row, next) : undefined}
        {...bindMenu(config.menu, config.rowId, id, row)}
      />
    ),
  };
}

export function roomColumn<T>(config: ColumnAccess<T> & { value: (row: T) => string; options: readonly string[]; onChange?: (row: T, value: string) => void }): DataColumn<T> {
  const id = config.id ?? "room";
  return {
    id,
    title: config.title ?? "Room",
    sortable: config.sortable,
    sortValue: (row) => config.value(row),
    minContent: (
      <>
        {config.options.map((option) => (
          <span key={option} data-col={id} className="sheet-room">
            {option}
          </span>
        ))}
      </>
    ),
    render: (row) => (
      <RoomCell
        value={config.onChange ? config.value(row) : undefined}
        defaultValue={config.value(row)}
        editable={canEdit(config.editable, row)}
        onChange={config.onChange ? (next) => config.onChange?.(row, next) : undefined}
      />
    ),
  };
}

export function urgencyColumn<T>(config: ColumnAccess<T> & { value: (row: T) => UrgencyValue; onChange?: (row: T, value: UrgencyValue) => void; options?: readonly UrgencyValue[] }): DataColumn<T> {
  const id = config.id ?? "urgency";
  const options = config.options ?? URGENCY_OPTIONS;
  return {
    id,
    title: config.title ?? "Urgency",
    labelInset: CHIP_LABEL_INSET,
    sortable: config.sortable,
    sortValue: (row) => config.value(row),
    minContent: <>{options.map((option) => <span key={option}>{measureChip(id, <Urgency level={option} style={taskQuietStyle} />)}</span>)}</>,
    render: (row) => (
      <UrgencyCell
        defaultValue={config.value(row)}
        options={options}
        editable={canEdit(config.editable, row)}
        onChange={config.onChange ? (next) => config.onChange?.(row, next) : undefined}
        {...bindMenu(config.menu, config.rowId, id, row)}
      />
    ),
  };
}

export function typeColumn<T>(config: ColumnAccess<T> & { value: (row: T) => string; onChange?: (row: T, value: string) => void; options?: readonly string[] }): DataColumn<T> {
  const id = config.id ?? "type";
  const options = config.options ?? DEPARTMENTS.map((item) => item.value);
  return {
    id,
    title: config.title ?? "Type",
    labelInset: CHIP_LABEL_INSET,
    sortable: config.sortable,
    sortValue: (row) => config.value(row),
    minContent: <>{options.map((option) => <span key={option}>{measureChip(id, <span>{option}</span>, "sheet-type")}</span>)}</>,
    render: (row) => (
      <TypeCell
        defaultValue={config.value(row)}
        options={options}
        editable={canEdit(config.editable, row)}
        onChange={config.onChange ? (next) => config.onChange?.(row, next) : undefined}
        {...bindMenu(config.menu, config.rowId, id, row)}
      />
    ),
  };
}

export function assigneeColumn<T>(config: ColumnAccess<T> & { named?: boolean; people?: readonly AssigneePerson[]; value: (row: T) => { name: string; initials: string }; onChange?: (row: T, value: string) => void }): DataColumn<T> {
  const named = config.named ?? false;
  const id = config.id ?? "assignee";
  return {
    id,
    title: config.title ?? "Assigned",
    labelInset: named ? CHIP_LABEL_INSET : 0,
    sortable: config.sortable,
    sortValue: (row) => config.value(row).name,
    measure: (row) => {
      const person = config.value(row);
      const mark = person.initials || "MJ";
      return (
        <span className="sheet-who">
          <span className="mini-pill">
            <span className="avatar mini">{mark}</span>
          </span>
        </span>
      );
    },
    render: (row) => {
      const person = config.value(row);
      const bound = bindMenu(config.menu, config.rowId, id, row);
      return (
        <AssigneeCell
          name={person.name}
          initials={person.initials}
          named={named}
          people={config.people}
          isOpen={bound.open}
          onOpenChange={bound.onToggle}
          onSelect={config.onChange ? (next) => config.onChange?.(row, next) : undefined}
        />
      );
    },
  };
}

export function dateColumn<T>(config: {
  id?: string;
  title?: string;
  sortable?: boolean;
  value: (row: T) => string;
  accessory?: (row: T) => ReactNode;
  accessoryWidth?: number;
}): DataColumn<T> {
  const extra = config.accessoryWidth ?? 0;
  return {
    id: config.id ?? "date",
    title: config.title ?? "Opened",
    sortable: config.sortable,
    sortValue: (row) => config.value(row),
    measure: (row) => (
      <span className="sheet-when" style={{ display: "inline-block", paddingInlineEnd: extra, whiteSpace: "nowrap" }}>{config.value(row)}</span>
    ),
    render: (row) => <DateCell value={config.value(row)} accessory={config.accessory?.(row)} />,
  };
}

export function textColumn<T>(config: {
  id: string;
  title: string;
  value: (row: T) => string;
  /** Short text is 160px. A title or description is primary and grows from 320px. */
  size?: DataTextSize;
  /** Replaces the shared default. The value is the full column, including both 12px paddings. */
  minWidth?: number;
  textDisplay?: DataTextDisplay;
  flex?: boolean;
  className?: string;
  /** Muted stand-in when the cell text is empty. */
  emptyLabel?: string;
  sortable?: boolean;
  labelInset?: number;
}): DataColumn<T> {
  const size = config.size ?? "short";
  const wrap = config.textDisplay === "wrap";
  return {
    id: config.id,
    title: config.title,
    text: size,
    textDisplay: config.textDisplay,
    lines: 1,
    flex: size === "primary" || config.flex,
    minWidth: config.minWidth,
    labelInset: config.labelInset,
    sortable: config.sortable,
    sortValue: (row) => config.value(row),
    render: (row) => {
      const text = config.value(row);
      return (
        <span
          className={config.className}
          style={wrap ? { minWidth: 0, overflowWrap: "anywhere", whiteSpace: "normal" } : clip}
        >
          {text || (config.emptyLabel ? <span style={{ color: "var(--black-50)" }}>{config.emptyLabel}</span> : null)}
        </span>
      );
    },
  };
}

export type { DepartmentValue } from "./DepartmentChip";
