"use client";

import { FilterPicker, OverlayMenu, SegmentedControl, Sidebar, type SidebarLink } from "@lance-live/sds";
import { useRef, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Glyph } from "./glyph";
import { NAV_FIXED, NAV_GROUPS } from "./nav";
import { useHtmlSlide } from "./slide";

export function WorkspaceSide({
  collapsed,
  onCollapsedChange,
  inbox,
  onToggleInbox,
}: {
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
  inbox: "notifications" | "messages" | null;
  onToggleInbox: (which: "notifications" | "messages") => void;
}) {
  const pathname = usePathname();
  const mark = (link: SidebarLink): SidebarLink => {
    if (link.label === "Notifications") {
      return { ...link, current: inbox === "notifications", onClick: () => onToggleInbox("notifications") };
    }
    if (link.label === "Messages") {
      return { ...link, current: inbox === "messages", onClick: () => onToggleInbox("messages") };
    }
    if (!link.href) return { ...link, onClick: () => {} };
    return { ...link, current: inbox ? false : pathname === link.href };
  };
  return (
    <Sidebar
      id="workspace"
      avatarSrc="/avatar-sarah.png"
      collapsed={collapsed}
      onCollapsedChange={onCollapsedChange}
      fixed={NAV_FIXED.map(mark)}
      groups={NAV_GROUPS.map((group) => ({ ...group, links: group.links.map(mark) }))}
    />
  );
}

export function LanceSide({ collapsed, onCollapsedChange }: { collapsed: boolean; onCollapsedChange: (collapsed: boolean) => void }) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState("Normal");
  const modeAnchor = useRef<HTMLButtonElement>(null);
  return (
    <aside className="lance-side sds" id="lance" aria-label="Lance">
      <header className="lance-bar">
        <span className="lance-name">Lance</span>
        <span className="lance-tools">
          <button className="side-icon" type="button" aria-label="History">
            <Glyph name="clock" size={18} />
          </button>
          <button className="side-icon" type="button" aria-label="New chat">
            <Glyph name="edit-square" size={18} />
          </button>
          <button className="side-icon" type="button" aria-label="Expand">
            <Glyph name="fullscreen" size={18} />
          </button>
          <button
            className="side-icon"
            type="button"
            data-lance-collapse=""
            aria-expanded={!collapsed}
            aria-controls="lance"
            aria-label={collapsed ? "Open chat" : "Collapse chat"}
            onClick={() => onCollapsedChange(!collapsed)}
          >
            <Glyph name="panel" size={18} />
          </button>
        </span>
      </header>
      <div className="lance-home">
        <span className="lance-logo" aria-hidden="true">
          <svg width="16" height="16" viewBox="0 0 185 185">
            <path fill="currentColor" d="M0 0H39V146H185V185H39A39 39 0 0 1 0 146ZM53 0H92V93H185V132H92A39 39 0 0 1 53 93ZM106 0H145V40H185V79H145A39 39 0 0 1 106 40Z" />
          </svg>
        </span>
        <p className="lance-hello">How can I help you today?</p>
        <button className="lance-suggest" type="button">
          <Glyph name="list" />
          Review internal notes
        </button>
        <button className="lance-suggest" type="button">
          <Glyph name="list" />
          Run a cash count
        </button>
        <button className="lance-suggest" type="button">
          <Glyph name="list" />
          Open the boards
        </button>
      </div>
      <div className="lance-dock">
        <form className="lance" onSubmit={(event) => event.preventDefault()}>
          <span className="lead">
            <button className="well" type="button" aria-label="Add">
              <Glyph name="plus" size={16} />
            </button>
            <input aria-label="Ask Lance anything" placeholder="Ask Lance anything..." />
          </span>
          <span className="tools">
            <span className="drop">
              <button ref={modeAnchor} className="mode" type="button" aria-expanded={open} aria-haspopup="menu" onClick={() => setOpen((value) => !value)}>
                <span>{mode}</span> <Glyph name="chevron" />
              </button>
              <OverlayMenu open={open} anchorRef={modeAnchor}>
                {["Lite", "Normal", "Ultra"].map((item) => (
                  <button
                    key={item}
                    className="menu-item"
                    type="button"
                    role="menuitemradio"
                    aria-checked={mode === item}
                    onClick={() => {
                      setMode(item);
                      setOpen(false);
                    }}
                  >
                    <span className="mode-copy">
                      <b>{item}</b>
                      <span>{item === "Lite" ? "Fastest responses" : item === "Ultra" ? "Deepest reasoning, slower" : "Balanced speed and quality"}</span>
                    </span>
                    <Glyph name="check" className="check" />
                  </button>
                ))}
              </OverlayMenu>
            </span>
            <button className="well" type="button" aria-label="Microphone">
              <Glyph name="mic" size={16} />
            </button>
            <button className="well" type="submit" aria-label="Send">
              <Glyph name="up" size={16} />
            </button>
          </span>
        </form>
      </div>
    </aside>
  );
}

export { SearchField as SearchBox } from "@lance-live/sds";

export function ReplyForm({ label, className, onReply, locked = false }: { label: string; className?: string; onReply?: (text: string) => void; locked?: boolean }) {
  return (
    <form
      className={["msg", locked ? "is-locked" : "", className].filter(Boolean).join(" ")}
      onSubmit={(event) => {
        event.preventDefault();
        const input = event.currentTarget.querySelector("input");
        const text = input?.value.trim() ?? "";
        if (!text || !onReply) return;
        onReply(text);
        if (input) input.value = "";
        event.currentTarget.classList.remove("has-value");
      }}
      onInput={(event) => {
        const input = event.currentTarget.querySelector("input");
        event.currentTarget.classList.toggle("has-value", Boolean(input?.value.trim()));
      }}
    >
      <span className="lead">
        <button className="well" type="button" aria-label="Add" disabled={locked}>
          <Glyph name="plus" size={16} />
        </button>
        <input aria-label={label} placeholder={`${label}...`} disabled={locked} />
      </span>
      <button className="well" type="submit" aria-label="Send" disabled={locked}>
        <Glyph name="up" size={16} />
      </button>
    </form>
  );
}

export function FilterMenu({
  value,
  onValueChange,
  options,
  sorts,
  sortId,
  onSortChange,
}: {
  value: readonly string[];
  onValueChange: (value: string[]) => void;
  options: string[];
  /** Single-choice sort, listed under the filters. */
  sorts?: Array<{ id: string; label: string }>;
  sortId?: string | null;
  onSortChange?: (id: string) => void;
}) {
  return <FilterPicker sections={[
    { options: options.map(value => ({ value, label: value })), selected: value, onSelectedChange: onValueChange },
    ...(sorts?.length ? [{
      options: sorts.map(({ id, label }) => ({ value: id, label })),
      selected: sortId ? [sortId] : [],
      mode: "single" as const,
      onSelectedChange: ([id]: string[]) => onSortChange?.(id),
    }] : []),
  ]} />;
}

export type FilterGroup = {
  name: string;
  options: readonly string[];
  value: readonly string[];
  onValueChange: (value: string[]) => void;
  /** One choice at a time, like a date range. Choosing it again clears it. */
  single?: boolean;
};

/** Filters by category. Each category row opens its options to the side, like the gallery filter menu. */
export function FilterGroupsMenu({ groups }: { groups: FilterGroup[] }) {
  return <FilterPicker groups={groups.map(group => ({
    id: group.name,
    label: group.name,
    options: group.options.map(value => ({ value, label: value })),
    selected: group.value,
    mode: group.single ? "single-toggle" : "multiple",
    onSelectedChange: group.onValueChange,
  }))} />;
}

export function TabBar({
  label,
  value,
  onValueChange,
  items,
}: {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  items: Array<{ value: string; label: string; count: number }>;
}) {
  return (
    <div className="tabs-fade scroll-fade scroll-fade-x">
      <HtmlTrack className="tabs tabs-bar has-slide" label={label} value={value} selector=".tab">
        {items.map((item) => (
          <button key={item.value} className="tab" type="button" role="tab" aria-selected={item.value === value} onClick={() => onValueChange(item.value)}>
            {item.label} <span className="count">{item.count}</span>
          </button>
        ))}
      </HtmlTrack>
    </div>
  );
}

const RANGES = ["24h", "7d", "30d"];

export function RangeControl({ value, onValueChange, label }: { value: string; onValueChange: (value: string) => void; label: string }) {
  return (
    <SegmentedControl
      className="range"
      aria-label={label}
      value={value}
      onValueChange={onValueChange}
      options={RANGES.map((option) => ({ value: option, label: option }))}
    />
  );
}

function HtmlTrack({
  className,
  label,
  value,
  selector,
  children,
}: {
  className: string;
  label: string;
  value: string;
  selector: string;
  children: ReactNode;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const pillRef = useRef<HTMLSpanElement>(null);
  useHtmlSlide(trackRef, pillRef, selector, value);
  return (
    <div ref={trackRef} className={className} role="tablist" aria-label={label}>
      <span ref={pillRef} className="slide-pill" aria-hidden="true" />
      {children}
    </div>
  );
}
