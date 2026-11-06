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
    <Group title="Data table">
      <section id="datatable">
        <h2>dataTable</h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "28px 32px", alignItems: "flex-start", marginBottom: 28 }}>
          <Col k="Status"><StatusCell defaultValue="open" /></Col>
          <Col k="Room"><RoomCell defaultValue="426" options={SHEET_ROOMS} /></Col>
          <Col k="Urgency"><UrgencyCell defaultValue="high" /></Col>
          <Col k="Type"><TypeCell defaultValue="Housekeeping" /></Col>
          <Col k="Assignee"><AssigneeCell name="Mark" initials="MJ" /></Col>
          <Col k="Date"><DateCell value="now" /></Col>
          <Col k="Dropdown title">
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
          </Col>
          <Col k="Editable title">
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
          </Col>
        </div>
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
      </section>
    </Group>
  );
}

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="group">
      <h2>{title}</h2>
      {children}
    </div>
  );
}

export function GallerySections() {
  const [tab, setTab] = useState("open");
  const [menu, setMenu] = useState<string | undefined>(undefined);
  return (
    <div className="sds">
      <Group title="Foundations">
        <section id="color">
          <h2>Color</h2>
          <ColorSwatches />
        </section>
        <section id="spacing">
          <h2>Spacing</h2>
          <SpacingScale />
        </section>
        <section id="type">
          <h2>Typography</h2>
          <TypeScale />
        </section>
      </Group>

      <Group title="Buttons">
        <section id="text-icon">
          <h2>Text and icon</h2>
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
            <span className="frame">
              <TextIcon className="ref" tone="delete-line" icon="trash">
                Delete
              </TextIcon>
            </span>
          </div>
        </section>
        <section className="band" id="chip">
          <h2>Chip</h2>
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
            <Col k="Hover">
              <span className="frame">
                <Chip className="ref" filter={{ name: "Room", value: "Room 12" }} />
              </span>
            </Col>
          </div>
        </section>
        <section id="department">
          <h2>Department tag</h2>
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
        </section>
      </Group>

      <Group title="Menus">
        <section id="menu">
          <h2>Drop down menu</h2>
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
            <Col k="Viewed">
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
            </Col>
          </div>
        </section>
        <section id="filter-menu">
          <h2>Filter menu</h2>
          <div className="cols">
            <Col k="Interactive">
              <FilterMenu />
            </Col>
            <Col k="Type open">
              <FilterMenu open branch="Type" selected={{ Type: ["Housekeeping"] }} readOnly />
            </Col>
          </div>
          <div className="cols">
            <Col k="Status">
              <FilterSubmenu field="Status" selected={["In progress"]} readOnly />
            </Col>
            <Col k="Urgency">
              <FilterSubmenu field="Urgency" selected={["High"]} readOnly />
            </Col>
            <Col k="Assigned">
              <FilterSubmenu field="Assigned" selected={["Mark"]} readOnly />
            </Col>
            <Col k="Room">
              <FilterSubmenu field="Room" selected={["426"]} readOnly />
            </Col>
          </div>
        </section>
        <section id="confirm">
          <h2>Delete confirmation</h2>
          <div className="cols">
            <Col k="Interactive">
              <Confirm name="test" noun="______" />
            </Col>
            <Col k="Base">
              <Confirm className="ref" name="test" noun="______" />
            </Col>
          </div>
        </section>
      </Group>

      <Group title="Fields">
        <section id="titles">
          <h2>Title and subtitle options</h2>
          <div className="cols cols-even">
            <Col k="Top and bottom">
              <Meta label="Description" value="broken screw near the window" />
            </Col>
            <Col k="Side by side">
              <Meta label="Location" value="Guestroom" layout="pair" />
            </Col>
          </div>
        </section>
        <section id="search">
          <h2>Search bar</h2>
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
        </section>
        <section id="checkbox">
          <h2>Checkbox</h2>
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
        </section>
        <section id="fields">
          <h2>Text fields</h2>
          <div className="cols">
            <Col k="Interactive">
              <TextField label="Text field title" />
            </Col>
            <Col k="Base">
              <TextField label="Text field title" />
            </Col>
            <Col k="Base">
              <TextField label="Text field title" multiline />
            </Col>
          </div>
        </section>
      </Group>

      <Group title="People">
        <section id="profile">
          <h2>Profile picture</h2>
          <div className="cols profile-cols">
            <Col k="Picture and name">
              <Person name="Sarah Mou" />
            </Col>
            <Col k="Miniature tag">
              <Person name="Sarah" variant="mini" />
            </Col>
            <Col k="Miniature tag">
              <Person name="Sarah" variant="pill" />
            </Col>
            <Col k="Unassigned">
              <Person name="Sarah" variant="unassigned" />
            </Col>
            <Col k="Picture and role">
              <Person name="Sarah Mou" role="Housekeeper" variant="role" />
            </Col>
            <Col k="Picture and title">
              <Person name="Sarah Mou" variant="title" time="Today ·10:38 AM" title="Eligible Enrollments 10/16/26" />
            </Col>
            <Col k="Miniature tag">
              <Person name="Sarah" variant="message" />
            </Col>
          </div>
        </section>
        <section id="lance">
          <h2>Lance bot</h2>
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
        </section>
        <section id="lance-side">
          <h2>Lance sidebar</h2>
          <div className="lance-frame">
            <LancePanel />
          </div>
        </section>
        <section id="messaging">
          <h2>Messaging</h2>
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
        </section>
        <section id="comment">
          <h2>Comment</h2>
          <div className="cols">
            <Col k="Base">
              <Comment className="ref" name="Sarah" initials="SM" time="now" body="okay" />
            </Col>
            <Col k="Hover">
              <Comment className="ref" name="Sarah" initials="SM" time="now" body="okay" hover />
            </Col>
          </div>
        </section>
        <section id="activity">
          <h2>Activity</h2>
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
        </section>
      </Group>

      <Group title="Feedback">
        <section id="toast">
          <h2>Toast</h2>
          <div className="cols">
            <Col k="Interactive">
              <Toast message="New to-do created" />
            </Col>
            <Col k="Base">
              <Toast message="New to-do created" />
            </Col>
          </div>
        </section>
        <section id="tip">
          <h2>Tool tip</h2>
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
        </section>
        <section id="status">
          <h2>Status symbols</h2>
          <div className="cols">
            <div className="col symbol-col">
              <span className="k">Base</span>
              <Status status="open" />
              <Status status="progress" />
              <Status status="complete" />
            </div>
          </div>
        </section>
        <section id="urgency">
          <h2>Urgency symbols</h2>
          <div className="cols">
            <div className="sds col symbol-col">
              <span className="k">Base</span>
              <Urgency level="urgent" />
              <Urgency level="high" />
              <Urgency level="standard" />
              <Urgency level="low" />
            </div>
          </div>
        </section>
      </Group>

      <DataTableSpecimen />

      <Group title="Navigation">
        <section id="header">
          <h2>Header</h2>
          <PageHeader title="To-Dos" count="6" />
        </section>
        <section id="sidebar">
          <h2>Sidebar</h2>
          <Sidebar avatarSrc="/avatar-sarah.png" fixed={sidebarFixed} groups={sidebarGroups} />
        </section>
        <section id="tabs">
          <h2>Primary tabs</h2>
          <div className="cols">
            <Col k="Interactive">
              <Tabs items={tabs} value={tab} onValueChange={setTab} />
              <Tabs items={tabs} value={tab} onValueChange={setTab} bar />
            </Col>
          </div>
        </section>
      </Group>

      <Group title="Icons">
        <section id="icons">
          <h2>Icon</h2>
          <div className="cols cols-even">
            {(Object.keys(icons) as IconName[]).map((name) => (
              <Col k={name} key={name}>
                <Icon name={name} />
              </Col>
            ))}
          </div>
        </section>
      </Group>
    </div>
  );
}
