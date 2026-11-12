"use client";

import { useCallback, useRef, useState, type ReactNode } from "react";
import {
  AssignedDropdown,
  Avatar,
  Button,
  Checkbox,
  Chip,
  ChipDropdown,
  ConfirmDialog,
  DetailPanel,
  EditorDialog,
  EditorField,
  EditorFields,
  EditorPhotos,
  EditorPill,
  EditorPillRow,
  EditorPills,
  PhotoPill,
  PhotoThumb,
  PhotoViewer,
  PlacePill,
  RequiredToast,
  RoomPill,
  SheetTable,
  SidebarItem,
  TaskAssignee,
  TaskFact,
  TaskTable,
  taskMenuItem,
  type TaskRow,
  ColorSwatches,
  ActivityFeed,
  Comment,
  Day,
  Empty,
  Meter,
  Widget,
  WidgetEmpty,
  WidgetList,
  WidgetMore,
  WidgetRow,
  Composer,
  Confirm,
  DEPARTMENTS,
  DepartmentChip,
  Icon,
  OverlayMenu,
  icons,
  LancePanel,
  Message,
  MessageGroup,
  FilterMenu,
  FilterSubmenu,
  Menu,
  PageHeader,
  Person,
  Resolved,
  SearchField,
  Sidebar,
  type SidebarGroup,
  type SidebarLink,
  SpacingScale,
  Status,
  Tabs,
  Ticket,
  TicketNote,
  Typing,
  TextIcon,
  Toast,
  Tooltip,
  TypeScale,
  Urgency,
  ViewedMenu,
  AssigneeCell,
  DataTable,
  DateCell,
  RoomCell,
  SidePhotos,
  SideRoom,
  FactField,
  FactLine,
  FactRow,
  StatusCell,
  TypeCell,
  UrgencyCell,
  assigneeColumn,
  dateColumn,
  roomColumn,
  statusColumn,
  textColumn,
  typeColumn,
  urgencyColumn,
  useTableMenu,
  TitleSubtitle,
  type IconName,
  type Photo,
} from "@lance-live/gallery-ui";
import { DocPage, Example } from "./docs-example";
import { TodosWidget } from "./(screens)/home/todos-widget";

const menuItems = [
  { value: "Share", label: "Share", icon: "share" as const },
  { value: "Edit", label: "Edit", icon: "edit" as const },
  { value: "Delete", label: "Delete", icon: "trash" as const, danger: true },
];

const CADENCE_ITEMS = [
  { value: "Daily", label: "Daily", description: "Every morning at 8" },
  { value: "Weekly", label: "Weekly", description: "Mondays at 8" },
];

const DEMO_PHOTOS: Photo[] = [
  { src: "/avatar-sarah.png", alt: "Pillow on the bed" },
  { src: "/avatar-sarah.png", alt: "Closet shelf" },
];

function PhotoThumbsDemo() {
  const [viewing, setViewing] = useState<number | null>(null);
  return (
    <>
      <div className="sds side-photos editor-photos">
        {DEMO_PHOTOS.map((photo, index) => (
          <PhotoThumb key={photo.alt} photo={photo} onOpen={() => setViewing(index)} />
        ))}
      </div>
      {viewing != null ? <PhotoViewer photos={DEMO_PHOTOS} index={viewing} onIndex={setViewing} onClose={() => setViewing(null)} /> : null}
    </>
  );
}

const sidebarFixed: SidebarLink[] = [
  { icon: "home", label: "Home" },
  { icon: "bubble", label: "Messages", tip: "Opt M" },
  { icon: "bell", label: "Notifications", tip: "Opt N" },
  { icon: "doc", label: "Internal notes" },
];

const sidebarGroups: SidebarGroup[] = [
  {
    title: "Pinned",
    pinned: true,
    open: true,
    links: [
      { label: "Boards", icon: "grid" },
      { label: "To-Dos", icon: "clipboard", current: true },
      { label: "Complaints", icon: "alert" },
      { label: "Schedule", icon: "calendar" },
    ],
  },
  {
    title: "Guest",
    open: true,
    links: [
      { label: "Calls", icon: "phone" },
      { label: "Guest messages", icon: "bubble-lines" },
      { label: "Wake-up calls", icon: "clock" },
    ],
  },
  {
    title: "Operations",
    open: false,
    links: [
      { label: "Boards", icon: "grid" },
      { label: "To-Dos", icon: "clipboard" },
      { label: "Complaints", icon: "alert" },
      { label: "Schedule", icon: "calendar" },
      { label: "Lost & found", icon: "tag" },
      { label: "Cash & bank", icon: "card" },
    ],
  },
  {
    title: "Facilities",
    open: false,
    links: [
      { label: "PM", icon: "wrench" },
      { label: "Readings", icon: "gauge" },
    ],
  },
  {
    title: "Records",
    open: true,
    links: [
      { label: "Internal notes", icon: "doc" },
      { label: "Knowledge base", icon: "book" },
    ],
  },
  {
    title: "Sales",
    open: false,
    links: [{ label: "Sales", icon: "share" }],
  },
];

const tabs = [
  { value: "open", label: "Open", count: 8 },
  { value: "scheduled", label: "Scheduled", count: 2 },
  { value: "completed", label: "Completed", count: 346 },
];

function Col({ k, children }: { k: string; children: ReactNode }) {
  return (
    <div className="col">
      <span className="k">{k}</span>
      {children}
    </div>
  );
}

function DepartmentPick() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("Front desk");
  const anchorRef = useRef<HTMLButtonElement>(null);
  return (
    <>
      <DepartmentChip
        as="button"
        ref={anchorRef}
        name={name}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((next) => !next)}
      />
      <OverlayMenu open={open} anchorRef={anchorRef} label="Department">
        {DEPARTMENTS.map((item) => (
          <button
            key={item.dept}
            className="menu-item"
            type="button"
            role="menuitemradio"
            aria-checked={item.value === name}
            onClick={() => {
              setName(item.value);
              setOpen(false);
            }}
          >
            <DepartmentChip name={item.value} plain />
            <Icon name="check" size={14} className="check" />
          </button>
        ))}
      </OverlayMenu>
    </>
  );
}

function OverlayPick() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("Edit");
  const anchorRef = useRef<HTMLButtonElement>(null);
  return (
    <span className="drop">
      <button
        ref={anchorRef}
        className="note-more"
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="More"
        onClick={() => setOpen((next) => !next)}
      >
        <Icon name="dots" size={14} />
      </button>
      <OverlayMenu open={open} anchorRef={anchorRef} label="Options">
        {menuItems.map((item) =>
          taskMenuItem(item.value, item.value === value, () => {
            setValue(item.value);
            setOpen(false);
          }, (
            <>
              <Icon name={item.icon} size={18} />
              {item.label}
            </>
          )),
        )}
      </OverlayMenu>
    </span>
  );
}

function ConfirmDialogDemo() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="danger" onClick={() => setOpen(true)}>
        <Icon name="trash" size={14} />
        Delete
      </Button>
      <ConfirmDialog open={open} name="Eligible Enrollments" noun="note" onCancel={() => setOpen(false)} onConfirm={() => setOpen(false)} />
    </>
  );
}

function EditorDialogDemo() {
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [title, setTitle] = useState("Boiler 2");
  const [tab, setTab] = useState("details");
  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        <Icon name="edit" size={14} />
        Edit source
      </Button>
      {open ? (
        <EditorDialog
          kicker="Edit source"
          title={title}
          titlePlaceholder="Boiler 2"
          onTitleChange={setTitle}
          subtitle="Boiler · Twice a day"
          tabs={{
            label: "Source",
            value: tab,
            onValueChange: setTab,
            items: [
              { value: "details", label: "Details" },
              { value: "measurements", label: "Measurements", count: 2 },
            ],
          }}
          deleteLabel="Delete source"
          onDelete={() => setConfirm(true)}
          onEscape={() => confirm}
          onClose={() => setOpen(false)}
          footer={<Button onClick={() => setOpen(false)}>Save source</Button>}
        >
          {tab === "details" ? (
            <div className="sds todo-side-meta">
              <FactRow label="Kind">
                <FactField label="Kind" value="Boiler" options={["Boiler", "Utility Meter", "Pool"]} />
              </FactRow>
              <FactRow label="Place">
                <FactField label="Place" value="Basement" options={["Basement", "Roof", "Pool deck"]} />
              </FactRow>
            </div>
          ) : (
            <div className="sds todo-side-meta">
              <FactRow label="Pressure">
                <FactLine label="Pressure" value="12 psi" />
              </FactRow>
              <FactRow label="Temperature">
                <FactLine label="Temperature" value="180°F" />
              </FactRow>
            </div>
          )}
        </EditorDialog>
      ) : null}
      <ConfirmDialog
        open={confirm}
        name={title}
        noun="source"
        onCancel={() => setConfirm(false)}
        onConfirm={() => {
          setConfirm(false);
          setOpen(false);
        }}
      />
    </>
  );
}

const PILL_PLACES = ["Guestroom", "Laundry", "Lobby"];
const PILL_ITEMS = ["Pillows", "Towels", "Dryer"];

function PillEditorDemo() {
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState<string | null>(null);
  const [place, setPlace] = useState("");
  const [room, setRoom] = useState("");
  const [item, setItem] = useState("");
  const [note, setNote] = useState("");
  const [guest, setGuest] = useState("");
  const [phone, setPhone] = useState("");
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [tried, setTried] = useState(false);
  const [toast, setToast] = useState(0);
  const hideToast = useCallback(() => setToast(0), []);
  const toggle = (key: string) => setMenu((current) => (current === key ? null : key));
  const options = (values: string[], current: string, onPick: (value: string) => void) =>
    values.map((value) =>
      taskMenuItem(value, value === current, () => {
        onPick(value);
        setMenu(null);
      }, value),
    );
  const close = () => {
    setOpen(false);
    setMenu(null);
    setTried(false);
  };
  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        <Icon name="plus-bold" size={14} />
        New to-do
      </Button>
      {open ? (
        <EditorDialog
          kicker="Create to-do"
          layout="pills"
          title=""
          titlePlaceholder="To-do title"
          onTitleChange={() => {}}
          subtitle={note}
          subtitlePlaceholder="Add a description"
          onSubtitleChange={setNote}
          subtitleInvalid={tried && !note.trim()}
          onClose={close}
          onEscape={() => {
            if (!menu) return false;
            setMenu(null);
            return true;
          }}
          footer={
            <>
              <PhotoPill onAdd={(added) => setPhotos((current) => [...current, ...added])} />
              <Button
                onClick={() => {
                  if (!place || !note.trim()) {
                    setTried(true);
                    setToast(Date.now());
                    return;
                  }
                  close();
                }}
              >
                Save to-do
              </Button>
            </>
          }
        >
          <EditorPhotos photos={photos} onRemove={(photo) => setPhotos((current) => current.filter((entry) => entry.src !== photo.src))} />
          <EditorFields>
            <EditorField label="Guest name" value={guest} onChange={setGuest} />
            <EditorField label="Phone" inputMode="tel" value={phone} onChange={setPhone} />
          </EditorFields>
          <EditorPills>
            <RoomPill
              open={place === "Guestroom"}
              value={room}
              onChange={setRoom}
              lead={<EditorPill icon="location" open={menu === "place"} onToggle={() => toggle("place")} value={place || "Location"} quiet={!place} invalid={tried && !place} menu={options(PILL_PLACES, place, setPlace)} />}
            />
            <EditorPill icon="tag" open={menu === "item"} onToggle={() => toggle("item")} value={item || "Item"} quiet={!item} menu={options(PILL_ITEMS, item, setItem)} />
            <EditorPillRow>
              <EditorPill open={menu === "status"} onToggle={() => toggle("status")} value={<Status status="open" />} menu={options(["Open"], "Open", () => {})} />
              <EditorPill open={menu === "urgency"} onToggle={() => toggle("urgency")} value={<Urgency level="standard" />} menu={options(["Standard"], "Standard", () => {})} />
            </EditorPillRow>
          </EditorPills>
        </EditorDialog>
      ) : null}
      {toast ? <RequiredToast id={toast} onDone={hideToast} /> : null}
    </>
  );
}

const PANEL_PLACES = ["Guestroom", "Laundry", "Lobby", "Common area"];
const PANEL_ITEMS = ["Pillows/Bedding", "Towels", "Dryer", "Climate"];

function DetailPanelDemo() {
  return (
    <div className="docs-panel-frame">
      <DetailPanel
        label="To-do details"
        name="Requested feathered pillows"
        noun="to-do"
        onClose={() => {}}
        onEdit={() => {}}
        actions={
          <Button variant="secondary">
            <Icon name="calendar" size={14} />
            Schedule for future
          </Button>
        }
      >
        <div className="todo-side-intro">
          <SideRoom value="426" readOnly />
          <div className="todo-side-heading">
            <div className="todo-side-title-row">
              <h2>Guestroom · Pillows</h2>
              <time>now</time>
            </div>
            <p className="todo-side-value is-quiet">Requested feathered pillows</p>
          </div>
        </div>
        <div className="todo-side-rule" />
        <div className="todo-side-meta">
          <FactRow label="Location">
            <span className="todo-side-value">Guestroom</span>
          </FactRow>
          <FactRow label="Item">
            <span className="todo-side-value">Pillows</span>
          </FactRow>
          <FactRow label="Type">
            <DepartmentChip name="Housekeeping" />
          </FactRow>
          <FactRow label="Assigned">
            <Person name="Mark" initials="MJ" variant="pill" />
          </FactRow>
          <FactRow label="Status">
            <StatusCell value="open" editable={false} />
          </FactRow>
          <FactRow label="Urgency">
            <UrgencyCell value="high" editable={false} />
          </FactRow>
        </div>
        <div className="todo-side-rule" />
        <ActivityFeed
          className="todo-side-activity"
          items={[
            { kind: "comment", name: "Mark", initials: "MJ", time: "now", body: "I'll bring feather pillows up to 426." },
            { kind: "status", name: "Sarah", initials: "SM", text: "assigned this to Mark", time: "Oct 29, 4:24 PM" },
          ]}
        />
      </DetailPanel>
    </div>
  );
}

const TASK_ROWS: TaskRow[] = [
  { id: "426", room: "426", note: "Requested feathered pillows", place: "Guestroom", item: "Pillows/Bedding", type: "Housekeeping", urgency: "high", status: "open", assignee: "Mark", initials: "MJ", opened: "now" },
  { id: "244", room: "244", note: "Dryer in the laundry is loud", place: "Laundry", item: "Dryer", type: "Maintenance", urgency: "standard", status: "progress", assignee: "Paul", initials: "PG", opened: "1h" },
  { id: "436", room: "436", note: "Air conditioning is warm", place: "Guestroom", item: "Climate", type: "Maintenance", urgency: "urgent", status: "open", assignee: "Boris", initials: "B", opened: "2h" },
];

const COMPLAINT_ROWS: TaskRow[] = [
  { id: "917", room: "917", note: "Noise", title: "Noise", description: "Smoking next door, and loud after 11.", guest: "Yogesh Delal", type: "Front desk", urgency: "high", status: "open", assignee: "Bobby", initials: "BO", opened: "Oct 30" },
  { id: "718", room: "718", note: "Cleanliness", title: "Cleanliness", description: "Black mold in the shower.", guest: "Sandra Roth", type: "Housekeeping", urgency: "urgent", status: "progress", assignee: "Unassigned", initials: "", opened: "—" },
];

function TaskTableDemo({ layout }: { layout: "todo" | "complaint" }) {
  const rows = layout === "complaint" ? COMPLAINT_ROWS : TASK_ROWS;
  const [selected, setSelected] = useState<string | null>(null);
  return <TaskTable layout={layout} rows={rows} selectedId={selected} onRowClick={(row) => setSelected(row.id)} />;
}

const CATEGORIES = ["Clothing", "Electronics", "Jewelry", "Documents"];

function ChipDropdownDemo() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("Electronics");
  return (
    <ChipDropdown
      open={open}
      onToggle={() => setOpen((next) => !next)}
      menu={CATEGORIES.map((category) =>
        taskMenuItem(category, category === value, () => {
          setValue(category);
          setOpen(false);
        }, category),
      )}
    >
      <span>{value}</span>
    </ChipDropdown>
  );
}

type FoundRow = { id: string; item: string; place: string; found: string };

const FOUND_ROWS: FoundRow[] = [
  { id: "1", item: "Phone charger", place: "Lobby", found: "now" },
  { id: "2", item: "Wool scarf", place: "Room 1013", found: "1d" },
];

function SheetTableDemo() {
  const [selected, setSelected] = useState<string | null>(null);
  return (
    <div className="sheet-page" data-view="head">
      <div className="stage sheet-stage">
        <SheetTable
          rows={FOUND_ROWS}
          selectedId={selected}
          onRowClick={(row) => setSelected(row.id)}
          columns={[
            { title: "Item", flex: true, render: (row) => row.item },
            { title: "Place", render: (row) => row.place },
            { title: "Found", render: (row) => row.found },
          ]}
        />
      </div>
    </div>
  );
}

type SheetRow = {
  id: string;
  status: "open" | "progress" | "complete";
  room: string;
  note: string;
  urgency: "urgent" | "high" | "standard" | "low";
  type: string;
  name: string;
  initials: string;
  opened: string;
};

const SHEET_ROWS: SheetRow[] = [
  { id: "426", status: "open", room: "426", note: "Requested feathered pillows", urgency: "high", type: "Housekeeping", name: "Mark", initials: "MJ", opened: "now" },
  { id: "244", status: "progress", room: "244", note: "Dryer in the laundry is loud", urgency: "standard", type: "Maintenance", name: "Paul", initials: "PG", opened: "1h" },
];

const SHEET_ROOMS = ["426", "244", "103", "436"];

function DataTableSpecimen() {
  const [selected, setSelected] = useState("426");
  const [dropdownNote, setDropdownNote] = useState("Requested Feathered Pillows.");
  const [editableNote, setEditableNote] = useState("Complained about the noise last night");
  const menu = useTableMenu();
  const access = { menu, rowId: (row: SheetRow) => row.id };
  return (
    <>
      <Example
        id="cell-status"
        title="Status"
        description="Status says what the record is now: Open, In progress, or Completed."
        code={`import { StatusCell } from "@lance-live/gallery-ui";

export function Status() {
  return <StatusCell defaultValue="open" />;
}`}
      >
        <StatusCell defaultValue="open" />
      </Example>
      <Example
        id="cell-room"
        title="Room"
        description="Room is a dropdown of rooms that already exist. The number is not typed."
        code={`import { RoomCell } from "@lance-live/gallery-ui";

export function Room() {
  return <RoomCell defaultValue="426" options={["426", "244", "103", "436"]} />;
}`}
      >
        <RoomCell defaultValue="426" options={SHEET_ROOMS} />
      </Example>
      <Example
        id="side-room"
        title="Detail room"
        description="The room on a to-do detail. The same list of rooms, in the panel's room control."
        code={`import { SideRoom } from "@lance-live/gallery-ui";

export function DetailRoom() {
  return <SideRoom value="426" options={["426", "244", "103", "436"]} />;
}`}
      >
        <SideRoom value="426" options={SHEET_ROOMS} />
      </Example>
      <Example
        id="side-fact"
        title="Fact row"
        description="A short label and the value beside it. Location uses this."
        code={`import { FactField, FactRow } from "@lance-live/gallery-ui";

export function Location() {
  return (
    <FactRow label="Location">
      <FactField label="Location" value="Guestroom" options={["Guestroom", "Laundry", "Lobby"]} />
    </FactRow>
  );
}`}
      >
        <FactRow label="Location">
          <FactField label="Location" value="Guestroom" options={["Guestroom", "Laundry", "Lobby", "Common area"]} />
        </FactRow>
      </Example>
      <Example
        id="side-line"
        title="Fact line"
        description="A typed fact in a detail panel. The line field sits beside the label."
        code={`import { FactLine, FactRow } from "@lance-live/gallery-ui";

export function Stored() {
  return (
    <FactRow label="Stored">
      <FactLine label="Stored" value="" />
    </FactRow>
  );
}`}
      >
        <FactRow label="Stored">
          <FactLine label="Stored" value="" />
        </FactRow>
      </Example>
      <Example
        id="side-photos"
        title="Photos"
        description="A record can hold photos. None is allowed, and another photo is added beside the ones already there."
        code={`import { SidePhotos } from "@lance-live/gallery-ui";

export function Photos() {
  return <SidePhotos />;
}`}
      >
        <SidePhotos />
      </Example>
      <Example
        id="cell-urgency"
        title="Urgency"
        description="Urgency hugs the word. Urgent keeps its icon."
        code={`import { UrgencyCell } from "@lance-live/gallery-ui";

export function Urgency() {
  return <UrgencyCell defaultValue="high" />;
}`}
      >
        <UrgencyCell defaultValue="high" />
      </Example>
      <Example
        id="cell-type"
        title="Type"
        description="Type is the department. The fill stays the department color."
        code={`import { TypeCell } from "@lance-live/gallery-ui";

export function Type() {
  return <TypeCell defaultValue="Housekeeping" />;
}`}
      >
        <TypeCell defaultValue="Housekeeping" />
      </Example>
      <Example
        id="cell-assignee"
        title="Assignee"
        description="Assignee is the person. An empty cell is the dashed avatar."
        code={`import { AssigneeCell } from "@lance-live/gallery-ui";

export function Assignee() {
  return <AssigneeCell name="Mark" initials="MJ" />;
}`}
      >
        <AssigneeCell name="Mark" initials="MJ" />
      </Example>
      <Example
        id="cell-assigned-dropdown"
        title="Assigned dropdown"
        description="Assigned on its own. It opens the people who already exist, including Unassigned."
        code={`import { AssignedDropdown } from "@lance-live/gallery-ui";

export function Assigned() {
  return <AssignedDropdown value="Mark" initials="MJ" />;
}`}
      >
        <AssignedDropdown value="Mark" initials="MJ" />
      </Example>
      <Example
        id="cell-named-assignee"
        title="Named assignee"
        description="The assignee with the name beside the photo. Complaints use this."
        code={`import { TaskAssignee } from "@lance-live/gallery-ui";

export function NamedAssignee() {
  return <TaskAssignee named name="Mark" initials="MJ" />;
}`}
      >
        <TaskAssignee named name="Mark" initials="MJ" />
      </Example>
      <Example
        id="cell-chip-dropdown"
        title="Chip dropdown"
        description="A chip that opens a list of values that already exist. Lost and found uses it for the category."
        code={`import { ChipDropdown, taskMenuItem } from "@lance-live/gallery-ui";

export function Category({ open, onToggle, value, onPick }) {
  return (
    <ChipDropdown
      open={open}
      onToggle={onToggle}
      menu={["Clothing", "Electronics"].map((item) => taskMenuItem(item, item === value, () => onPick(item), item))}
    >
      <span>{value}</span>
    </ChipDropdown>
  );
}`}
      >
        <ChipDropdownDemo />
      </Example>
      <Example
        id="cell-fact"
        title="Fact"
        description="A short value with a chevron, for a fact that opens a choice."
        code={`import { TaskFact } from "@lance-live/gallery-ui";

export function Place() {
  return <TaskFact>Guestroom</TaskFact>;
}`}
      >
        <TaskFact>Guestroom</TaskFact>
      </Example>
      <Example
        id="cell-date"
        title="Date"
        description="Opened is the date the record started. The column is already as wide as a full date."
        code={`import { DateCell } from "@lance-live/gallery-ui";

export function Opened() {
  return <DateCell value="now" />;
}`}
      >
        <DateCell value="now" />
      </Example>
      <Example
        id="cell-dropdown-title"
        title="Dropdown title"
        description="A to-do title is two dropdowns, location and item, with the note under them."
        code={`import { TitleSubtitle } from "@lance-live/gallery-ui";

export function DropdownTitle() {
  return (
    <TitleSubtitle
      variant="dropdown"
      title={[
        { value: "Guestroom", options: ["Guestroom", "Lobby"] },
        { value: "Pillows/Bedding", options: ["Pillows/Bedding", "Towels"] },
      ]}
      subtitle="Requested Feathered Pillows."
      subtitleLabel="Note"
    />
  );
}`}
      >
        <div style={{ width: 220 }}>
          <TitleSubtitle
            variant="dropdown"
            title={[
              { value: "Guestroom", options: ["Guestroom", "Lobby", "Common area"] },
              { value: "Pillows/Bedding", options: ["Pillows/Bedding", "Towels", "Dryer"] },
            ]}
            subtitle={dropdownNote}
            subtitleLabel="Note"
            onSubtitleChange={setDropdownNote}
          />
        </div>
      </Example>
      <Example
        id="cell-editable-title"
        title="Editable title"
        description="Some records type the title. The detail sits under it and stays one field."
        code={`import { TitleSubtitle } from "@lance-live/gallery-ui";

export function EditableTitle() {
  return (
    <TitleSubtitle
      variant="editable"
      title="Noise"
      titleLabel="To-do"
      subtitle="Complained about the noise last night"
      subtitleLabel="Detail"
    />
  );
}`}
      >
        <div style={{ width: 220 }}>
          <TitleSubtitle
            variant="editable"
            title="Noise"
            titleLabel="To-do"
            subtitle={editableNote}
            subtitleLabel="Detail"
            onSubtitleChange={setEditableNote}
          />
        </div>
      </Example>
      <Example
        id="table"
        title="Table"
        description="A row opens its detail. The selected row keeps the blue fill while another row can still hover."
        code={`import { DataTable } from "@lance-live/gallery-ui";

export function TodoTable() {
  return <DataTable rows={rows} selectedId="426" interactive columns={columns} />;
}`}
      >
        <div className="sheet-page" data-view="head">
          <div className="stage sheet-stage">
                <DataTable
                  rows={SHEET_ROWS}
                  selectedId={selected}
                  onRowClick={(row) => setSelected(row.id)}
                  interactive
                  columns={[
                    statusColumn<SheetRow>({ ...access, value: (row) => row.status }),
                    roomColumn<SheetRow>({ ...access, value: (row) => row.room, options: SHEET_ROOMS }),
                    textColumn<SheetRow>({ id: "note", title: "Note", size: "primary", value: (row) => row.note }),
                    urgencyColumn<SheetRow>({ ...access, value: (row) => row.urgency }),
                    typeColumn<SheetRow>({ ...access, value: (row) => row.type }),
                    assigneeColumn<SheetRow>({ value: (row) => ({ name: row.name, initials: row.initials }) }),
                    dateColumn<SheetRow>({ title: "Opened", value: (row) => row.opened }),
                  ]}
                />
          </div>
        </div>
      </Example>
      <Example
        id="table-simple"
        title="Simple table"
        description="A table that only shows text. Each column is a title and what to show for a row."
        code={`import { SheetTable } from "@lance-live/gallery-ui";

export function Found() {
  return (
    <SheetTable
      rows={rows}
      columns={[
        { title: "Item", flex: true, render: (row) => row.item },
        { title: "Place", render: (row) => row.place },
        { title: "Found", render: (row) => row.found },
      ]}
    />
  );
}`}
      >
        <SheetTableDemo />
      </Example>
    </>
  );
}

export function GallerySections({ page }: { page: string }) {
  const [tab, setTab] = useState("open");
  const [barTab, setBarTab] = useState("open");
  const [menu, setMenu] = useState<string | undefined>(undefined);
  return (
    <>
      {page === "color" && (
        <DocPage title="Color" description="Color is the palette. Components use a role, and the role points at one of these swatches.">
          <Example id="color-example" title="Palette" description="The named colors, from the page surface to the action blue." code={`import { ColorSwatches } from "@lance-live/gallery-ui";

export function Palette() {
  return <ColorSwatches />;
}`}>
          <ColorSwatches />
          </Example>
        </DocPage>
      )}
      {page === "spacing" && (
        <DocPage title="Spacing" description="Space is a scale. A gap inside a group stays smaller than the gap between groups.">
          <Example id="spacing-example" title="Scale" description="Steps from 2px through 25px." code={`import { SpacingScale } from "@lance-live/gallery-ui";

export function Spacing() {
  return <SpacingScale />;
}`}>
          <SpacingScale />
          </Example>
        </DocPage>
      )}
      {page === "type" && (
        <DocPage title="Typography" description="Type has a small set of sizes. A page title, a record, and a label do not invent a size between them.">
          <Example id="type-example" title="Scale" description="The sizes already in use, from a label to a page title." code={`import { TypeScale } from "@lance-live/gallery-ui";

export function Type() {
  return <TypeScale />;
}`}>
            <div id="type">
              <TypeScale />
            </div>
          </Example>
        </DocPage>
      )}
      {page === "text-icon" && (
        <DocPage title="Text and icon" description="A text button is a quiet action: a label, an icon, and no fill until hover.">
          <Example id="text-icon-example" title="Default" description="Label, small, and delete." code={`import { TextIcon } from "@lance-live/gallery-ui";

export function ShareAction() {
  return <TextIcon>Share</TextIcon>;
}`}>
          <TextIcon>Share</TextIcon>
          </Example>
          <Example id="text-icon-icon" title="Icon" description="Any icon can lead the label. Pick the one that names the action." code={`import { TextIcon } from "@lance-live/gallery-ui";

export function EditAction() {
  return <TextIcon icon="edit">Edit</TextIcon>;
}`}>
            <TextIcon icon="edit">Edit</TextIcon>
          </Example>
          <Example id="text-icon-small" title="Small" description="A 14px icon and tighter padding, for a dense row or a panel header." code={`import { TextIcon } from "@lance-live/gallery-ui";

export function SmallShare() {
  return <TextIcon size="sm">Share</TextIcon>;
}`}>
            <TextIcon size="sm">Share</TextIcon>
          </Example>
          <Example id="text-icon-delete" title="Delete" description="The destructive text button. The word and the icon stay red, and the press opens the delete confirmation." code={`import { TextIcon } from "@lance-live/gallery-ui";

export function DeleteAction() {
  return <TextIcon icon="trash" tone="delete">Delete</TextIcon>;
}`}>
            <TextIcon icon="trash" tone="delete">Delete</TextIcon>
          </Example>
        </DocPage>
      )}
      {page === "chip" && (
        <DocPage title="Chip" description="A chip is a compact action. The filter chip is a separate variant, used only for a chosen filter.">
          <Example id="chip-example" title="Default" description="A label, with or without an icon." code={`import { Chip } from "@lance-live/gallery-ui";

export function NewChip() {
  return <Chip>New</Chip>;
}`}>
          <Chip>New</Chip>
          </Example>
          <Example id="chip-icon" title="With icon" description="An icon before the label. Plus is the default glyph; pass another to name the action." code={`import { Chip } from "@lance-live/gallery-ui";

export function AddChip() {
  return (
    <>
      <Chip icon>New</Chip>
      <Chip glyph="calendar">Schedule</Chip>
    </>
  );
}`}>
            <Chip icon>New</Chip>
            <Chip glyph="calendar">Schedule</Chip>
          </Example>
          <Example id="chip-icon-only" title="Icon only" description="The chip with only its icon, for a tool with no room for a label. It needs an aria-label." code={`import { Chip } from "@lance-live/gallery-ui";

export function AddChip() {
  return <Chip icon aria-label="New" />;
}`}>
            <Chip icon aria-label="New" />
          </Example>
          <Example
            id="chip-filter"
            title="Filter"
            description="A filter chip shows the field and the chosen value. It hugs that value, and it is only used on a filter row."
            code={`import { Chip } from "@lance-live/gallery-ui";

export function RoomFilter() {
  return <Chip filter={{ name: "Room", value: "Room 12" }} />;
}`}
          >
            <Chip className="ref" filter={{ name: "Room", value: "Room 12" }} />
          </Example>
        </DocPage>
      )}
      {page === "department" && (
        <DocPage title="Department tag" description="A department keeps one color wherever it appears: a tag, a filter, or a table.">
          <Example id="department-example" title="Default" description="Every department, then the tag as a menu." code={`import { DepartmentChip } from "@lance-live/gallery-ui";

export function DepartmentTag() {
  return <DepartmentChip name="Front desk" />;
}`}>
          <DepartmentPick />
          </Example>
          <Example
            id="department-label"
            title="Label"
            description="The department as a fact: the colored circle and the name. It is not a control, so it has no stroke."
            code={`import { DepartmentChip } from "@lance-live/gallery-ui";

export function DepartmentLabel() {
  return <DepartmentChip name="Front desk" plain />;
}`}
          >
            <div className="cols">
              <div className="col symbol-col">
                {DEPARTMENTS.map((item) => (
                  <DepartmentChip key={item.dept} name={item.value} plain />
                ))}
              </div>
            </div>
          </Example>
        </DocPage>
      )}
      {page === "menu" && (
        <DocPage title="Drop down menu" description="A menu hugs its longest label, then leaves 16px to the edge. Delete is last, in red.">
          <Example id="menu-example" title="Default" description="Closed, open, hover, and search." code={`import { Menu } from "@lance-live/gallery-ui";

const items = [
  { value: "Share", label: "Share", icon: "share" },
  { value: "Edit", label: "Edit", icon: "edit" },
  { value: "Delete", label: "Delete", icon: "trash", danger: true },
];

export function ShareMenu() {
  return <Menu items={items} searchable />;
}`}>
          <Menu items={menuItems} value={menu} onValueChange={setMenu} searchable />
          </Example>
          <Example id="menu-placeholder" title="Placeholder" description="Nothing is chosen yet, so the trigger shows a quiet placeholder. An item can carry a line of description under its label." code={`import { Menu } from "@lance-live/gallery-ui";

const items = [
  { value: "Daily", label: "Daily", description: "Every morning at 8" },
  { value: "Weekly", label: "Weekly", description: "Mondays at 8" },
];

export function CadenceMenu() {
  return <Menu items={items} placeholder="Choose a cadence" placeholderIcon="clock" />;
}`}>
            <Menu items={CADENCE_ITEMS} placeholder="Choose a cadence" placeholderIcon="clock" />
          </Example>
          <Example
            id="menu-overlay"
            title="Anchored"
            description="The menu opened from any control, such as the three dots. It floats over the page and lines up with that control."
            code={`import { useRef, useState } from "react";
import { Icon, OverlayMenu } from "@lance-live/gallery-ui";

export function MoreMenu() {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef(null);
  return (
    <>
      <button ref={anchorRef} className="note-more" aria-label="More" onClick={() => setOpen(!open)}>
        <Icon name="dots" size={14} />
      </button>
      <OverlayMenu open={open} anchorRef={anchorRef} label="Options">
        {/* menu items */}
      </OverlayMenu>
    </>
  );
}`}
          >
            <OverlayPick />
          </Example>
          <Example
            id="menu-viewed"
            title="Viewed"
            description="The viewed list is its own menu. It shows who has opened the record, and who has not."
            code={`import { ViewedMenu } from "@lance-live/gallery-ui";

export function Viewed() {
  return (
    <ViewedMenu
      viewed={[{ name: "Sarah Mou" }, { name: "Jordan Hale" }]}
      notViewed={[{ name: "Priya Shah" }, { name: "Luis Ortega" }]}
    />
  );
}`}
          >
            <ViewedMenu
              open
              viewed={[
                { name: "Sarah Mou", src: "/avatar-sarah.png" },
                { name: "Jordan Hale", src: "/avatar-sarah.png" },
              ]}
              notViewed={[
                { name: "Priya Shah", src: "/avatar-sarah.png" },
                { name: "Luis Ortega", src: "/avatar-sarah.png" },
                { name: "Mina Park", src: "/avatar-sarah.png" },
                { name: "Owen Brooks", src: "/avatar-sarah.png" },
                { name: "Elena Voss", src: "/avatar-sarah.png" },
                { name: "Chris Adeyemi", src: "/avatar-sarah.png" },
              ]}
            />
          </Example>
        </DocPage>
      )}
      {page === "filter-menu" && (
        <DocPage title="Filter menu" description="Each field opens a submenu. A chosen value becomes a chip on the row.">
          <Example id="filter-menu-example" title="Default" description="The field list, with Type open, and the submenus beside it." code={`import { FilterMenu } from "@lance-live/gallery-ui";

export function Filters() {
  return <FilterMenu />;
}`}>
          <FilterMenu />
          </Example>
          <Example
            id="filter-status"
            title="Status"
            description="Status is the words Open, In progress, and Completed."
            code={`import { FilterSubmenu } from "@lance-live/gallery-ui";

export function StatusFilter() {
  return <FilterSubmenu field="Status" selected={["In progress"]} />;
}`}
          >
            <FilterSubmenu field="Status" selected={["In progress"]} readOnly />
          </Example>
          <Example
            id="filter-urgency"
            title="Urgency"
            description="Urgency is the colored word. Urgent keeps the warning icon."
            code={`import { FilterSubmenu } from "@lance-live/gallery-ui";

export function UrgencyFilter() {
  return <FilterSubmenu field="Urgency" selected={["High"]} />;
}`}
          >
            <FilterSubmenu field="Urgency" selected={["High"]} readOnly />
          </Example>
          <Example
            id="filter-assigned"
            title="Assigned"
            description="Assigned is the people who already exist, including Unassigned."
            code={`import { FilterSubmenu } from "@lance-live/gallery-ui";

export function AssignedFilter() {
  return <FilterSubmenu field="Assigned" selected={["Mark"]} />;
}`}
          >
            <FilterSubmenu field="Assigned" selected={["Mark"]} readOnly />
          </Example>
          <Example
            id="filter-room"
            title="Room"
            description="Room is a list of rooms that already exist."
            code={`import { FilterSubmenu } from "@lance-live/gallery-ui";

export function RoomFilter() {
  return <FilterSubmenu field="Room" selected={["426"]} />;
}`}
          >
            <FilterSubmenu field="Room" selected={["426"]} readOnly />
          </Example>
        </DocPage>
      )}
      {page === "confirm" && (
        <DocPage title="Delete confirmation" description="Delete asks for the name of the record before it removes it.">
          <Example id="confirm-example" title="Default" description="The dialog at rest, and the same dialog open." code={`import { Confirm } from "@lance-live/gallery-ui";

export function DeleteNote() {
  return <Confirm name="test" noun="note" />;
}`}>
          <Confirm name="test" noun="______" />
          </Example>
          <Example
            id="confirm-dialog"
            title="Dialog"
            description="The confirmation as a modal over the page. A delete button opens it. Cancel and Escape close it."
            code={`import { ConfirmDialog } from "@lance-live/gallery-ui";

export function DeleteNote({ open, onClose }) {
  return <ConfirmDialog open={open} name="Eligible Enrollments" noun="note" onCancel={onClose} onConfirm={onClose} />;
}`}
          >
            <ConfirmDialogDemo />
          </Example>
        </DocPage>
      )}
      {page === "search" && (
        <DocPage title="Search" description="Search is a field. On a sheet it sits with the filter control. On its own it can be the icon.">
          <Example id="search-example" title="Default" description="Empty, filled, and the icon button." code={`import { SearchField } from "@lance-live/gallery-ui";

export function Search() {
  return <SearchField />;
}`}>
          <SearchField />
          </Example>
        </DocPage>
      )}
      {page === "checkbox" && (
        <DocPage title="Checkbox" description="A checkbox selects one item in a list. The check is the selection, and hover is one step.">
          <Example id="checkbox-example" title="Default" description="A short list, then the checked, empty, and hover states." code={`import { Checkbox } from "@lance-live/gallery-ui";

export function CashCount() {
  return (
    <>
      <Checkbox defaultChecked>Pennies</Checkbox>
      <Checkbox>Deposit/drop</Checkbox>
    </>
  );
}`}>
          <span className="sds check-list">
            <Checkbox defaultChecked>Pennies</Checkbox>
            <Checkbox defaultChecked>Nickels</Checkbox>
            <Checkbox>Deposit/drop</Checkbox>
          </span>
          </Example>
          <Example id="checkbox-large" title="Large" description="An 18px box with a 12px check. It is for a row picked from a list of people, where the box sits alone at the end of the row." code={`import { Checkbox } from "@lance-live/gallery-ui";

export function PickPerson() {
  return <Checkbox size="lg" defaultChecked aria-label="Mark" />;
}`}>
            <Checkbox size="lg" defaultChecked aria-label="Mark" />
            <Checkbox size="lg" aria-label="Paul" />
          </Example>
        </DocPage>
      )}
      {page === "profile" && (
        <DocPage title="Profile" description="A person has one drawing. Each variant is a different place that drawing shows up.">
          <Example id="profile-name" title="Picture and name" description="The author on a note or a comment." code={`import { Person } from "@lance-live/gallery-ui";

export function Author() {
  return <Person name="Sarah Mou" />;
}`}>
            <Person name="Sarah Mou" />
          </Example>
          <Example id="profile-mini" title="Miniature" description="A name beside a small photo, on one line." code={`import { Person } from "@lance-live/gallery-ui";

export function MiniName() {
  return <Person name="Sarah" variant="mini" />;
}`}>
            <Person name="Sarah" variant="mini" />
          </Example>
          <Example id="profile-pill" title="Pill" description="The assigned person in a table or a filter." code={`import { Person } from "@lance-live/gallery-ui";

export function AssigneePill() {
  return <Person name="Sarah" variant="pill" />;
}`}>
            <Person name="Sarah" variant="pill" />
          </Example>
          <Example id="profile-unassigned" title="Unassigned" description="No one is assigned. The avatar is the dashed empty circle." code={`import { Person } from "@lance-live/gallery-ui";

export function Unassigned() {
  return <Person name="Sarah" variant="unassigned" />;
}`}>
            <Person name="Sarah" variant="unassigned" />
          </Example>
          <Example id="profile-role" title="Picture and role" description="A person and the job they do." code={`import { Person } from "@lance-live/gallery-ui";

export function Housekeeper() {
  return <Person name="Sarah Mou" role="Housekeeper" variant="role" />;
}`}>
            <Person name="Sarah Mou" role="Housekeeper" variant="role" />
          </Example>
          <Example id="profile-title" title="Picture and title" description="A note card: the author, the time, and the title." code={`import { Person } from "@lance-live/gallery-ui";

export function NoteAuthor() {
  return (
    <Person
      name="Sarah Mou"
      variant="title"
      time="Today ·10:38 AM"
      title="Eligible Enrollments 10/16/26"
    />
  );
}`}>
            <Person name="Sarah Mou" variant="title" time="Today ·10:38 AM" title="Eligible Enrollments 10/16/26" />
          </Example>
          <Example id="profile-message" title="Message" description="The sender on a message." code={`import { Person } from "@lance-live/gallery-ui";

export function MessageSender() {
  return <Person name="Sarah" variant="message" />;
}`}>
            <Person name="Sarah" variant="message" />
          </Example>
        </DocPage>
      )}
      {page === "avatar" && (
        <DocPage title="Avatar" description="The picture of a person: their photo, or their initials in a ringed circle. Hover names them when the name is not written beside it.">
          <Example id="avatar-initials" title="Initials" description="No photo yet. The initials sit in the circle." code={`import { Avatar } from "@lance-live/gallery-ui";

export function Initials() {
  return <Avatar initials="SM" name="Sarah Mou" />;
}`}>
            <Avatar initials="SM" name="Sarah Mou" />
          </Example>
          <Example id="avatar-photo" title="Photo" description="A portrait fills the circle. The edge is the image outline, not the ring." code={`import { Avatar } from "@lance-live/gallery-ui";

export function Photo() {
  return <Avatar photo="/avatar-sarah.png" name="Sarah Mou" />;
}`}>
            <Avatar photo="/avatar-sarah.png" name="Sarah Mou" />
          </Example>
          <Example id="avatar-empty" title="Empty" description="No one. The dashed circle, as in Unassigned." code={`import { Avatar } from "@lance-live/gallery-ui";

export function NoOne() {
  return <Avatar empty />;
}`}>
            <Avatar empty />
          </Example>
          <Example id="avatar-sizes" title="Sizes" description="Mini sits beside a name on one line. Large is a record's own picture." code={`import { Avatar } from "@lance-live/gallery-ui";

export function Sizes() {
  return (
    <>
      <Avatar initials="SM" size="mini" />
      <Avatar initials="SM" />
      <Avatar initials="SM" size="lg" />
    </>
  );
}`}>
            <div className="cols">
              <Avatar initials="SM" size="mini" name="Sarah Mou" />
              <Avatar initials="SM" name="Sarah Mou" />
              <Avatar initials="SM" size="lg" name="Sarah Mou" />
            </div>
          </Example>
        </DocPage>
      )}
      {page === "task-table" && (
        <DocPage title="To-do table" description="The data table with the to-do columns already set. Each cell edits in place, and a row opens its detail.">
          <Example id="task-table-todo" title="To-dos" description="Room, the to-do, status, urgency, type, assigned, and when it opened." code={`import { TaskTable } from "@lance-live/gallery-ui";

export function Todos() {
  return <TaskTable rows={rows} selectedId={selected} onRowClick={(row) => setSelected(row.id)} />;
}`}>
            <TaskTableDemo layout="todo" />
          </Example>
          <Example id="task-table-complaint" title="Complaints" description="Room, guest, the complaint, status, urgency, assigned, and when it was completed." code={`import { TaskTable } from "@lance-live/gallery-ui";

export function Complaints() {
  return <TaskTable layout="complaint" rows={rows} />;
}`}>
            <TaskTableDemo layout="complaint" />
          </Example>
        </DocPage>
      )}
      {page === "detail-panel" && (
        <DocPage title="Detail panel" description="The record a row opens. It slides in on the right, over the table. Its options menu holds Delete, which asks first.">
          <Example id="detail-panel-example" title="Default" description="A to-do, view-only: the room and title, its facts, then the activity. Edit opens the editor popup." code={`import { DetailPanel } from "@lance-live/gallery-ui";

export function TodoDetail({ onClose, onEdit }) {
  return (
    <DetailPanel label="To-do details" name="Requested feathered pillows" noun="to-do" onClose={onClose} onEdit={onEdit}>
      {/* room, title, facts as text, activity */}
    </DetailPanel>
  );
}`}>
            <DetailPanelDemo />
          </Example>
          <Example id="detail-panel-photos" title="Photos" description="A record's photos as thumbnails. A thumbnail opens the viewer: one photo full size, arrows step through the rest, and Escape closes only the viewer." code={`import { PhotoThumb, PhotoViewer } from "@lance-live/gallery-ui";

export function Photos({ photos }) {
  const [viewing, setViewing] = useState(null);
  return (
    <>
      {photos.map((photo, index) => <PhotoThumb key={photo.src} photo={photo} onOpen={() => setViewing(index)} />)}
      {viewing != null ? <PhotoViewer photos={photos} index={viewing} onIndex={setViewing} onClose={() => setViewing(null)} /> : null}
    </>
  );
}`}>
            <PhotoThumbsDemo />
          </Example>
        </DocPage>
      )}
      {page === "editor" && (
        <DocPage title="Editor popup" description="The popup for editing one record: a name, tabs, a body that scrolls, and Save at the bottom.">
          <Example id="editor-example" title="Default" description="Edit opens it. Close, the scrim, and Escape close it. Delete asks first." code={`import { Button, EditorDialog } from "@lance-live/gallery-ui";

export function EditSource({ onClose }) {
  return (
    <EditorDialog
      kicker="Edit source"
      title="Boiler 2"
      onTitleChange={setTitle}
      tabs={{ label: "Source", value: tab, onValueChange: setTab, items }}
      onDelete={askFirst}
      onClose={onClose}
      footer={<Button onClick={onClose}>Save source</Button>}
    >
      {/* the current tab */}
    </EditorDialog>
  );
}`}>
            <EditorDialogDemo />
          </Example>
        </DocPage>
      )}
      {page === "pill-editor" && (
        <DocPage title="Pill editor" description="The editor popup for creating or editing one record. Choices are pills in one wrapping line, and typed details sit in labelled fields above them.">
          <Example
            id="pill-editor-example"
            title="Default"
            description="Location and description are required. Save with them empty to see the red pills and the toast. Guestroom slides out a room field."
            code={`import { EditorDialog, EditorField, EditorFields, EditorPill, EditorPillRow, EditorPills, PhotoPill, EditorPhotos, RequiredToast, RoomPill } from "@lance-live/gallery-ui";

<EditorDialog
  kicker="Create to-do"
  layout="pills"
  subtitleInvalid={tried && !note}
  footer={<><PhotoPill onAdd={addPhotos} /><Button onClick={save}>Save to-do</Button></>}
  {...dialog}
>
  <EditorPhotos photos={photos} onRemove={removePhoto} />
  <EditorFields>
    <EditorField label="Guest name" value={guest} onChange={setGuest} />
  </EditorFields>
  <EditorPills>
    <RoomPill open={place === "Guestroom"} value={room} onChange={setRoom}
      lead={<EditorPill icon="location" value={place || "Location"} quiet={!place} invalid={tried && !place} {...menu} />} />
    <EditorPill icon="tag" value={item || "Item"} quiet={!item} {...menu} />
    <EditorPillRow>{/* status, urgency */}</EditorPillRow>
  </EditorPills>
</EditorDialog>
{toast ? <RequiredToast id={toast} onDone={hideToast} /> : null}`}
          >
            <PillEditorDemo />
          </Example>
          <Example id="pill-editor-place" title="Fixed place" description="Where the place cannot change, such as editing a cash count or recording a reading, the lead is a PlacePill. It has no menu and no hover." code={`import { EditorPill, EditorPills, PlacePill } from "@lance-live/gallery-ui";

<EditorPills>
  <PlacePill>Front Desk</PlacePill>
  <EditorPill icon="calendar" value="Today" {...menu} />
</EditorPills>`}>
            <div className="sds editor-pills">
              <PlacePill>Front Desk</PlacePill>
            </div>
          </Example>
        </DocPage>
      )}
      {page === "lance" && (
        <DocPage title="Lance" description="Lance is the assistant composer. The field grows when there is a question in it.">
          <Example id="lance-example" title="Default" description="Empty, hover, and a typed question." code={`import { Composer } from "@lance-live/gallery-ui";

export function AskLance() {
  return <Composer kind="lance" placeholder="Ask Lance anything..." />;
}`}>
          <Composer kind="lance" placeholder="Ask Lance anything..." />
          </Example>
        </DocPage>
      )}
      {page === "lance-side" && (
        <DocPage title="Lance sidebar" description="The Lance panel is the assistant beside the page. It uses the same composer.">
          <Example id="lance-side-example" title="Default" description="The panel, open." code={`import { LancePanel } from "@lance-live/gallery-ui";

export function LanceSide() {
  return <LancePanel />;
}`}>
          <div className="lance-frame">
                      <LancePanel />
                    </div>
          </Example>
        </DocPage>
      )}
      {page === "messaging" && (
        <DocPage title="Messaging" description="A message composer sits under a thread. The send action stays at the end of the field.">
          <Example id="messaging-example" title="Default" description="Empty, hover, and a typed message." code={`import { Composer } from "@lance-live/gallery-ui";

export function MessageField() {
  return <Composer kind="message" placeholder="Write a message..." />;
}`}>
          <Composer kind="message" placeholder="Write a message..." />
          </Example>
        </DocPage>
      )}
      {page === "comment" && (
        <DocPage title="Comment" description="A comment is the author, the time, and the body. Hover shows the actions on that row.">
          <Example id="comment-example" title="Default" description="Rest, and hover." code={`import { Comment } from "@lance-live/gallery-ui";

export function CommentRow() {
  return <Comment name="Sarah" initials="SM" time="now" body="okay" />;
}`}>
          <div id="comment">
            <Comment name="Sarah" initials="SM" time="now" body="okay" />
          </div>
          </Example>
        </DocPage>
      )}
      {page === "message" && (
        <DocPage title="Message" description="One line in a conversation. The name and the time sit above the bubble. Yours is on the right, in the one blue.">
          <Example id="message-example" title="Default" description="Someone else, and you." code={`import { Message } from "@lance-live/gallery-ui";

export function Incoming() {
  return <Message name="Gavin from Lance" time="9:25 AM" initials="GV" body="Hi, how can I help?" />;
}`}>
            <div className="cols">
              <div className="sds message-frame">
                <Message name="Gavin from Lance" time="9:25 AM" initials="GV" body="Hi, how can I help?" />
              </div>
              <div className="sds message-frame">
                <Message name="Sarah Mou" time="9:26 AM" you body="The photos will not open." />
              </div>
            </div>
          </Example>
        </DocPage>
      )}
      {page === "message-group" && (
        <DocPage title="Message group" description="Messages from the same person inside two minutes share one name and sit 2px apart. Only the last bubble squares its outer bottom corner.">
          <Example id="message-group-example" title="Default" description="An incoming run, and yours." code={`import { MessageGroup } from "@lance-live/gallery-ui";

export function Run() {
  return (
    <MessageGroup
      name="Gavin from Lance"
      time="9:25 AM"
      initials="GV"
      messages={[{ body: "Hi, how can I help?" }, { body: "Send me a screenshot when you can." }]}
    />
  );
}`}>
            <div className="cols">
              <div className="sds message-frame">
                <MessageGroup name="Gavin from Lance" time="9:25 AM" initials="GV" messages={[{ body: "Hi, how can I help?" }, { body: "Send me a screenshot when you can." }]} />
              </div>
              <div className="sds message-frame">
                <MessageGroup name="Sarah Mou" time="9:26 AM" you messages={[{ body: "The photos will not open." }, { body: "It happens on the phone only." }]} />
              </div>
            </div>
          </Example>
        </DocPage>
      )}
      {page === "day" && (
        <DocPage title="Day" description="The rule between days. The clock sits on this line, not beside the name.">
          <Example id="day-example" title="Default" description="Today, with the time." code={`import { Day } from "@lance-live/gallery-ui";

export function Today() {
  return <Day label="Today 9:25 AM" />;
}`}>
            <div className="sds message-frame">
              <Day label="Today 9:25 AM" />
            </div>
          </Example>
        </DocPage>
      )}
      {page === "typing" && (
        <DocPage title="Typing" description="The other person is writing. Three dots, in the same bubble as a message.">
          <Example id="typing-example" title="Default" description="Gavin is typing." code={`import { Typing } from "@lance-live/gallery-ui";

export function GavinTyping() {
  return <Typing initials="GV" label="Gavin is typing" />;
}`}>
            <div className="sds message-frame">
              <Typing initials="GV" label="Gavin is typing" />
            </div>
          </Example>
        </DocPage>
      )}
      {page === "resolved" && (
        <DocPage title="Resolved" description="A finished conversation. The reply field is gone. The next step is a new chat, or reopening this one.">
          <Example id="resolved-example" title="Default" description="The note and the two actions." code={`import { Resolved } from "@lance-live/gallery-ui";

export function Finished() {
  return <Resolved />;
}`}>
            <Resolved />
          </Example>
        </DocPage>
      )}
      {page === "ticket" && (
        <DocPage title="Ticket" description="The ticket as a record inside its conversation. Finished steps are marked. The one still to come is empty.">
          <Example id="ticket-example" title="Default" description="An issue, partway through." code={`import { Ticket } from "@lance-live/gallery-ui";

export function OpenTicket() {
  return (
    <Ticket
      number="2709"
      title="Unable to take or view pictures on mobile app"
      kind="Issue"
      steps={[
        { label: "Submitted", time: "5:48 AM" },
        { label: "Routed to team", time: "5:48 AM" },
        { label: "The team is on it", time: "6:02 AM" },
        { label: "Resolved" },
      ]}
    />
  );
}`}>
            <Ticket
              number="2709"
              title="Unable to take or view pictures on mobile app"
              kind="Issue"
              steps={[
                { label: "Submitted", time: "5:48 AM" },
                { label: "Routed to team", time: "5:48 AM" },
                { label: "The team is on it", time: "6:02 AM" },
                { label: "Resolved" },
              ]}
            />
          </Example>
        </DocPage>
      )}
      {page === "ticket-note" && (
        <DocPage title="Ticket note" description="A glance at an open ticket, under the header: the number, the title, and where it stands.">
          <Example id="ticket-note-example" title="Default" description="In progress." code={`import { TicketNote } from "@lance-live/gallery-ui";

export function Note() {
  return <TicketNote number="2709" title="Unable to take or view pictures on mobile app" status="progress" />;
}`}>
            <TicketNote className="is-set" number="2709" title="Unable to take or view pictures on mobile app" status="progress" onDismiss={() => {}} />
          </Example>
        </DocPage>
      )}
      {page === "empty" && (
        <DocPage title="Empty" description="A page or a list with nothing in it. The title and the line are one group. An action, when there is one, sits below.">
          <Example id="empty-example" title="Default" description="Nothing is open, and there is a next step." code={`import { Button, Empty, Icon } from "@lance-live/gallery-ui";

export function PickOne() {
  return (
    <Empty
      icon="bubble"
      title="Select a conversation"
      action={<Button><Icon name="plus-bold" size={14} />New message</Button>}
    >
      Choose a message from the left, or start a new one.
    </Empty>
  );
}`}>
            <div className="sds message-frame">
              <Empty
                icon="bubble"
                title="Select a conversation"
                action={<Button><Icon name="plus-bold" size={14} />New message</Button>}
              >
                Choose a message from the left, or start a new one.
              </Empty>
            </div>
          </Example>
          <Example id="empty-quiet" title="No action" description="Nothing to restore." code={`import { Empty } from "@lance-live/gallery-ui";

export function Deleted() {
  return (
    <Empty icon="archive" title="No deleted messages">
      Messages an admin deletes from any conversation are kept here and can be restored.
    </Empty>
  );
}`}>
            <div className="sds message-frame">
              <Empty icon="archive" title="No deleted messages">
                Messages an admin deletes from any conversation are kept here and can be restored.
              </Empty>
            </div>
          </Example>
        </DocPage>
      )}
      {page === "meter" && (
        <DocPage title="Meter" description="How far along something is. The done part fills in blue over light grey ticks.">
          <Example id="meter-example" title="Default" description="A score out of a total." code={`import { Meter } from "@lance-live/gallery-ui";

export function Health() {
  return <Meter value={41} max={80} label="41 out of 80" />;
}`}>
            <div className="sds widget-frame">
              <Meter value={41} max={80} label="41 out of 80" />
            </div>
          </Example>
          <Example id="meter-end" title="With an end part" description="Rooms cleaned, rooms left, and rooms on DND at the end in a darker grey." code={`import { Meter } from "@lance-live/gallery-ui";

export function Rooms() {
  return <Meter value={52} max={96} end={6} label="52 clean, 38 left, 6 on DND, of 96 rooms" />;
}`}>
            <div className="sds widget-frame">
              <Meter value={52} max={96} end={6} label="52 clean, 38 left, 6 on DND, of 96 rooms" />
            </div>
          </Example>
        </DocPage>
      )}
      {page === "widget" && (
        <DocPage title="Widget" description="A glance at a list on a dashboard. A grey head with the title, the count, and one action, over a few rows and a link to the rest.">
          <Example id="widget-example" title="Default" description="Open to-dos, most urgent first, with who has each one." code={`import { Person, Status, TextIcon, Widget, WidgetList, WidgetMore, WidgetRow } from "@lance-live/gallery-ui";

export function OpenTodos() {
  return (
    <Widget icon="clipboard" title="To-dos" count={9} action={<TextIcon icon="plus" size="sm" aria-label="New to-do" />}>
      <WidgetList>
        <WidgetRow href="/todos" lead={<Status status="open" iconOnly />} title="Hallway" subtitle="Ice machine" meta="20m" trail={<Person name="Sarah" initials="SM" variant="pill" />} />
        <WidgetRow href="/todos" lead={<Status status="open" iconOnly />} title="816" subtitle="Bug / insect" meta="2h" trail={<Person name="Unassigned" variant="unassigned" />} />
        <WidgetRow href="/todos" lead={<Status status="progress" iconOnly />} title="1021" subtitle="Full service" meta="1h" trail={<Person name="Sarah" initials="SM" variant="pill" />} />
        <WidgetMore href="/todos">+ 6 more</WidgetMore>
      </WidgetList>
    </Widget>
  );
}`}>
            <div className="sds widget-frame">
              <Widget icon="clipboard" title="To-dos" count={9} action={<TextIcon icon="plus" size="sm" aria-label="New to-do" />}>
                <WidgetList>
                  <WidgetRow href="#widget" lead={<Status status="open" iconOnly />} title="Hallway" subtitle="Ice machine" meta="20m" trail={<Person name="Sarah" initials="SM" variant="pill" />} />
                  <WidgetRow href="#widget" lead={<Status status="open" iconOnly />} title="816" subtitle="Bug / insect" meta="2h" trail={<Person name="Unassigned" variant="unassigned" />} />
                  <WidgetRow href="#widget" lead={<Status status="progress" iconOnly />} title="1021" subtitle="Full service" meta="1h" trail={<Person name="Sarah" initials="SM" variant="pill" />} />
                  <WidgetMore href="#widget">+ 6 more</WidgetMore>
                </WidgetList>
              </Widget>
            </div>
          </Example>
          <Example id="widget-empty" title="Empty" description="Nothing to show. The head stays, and the empty fills the list." code={`import { Empty, TextIcon, Widget, WidgetEmpty } from "@lance-live/gallery-ui";

export function NoTodos() {
  return (
    <Widget icon="clipboard" title="To-dos" count={0} action={<TextIcon icon="plus" size="sm" aria-label="New to-do" />}>
      <WidgetEmpty>
        <Empty icon="todo" title="No open to-dos">
          Nothing is open right now.
        </Empty>
      </WidgetEmpty>
    </Widget>
  );
}`}>
            <div className="sds widget-frame">
              <Widget icon="clipboard" title="To-dos" count={0} action={<TextIcon icon="plus" size="sm" aria-label="New to-do" />}>
                <WidgetEmpty>
                  <Empty icon="todo" title="No open to-dos">
                    Nothing is open right now.
                  </Empty>
                </WidgetEmpty>
              </Widget>
            </div>
          </Example>
        </DocPage>
      )}
      {page === "widget-list" && (
        <DocPage title="Widget list" description="The rows inside a widget, 2px in from the card like a menu, and the link to the rest.">
          <Example id="widget-list-more" title="With more" description="A few rows, and how many wait behind them." code={`import { Person, Status, Widget, WidgetList, WidgetMore, WidgetRow } from "@lance-live/gallery-ui";

export function Rows() {
  return (
    <Widget icon="clipboard" title="To-dos" count={9}>
      <WidgetList>
        <WidgetRow href="/todos" lead={<Status status="open" iconOnly />} title="Hallway" subtitle="Ice machine" meta="20m" trail={<Person name="Sarah" initials="SM" variant="pill" />} />
        <WidgetRow href="/todos" lead={<Status status="open" iconOnly />} title="816" subtitle="Bug / insect" meta="2h" trail={<Person name="Unassigned" variant="unassigned" />} />
        <WidgetRow href="/todos" lead={<Status status="progress" iconOnly />} title="1021" subtitle="Full service" meta="1h" trail={<Person name="Sarah" initials="SM" variant="pill" />} />
        <WidgetMore href="/todos">+ 6 more</WidgetMore>
      </WidgetList>
    </Widget>
  );
}`}>
            <div className="sds widget-frame">
              <Widget icon="clipboard" title="To-dos" count={9}>
                <WidgetList>
                  <WidgetRow href="#widget-list" lead={<Status status="open" iconOnly />} title="Hallway" subtitle="Ice machine" meta="20m" trail={<Person name="Sarah" initials="SM" variant="pill" />} />
                  <WidgetRow href="#widget-list" lead={<Status status="open" iconOnly />} title="816" subtitle="Bug / insect" meta="2h" trail={<Person name="Unassigned" variant="unassigned" />} />
                  <WidgetRow href="#widget-list" lead={<Status status="progress" iconOnly />} title="1021" subtitle="Full service" meta="1h" trail={<Person name="Sarah" initials="SM" variant="pill" />} />
                  <WidgetMore href="#widget-list">+ 6 more</WidgetMore>
                </WidgetList>
              </Widget>
            </div>
          </Example>
          <Example id="widget-list-all" title="All rows" description="Every record fits, so there is no more link." code={`import { Avatar, Widget, WidgetList, WidgetRow } from "@lance-live/gallery-ui";

export function Notes() {
  return (
    <Widget icon="doc" title="Internal notes" count={3}>
      <WidgetList>
        <WidgetRow href="/notes" lead={<Avatar initials="CS" name="Cy Smith" />} title="11/10 NA shift" subtitle="Guest Khari Emberly checked out two days early." subtitleTone="muted" meta="9h" />
        <WidgetRow href="/notes" lead={<Avatar initials="AC" name="Ana Cruz" />} title="11/10 PM shift" subtitle="Room moves completed: 428 to 423." subtitleTone="muted" meta="17h" />
        <WidgetRow href="/notes" lead={<Avatar initials="JR" name="Jo Reyes" />} title="AM shift" subtitle="Smooth shift. Delta all assigned and checked in." subtitleTone="muted" meta="1d" />
      </WidgetList>
    </Widget>
  );
}`}>
            <div className="sds widget-frame">
              <Widget icon="doc" title="Internal notes" count={3}>
                <WidgetList>
                  <WidgetRow href="#widget-list" lead={<Avatar initials="CS" name="Cy Smith" />} title="11/10 NA shift" subtitle="Guest Khari Emberly checked out two days early." subtitleTone="muted" meta="9h" />
                  <WidgetRow href="#widget-list" lead={<Avatar initials="AC" name="Ana Cruz" />} title="11/10 PM shift" subtitle="Room moves completed: 428 to 423." subtitleTone="muted" meta="17h" />
                  <WidgetRow href="#widget-list" lead={<Avatar initials="JR" name="Jo Reyes" />} title="AM shift" subtitle="Smooth shift. Delta all assigned and checked in." subtitleTone="muted" meta="1d" />
                </WidgetList>
              </Widget>
            </div>
          </Example>
        </DocPage>
      )}
      {page === "widget-row" && (
        <DocPage title="Widget row" description="One record in a widget, two lines: what and where on the left, age and owner on the right.">
          <Example id="widget-row-todo" title="Status and person" description="A to-do: its status, the room, the item, the age, and who has it." code={`import { Person, Status, WidgetRow } from "@lance-live/gallery-ui";

export function TodoRow() {
  return (
    <WidgetRow href="/todos" lead={<Status status="open" iconOnly />} title="Hallway" subtitle="Ice machine" meta="20m" trail={<Person name="Sarah" initials="SM" variant="pill" />} />
  );
}`}>
            <div className="sds widget-frame">
              <div className="sds widget">
                <WidgetList>
                  <WidgetRow href="#widget-row" lead={<Status status="open" iconOnly />} title="Hallway" subtitle="Ice machine" meta="20m" trail={<Person name="Sarah" initials="SM" variant="pill" />} />
                </WidgetList>
              </div>
            </div>
          </Example>
          <Example id="widget-row-note" title="Avatar and preview" description="A note: who wrote it, the title, and a muted first line." code={`import { Avatar, WidgetRow } from "@lance-live/gallery-ui";

export function NoteRow() {
  return (
    <WidgetRow href="/notes" lead={<Avatar initials="CS" name="Cy Smith" />} title="11/10 NA shift" subtitle="Guest Khari Emberly checked out two days early." subtitleTone="muted" meta="9h" />
  );
}`}>
            <div className="sds widget-frame">
              <div className="sds widget">
                <WidgetList>
                  <WidgetRow href="#widget-row" lead={<Avatar initials="CS" name="Cy Smith" />} title="11/10 NA shift" subtitle="Guest Khari Emberly checked out two days early." subtitleTone="muted" meta="9h" />
                </WidgetList>
              </div>
            </div>
          </Example>
        </DocPage>
      )}
      {page === "todos-widget" && (
        <DocPage title="To-dos widget" description="Open to-dos on Home, most urgent first. The plus creates one.">
          <Example id="todos-widget-example" title="Default" description="The live widget. The plus opens the editor, and the rows go to To-Dos." code={`import { TodosWidget } from "./todos-widget";

export function Home() {
  return <TodosWidget />;
}`}>
            <div className="sds widget-frame">
              <TodosWidget />
            </div>
          </Example>
        </DocPage>
      )}
      {page === "activity" && (
        <DocPage title="Activity" description="Activity is the thread of comments and status changes on a record, newest first.">
          <Example id="activity-example" title="Default" description="A thread that starts with a comment, and one that is only status." code={`import { ActivityFeed } from "@lance-live/gallery-ui";

export function Activity() {
  return (
    <ActivityFeed
      items={[
        { kind: "comment", name: "Sarah", initials: "SM", time: "now", body: "asdfasdf" },
        { kind: "status", name: "Sarah", initials: "SM", text: "assigned this to Mark", time: "Oct 29, 4:24 PM" },
      ]}
    />
  );
}`}>
          <div className="cols cols-even">
                      <div className="col">
                        <ActivityFeed
                          items={[
                            { kind: "comment", name: "Sarah", initials: "SM", time: "now", body: "asdfasdf" },
                            { kind: "comment", name: "Mark", initials: "MJ", time: "Oct 29, 5:05 PM", body: "I'll bring feather pillows up to 426." },
                            { kind: "status", name: "Sarah", initials: "SM", text: "assigned this to Mark", time: "Oct 29, 4:24 PM" },
                            { kind: "status", name: "Manual", initials: "M", text: "created this to-do", time: "Oct 29, 4:22 PM" },
                          ]}
                        />
                      </div>
                      <div className="col">
                        <ActivityFeed
                          items={[
                            { kind: "status", name: "Sarah", initials: "SM", text: "assigned this to Mark", time: "Oct 29, 4:24 PM" },
                            { kind: "status", name: "Manual", initials: "M", text: "created this to-do", time: "Oct 29, 4:22 PM" },
                          ]}
                        />
                      </div>
                    </div>
          </Example>
        </DocPage>
      )}
      {page === "toast" && (
        <DocPage title="Toast" description="A toast confirms an action that already happened. It does not ask a question.">
          <Example id="toast-example" title="Default" description="The confirmation after a to-do is created." code={`import { Toast } from "@lance-live/gallery-ui";

export function Created() {
  return <Toast message="New to-do created" />;
}`}>
          <Toast message="New to-do created" />
          </Example>
        </DocPage>
      )}
      {page === "tip" && (
        <DocPage title="Tooltip" description="A tooltip names the control under the pointer, and can show its shortcut. It sits above everything else.">
          <Example id="tip-example" title="Default" description="The label and the shortcut." code={`import { Tooltip } from "@lance-live/gallery-ui";

export function MessagesTip() {
  return <Tooltip label="Messages" shortcut="Opt M" />;
}`}>
          <Tooltip label="Messages" shortcut="Opt M" />
          </Example>
        </DocPage>
      )}
      {page === "status" && (
        <DocPage title="Status" description="Status says what the record is now: Open, In progress, or Completed.">
          <Example id="status-example" title="Default" description="The three states." code={`import { Status } from "@lance-live/gallery-ui";

export function OpenStatus() {
  return <Status status="open" />;
}`}>
          <div className="cols">
                      <div className="col symbol-col">
                        <Status status="open" />
                        <Status status="progress" />
                        <Status status="complete" />
                      </div>
                    </div>
          </Example>
          <Example id="status-icon" title="Icon only" description="Just the mark, for a column where every row is the same state, such as PM history. The word stays as the tooltip and for screen readers." code={`import { Status } from "@lance-live/gallery-ui";

export function DoneMark() {
  return <Status status="complete" iconOnly />;
}`}>
            <Status status="open" iconOnly />
            <Status status="progress" iconOnly />
            <Status status="complete" iconOnly />
          </Example>
        </DocPage>
      )}
      {page === "urgency" && (
        <DocPage title="Urgency" description="Urgency is a colored word. Urgent also carries the warning icon. Standard stays quiet.">
          <Example id="urgency-example" title="Default" description="Urgent, high, standard, and low." code={`import { Urgency } from "@lance-live/gallery-ui";

export function HighUrgency() {
  return <Urgency level="high" />;
}`}>
          <div className="cols">
                      <div className="sds col symbol-col">
                        <Urgency level="urgent" />
                        <Urgency level="high" />
                        <Urgency level="standard" />
                        <Urgency level="low" />
                      </div>
                    </div>
          </Example>
        </DocPage>
      )}
      {page === "header" && (
        <DocPage title="Header" description="The header is the title row: a page icon, the title, and a count. A main page can put its one primary action on the right.">
          <Example id="header-example" title="Default" description="The title row. A page adds its own action on the right." code={`import { PageHeader } from "@lance-live/gallery-ui";

export function TodosHeader() {
  return <PageHeader title="To-Dos" count="6" actions={null} />;
}`}>
          <div id="header">
            <PageHeader title="To-Dos" count="6" actions={null} />
          </div>
          </Example>
        </DocPage>
      )}
      {page === "sidebar" && (
        <DocPage title="Sidebar" description="The sidebar is shared chrome. A page does not restyle it. The current item is the one step of selection.">
          <Example id="sidebar-example" title="Default" description="Pinned, guest, and the collapsed groups." code={`import { Sidebar } from "@lance-live/gallery-ui";

export function AppSidebar() {
  return <Sidebar avatarSrc="/avatar-sarah.png" fixed={fixed} groups={groups} />;
}`}>
          <Sidebar avatarSrc="/avatar-sarah.png" fixed={sidebarFixed} groups={sidebarGroups} />
          </Example>
          <Example id="sidebar-item" title="Item" description="One link in the sidebar. Hover shows reorder and pin. A count sits at the end." code={`import { SidebarItem } from "@lance-live/gallery-ui";

export function MessagesLink() {
  return <SidebarItem icon="bubble" label="Messages" count={4} />;
}`}>
            <div className="sds side">
              <div className="side-links">
                <SidebarItem icon="bubble" label="Messages" count={4} />
                <SidebarItem icon="clipboard" label="To-Dos" current />
              </div>
            </div>
          </Example>
        </DocPage>
      )}
      {page === "tabs" && (
        <DocPage title="Tabs" description="Tabs filter a page by a status. The selected tab is one step from the bar, and its count stays readable.">
          <Example id="tabs-example" title="Default" description="The tabs on the page. The selected tab takes one step from the page." code={`import { Tabs } from "@lance-live/gallery-ui";

const items = [
  { value: "open", label: "Open", count: 8 },
  { value: "scheduled", label: "Scheduled", count: 2 },
  { value: "completed", label: "Completed", count: 346 },
];

export function StatusTabs() {
  return <Tabs items={items} value="open" />;
}`}>
            <Tabs items={tabs} value={tab} onValueChange={setTab} />
          </Example>
          <Example id="tabs-bar" title="On a bar" description="The tabs on the department bar. The selected tab takes one step from the bar." code={`import { Tabs } from "@lance-live/gallery-ui";

const items = [
  { value: "open", label: "Open", count: 8 },
  { value: "scheduled", label: "Scheduled", count: 2 },
  { value: "completed", label: "Completed", count: 346 },
];

export function StatusTabsBar() {
  return <Tabs items={items} value="open" bar />;
}`}>
            <Tabs items={tabs} value={barTab} onValueChange={setBarTab} bar />
          </Example>
        </DocPage>
      )}
      {page === "icons" && (
        <DocPage title="Icons" description="Icons share one construction: a 14px grid and a hairline stroke. A menu uses the same set.">
          <Example id="icons-example" title="Set" description="Every icon in the set." code={`import { Icon } from "@lance-live/gallery-ui";

export function ShareIcon() {
  return <Icon name="share" />;
}`}>
          <div className="cols cols-even">
                      {(Object.keys(icons) as IconName[]).map((name) => (
                        <Col k={name} key={name}>
                          <Icon name={name} />
                        </Col>
                      ))}
                    </div>
          </Example>
        </DocPage>
      )}
      {page === "datatable" && (
        <DocPage title="Data table" description="The table is the record. A cell edits in place, and the row opens the detail.">
          <DataTableSpecimen />
        </DocPage>
      )}
    </>
  );
}

