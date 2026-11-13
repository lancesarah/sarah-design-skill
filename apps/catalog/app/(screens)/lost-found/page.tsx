"use client";

import {
  Chip,
  Button,
  CHIP_LABEL_INSET,
  ChipDropdown,
  ConfirmDialog,
  DataTable,
  DetailPanel,
  EditorDialog,
  EditorField,
  EditorFields,
  EditorPhotos,
  EditorPill,
  EditorPills,
  FactRow,
  Icon,
  PhotoPill,
  PhotoThumb,
  PhotoViewer,
  RequiredToast,
  RoomPill,
  TITLE_TEXT_INSET,
  TEXT_SHORT_MIN,
  Tabs,
  TitleSubtitle,
  captureClose,
  dateColumn,
  taskMenuItem,
  useTableMenu,
  type DataColumn,
} from "@lance-live/sds";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { putBack, useNotify } from "../action-toast";
import { FilterMenu, SearchBox } from "../chrome";
import { PageLayout } from "../page-layout";

type Bucket = "held" | "returned" | "archived";
type Area = "guestroom" | "common_areas" | "employee_areas" | "guest_amenities" | "exterior";
type Category = "Electronics" | "Clothing" | "Documents" | "Jewelry" | "Keys" | "Toiletries" | "Other";

type FoundItem = {
  id: string;
  bucket: Bucket;
  photo: string | null;
  description: string;
  category: Category | "";
  area: Area | "";
  roomNumber: string;
  storage: string;
  notes: string;
  found: string;
};

const BUCKETS: Array<{ value: Bucket; label: string }> = [
  { value: "held", label: "Held" },
  { value: "returned", label: "Returned" },
  { value: "archived", label: "Archived" },
];

function bucketLabel(bucket: Bucket) {
  return BUCKETS.find((item) => item.value === bucket)?.label ?? bucket;
}

const CATEGORIES: Category[] = ["Electronics", "Clothing", "Documents", "Jewelry", "Keys", "Toiletries", "Other"];
const ROOMS = ["214", "318", "412", "902", "1013"];
const AREAS: Array<{ value: Area; label: string }> = [
  { value: "guestroom", label: "Guestroom" },
  { value: "common_areas", label: "Common Areas" },
  { value: "employee_areas", label: "Employee Areas" },
  { value: "guest_amenities", label: "Guest Amenities" },
  { value: "exterior", label: "Exterior" },
];

const STARTER: FoundItem[] = [
  {
    id: "charger",
    bucket: "held",
    photo: "/lost-charger.jpg",
    description: "Black iPhone charger",
    category: "Electronics",
    area: "guestroom",
    roomNumber: "412",
    storage: "Front desk",
    notes: "White cable, scuffed corner",
    found: "20m",
  },
  {
    id: "scarf",
    bucket: "held",
    photo: "/lost-scarf.jpg",
    description: "Navy wool scarf",
    category: "Clothing",
    area: "common_areas",
    roomNumber: "",
    storage: "Housekeeping closet",
    notes: "No label",
    found: "3h",
  },
  {
    id: "key",
    bucket: "held",
    photo: null,
    description: "Silver room key",
    category: "Keys",
    area: "guest_amenities",
    roomNumber: "",
    storage: "Front desk",
    notes: "Sleeve says 318",
    found: "2d",
  },
  {
    id: "earring",
    bucket: "returned",
    photo: null,
    description: "Gold hoop earring",
    category: "Jewelry",
    area: "exterior",
    roomNumber: "",
    storage: "Lost and found bin",
    notes: "Single hoop",
    found: "5d",
  },
];

/** Widest chip, including the chevron the column keeps even while it is hidden. */
function measuredChip(id: string, label: string) {
  return (
    <span
      data-col={id}
      style={{ display: "inline-flex", alignItems: "center", width: "max-content", padding: "2px 4px" }}
    >
      <span>{label}</span>
      <span style={{ width: 10, minWidth: 10, marginInlineStart: 4, flex: "none" }}>
        <Icon name="chevron" size={10} />
      </span>
    </span>
  );
}

function areaLabel(area: Area | "") {
  return AREAS.find((item) => item.value === area)?.label ?? "";
}

function foundAt(row: FoundItem) {
  if (row.area === "guestroom") {
    const room = row.roomNumber.trim();
    return room ? `Guestroom ${room}` : "Guestroom";
  }
  return areaLabel(row.area);
}

type ItemPick = "category" | "area";

function SideValue({ value }: { value: string }) {
  return <span className={value ? "todo-side-value" : "todo-side-value is-quiet"}>{value || "–"}</span>;
}

/** The pill editor for a found item. A new item joins the table only when it is saved. */
function ItemEditor({
  item,
  onClose,
  onSave,
  onDelete,
}: {
  /** An item to edit. Without it the editor logs a new one. */
  item?: FoundItem;
  onClose: () => void;
  onSave: (item: FoundItem) => void;
  onDelete?: () => void;
}) {
  const [draft, setDraft] = useState<FoundItem>(() => item ?? ({
    id: `item-${Date.now()}`,
    bucket: "held",
    photo: null,
    description: "",
    category: "",
    area: "",
    roomNumber: "",
    storage: "",
    notes: "",
    found: "now",
  }));
  const [confirm, setConfirm] = useState(false);
  const [menu, setMenu] = useState<ItemPick | null>(null);
  const [tried, setTried] = useState(false);
  const [toast, setToast] = useState(0);
  const hideToast = useCallback(() => setToast(0), []);
  const guestroom = draft.area === "guestroom";
  const missing = {
    description: !draft.description.trim(),
    category: !draft.category,
    area: !draft.area,
    room: guestroom && !draft.roomNumber.trim(),
    storage: !draft.storage.trim(),
  };
  const patch = (next: Partial<FoundItem>) => setDraft((current) => ({ ...current, ...next }));
  const toggle = (next: ItemPick) => setMenu((current) => (current === next ? null : next));
  const area = (
    <EditorPill
      icon="location"
      open={menu === "area"}
      onToggle={() => toggle("area")}
      value={areaLabel(draft.area) || "Found at"}
      quiet={!draft.area}
      invalid={tried && missing.area}
      menu={AREAS.map((option) =>
        taskMenuItem(option.value, option.value === draft.area, () => {
          patch({ area: option.value, roomNumber: option.value === "guestroom" ? draft.roomNumber : "" });
          setMenu(null);
        }, option.label),
      )}
    />
  );

  return (
    <>
      <EditorDialog
        kicker={item ? "Edit item" : "Log item"}
        layout="pills"
        className="pm-page todo-editor"
        title={draft.description}
        titlePlaceholder="What it is"
        onTitleChange={(value) => patch({ description: value.replace(/\n+/g, " ") })}
        subtitle={draft.notes}
        subtitleLabel="Notes"
        subtitlePlaceholder="Add notes: brand, color, scratches"
        onSubtitleChange={(notes) => patch({ notes })}
        deleteLabel="Delete item"
        onDelete={item && onDelete ? () => setConfirm(true) : undefined}
        onClose={onClose}
        onEscape={() => {
          if (confirm) return true;
          if (!menu) return false;
          setMenu(null);
          return true;
        }}
        footer={
          <>
            <PhotoPill onAdd={(photos) => photos[0] && patch({ photo: photos[0].src })} />
            <Button
              onClick={() => {
                if (Object.values(missing).some(Boolean)) {
                  setTried(true);
                  setToast(Date.now());
                  return;
                }
                onSave({ ...draft, description: draft.description.trim(), storage: draft.storage.trim() });
              }}
            >
              Save item
            </Button>
          </>
        }
      >
        {draft.photo ? (
          <EditorPhotos photos={[{ src: draft.photo, alt: draft.description }]} onRemove={() => patch({ photo: null })} />
        ) : null}
        <EditorFields>
          <EditorField label="Stored" placeholder="Front desk" value={draft.storage} onChange={(storage) => patch({ storage })} />
        </EditorFields>
        <EditorPills>
          <EditorPill
            icon="tag"
            open={menu === "category"}
            onToggle={() => toggle("category")}
            value={draft.category || "Category"}
            quiet={!draft.category}
            invalid={tried && missing.category}
            menu={CATEGORIES.map((category) =>
              taskMenuItem(category, category === draft.category, () => {
                patch({ category });
                setMenu(null);
              }, category),
            )}
          />
          <RoomPill lead={area} open={guestroom} value={draft.roomNumber} onChange={(roomNumber) => patch({ roomNumber: roomNumber.replace(/\n+/g, " ") })} invalid={tried && missing.room} />
        </EditorPills>
      </EditorDialog>
      {toast ? <RequiredToast id={toast} onDone={hideToast} /> : null}
      {onDelete ? (
        <ConfirmDialog
          open={confirm}
          name={draft.description.trim() || "Item"}
          noun="item"
          onCancel={() => setConfirm(false)}
          onConfirm={() => {
            setConfirm(false);
            onDelete();
          }}
        />
      ) : null}
    </>
  );
}

export default function LostFoundPage() {
  const notify = useNotify();
  const [items, setItems] = useState(STARTER);
  const [logging, setLogging] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [viewing, setViewing] = useState(false);
  const [bucket, setBucket] = useState<Bucket>("held");
  const [query, setQuery] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [enteringId, setEnteringId] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [present, setPresent] = useState(false);
  const [hidden, setHidden] = useState(true);
  const retained = useRef<FoundItem | null>(null);
  const menu = useTableMenu();

  const itemsRef = useRef(items);
  itemsRef.current = items;
  useEffect(
    () => () => {
      for (const row of itemsRef.current) {
        if (row.photo?.startsWith("blob:")) URL.revokeObjectURL(row.photo);
      }
    },
    [],
  );

  function patch(id: string, next: Partial<FoundItem>) {
    setItems((list) => list.map((row) => (row.id === id ? { ...row, ...next } : row)));
  }

  const columns: Array<DataColumn<FoundItem>> = [
    {
      id: "photo",
      title: "Photo",
      sortable: false,
      render: (row) =>
        row.photo ? (
          <img src={row.photo} alt="" width={32} height={32} style={{ width: 32, height: 32, objectFit: "cover", borderRadius: 4 }} />
        ) : (
          <span style={{ color: "var(--text-muted)" }}>N/A</span>
        ),
    },
    {
      id: "description",
      title: "Item",
      text: "primary",
      flex: true,
      minWidth: TEXT_SHORT_MIN,
      lines: 2,
      sortable: false,
      sortValue: (row) => row.description,
      render: (row) => (
        <TitleSubtitle
          variant="editable"
          title={row.description}
          titleLabel="Item"
          titlePlaceholder="Item"
          onTitleChange={(value) => patch(row.id, { description: value })}
          subtitle={row.notes}
          subtitleLabel="Notes"
          subtitlePlaceholder="Add a note"
          onSubtitleChange={(value) => patch(row.id, { notes: value })}
        />
      ),
    },
    {
      id: "category",
      title: "Category",
      labelInset: CHIP_LABEL_INSET,
      sortable: false,
      sortValue: (row) => row.category,
      minContent: <>{CATEGORIES.map((category) => <span key={category}>{measuredChip("category", category)}</span>)}</>,
      render: (row) => (
        <ChipDropdown
          open={menu.isOpen(row.id, "category")}
          onToggle={() => menu.toggle(row.id, "category")}
          menu={CATEGORIES.map((category) => (
            <button
              key={category}
              className="menu-item"
              type="button"
              role="menuitemradio"
              aria-checked={row.category === category}
              onClick={() => {
                menu.toggle(row.id, "category");
                patch(row.id, { category });
              }}
            >
              {category}
              <Icon name="check" size={14} className="check" />
            </button>
          ))}
        >
          <span style={row.category ? undefined : { color: "var(--black-50)" }}>{row.category || "Category"}</span>
        </ChipDropdown>
      ),
    },
    {
      id: "foundAt",
      title: "Found at",
      labelInset: CHIP_LABEL_INSET,
      sortable: false,
      sortValue: (row) => foundAt(row),
      minContent: (
        <>
          {AREAS.map((area) => (
            <span key={area.value}>{measuredChip("foundAt", area.label)}</span>
          ))}
          <span data-col="foundAt" style={{ display: "inline-block", paddingInline: CHIP_LABEL_INSET }}>
            Guestroom {ROOMS.reduce((longest, room) => (room.length > longest.length ? room : longest), "")}
          </span>
        </>
      ),
      render: (row) =>
        row.area === "guestroom" ? (
          <span style={{ paddingInline: CHIP_LABEL_INSET }}>{foundAt(row)}</span>
        ) : (
          <ChipDropdown
            open={menu.isOpen(row.id, "area")}
            onToggle={() => menu.toggle(row.id, "area")}
            menu={AREAS.map((area) => (
              <button
                key={area.value}
                className="menu-item"
                type="button"
                role="menuitemradio"
                aria-checked={row.area === area.value}
                onClick={() => {
                  menu.toggle(row.id, "area");
                  patch(row.id, {
                    area: area.value,
                    roomNumber: area.value === "guestroom" ? row.roomNumber : "",
                  });
                }}
              >
                {area.label}
                <Icon name="check" size={14} className="check" />
              </button>
            ))}
          >
            <span style={row.area ? undefined : { color: "var(--black-50)" }}>{areaLabel(row.area) || "Area"}</span>
          </ChipDropdown>
        ),
    },
    {
      id: "storage",
      title: "Stored",
      text: "short",
      labelInset: TITLE_TEXT_INSET,
      sortable: false,
      sortValue: (row) => row.storage,
      render: (row) => (
        <input
          className="title-sub-field"
          aria-label="Location"
          placeholder="Location"
          value={row.storage}
          onPointerDown={(event) => event.stopPropagation()}
          onClick={(event) => event.stopPropagation()}
          onChange={(event) => patch(row.id, { storage: event.target.value })}
        />
      ),
    },
    {
      id: "bucket",
      title: "Status",
      labelInset: CHIP_LABEL_INSET,
      sortable: false,
      sortValue: (row) => row.bucket,
      minContent: <>{BUCKETS.map((item) => <span key={item.value}>{measuredChip("bucket", item.label)}</span>)}</>,
      render: (row) => (
        <ChipDropdown
          open={menu.isOpen(row.id, "bucket")}
          onToggle={() => menu.toggle(row.id, "bucket")}
          menu={BUCKETS.map((item) => (
            <button
              key={item.value}
              className="menu-item"
              type="button"
              role="menuitemradio"
              aria-checked={row.bucket === item.value}
              onClick={() => {
                menu.toggle(row.id, "bucket");
                assign(row, item.value);
              }}
            >
              {item.label}
              <Icon name="check" size={14} className="check" />
            </button>
          ))}
        >
          {bucketLabel(row.bucket)}
        </ChipDropdown>
      ),
    },
    dateColumn({ id: "found", title: "Logged", value: (row) => row.found }),
  ];

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return items.filter((row) => {
      if (row.bucket !== bucket) return false;
      if (categories.length > 0 && !categories.includes(row.category)) return false;
      if (!needle) return true;
      return `${row.description} ${row.category} ${foundAt(row)} ${row.storage} ${row.notes}`.toLowerCase().includes(needle);
    });
  }, [items, bucket, categories, query]);

  const open = items.find((row) => row.id === selected) ?? null;
  if (open) retained.current = open;

  useEffect(() => {
    if (open) {
      setPresent(true);
      return;
    }
    setHidden(true);
  }, [open]);

  useEffect(() => {
    if (!present || !open) return;
    const frame = requestAnimationFrame(() => setHidden(false));
    return () => cancelAnimationFrame(frame);
  }, [present, open]);

  useEffect(() => {
    if (!present || !hidden || open) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timer = window.setTimeout(() => setPresent(false), reduce ? 0 : 360);
    return () => window.clearTimeout(timer);
  }, [present, hidden, open]);

  function saveItem(item: FoundItem) {
    setEditing(null);
    setItems((list) =>
      list.map((row) => {
        if (row.id !== item.id) return row;
        if (row.photo !== item.photo && row.photo?.startsWith("blob:")) URL.revokeObjectURL(row.photo);
        return item;
      }),
    );
    notify("Item updated");
  }

  function addItem(item: FoundItem) {
    setLogging(false);
    setBucket("held");
    setQuery("");
    setCategories([]);
    setItems((list) => [item, ...list]);
    setEnteringId(item.id);
    notify("Item added");
  }

  function assign(row: FoundItem, next: Bucket) {
    if (row.bucket === next) return;
    const play = captureClose(document.querySelector(`[data-record="${CSS.escape(row.id)}"]`));
    flushSync(() => {
      setItems((list) => list.map((item) => (item.id === row.id ? { ...item, bucket: next } : item)));
      if (next !== bucket) setSelected((current) => (current === row.id ? null : current));
    });
    play();
    if (next === "returned") {
      const name = row.description.trim() || "Item";
      notify({
        message: `${name} marked returned`,
        action: "Undo",
        onAction: () => setItems((list) => list.map((item) => (item.id === row.id ? { ...item, bucket: row.bucket } : item))),
      });
    }
  }

  function move(row: FoundItem) {
    assign(row, row.bucket === "held" ? "returned" : "held");
  }

  function removeItem(row: FoundItem) {
    const index = items.findIndex((item) => item.id === row.id);
    const play = captureClose(document.querySelector(`[data-record="${CSS.escape(row.id)}"]`));
    flushSync(() => {
      setItems((list) => list.filter((item) => item.id !== row.id));
      setSelected((current) => (current === row.id ? null : current));
    });
    play();
    notify({ message: "Item deleted", action: "Undo", onAction: () => setItems((list) => putBack(list, row, index)) });
  }

  const record = retained.current;
  const editingItem = items.find((row) => row.id === editing) ?? null;

  return (
    <PageLayout
      className="sheet-page lost-page"
      data-view="head"
      icon="tag"
      title="Lost & found"
      count={visible.length}
      actions={
        <Button onClick={() => setLogging(true)}>
          <Icon name="plus-bold" size={14} />
          Log item
        </Button>
      }
      tabs={
        <Tabs
          label="Lost and found"
          value={bucket}
          onValueChange={(value) => setBucket(value as Bucket)}
          items={[
            { value: "held", label: "Held", count: items.filter((row) => row.bucket === "held").length },
            { value: "returned", label: "Returned", count: items.filter((row) => row.bucket === "returned").length },
            { value: "archived", label: "Archived", count: items.filter((row) => row.bucket === "archived").length },
          ]}
        />
      }
      toolbar={
        <div className="filter-row page-toolbar">
          <SearchBox placeholder="Search items" label="Search items" value={query} onValueChange={setQuery} />
          <FilterMenu value={categories} onValueChange={setCategories} options={CATEGORIES} />
          <div className="filter-chips">
            {categories.map((value) => (
              <Chip key={value} filter={{ name: "Category", value }} onClick={() => setCategories((current) => current.filter((item) => item !== value))} />
            ))}
          </div>
        </div>
      }
    >
      <div className="sheet-work">
        <div className="sheet-list">
          <div className="stage sheet-stage">
            <DataTable
              rows={visible}
              total={items.length}
              empty={bucket === "held" ? "No items held" : bucket === "returned" ? "No items returned" : "No items archived"}
              columns={columns}
              enteringId={enteringId}
              selectedId={selected}
              interactive
              onRowClick={(row) => setSelected((current) => (current === row.id ? null : row.id))}
              onDelete={removeItem}
              deleteNoun="item"
              rowName={(row) => row.description.trim() || "Item"}
              rowMenu={(row, close) =>
                BUCKETS.filter((item) => item.value !== row.bucket).map((item) => (
                  <button
                    key={item.value}
                    className="menu-item"
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      close();
                      assign(row, item.value);
                    }}
                  >
                    <Icon name={item.value === "returned" ? "check" : item.value === "archived" ? "archive" : "tag"} size={18} />
                    {item.label}
                  </button>
                ))
              }
            />
          </div>
        </div>
      </div>
      {present && record ? (
        <DetailPanel
          label="Lost and found"
          name={record.description.trim() || "Item"}
          noun="item"
          hidden={hidden}
          focusText={!hidden && record.id === enteringId}
          onClose={() => setSelected(null)}
          onExited={() => setPresent(false)}
          onDeleted={() => removeItem(record)}
          onEdit={() => setEditing(record.id)}
          actions={
            <Button variant="secondary" onClick={() => move(record)}>
              <Icon name={record.bucket === "held" ? "check" : "archive"} size={14} />
              {record.bucket === "held" ? "Mark returned" : "Mark held"}
            </Button>
          }
        >
          <div className="todo-side-intro">
            <div className="todo-side-heading">
              <div className="todo-side-title-row">
                <h2>{record.description.trim() || "Item"}</h2>
                <time>{record.found}</time>
              </div>
              <p className={record.notes ? "todo-side-value is-quiet" : "todo-side-value is-empty"}>{record.notes || "No notes"}</p>
            </div>
          </div>
          <div className="todo-side-rule" />
          <div className="todo-side-meta">
            <FactRow label="Category">
              <SideValue value={record.category} />
            </FactRow>
            <FactRow label="Found at">
              <SideValue value={foundAt(record)} />
            </FactRow>
            <FactRow label="Stored">
              <SideValue value={record.storage} />
            </FactRow>
            <FactRow label="Photo">
              {record.photo ? (
                <div className="side-photos">
                  <figure className="side-photo">
                    <PhotoThumb photo={{ src: record.photo, alt: record.description }} onOpen={() => setViewing(true)} />
                  </figure>
                </div>
              ) : (
                <SideValue value="" />
              )}
            </FactRow>
          </div>
          {viewing && record.photo ? (
            <PhotoViewer photos={[{ src: record.photo, alt: record.description }]} index={0} onIndex={() => {}} onClose={() => setViewing(false)} />
          ) : null}
        </DetailPanel>
      ) : null}
      {logging ? <ItemEditor onClose={() => setLogging(false)} onSave={addItem} /> : null}
      {editingItem ? (
        <ItemEditor
          key={editingItem.id}
          item={editingItem}
          onClose={() => setEditing(null)}
          onSave={saveItem}
          onDelete={() => {
            setEditing(null);
            removeItem(editingItem);
          }}
        />
      ) : null}
    </PageLayout>
  );
}
