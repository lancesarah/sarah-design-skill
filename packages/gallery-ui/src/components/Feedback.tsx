"use client";

import { useState, type CSSProperties, type ReactNode } from "react";

function CompleteMark() {
  return (
    <svg width="16" height="16" viewBox="0 0 18 18" aria-hidden="true">
      <path
        fill="var(--status-complete)"
        fillRule="evenodd"
        d="M9 0a9 9 0 1 0 0 18A9 9 0 0 0 9 0Zm3.65 6.66-1.05-.86-4 4.9-1.75-1.76-.95.96 2.8 2.8 4.95-6.04Z"
      />
    </svg>
  );
}

export function Status({ status }: { status: "open" | "progress" | "complete" }) {
  const label = status === "open" ? "Open" : status === "progress" ? "In progress" : "Completed";
  return (
    <span className="sds status">
      {status === "open" ? (
        <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
          <path d="M17 9a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z" fill="none" stroke="var(--urgency-high)" strokeWidth="2" />
        </svg>
      ) : null}
      {status === "progress" ? (
        <svg className="status-progress" width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
          <path d="M17 9a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z" fill="none" stroke="var(--action)" strokeWidth="2" />
          <path d="M9 14.4a5.4 5.4 0 0 0 0-10.8V9l0 5.4Z" fill="var(--action)" />
        </svg>
      ) : null}
      {status === "complete" ? (
        <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
          <path
            fill="var(--status-complete)"
            fillRule="evenodd"
            d="M9 0a9 9 0 1 0 0 18A9 9 0 0 0 9 0Zm3.65 6.66-1.05-.86-4 4.9-1.75-1.76-.95.96 2.8 2.8 4.95-6.04Z"
          />
        </svg>
      ) : null}
      {label}
    </span>
  );
}

export function Urgency({ level, children, style }: { level: "urgent" | "high" | "standard" | "low"; children?: ReactNode; style?: CSSProperties }) {
  const label = level === "urgent" ? "Urgent" : level === "high" ? "High" : level === "standard" ? "Standard" : "Low";
  return (
    <span className={`sds urgency urgency-${level}`} style={style}>
      {level === "urgent" ? (
        <svg className="i" width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
          <path d="M7 5.4V8M7 1.8 1.4 11.2h11.2L7 1.8Z" fill="none" stroke="currentColor" strokeLinecap="square" />
          <rect x="6.7" y="9.2" width=".6" height=".6" fill="currentColor" />
        </svg>
      ) : null}
      {label}
      {children}
    </span>
  );
}

export function Toast({ message, action = "See task", time = "Now" }: { message: string; action?: string; time?: string }) {
  const [hidden, setHidden] = useState(false);
  if (hidden) return null;
  return (
    <div className="sds toast">
      <CompleteMark />
      <span>{message}</span>
      <span className="when">· {time}</span>
      <button className="toast-link" type="button" onClick={() => setHidden(true)}>
        {action}
      </button>
    </div>
  );
}

export function Tooltip({ label, shortcut }: { label: string; shortcut?: string }) {
  return (
    <button className="sds tip-host" type="button">
      {label}
      <span className="tip">
        {label}
        {shortcut ? <span>{shortcut}</span> : null}
      </span>
    </button>
  );
}
