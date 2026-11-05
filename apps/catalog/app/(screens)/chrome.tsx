"use client";

import { OverlayMenu, SegmentedControl, Sidebar, type SidebarGroup, type SidebarLink } from "@lance-live/gallery-ui";
import { useRef, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Glyph } from "./glyph";
import { useHtmlSlide } from "./slide";

const FIXED: SidebarLink[] = [
  { href: "/", icon: "home", label: "Home" },
  { href: "/#sidebar", icon: "bubble", label: "Messages", tip: "Opt M" },
  { href: "/#sidebar", icon: "bell", label: "Notifications", tip: "Opt N" },
  { href: "/notes", icon: "doc", label: "Internal notes" },
];

const GROUPS: SidebarGroup[] = [
  {
    title: "Pinned",
    pinned: true,
    open: true,
    links: [
      { href: "/#sidebar", icon: "grid", label: "Boards" },
      { href: "/todos", icon: "clipboard", label: "To-Dos" },
      { href: "/complaints", icon: "alert", label: "Complaints" },
      { href: "/cash", icon: "card", label: "Cash & bank" },
      { href: "/#sidebar", icon: "calendar", label: "Schedule" },
    ],
  },
  {
    title: "Guest",
    open: true,
    links: [
      { href: "/calls", icon: "phone", label: "Calls" },
      { href: "/#sidebar", icon: "bubble-lines", label: "Guest messages" },
      { href: "/#sidebar", icon: "clock", label: "Wake-up calls" },
    ],
  },
  {
    title: "Operations",
    open: false,
    links: [
      { href: "/#sidebar", icon: "grid", label: "Boards" },
      { href: "/todos", icon: "clipboard", label: "To-Dos" },
      { href: "/complaints", icon: "alert", label: "Complaints" },
      { href: "/#sidebar", icon: "calendar", label: "Schedule" },
      { href: "/cash", icon: "card", label: "Cash & bank" },
    ],
  },
  {
    title: "Facilities",
    open: false,
    links: [
      { href: "/#sidebar", icon: "wrench", label: "PM" },
      { href: "/#sidebar", icon: "gauge", label: "Readings" },
    ],
  },
  {
    title: "Records",
    open: true,
    links: [
      { href: "/notes", icon: "doc", label: "Internal notes" },
      { href: "/knowledge", icon: "book", label: "Knowledge base" },
    ],
  },
  {
    title: "Sales",
    open: false,
    links: [{ href: "/#sidebar", icon: "share", label: "Sales" }],
  },
];

export function WorkspaceSide({ collapsed, onCollapsedChange }: { collapsed: boolean; onCollapsedChange: (collapsed: boolean) => void }) {
  const pathname = usePathname();
  const mark = (link: SidebarLink): SidebarLink => ({ ...link, current: pathname === link.href });
  return (
    <Sidebar
      id="workspace"
      avatarSrc="/avatar-sarah.png"
      collapsed={collapsed}
      onCollapsedChange={onCollapsedChange}
      fixed={FIXED.map(mark)}
      groups={GROUPS.map((group) => ({ ...group, links: group.links.map(mark) }))}
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
          <svg width="16" height="16" viewBox="0 0 16 16">
            <path fill="currentColor" d="M2 2h5v12H2zM2 9h12v5H2z" />
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

export function SearchBox({
  placeholder,
  label,
  value,
  onValueChange,
  className,
}: {
  placeholder: string;
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
}) {
  return (
    <form className={["search", value ? "has-value" : "", className].filter(Boolean).join(" ")} role="search" onSubmit={(event) => event.preventDefault()}>
      <Glyph name="search" size={18} />
      <input type="search" placeholder={placeholder} aria-label={label} value={value} onChange={(event) => onValueChange(event.target.value)} />
      <button className="clear" type="button" hidden={value.length === 0} aria-label="Clear search" onClick={() => onValueChange("")}>
        <Glyph name="close" />
      </button>
    </form>
  );
}

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
}: {
  value: string;
  onValueChange: (value: string) => void;
  options: string[];
}) {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLButtonElement>(null);
  return (
    <div className="drop">
      <button ref={anchorRef} className="trigger" type="button" aria-expanded={open} aria-haspopup="menu" aria-label="Filters" onClick={() => setOpen((next) => !next)}>
        <span className="pair">
          <Glyph name="filter" />
          <span className="fit-label">{value || "Filters"}</span>
        </span>
        <Glyph name="chevron" />
      </button>
      <OverlayMenu open={open} anchorRef={anchorRef}>
        {options.map((option) => (
          <button
            key={option}
            className="menu-item"
            type="button"
            role="menuitemradio"
            aria-checked={value === option}
            onClick={() => {
              onValueChange(option);
              setOpen(false);
            }}
          >
            {option}
            <Glyph name="check" className="check" />
          </button>
        ))}
      </OverlayMenu>
    </div>
  );
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
