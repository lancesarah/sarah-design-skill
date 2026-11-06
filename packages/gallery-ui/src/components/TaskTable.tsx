"use client";

import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { DataTable, type DataColumn } from "./DataTable";
import { Icon } from "../icons";
import { Chip } from "./Chip";
import { TitleSubtitle, type TitleDropdownValue } from "./TitleSubtitle";
import {
  CHIP_LABEL_INSET,
  assigneeColumn,
  dateColumn,
  roomColumn,
  statusColumn,
  textColumn,
  typeColumn,
  urgencyColumn,
  useTableMenu,
  type TableMenu,
} from "./table-columns";

export {
  AssigneeCell,
  ChipDropdown,
  DateCell,
  RoomCell,
  StatusCell,
  TableChip,
  TaskAssignee,
  TypeCell,
  UrgencyCell,
  assigneeColumn,
  dateColumn,
  roomColumn,
  statusColumn,
  taskMenuItem,
  taskQuietStyle,
  textColumn,
  typeColumn,
  urgencyColumn,
  useTableMenu,
  useTaskChipFill,
} from "./table-columns";

export type TaskActivity = {
  initials: string;
  name: string;
  text?: string;
  time?: string;
  done?: boolean;
  assignee?: string;
  assigneeInitials?: string;
};

export type TaskRow = {
  id: string;
  room: string;
  note: string;
  title?: string;
  place?: string;
  item?: string;
  guest?: string;
  email?: string;
  mood?: string;
  description?: string;
  satisfaction?: string;
  resolution?: string;
  views?: number;
  activity?: TaskActivity[];
  type: string;
  urgency: "urgent" | "high" | "standard" | "low";
  status: "open" | "progress" | "complete";
  assignee: string;
  initials: string;
  opened: string;
};

export type TaskTableLayout = "todo" | "complaint";

export type TaskTableProps = {
  hover?: boolean;
  chips?: Array<{ name: string; value: string }>;
  rows?: TaskRow[];
  total?: number;
  selectedId?: string | null;
  onRowClick?: (row: TaskRow) => void;
  onRowContextMenu?: (row: TaskRow, point: { x: number; y: number }) => void;
  onDelete?: (row: TaskRow) => void;
  deleteNoun?: string;
  rowName?: (row: TaskRow) => string;
  onAssigneeChange?: (row: TaskRow, value: string) => void;
  /** Complaint rows are Room, Guest, Complaint, Urgency, Status, Assigned, Completed. */
  layout?: TaskTableLayout;
  empty?: string;
  placeOptions?: readonly string[];
  itemOptions?: readonly string[];
  /** Location, item, and the note under the To-do title. Complaints use title, description, and guest. */
  onCopyChange?: (row: TaskRow, patch: { place?: string; item?: string; note?: string; title?: string; description?: string; guest?: string }) => void;
  /** Complaint titles that already exist. The detail and the table share this list. */
  titleOptions?: readonly string[];
  /** Room numbers that already exist. The detail and the table share this list. */
  roomOptions?: readonly string[];
  onRoomChange?: (row: TaskRow, value: string) => void;
  /** Row id that should expand in from zero height. */
  enteringId?: string | null;
};

const ROOMS = ["426", "244", "103", "436"];
const COMPLAINT_TITLES = ["Cleanliness", "Noise", "Maintenance", "Temperature", "Amenities", "Service", "Billing", "Other"];
const contentStyle: CSSProperties = {
  width: "max-content",
  maxWidth: "100%",
  height: 20,
  minWidth: 0,
  padding: "0 4px",
  justifyContent: "flex-start",
  textAlign: "left",
  overflow: "hidden",
};

export function TaskFact({ children, empty = false }: { children: ReactNode; empty?: boolean }) {
  return (
    <button className={empty ? "side-field is-empty" : "side-field"} type="button" style={contentStyle}>
      <span>{children}</span>
      <Icon name="chevron" size={10} className="sheet-edit" />
    </button>
  );
}

const SAMPLE_ROW: TaskRow = {
  id: "sample",
  room: "426",
  note: "Requested Feathered Pillows.",
  place: "Guestroom",
  item: "Pillows/Bedding",
  type: "Housekeeping",
  urgency: "high",
  status: "open",
  assignee: "Mark",
  initials: "MJ",
  opened: "now",
};

function withValue(value: string, options: readonly string[]) {
  if (!value || options.includes(value)) return options;
  return [value, ...options];
}

function GuestField({ value, onChange }: { value: string; onChange?: (value: string) => void }) {
  const [text, setText] = useState(value);
  useEffect(() => setText(value), [value]);
  return (
    <input
      className="sheet-guest"
      aria-label="Guest"
      placeholder="Guest"
      value={text}
      onPointerDown={(event) => event.stopPropagation()}
      onClick={(event) => event.stopPropagation()}
      onKeyDown={(event) => event.stopPropagation()}
      onChange={(event) => {
        setText(event.target.value);
        onChange?.(event.target.value);
      }}
    />
  );
}

function CopyCell({
  row,
  complaint,
  menu,
  places,
  items,
  titles,
  onCopyChange,
}: {
  row: TaskRow;
  complaint: boolean;
  menu: TableMenu;
  places: readonly string[];
  items: readonly string[];
  titles: readonly string[];
  onCopyChange?: TaskTableProps["onCopyChange"];
}) {
  const bind = (field: string) => ({
    open: menu.isOpen(row.id, field),
    onToggle: () => menu.toggle(row.id, field),
  });
  if (complaint) {
    const title = row.title || row.note;
    return (
      <TitleSubtitle
        variant="dropdown"
        title={{
          value: title,
          placeholder: "Complaint",
          options: withValue(title, titles),
          onChange: onCopyChange ? (value) => onCopyChange(row, { title: value }) : undefined,
          ...bind("title"),
        }}
        subtitle={row.description || ""}
        subtitleLabel="Detail"
        subtitlePlaceholder="Add a note"
        onSubtitleChange={onCopyChange ? (value) => onCopyChange(row, { description: value }) : undefined}
      />
    );
  }
  // An empty to-do reads Location and Item. Filled rows keep the chosen values.
  const place = row.place ?? "";
  const item = row.item ?? "";
  const parts: TitleDropdownValue[] = [
    { value: place, placeholder: "Location", options: withValue(place, places), onChange: (value) => onCopyChange?.(row, { place: value }), ...bind("place") },
    { value: item, placeholder: "Item", options: withValue(item, items), onChange: (value) => onCopyChange?.(row, { item: value }), ...bind("item") },
  ];
  return (
    <TitleSubtitle
      variant="dropdown"
      title={parts}
      subtitle={row.note}
      subtitleLabel="Note"
      subtitlePlaceholder="Add a note"
      onSubtitleChange={onCopyChange ? (value) => onCopyChange(row, { note: value }) : undefined}
    />
  );
}

function taskColumns(
  layout: TaskTableLayout,
  rooms: string[],
  menu: TableMenu,
  places: readonly string[],
  items: readonly string[],
  titles: readonly string[],
  onAssigneeChange?: (row: TaskRow, value: string) => void,
  onCopyChange?: TaskTableProps["onCopyChange"],
  onRoomChange?: TaskTableProps["onRoomChange"],
): Array<DataColumn<TaskRow>> {
  const complaint = layout === "complaint";
  const access = { rowId: (row: TaskRow) => row.id, menu };
  const status = statusColumn<TaskRow>({ ...access, value: (row) => row.status });
  const room = roomColumn<TaskRow>({ ...access, value: (row) => row.room, options: rooms, onChange: onRoomChange });
  const urgency = urgencyColumn<TaskRow>({ ...access, value: (row) => row.urgency });
  const type = typeColumn<TaskRow>({ ...access, value: (row) => row.type });
  const guest: DataColumn<TaskRow> = {
    id: "guest",
    title: "Guest",
    sortable: false,
    sortValue: (row) => row.guest ?? "",
    measure: (row) => row.guest || "Guest",
    render: (row) => <GuestField value={row.guest ?? ""} onChange={onCopyChange ? (value) => onCopyChange(row, { guest: value }) : undefined} />,
  };
  const assignee = assigneeColumn<TaskRow>({ ...access, value: (row) => ({ name: row.assignee, initials: row.initials }), onChange: onAssigneeChange });
  const opened = dateColumn<TaskRow>({
    id: "opened",
    title: complaint ? "Completed" : "Opened",
    value: (row) => row.opened,
  });
  const todo: DataColumn<TaskRow> = {
    id: "todo",
    title: complaint ? "Complaint" : "To-do",
    text: "primary",
    flex: true,
    minWidth: 200,
    labelInset: CHIP_LABEL_INSET,
    sortable: false,
    sortValue: (row) => (complaint ? row.title || row.note : row.note),
    render: (row) => <CopyCell row={row} complaint={complaint} menu={menu} places={places} items={items} titles={titles} onCopyChange={onCopyChange} />,
  };
  return complaint ? [room, guest, todo, urgency, status, assignee, opened] : [status, room, todo, urgency, type, assignee, opened];
}

function SheetGrid({
  hover = false,
  rows,
  total,
  selectedId,
  onRowClick,
  onRowContextMenu,
  onDelete,
  deleteNoun,
  rowName,
  layout = "todo",
  empty = "No to-dos",
  placeOptions,
  itemOptions,
  titleOptions,
  onAssigneeChange,
  onCopyChange,
  onRoomChange,
  roomOptions,
  enteringId,
}: {
  hover?: boolean;
  rows: TaskRow[];
  total?: number;
  selectedId?: string | null;
  onRowClick?: (row: TaskRow) => void;
  onRowContextMenu?: (row: TaskRow, point: { x: number; y: number }) => void;
  onDelete?: (row: TaskRow) => void;
  deleteNoun?: string;
  rowName?: (row: TaskRow) => string;
  layout?: TaskTableLayout;
  empty?: string;
  placeOptions?: readonly string[];
  itemOptions?: readonly string[];
  titleOptions?: readonly string[];
  onAssigneeChange?: (row: TaskRow, value: string) => void;
  onCopyChange?: TaskTableProps["onCopyChange"];
  onRoomChange?: TaskTableProps["onRoomChange"];
  roomOptions?: readonly string[];
  enteringId?: string | null;
}) {
  const menu = useTableMenu();
  const listed = roomOptions ?? (layout === "complaint" ? [] : ROOMS);
  const rooms = Array.from(new Set([...listed, ...rows.map((row) => row.room)])).filter(Boolean);
  const places = placeOptions ?? Array.from(new Set(rows.map((row) => row.place).filter((value): value is string => Boolean(value))));
  const items = itemOptions ?? Array.from(new Set(rows.map((row) => row.item).filter((value): value is string => Boolean(value))));
  const titles = titleOptions ?? COMPLAINT_TITLES;
  const columns = taskColumns(layout, rooms, menu, places, items, titles, onAssigneeChange, onCopyChange, onRoomChange);
  return (
    <DataTable
      columns={columns}
      rows={rows}
      total={total}
      empty={empty}
      selectedId={selectedId}
      onRowClick={onRowClick}
      onRowContextMenu={onRowContextMenu}
      onDelete={onDelete}
      deleteNoun={deleteNoun}
      rowName={rowName}
      hoveredId={hover ? rows[0]?.id : null}
      enteringId={enteringId}
      interactive
    />
  );
}


export function TaskTable({ hover = false, chips = [], rows, total, selectedId, onRowClick, onRowContextMenu, onDelete, deleteNoun, rowName, onAssigneeChange, onCopyChange, onRoomChange, layout = "todo", empty, placeOptions, itemOptions, titleOptions, roomOptions, enteringId }: TaskTableProps) {
  if (rows) {
    const all = total ?? rows.length;
    return (
      <div className="sheet-list sheet-page" data-view="head">
        <div className="stage sheet-stage">
          <SheetGrid rows={rows} total={all} selectedId={selectedId} onRowClick={onRowClick} onRowContextMenu={onRowContextMenu} onDelete={onDelete} deleteNoun={deleteNoun} rowName={rowName} onAssigneeChange={onAssigneeChange} onCopyChange={onCopyChange} onRoomChange={onRoomChange} layout={layout} empty={empty} placeOptions={placeOptions} itemOptions={itemOptions} titleOptions={titleOptions} roomOptions={roomOptions} enteringId={enteringId} />
        </div>
      </div>
    );
  }

  return (
    <div className="sds sheet-page" data-view="head">
      <div className="filter-row">
        <form className="search" role="search" onSubmit={(event) => event.preventDefault()}>
          <Icon name="search" size={18} />
          <input type="search" placeholder="Search to-dos" aria-label="Search to-dos" />
        </form>
        <div className="drop">
          <button className="trigger" type="button" aria-expanded="false" aria-haspopup="menu" aria-label="Filters">
            <span className="pair">
              <Icon name="filter" size={14} />
              <span>Filters</span>
            </span>
            <Icon name="chevron" size={14} />
          </button>
        </div>
        {chips.length ? (
          <div className="filter-chips">
            {chips.map((chip) => (
              <Chip key={chip.name} filter={chip} />
            ))}
          </div>
        ) : null}
      </div>
      <div className="stage sheet-stage">
        <SheetGrid hover={hover} rows={[SAMPLE_ROW]} placeOptions={placeOptions} itemOptions={itemOptions} />
      </div>
    </div>
  );
}
