"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Button } from "./Button";
import { Icon, type IconName } from "../icons";
import { ThemeSwitch } from "./Fields";

export function PageHeader({
  title,
  count,
  mark = "todo",
  search,
  actions,
}: {
  title: string;
  count?: string;
  mark?: IconName;
  search?: ReactNode;
  /** Replaces Print and New. `null` leaves the header with no actions. */
  actions?: ReactNode;
}) {
  const tools =
    actions === undefined ? (
      <>
        <Button variant="secondary">
          <Icon name="plus" size={14} />
          Print
        </Button>
        <Button>
          <Icon name="plus" size={14} />
          New
        </Button>
      </>
    ) : (
      actions
    );
  return (
    <header className="sds page-head">
      <div className="page-title">
        <span className="page-mark">
          <Icon name={mark} size={18} />
        </span>
        <h1>{title}</h1>
        {count ? <p className="count">{count}</p> : null}
      </div>
      {search}
      {tools ? <div className="head-actions">{tools}</div> : null}
    </header>
  );
}

export type SidebarLink = {
  label: string;
  icon: IconName;
  href?: string;
  current?: boolean;
  tip?: string;
};

export type SidebarGroup = {
  title: string;
  links: SidebarLink[];
  open?: boolean;
  pinned?: boolean;
};

export function SidebarItem({ label, icon, href = "#sidebar", current, tip, pinned }: SidebarLink & { pinned?: boolean }) {
  return (
    <div className="side-item" data-label={label}>
      <a href={href} aria-current={current ? "page" : undefined} className={tip ? "tip-host" : undefined}>
        <Icon name={icon} size={18} />
        {label}
        {tip ? (
          <span className="tip">
            {label} <span>{tip}</span>
          </span>
        ) : null}
      </a>
      <span className="side-actions">
        <button className="side-action" type="button" data-side-drag aria-label="Reorder">
          <Icon name="grip" size={14} />
        </button>
        <button className="side-action" type="button" aria-label={pinned ? "Unpin" : "Pin"}>
          <Icon name={pinned ? "unpin" : "pin"} size={14} />
        </button>
      </span>
    </div>
  );
}

function SideList({ links, pinned, hidden }: { links: SidebarLink[]; pinned?: boolean; hidden?: boolean }) {
  const listRef = useRef<HTMLDivElement>(null);
  const signature = links.map((link) => link.label).join("\0");
  const [order, setOrder] = useState(() => links.map((link) => link.label));
  const seen = useRef(signature);
  if (seen.current !== signature) {
    seen.current = signature;
    setOrder(links.map((link) => link.label));
  }
  const byLabel = new Map(links.map((link) => [link.label, link]));
  const shown = order.flatMap((label) => {
    const link = byLabel.get(label);
    return link ? [link] : [];
  });
  for (const link of links) {
    if (!order.includes(link.label)) shown.push(link);
  }

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    let cancel = () => {};

    const onPointerDown = (event: PointerEvent) => {
      if (event.button !== 0) return;
      if (document.body.classList.contains("is-side-collapsed")) return;
      const grip = (event.target as Element | null)?.closest?.("[data-side-drag]");
      const item = grip?.closest<HTMLElement>(".side-item");
      if (!grip || !item || !list.contains(item)) return;
      event.preventDefault();
      const originX = event.clientX;
      const originY = event.clientY;
      const anchor = item.querySelector("a");
      if (!anchor) return;
      let active: { ghost: HTMLElement; line: HTMLElement; originLeft: number; originTop: number; before: HTMLElement | null } | null = null;

      const placeLine = (clientY: number) => {
        if (!active) return;
        const rows = [...list.querySelectorAll<HTMLElement>(":scope > .side-item")];
        const from = rows.indexOf(item);
        let to = 0;
        let before: HTMLElement | null = null;
        for (const row of rows) {
          if (row === item) continue;
          const box = row.getBoundingClientRect();
          if (clientY < box.top + box.height / 2) {
            before = row;
            break;
          }
          to += 1;
        }
        if (to === from) {
          active.line.hidden = true;
          active.before = null;
          return;
        }
        const listBox = list.getBoundingClientRect();
        const edge = before ? before.getBoundingClientRect().top : rows.at(-1)!.getBoundingClientRect().bottom;
        active.line.hidden = false;
        active.line.style.top = `${edge - listBox.top}px`;
        active.before = before;
      };

      const onMove = (ev: PointerEvent) => {
        if (!active) {
          if (Math.hypot(ev.clientX - originX, ev.clientY - originY) < 4) return;
          const box = anchor.getBoundingClientRect();
          const ghost = item.cloneNode(true) as HTMLElement;
          ghost.className = "sds side-drag";
          ghost.setAttribute("aria-hidden", "true");
          ghost.style.width = `${box.width}px`;
          ghost.style.left = `${box.left}px`;
          ghost.style.top = `${box.top}px`;
          const line = document.createElement("div");
          line.className = "side-drop";
          line.hidden = true;
          list.append(line);
          document.body.append(ghost);
          document.body.classList.add("is-side-reordering");
          item.classList.add("is-dragging");
          active = { ghost, line, originLeft: box.left, originTop: box.top, before: null };
        }
        active.ghost.style.left = `${active.originLeft + ev.clientX - originX}px`;
        active.ghost.style.top = `${active.originTop + ev.clientY - originY}px`;
        placeLine(ev.clientY);
      };

      const finish = () => {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", finish);
        window.removeEventListener("pointercancel", finish);
        cancel = () => {};
        if (!active) return;
        const { ghost, line, before } = active;
        const moved = !line.hidden;
        active = null;
        if (moved) {
          const rows = [...list.querySelectorAll<HTMLElement>(":scope > .side-item")];
          const labels = rows.map((row) => row.dataset.label ?? "");
          const from = rows.indexOf(item);
          const next = labels.slice();
          const [label] = next.splice(from, 1);
          const beforeLabel = before?.dataset.label;
          const index = beforeLabel ? next.indexOf(beforeLabel) : next.length;
          if (label) next.splice(index, 0, label);
          setOrder(next);
        }
        ghost.remove();
        line.remove();
        item.classList.remove("is-dragging");
        document.body.classList.remove("is-side-reordering");
      };

      cancel = finish;
      try { (grip as HTMLElement).setPointerCapture(event.pointerId); } catch { /* the window listeners still receive the release */ }
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", finish);
      window.addEventListener("pointercancel", finish);
    };

    list.addEventListener("pointerdown", onPointerDown);
    return () => {
      list.removeEventListener("pointerdown", onPointerDown);
      cancel();
    };
  }, []);

  return (
    <div className="side-links" ref={listRef} hidden={hidden}>
      {shown.map((link) => (
        <SidebarItem key={link.label} {...link} pinned={pinned} />
      ))}
    </div>
  );
}

export function Sidebar({
  id,
  avatarSrc,
  fixed = [],
  groups = [],
  children,
  collapsed: collapsedProp,
  onCollapsedChange,
}: {
  id?: string;
  avatarSrc?: string;
  /** Links under the search. Each page supplies its own. */
  fixed?: SidebarLink[];
  /** Grouped links in the scroll area. Each page supplies its own. */
  groups?: SidebarGroup[];
  /** Extra page content inside the scroll area, after the groups. */
  children?: ReactNode;
  /** When set, the page owns open and collapsed. The gallery specimen leaves this unset. */
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}) {
  const [open, setOpen] = useState(() => new Set(groups.filter((group) => group.open).map((group) => group.title)));
  const [dark, setDark] = useState(false);
  const [uncontrolledCollapsed, setUncontrolledCollapsed] = useState(false);
  const collapsed = collapsedProp ?? uncontrolledCollapsed;
  const setCollapsed = (next: boolean) => {
    if (collapsedProp === undefined) setUncontrolledCollapsed(next);
    onCollapsedChange?.(next);
  };
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = scrollRef.current;
    const frame = el?.parentElement;
    if (!el || !frame) return;
    const update = () => {
      const max = el.scrollHeight - el.clientHeight;
      const pos = el.scrollTop;
      frame.classList.toggle("is-fade-start", max > 1 && pos > 1);
      frame.classList.toggle("is-fade-end", max > 1 && pos < max - 1);
    };
    update();
    el.addEventListener("scroll", update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(el);
    for (const child of el.children) observer.observe(child);
    return () => {
      el.removeEventListener("scroll", update);
      observer.disconnect();
    };
  }, [open, collapsed, groups]);
  useEffect(() => {
    if (collapsedProp !== undefined) return;
    document.body.classList.toggle("is-side-collapsed", collapsed);
    return () => document.body.classList.remove("is-side-collapsed");
  }, [collapsed, collapsedProp]);
  useEffect(() => {
    const sync = () => setDark(document.documentElement.dataset.theme === "dark");
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, []);

  return (
    <div className="sds side-frame">
      <aside className="side sds" id={id} aria-label="Workspace">
        <div className="side-top">
          <button className="side-brand" type="button">
            <span className="side-mark">M</span>
            <span className="side-title">Mobile Test</span>
            <Icon name="chevron" size={16} />
          </button>
          <button
            className="side-icon"
            type="button"
            aria-expanded={!collapsed}
            aria-controls={id}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            onClick={() => setCollapsed(!collapsed)}
          >
            <Icon name="sidebar" size={18} />
          </button>
        </div>
        <div className="side-fixed">
          <form className="search side-search" role="search" onSubmit={(event) => event.preventDefault()}>
            <Icon name="search" size={18} />
            <input type="search" placeholder="Search" aria-label="Search" />
            <kbd>⌘ K</kbd>
          </form>
          {fixed.length ? <SideList links={fixed} /> : null}
        </div>
        <div className="side-scroll-frame">
          <div className="side-scroll" ref={scrollRef}>
            {groups.map((group) => {
              const expanded = open.has(group.title);
              return (
                <div className="side-group" key={group.title}>
                  <button
                    className="side-fold"
                    type="button"
                    aria-expanded={expanded}
                    onClick={() =>
                      setOpen((current) => {
                        const next = new Set(current);
                        if (next.has(group.title)) next.delete(group.title);
                        else next.add(group.title);
                        return next;
                      })
                    }
                  >
                    {group.title} <Icon name="chevron" size={14} />
                  </button>
                  <SideList links={group.links} pinned={group.pinned} hidden={!expanded} />
                </div>
              );
            })}
            {children}
          </div>
        </div>
        <div className="side-user">
          <span className="person">
            {avatarSrc ? <img className="avatar" src={avatarSrc} alt="" /> : <span className="avatar">S</span>}
            <span className="person-copy">
              <span>Sarah</span>
              <span className="sub">Mobile Test</span>
            </span>
          </span>
          <div className="side-settings">
            <button className="side-icon" type="button" aria-label="Settings">
              <Icon name="gear" size={18} />
            </button>
            <ThemeSwitch
              pressed={dark}
              label="Dark mode"
              onPressedChange={(next) => {
                setDark(next);
                if (next) document.documentElement.dataset.theme = "dark";
                else delete document.documentElement.dataset.theme;
              }}
            />
          </div>
        </div>
      </aside>
    </div>
  );
}
