"use client";

import { Fragment, useEffect, useId, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent, type MouseEvent, type ReactNode } from "react";
import { playEnter } from "../close-gap";
import { Icon } from "../icons";
import { ConfirmDialog } from "./ConfirmDialog";
import { OverlayMenu } from "./OverlayMenu";

/** Clearance from a column edge to the outer bounds of its content, on each side. */
export const DATA_TABLE_PAD = 12;

/**
 * Full column width, including the 12px clearance on each side.
 * Short text stays this wide. It does not grow to fit an input or the longest value.
 */
export const TEXT_SHORT_MIN = 200;

/**
 * Full column width for a title, subtitle, or description, including the 12px clearance on each side.
 * The column grows into leftover table space. 480–600 is the preferred width when the table has room.
 */
export const TEXT_PRIMARY_MIN = 320;
export const TEXT_PRIMARY_PREFERRED_MIN = 480;
export const TEXT_PRIMARY_PREFERRED_MAX = 600;

/** Set on the column. A cell that contains text or an input does not choose this. */
export type DataTextSize = "short" | "primary";

/** How text that does not fit the column is shown. Neither mode widens the table. */
export type DataTextDisplay = "clip" | "wrap";

export type DataSort = {
  columnId: string;
  direction: "asc" | "desc";
};

/**
 * Where a column sits relative to the other columns.
 * Status is the leftmost data column. Selection and expand controls may sit before it.
 * A column with no role keeps the order the page configured.
 */
export type DataColumnRole = "selection" | "expand" | "status";

/** Status columns lead the data columns. Pages without one keep their configured order. */
export function orderDataColumns<T>(columns: Array<DataColumn<T>>): Array<DataColumn<T>> {
  if (!columns.some((column) => column.role === "status")) return columns;
  const selection: Array<DataColumn<T>> = [];
  const expand: Array<DataColumn<T>> = [];
  const status: Array<DataColumn<T>> = [];
  const rest: Array<DataColumn<T>> = [];
  for (const column of columns) {
    if (column.role === "selection") selection.push(column);
    else if (column.role === "expand") expand.push(column);
    else if (column.role === "status") status.push(column);
    else rest.push(column);
  }
  return [...selection, ...expand, ...status, ...rest];
}

export type DataColumn<T> = {
  id: string;
  title: string;
  /**
   * Set by the column, not inferred from its title.
   * "status" is a status or status-like indicator and is placed first among data columns.
   */
  role?: DataColumnRole;
  /** This column absorbs leftover width. Primary text columns do this even when flex is omitted. */
  flex?: boolean;
  /**
   * Text sizing. "short" is a 200px column. "primary" is a title or description:
   * at least 320px, growing with leftover space. The field fills that column.
   * It does not shrink to the words. Overrides belong on minWidth.
   */
  text?: DataTextSize;
  /** "clip" ellipsizes on one line. "wrap" breaks inside the column width. */
  textDisplay?: DataTextDisplay;
  /**
   * Shift the header so it lines up with the label inside a chip,
   * not with the chip’s outer edge. The chip itself still starts after DATA_TABLE_PAD.
   */
  labelInset?: number;
  /** Floor for the whole column, including the 12px clearance on both sides. */
  minWidth?: number;
  sortable?: boolean;
  sortValue?: (row: T) => string | number | null | undefined;
  render: (row: T) => ReactNode;
  /**
   * Stand-in used for the minimum width. Include chip padding and any control
   * space that appears on hover. When omitted, the rendered cell is measured.
   */
  measure?: (row: T) => ReactNode;
  /** Widest options for a column, measured once instead of from the current cell. */
  minContent?: ReactNode;
};

export type DataTableProps<T extends { id: string }> = {
  columns: Array<DataColumn<T>>;
  rows: T[];
  /** Full set, before the page filters `rows`. Defaults to the rows passed in. */
  total?: number;
  empty?: string;
  selectedId?: string | null;
  onRowClick?: (row: T) => void;
  onRowContextMenu?: (row: T, point: { x: number; y: number }) => void;
  /**
   * Right-click opens the same options menu on every table. Delete is last.
   * Extra items render above it.
   */
  onDelete?: (row: T) => void;
  deleteNoun?: string;
  rowName?: (row: T) => string;
  rowMenu?: (row: T, close: () => void) => ReactNode;
  /** Pins the row-hover treatment, used by the gallery specimen. */
  hoveredId?: string | null;
  sort?: DataSort | null;
  onSortChange?: (sort: DataSort) => void;
  /** Overlay actions. Omitted tables do not reserve a column for them. */
  rowActions?: (row: T) => ReactNode;
  /**
   * Rows that contain buttons, inputs, or menus. Every row is a div, so a
   * press does not scale the row and those controls stay valid.
   */
  interactive?: boolean;
  /** Wrap a row so cell renderers can share row state. */
  wrapRow?: (row: T, children: ReactNode) => ReactNode;
  /**
   * A row that was just inserted. It expands vertically with the sheet enter
   * transition. Pass the new id once; repeating the same id does not replay.
   */
  enteringId?: string | null;
};

const columnStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  marginInlineStart: 0,
  paddingInline: DATA_TABLE_PAD,
  boxSizing: "border-box",
  minWidth: 0,
  justifyContent: "flex-start",
  textAlign: "left",
};

const cellStyle: CSSProperties = {
  ...columnStyle,
  alignItems: "flex-start",
  alignSelf: "start",
};

function headerStyle(inset: number): CSSProperties {
  return { ...columnStyle, paddingInlineStart: DATA_TABLE_PAD + inset };
}

/** Configured text width, already including both 12px paddings. Content is not measured. */
function textColumnMin(column: { text?: DataTextSize; minWidth?: number }) {
  if (column.text === "short") return column.minWidth ?? TEXT_SHORT_MIN;
  if (column.text === "primary") return column.minWidth ?? TEXT_PRIMARY_MIN;
  return null;
}

function columnTrack(column: { text?: DataTextSize; flex?: boolean }, min: number) {
  if (column.text === "primary" || column.flex) return `minmax(${min}px, 1fr)`;
  if (column.text === "short") return `${min}px`;
  return `minmax(${min}px, max-content)`;
}

export function DataTable<T extends { id: string }>({
  columns: sourceColumns,
  rows,
  total,
  empty = "Nothing to show",
  selectedId,
  onRowClick,
  onRowContextMenu,
  onDelete,
  deleteNoun = "record",
  rowName,
  rowMenu,
  hoveredId,
  sort = null,
  onSortChange,
  rowActions,
  interactive = false,
  wrapRow,
  enteringId,
}: DataTableProps<T>) {
  const columns = useMemo(() => orderDataColumns(sourceColumns), [sourceColumns]);
  const titleRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const measureRef = useRef<HTMLDivElement>(null);
  const entered = useRef<string | null>(null);
  const menuAnchor = useRef<HTMLDivElement>(null);
  const menuId = useId().replace(/:/g, "");
  const [menu, setMenu] = useState<{ row: T; x: number; y: number } | null>(null);
  const [pendingDelete, setPendingDelete] = useState<T | null>(null);
  const [mins, setMins] = useState<number[]>(() => columns.map((column) => column.minWidth ?? DATA_TABLE_PAD * 2));

  const closeMenu = () => setMenu(null);
  const hasMenu = Boolean(onDelete || rowMenu);

  useEffect(() => {
    if (!menu) return;
    const close = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (target.closest(`[data-menu="${menuId}"]`)) return;
      setMenu(null);
    };
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") setMenu(null);
    };
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", onKey);
    };
  }, [menu, menuId]);

  const shown = useMemo(() => {
    if (!sort) return rows;
    const column = columns.find((item) => item.id === sort.columnId);
    if (!column?.sortValue) return rows;
    const direction = sort.direction === "asc" ? 1 : -1;
    const valueOf = column.sortValue;
    return [...rows].sort((a, b) => {
      const left = valueOf(a);
      const right = valueOf(b);
      if (left == null && right == null) return 0;
      if (left == null) return 1;
      if (right == null) return -1;
      if (typeof left === "number" && typeof right === "number") return (left - right) * direction;
      return String(left).localeCompare(String(right)) * direction;
    });
  }, [columns, rows, sort]);

  const measureKey = columns.map((column) => `${column.id}:${column.title}:${column.flex ? 1 : 0}:${column.text ?? ""}:${column.minWidth ?? ""}:${column.labelInset ?? 0}`).join("|");

  useLayoutEffect(() => {
    const apply = () => {
      const sample = titleRefs.current.find((node) => node);
      const font = sample ? getComputedStyle(sample).font : "";
      const probe = document.createElement("span");
      probe.style.cssText = "position:absolute;left:-9999px;top:0;white-space:nowrap;visibility:hidden";
      if (font) probe.style.font = font;
      document.body.appendChild(probe);
      const titles = columns.map((column) => {
        probe.textContent = column.title;
        return Math.ceil(probe.getBoundingClientRect().width) + (column.labelInset ?? 0);
      });
      probe.remove();
      const content = columns.map(() => 0);
      measureRef.current?.querySelectorAll<HTMLElement>("[data-col]").forEach((node) => {
        const index = columns.findIndex((column) => column.id === node.dataset.col);
        if (index < 0) return;
        content[index] = Math.max(content[index] ?? 0, Math.ceil(node.getBoundingClientRect().width));
      });
      const next = titles.map((title, index) => {
        const column = columns[index];
        const configured = column ? textColumnMin(column) : null;
        if (configured != null) return configured;
        return Math.max(Math.max(title, content[index] ?? 0) + DATA_TABLE_PAD * 2, column?.minWidth ?? 0);
      });
      setMins((current) => (current.length === next.length && current.every((value, index) => value === next[index]) ? current : next));
    };
    apply();
    const ready = document.fonts?.ready;
    if (!ready) return;
    let cancel = false;
    ready.then(() => {
      if (!cancel) apply();
    });
    return () => {
      cancel = true;
    };
  }, [columns, measureKey, shown]);

  // The new row is in the DOM at full height. Collapse it, then let the sheet transition open it.
  useLayoutEffect(() => {
    if (!enteringId || entered.current === enteringId) return;
    const node = document.querySelector(`[data-record="${CSS.escape(enteringId)}"]`);
    if (!node) return;
    entered.current = enteringId;
    playEnter(node);
    node.scrollIntoView({ block: "nearest" });
  }, [enteringId, shown]);

  const tracks = mins
    .map((min, index) => columnTrack(columns[index] ?? {}, min))
    .join(" ");

  return (
    <>
      <div aria-hidden="true" style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }}>
        <div ref={measureRef} style={{ width: "max-content" }}>
          {columns.map((column) => {
            const samples = column.text
              ? null
              : column.measure
                ? shown.map((row) => (
                    <span key={row.id} data-col={column.id} style={{ display: "inline-block", width: "max-content" }}>
                      {column.measure?.(row)}
                    </span>
                  ))
                : column.minContent
                  ? null
                  : column.flex
                    ? null
                    : shown.map((row) => (
                        <span key={row.id} data-col={column.id} style={{ display: "inline-block", width: "max-content" }}>
                          {column.render(row)}
                        </span>
                      ));
            return (
              <span key={column.id}>
                {column.minContent}
                {samples}
              </span>
            );
          })}
        </div>
      </div>
      <div className="sheet-fade">
      <div className="sheet-scroll">
      <div
        className="sheet-grid"
        style={{
          ["--line-pad" as string]: "0px",
          columnGap: 0,
          padding: 0,
          width: "100%",
          minWidth: mins.reduce((sum, min) => sum + min, 0),
          gridTemplateColumns: tracks,
        }}
      >
        <div className="sheet-head" style={{ margin: 0, padding: 0 }}>
          {columns.map((column, index) => {
            const sorted = sort?.columnId === column.id ? sort.direction : undefined;
            const title = (
              <span ref={(node) => { titleRefs.current[index] = node; }} style={{ whiteSpace: "nowrap" }}>
                {column.title}
              </span>
            );
            return (
              <span key={column.id} style={headerStyle(column.labelInset ?? 0)}>
                {column.sortable && onSortChange ? (
                  <button
                    className="sheet-sort"
                    type="button"
                    aria-sort={sorted === "asc" ? "ascending" : sorted === "desc" ? "descending" : "none"}
                    onClick={() =>
                      onSortChange({
                        columnId: column.id,
                        direction: sorted === "asc" ? "desc" : "asc",
                      })
                    }
                  >
                    {title}
                    {sorted ? (
                      <span style={{ display: "inline-flex", transform: sorted === "asc" ? "rotate(180deg)" : undefined }}>
                        <Icon name="chevron" size={10} />
                      </span>
                    ) : null}
                  </button>
                ) : (
                  title
                )}
              </span>
            );
          })}
        </div>
        <div data-sheet>
          {shown.map((row) => {
            const selected = selectedId === row.id;
            const openRow = (event: { target: EventTarget | null }) => {
              if (!onRowClick) return;
              const target = event.target as HTMLElement | null;
              if (target?.closest("button, input, textarea, a, [role='menu']")) return;
              onRowClick(row);
            };
            const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
              if (event.key !== "Enter" && event.key !== " ") return;
              if ((event.target as HTMLElement).closest("button, input, textarea, a")) return;
              event.preventDefault();
              onRowClick?.(row);
            };
            const cells = columns.map((column) => (
              <div key={column.id} data-text={column.text} style={{ ...cellStyle, whiteSpace: column.textDisplay === "wrap" ? "normal" : undefined }}>
                <div className="sheet-cell-clip" style={{ whiteSpace: "inherit" }}>
                  {column.render(row)}
                </div>
              </div>
            ));
            const lineClass = ["sheet-line", hoveredId === row.id ? "is-hover" : ""].filter(Boolean).join(" ");
            const lineStyle: CSSProperties = { paddingBlock: "var(--space-8)", paddingInline: 0, alignItems: "start", ...(onRowClick ? { cursor: "pointer" } : {}) };
            const onContextMenu = (event: MouseEvent) => {
              const target = event.target;
              if (target instanceof Element && target.closest("input, textarea, .menu")) return;
              if (!hasMenu && !onRowContextMenu) return;
              event.preventDefault();
              const point = { x: event.clientX, y: event.clientY };
              if (hasMenu) setMenu({ row, ...point });
              onRowContextMenu?.(row, point);
            };
            const line = (
              <div
                className={lineClass}
                style={lineStyle}
                tabIndex={onRowClick ? 0 : undefined}
                onClick={onRowClick ? openRow : undefined}
                onKeyDown={onRowClick ? onKeyDown : undefined}
                onContextMenu={onContextMenu}
              >
                {cells}
                {rowActions ? (
                  <div className="sheet-row-actions" onPointerDown={(event) => event.stopPropagation()} onClick={(event) => event.stopPropagation()}>
                    {rowActions(row)}
                  </div>
                ) : null}
              </div>
            );
            const article = (
              <article className={selected ? "sheet is-open" : "sheet"} data-record={row.id} aria-selected={selected || undefined} style={{ marginInline: 0 }}>
                <div className="sheet-clip">
                  <div className="sheet-inner">{line}</div>
                </div>
              </article>
            );
            return <Fragment key={row.id}>{wrapRow ? wrapRow(row, article) : article}</Fragment>;
          })}
        </div>
        {shown.length === 0 ? <p className="sheet-empty">{empty}</p> : null}
      </div>
      </div>
    </div>
    <p className="count sheet-count">
      Showing {shown.length} of {total ?? rows.length}
    </p>
    <div ref={menuAnchor} hidden />
    <OverlayMenu open={menu != null} anchorRef={menuAnchor} marker={menuId} label="Options" point={menu}>
      {menu && rowMenu ? rowMenu(menu.row, closeMenu) : null}
      {menu && rowMenu && onDelete ? <span className="menu-rule" /> : null}
      {onDelete ? (
        <button
          className="menu-item danger"
          type="button"
          role="menuitem"
          onClick={() => {
            const row = menu?.row;
            setMenu(null);
            if (row) setPendingDelete(row);
          }}
        >
          <Icon name="trash" size={18} />
          Delete
        </button>
      ) : null}
    </OverlayMenu>
    <ConfirmDialog
      open={pendingDelete != null}
      name={pendingDelete ? (rowName?.(pendingDelete) || "this record") : ""}
      noun={deleteNoun}
      onCancel={() => setPendingDelete(null)}
      onConfirm={() => {
        const row = pendingDelete;
        setPendingDelete(null);
        if (row) onDelete?.(row);
      }}
    />
  </>
  );
}

export type SheetColumn<T> = {
  id?: string;
  title: string;
  flex?: boolean;
  role?: DataColumnRole;
  render: (row: T) => ReactNode;
};

export function SheetTable<T extends { id: string }>({
  rows,
  columns,
  empty,
  selectedId,
  onRowClick,
  enteringId,
}: {
  rows: T[];
  columns: Array<SheetColumn<T>>;
  empty?: string;
  selectedId?: string | null;
  onRowClick?: (row: T) => void;
  enteringId?: string | null;
}) {
  return (
    <DataTable
      rows={rows}
      empty={empty}
      selectedId={selectedId}
      onRowClick={onRowClick}
      enteringId={enteringId}
      columns={columns.map((column) => ({
        id: column.id ?? column.title,
        title: column.title,
        flex: column.flex,
        role: column.role,
        render: column.render,
      }))}
    />
  );
}
