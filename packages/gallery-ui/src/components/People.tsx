"use client";

import type { ReactNode } from "react";
import { Icon } from "../icons";

export function Avatar({ initials, size = "md", empty = false }: { initials?: string; size?: "md" | "mini" | "lg"; empty?: boolean }) {
  return (
    <span className={["sds", "avatar", size === "md" ? "" : size, empty ? "is-empty" : ""].filter(Boolean).join(" ")} aria-hidden="true">
      {empty ? null : initials}
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
          <svg width="16" height="16" viewBox="0 0 16 16">
            <path fill="currentColor" d="M2 2h5v12H2zM2 9h12v5H2z" />
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
