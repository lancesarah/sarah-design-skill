"use client";

import { useRef, useState, type ReactNode } from "react";
import {
  Checkbox,
  Chip,
  ColorSwatches,
  ActivityFeed,
  Comment,
  Composer,
  Confirm,
  DEPARTMENTS,
  DepartmentChip,
  Icon,
  OverlayMenu,
  icons,
  LancePanel,
  FilterMenu,
  FilterSubmenu,
  Menu,
  Meta,
  PageHeader,
  Person,
  SearchField,
  Sidebar,
  type SidebarGroup,
  type SidebarLink,
  SpacingScale,
  Status,
  Tabs,
  TextField,
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
} from "@lance-live/gallery-ui";
import { DocPage, Example } from "./docs-example";

const menuItems = [
  { value: "Share", label: "Share", icon: "share" as const },
  { value: "Edit", label: "Edit", icon: "edit" as const },
  { value: "Delete", label: "Delete", icon: "trash" as const, danger: true },
];

const hoverMenu = [
  { value: "Share", label: "Share", icon: "share" as const, state: "hover" as const },
  { value: "Edit", label: "Edit", icon: "edit" as const },
  { value: "Delete", label: "Delete", icon: "trash" as const, danger: true },
];

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
            <DepartmentChip name={item.value} />
            <Icon name="check" size={14} className="check" />
          </button>
        ))}
      </OverlayMenu>
    </>
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
    </>
  );
}

export function GallerySections({ page }: { page: string }) {
  const [tab, setTab] = useState("open");
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
          <TypeScale />
          </Example>
        </DocPage>
      )}
      {page === "text-icon" && (
        <DocPage title="Text and icon" description="A text button is a quiet action: a label, an icon, and no fill until hover.">
          <Example id="text-icon-example" title="Default" description="Label, small, and delete." code={`import { TextIcon } from "@lance-live/gallery-ui";

export function ShareAction() {
  return <TextIcon>Share</TextIcon>;
}`}>
          <div className="stack">
                      <span className="stack-live">
                        <span className="k">Interactive</span>
                        <span className="frame">
                          <TextIcon>Share</TextIcon>
                        </span>
                      </span>
                      <span className="frame">
                        <TextIcon className="ref">Share</TextIcon>
                      </span>
                      <span className="frame">
                        <TextIcon className="ref" size="sm">
                          Share
                        </TextIcon>
                      </span>
                      <span className="frame">
                        <TextIcon className="ref" tone="delete" icon="trash">
                          Delete
                        </TextIcon>
                      </span>
                    </div>
          </Example>
        </DocPage>
      )}
      {page === "chip" && (
        <DocPage title="Chip" description="A chip is a compact action. The filter chip is a separate variant, used only for a chosen filter.">
          <Example id="chip-example" title="Default" description="A label, with or without an icon." code={`import { Chip } from "@lance-live/gallery-ui";

export function NewChip() {
  return <Chip>New</Chip>;
}`}>
          <div className="cols">
                      <Col k="Interactive">
                        <span className="frame">
                          <Chip>New</Chip>
                        </span>
                      </Col>
                      <Col k="Base">
                        <span className="frame">
                          <Chip className="ref">New</Chip>
                        </span>
                      </Col>
                      <Col k="Hover">
                        <span className="frame">
                          <Chip className="ref" state="hover">
                            New
                          </Chip>
                        </span>
                      </Col>
                      <Col k="Base">
                        <span className="frame">
                          <Chip className="ref" icon aria-label="New" />
                        </span>
                      </Col>
                      <Col k="Hover">
                        <span className="frame">
                          <Chip className="ref" icon state="hover" aria-label="New" />
                        </span>
                      </Col>
                      <Col k="Hover">
                        <span className="frame">
                          <Chip className="ref" icon state="hover">
                            New
                          </Chip>
                        </span>
                      </Col>
                    </div>
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
            <span className="frame">
              <Chip className="ref" filter={{ name: "Room", value: "Room 12" }} />
            </span>
          </Example>
        </DocPage>
      )}
      {page === "department" && (
        <DocPage title="Department tag" description="A department keeps one color wherever it appears: a tag, a filter, or a table.">
          <Example id="department-example" title="Default" description="Every department, then the tag as a menu." code={`import { DepartmentChip } from "@lance-live/gallery-ui";

export function DepartmentTag() {
  return <DepartmentChip name="Front desk" />;
}`}>
          <div className="cols">
                      <div className="col symbol-col">
                        <span className="k">Base</span>
                        {DEPARTMENTS.map((item) => (
                          <DepartmentChip key={item.dept} name={item.value} />
                        ))}
                      </div>
                      <Col k="Interactive">
                        <DepartmentPick />
                      </Col>
                      <Col k="Hover">
                        <DepartmentChip as="button" className="ref" name="Front desk" state="hover" />
                      </Col>
                      <Col k="Open">
                        <DepartmentChip as="button" className="ref" name="Front desk" state="open" aria-expanded />
                      </Col>
                    </div>
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
          <div className="cols drop-row">
                      <Col k="Interactive">
                        <Menu items={menuItems} value={menu} onValueChange={setMenu} searchable />
                      </Col>
                      <Col k="Base">
                        <Menu className="ref" items={menuItems} open />
                      </Col>
                      <Col k="Hover">
                        <Menu className="ref" items={hoverMenu} open triggerState="hover" />
                      </Col>
                      <Col k="Searchable">
                        <Menu className="ref" items={menuItems} open searchable />
                      </Col>
                    </div>
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
          <div className="cols">
                      <Col k="Interactive">
                        <FilterMenu />
                      </Col>
                      <Col k="Type open">
                        <FilterMenu open branch="Type" selected={{ Type: ["Housekeeping"] }} readOnly />
                      </Col>
                    </div>
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
          <div className="cols">
                      <Col k="Interactive">
                        <Confirm name="test" noun="______" />
                      </Col>
                      <Col k="Base">
                        <Confirm className="ref" name="test" noun="______" />
                      </Col>
                    </div>
          </Example>
        </DocPage>
      )}
      {page === "titles" && (
        <DocPage title="Title and subtitle" description="A title and its subtitle stack, or they sit on one line when the pair is short.">
          <Example id="titles-stacked" title="Stacked" description="The label sits above the value when the value is a sentence." code={`import { Meta } from "@lance-live/gallery-ui";

export function Description() {
  return <Meta label="Description" value="broken screw near the window" />;
}`}>
            <Meta label="Description" value="broken screw near the window" />
          </Example>
          <Example id="titles-pair" title="Side by side" description="A short pair stays on one line. Location uses this." code={`import { Meta } from "@lance-live/gallery-ui";

export function Location() {
  return <Meta label="Location" value="Guestroom" layout="pair" />;
}`}>
            <Meta label="Location" value="Guestroom" layout="pair" />
          </Example>
        </DocPage>
      )}
      {page === "search" && (
        <DocPage title="Search" description="Search is a field. On a sheet it sits with the filter control. On its own it can be the icon.">
          <Example id="search-example" title="Default" description="Empty, filled, and the icon button." code={`import { SearchField } from "@lance-live/gallery-ui";

export function Search() {
  return <SearchField />;
}`}>
          <div className="cols">
                      <Col k="Interactive">
                        <span className="frame">
                          <SearchField />
                        </span>
                      </Col>
                      <Col k="Base">
                        <span className="frame">
                          <SearchField className="ref" />
                        </span>
                      </Col>
                      <Col k="Hover">
                        <span className="frame">
                          <SearchField className="ref" state="hover" />
                        </span>
                      </Col>
                      <Col k="Interaction">
                        <span className="frame">
                          <SearchField className="ref" defaultValue="Hi I’m Sarah" />
                        </span>
                      </Col>
                      <Col k="Search icon">
                        <span className="frame">
                          <SearchField className="ref" iconOnly label="Search" />
                        </span>
                      </Col>
                      <Col k="Search icon hover">
                        <span className="frame">
                          <SearchField className="ref" iconOnly label="Search" state="hover" />
                        </span>
                      </Col>
                    </div>
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
          <div className="cols">
                      <Col k="Interactive">
                        <span className="sds check-list">
                          <Checkbox defaultChecked>Pennies</Checkbox>
                          <Checkbox defaultChecked>Nickels</Checkbox>
                          <Checkbox>Deposit/drop</Checkbox>
                        </span>
                      </Col>
                      <Col k="Checked">
                        <Checkbox className="ref" checked>
                          Pennies
                        </Checkbox>
                      </Col>
                      <Col k="Unchecked">
                        <Checkbox className="ref">Deposit/drop</Checkbox>
                      </Col>
                      <Col k="Hover">
                        <Checkbox className="ref" state="hover">
                          Deposit/drop
                        </Checkbox>
                      </Col>
                      <Col k="Checked hover">
                        <Checkbox className="ref" checked state="hover">
                          Pennies
                        </Checkbox>
                      </Col>
                    </div>
          </Example>
        </DocPage>
      )}
      {page === "fields" && (
        <DocPage title="Text field" description="A labeled field, a line with no label, and a multiline note.">
          <Example id="fields-example" title="Default" description="One line, and a multiline note." code={`import { TextField } from "@lance-live/gallery-ui";

export function NoteField() {
  return <TextField label="Text field title" />;
}`}>
          <div className="cols">
                      <Col k="Interactive">
                        <TextField label="Text field title" />
                      </Col>
                      <Col k="Base">
                        <TextField label="Text field title" />
                      </Col>
                      <Col k="Line">
                        <input className="sds line" placeholder="New step name..." aria-label="New step name" />
                      </Col>
                    </div>
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
      {page === "lance" && (
        <DocPage title="Lance" description="Lance is the assistant composer. The field grows when there is a question in it.">
          <Example id="lance-example" title="Default" description="Empty, hover, and a typed question." code={`import { Composer } from "@lance-live/gallery-ui";

export function AskLance() {
  return <Composer kind="lance" placeholder="Ask Lance anything..." />;
}`}>
          <div className="cols">
                      <Col k="Interactive">
                        <Composer kind="lance" placeholder="Ask Lance anything..." />
                      </Col>
                      <Col k="Base">
                        <Composer className="ref" kind="lance" placeholder="Ask Lance anything..." />
                      </Col>
                      <Col k="Hover">
                        <Composer className="ref" kind="lance" placeholder="Ask Lance anything..." state="hover" />
                      </Col>
                      <Col k="Interaction">
                        <Composer className="ref" kind="lance" placeholder="Ask Lance anything..." state="typed" defaultValue="How many rooms are occupied?" />
                      </Col>
                    </div>
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
          <div className="cols">
                      <Col k="Interactive">
                        <Composer kind="message" placeholder="Write a message..." />
                      </Col>
                      <Col k="Base">
                        <Composer className="ref" kind="message" placeholder="Write a message..." />
                      </Col>
                      <Col k="Hover">
                        <Composer className="ref" kind="message" placeholder="Write a message..." state="hover" />
                      </Col>
                      <Col k="Interaction">
                        <Composer className="ref" kind="message" placeholder="Write a message..." state="typed" defaultValue="Hello world!" />
                      </Col>
                    </div>
          </Example>
        </DocPage>
      )}
      {page === "comment" && (
        <DocPage title="Comment" description="A comment is the author, the time, and the body. Hover shows the actions on that row.">
          <Example id="comment-example" title="Default" description="Rest, and hover." code={`import { Comment } from "@lance-live/gallery-ui";

export function CommentRow() {
  return <Comment name="Sarah" initials="SM" time="now" body="okay" />;
}`}>
          <div id="comment" className="cols">
                      <Col k="Base">
                        <Comment className="ref" name="Sarah" initials="SM" time="now" body="okay" />
                      </Col>
                      <Col k="Hover">
                        <Comment className="ref" name="Sarah" initials="SM" time="now" body="okay" hover />
                      </Col>
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
                      <Col k="Past status">
                        <ActivityFeed
                          items={[
                            { kind: "comment", name: "Sarah", initials: "SM", time: "now", body: "asdfasdf" },
                            { kind: "comment", name: "Mark", initials: "MJ", time: "Oct 29, 5:05 PM", body: "I'll bring feather pillows up to 426." },
                            { kind: "status", name: "Sarah", initials: "SM", text: "assigned this to Mark", time: "Oct 29, 4:24 PM" },
                            { kind: "status", name: "Manual", initials: "M", text: "created this to-do", time: "Oct 29, 4:22 PM" },
                          ]}
                        />
                      </Col>
                      <Col k="Status first">
                        <ActivityFeed
                          items={[
                            { kind: "status", name: "Sarah", initials: "SM", text: "assigned this to Mark", time: "Oct 29, 4:24 PM" },
                            { kind: "status", name: "Manual", initials: "M", text: "created this to-do", time: "Oct 29, 4:22 PM" },
                          ]}
                        />
                      </Col>
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
          <div className="cols">
                      <Col k="Interactive">
                        <Toast message="New to-do created" />
                      </Col>
                      <Col k="Base">
                        <Toast message="New to-do created" />
                      </Col>
                    </div>
          </Example>
        </DocPage>
      )}
      {page === "tip" && (
        <DocPage title="Tooltip" description="A tooltip names the control under the pointer, and can show its shortcut. It sits above everything else.">
          <Example id="tip-example" title="Default" description="The label and the shortcut." code={`import { Tooltip } from "@lance-live/gallery-ui";

export function MessagesTip() {
  return <Tooltip label="Messages" shortcut="Opt M" />;
}`}>
          <div className="cols">
                      <Col k="Interactive">
                        <Tooltip label="Messages" shortcut="Opt M" />
                      </Col>
                      <Col k="Base">
                        <span className="tip ref">
                          Messages <span>Opt M</span>
                        </span>
                      </Col>
                    </div>
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
                        <span className="k">Base</span>
                        <Status status="open" />
                        <Status status="progress" />
                        <Status status="complete" />
                      </div>
                    </div>
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
                        <span className="k">Base</span>
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
        </DocPage>
      )}
      {page === "tabs" && (
        <DocPage title="Tabs" description="Tabs filter a page by a status. The selected tab is one step from the bar, and its count stays readable.">
          <Example id="tabs-example" title="Default" description="The tabs on their own, and on the department bar." code={`import { Tabs } from "@lance-live/gallery-ui";

const items = [
  { value: "open", label: "Open", count: 8 },
  { value: "scheduled", label: "Scheduled", count: 2 },
  { value: "completed", label: "Completed", count: 346 },
];

export function StatusTabs() {
  return <Tabs items={items} value="open" />;
}`}>
          <div className="cols">
                      <Col k="Interactive">
                        <Tabs items={tabs} value={tab} onValueChange={setTab} />
                        <Tabs items={tabs} value={tab} onValueChange={setTab} bar />
                      </Col>
                    </div>
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

