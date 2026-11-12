"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Icon } from "../icons";

/** Centers the name above the picture. The tip is in the top layer, so a scrolling list does not clip it. */
function placeNameTip(host: HTMLElement) {
  const tip = host.querySelector<HTMLElement>(":scope > .tip");
  if (!tip) return null;
  const gap = Number.parseFloat(getComputedStyle(host).getPropertyValue("--tip-gap")) || 8;
  const box = host.getBoundingClientRect();
  tip.style.position = "fixed";
  tip.style.left = `${box.left + box.width / 2}px`;
  tip.style.top = `${box.top - gap}px`;
  tip.style.transform = "translate(-50%, -100%)";
  return tip;
}

export function Avatar({
  initials,
  size = "md",
  empty = false,
  name,
  photo,
  className,
  children,
}: {
  initials?: string;
  size?: "md" | "mini" | "lg";
  empty?: boolean;
  /** The person's name, as a tooltip. Leave it off when that name is already written beside the picture. */
  name?: string;
  /** A portrait, shown in the circle in place of the initials. */
  photo?: string;
  className?: string;
  /** A mark that sits on the picture, such as the verified check. */
  children?: ReactNode;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const host = ref.current;
    if (!hovered || !host) return;
    const place = () => placeNameTip(host);
    const tip = place();
    if (!tip) return;
    try {
      if (!tip.matches(":popover-open")) tip.showPopover();
    } catch {
      // The tip can already be opening as the pointer crosses the picture.
    }
    window.addEventListener("scroll", place, true);
    window.addEventListener("resize", place);
    return () => {
      window.removeEventListener("scroll", place, true);
      window.removeEventListener("resize", place);
      try {
        if (tip.matches(":popover-open")) tip.hidePopover();
      } catch {
        // The tip can already be closed when the pointer leaves.
      }
    };
  }, [hovered]);

  const classes = ["sds", "avatar", size === "md" ? "" : size, empty ? "is-empty" : "", photo ? "is-photo" : "", name ? "tip-host" : "", className].filter(Boolean).join(" ");
  const face = photo ? <img src={photo} alt="" /> : empty ? null : initials;
  if (!name) {
    return (
      <span className={classes} aria-hidden="true">
        {face}
        {children}
      </span>
    );
  }
  return (
    <span ref={ref} className={classes} role="img" aria-label={name} onPointerEnter={() => setHovered(true)} onPointerLeave={() => setHovered(false)}>
      {face}
      {children}
      <span className="tip" popover="manual" aria-hidden="true">
        {name}
      </span>
    </span>
  );
}

export function Person({
  initials = "SM",
  name,
  role,
  title,
  time,
  variant = "name",
}: {
  initials?: string;
  name: string;
  role?: string;
  title?: string;
  time?: string;
  variant?: "name" | "mini" | "pill" | "unassigned" | "role" | "title" | "message";
}) {
  if (variant === "mini") {
    return (
      <span className="sds mini-line">
        <Avatar initials={initials} size="mini" />
        {name}
      </span>
    );
  }
  if (variant === "pill" || variant === "unassigned" || variant === "message") {
    const pill = (
      <span className={["sds", "mini-pill", variant === "unassigned" ? "is-empty" : ""].filter(Boolean).join(" ")}>
        <Avatar initials={initials} size="mini" empty={variant === "unassigned"} />
        {variant === "unassigned" ? "Unassigned" : name}
      </span>
    );
    if (variant !== "message") return pill;
    return (
      <span className="sds mini-stack">
        {pill}
        <button className="msg-btn" type="button">
          <Icon name="bubble" size={14} />
          Message
        </button>
      </span>
    );
  }
  return (
    <span className="sds person">
      <Avatar initials={initials} size={variant === "title" ? "lg" : "md"} />
      {variant === "name" ? (
        <span>{name}</span>
      ) : (
        <span className={variant === "title" ? "person-copy person-title" : "person-copy"}>
          {variant === "title" ? (
            <>
              <span className="who">
                {name} <span>{time}</span>
              </span>
              <span className="title">{title}</span>
            </>
          ) : (
            <>
              <span>{name}</span>
              <span className="sub">{role}</span>
            </>
          )}
        </span>
      )}
    </span>
  );
}

export function Composer({
  kind = "lance",
  placeholder,
  photo,
  className,
  state,
  defaultValue = "",
  fill = false,
}: {
  kind?: "lance" | "message";
  placeholder: string;
  photo?: ReactNode;
  className?: string;
  state?: "hover" | "typed";
  defaultValue?: string;
  /** Stretch to the parent width. The gallery specimen stays at its own width. */
  fill?: boolean;
}) {
  const classes = ["sds", kind === "message" ? "msg" : kind, fill ? "is-fill" : "", state === "hover" ? "is-hover" : "", state === "typed" ? "is-typed" : "", defaultValue.trim() ? "has-value" : "", className]
    .filter(Boolean)
    .join(" ");
  return (
    <form
      className={classes}
      onSubmit={(event) => event.preventDefault()}
      onInput={(event) => {
        const input = event.currentTarget.querySelector("input");
        event.currentTarget.classList.toggle("has-value", Boolean(input?.value.trim()));
      }}
    >
      <span className="lead">
        {photo ?? (
          <button className="well" type="button" aria-label="Add">
            <Icon name="plus" size={16} />
          </button>
        )}
        <input aria-label={placeholder} placeholder={placeholder} defaultValue={defaultValue} />
      </span>
      {kind === "lance" ? (
        <span className="tools">
          <button className="mode" type="button">
            Normal <Icon name="chevron" size={14} />
          </button>
          <button className={state === "typed" ? "well is-on" : "well"} type="button" aria-label="Microphone">
            <Icon name="mic" size={16} />
          </button>
          <button className={state === "typed" ? "well is-on" : "well"} type="submit" aria-label="Send">
            <Icon name="up" size={16} />
          </button>
        </span>
      ) : (
        <button className={state === "typed" ? "well is-on" : "well"} type="submit" aria-label="Send">
          <Icon name="up" size={16} />
        </button>
      )}
    </form>
  );
}

export function LancePanel() {
  return (
    <aside className="sds lance-side" aria-label="Lance">
      <header className="lance-bar">
        <span>Lance</span>
        <span className="lance-tools">
          <button className="side-icon" type="button" aria-label="History">
            <Icon name="clock" size={18} />
          </button>
          <button className="side-icon" type="button" aria-label="New chat">
            <Icon name="edit-square" size={18} />
          </button>
          <button className="side-icon" type="button" aria-label="Expand">
            <Icon name="fullscreen" size={18} />
          </button>
          <button className="side-icon" type="button" aria-label="Collapse chat">
            <Icon name="panel" size={18} />
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
          <Icon name="list" size={14} />
          Review internal notes
        </button>
        <button className="lance-suggest" type="button">
          <Icon name="list" size={14} />
          Run a cash count
        </button>
        <button className="lance-suggest" type="button">
          <Icon name="list" size={14} />
          Open the boards
        </button>
      </div>
      <div className="lance-dock">
        <Composer kind="lance" placeholder="Ask Lance anything..." />
      </div>
    </aside>
  );
}

export function Comment({
  name,
  time,
  body,
  hover = false,
  initials,
  className,
}: {
  name: string;
  time: string;
  body: string;
  hover?: boolean;
  initials?: string;
  className?: string;
}) {
  const mark =
    initials ??
    name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2);
  return (
    <div className={["sds", "comment-row", hover ? "is-hover" : "", className].filter(Boolean).join(" ")}>
      <span className="avatar mini comment-photo">{mark}</span>
      <span className="person-copy">
        <span className="comment-meta">
          {name} <time>{time}</time>
        </span>
        <p>{body}</p>
      </span>
      {hover ? (
        <button className="note-more" type="button" aria-label="More">
          <Icon name="dots" size={14} />
        </button>
      ) : null}
    </div>
  );
}
