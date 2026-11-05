"use client";

import { ConfirmDialog, DetailPanel, Icon, OverlayMenu, captureClose, type MenuPoint } from "@lance-live/gallery-ui";
import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { ReplyForm } from "../chrome";
import { Glyph } from "../glyph";

export type CallResolution = "transferred" | "resolved" | "missed" | "abandoned";

export type CallComment = { name: string; initials: string; text: string; at: string };

export type TranscriptTurn =
  | { who: "Lance AI" | "Guest"; offset: number; text: string }
  | { tool: string; offset: number };

export type CallRecord = {
  id: string;
  phone: string;
  summary: string;
  resolution: CallResolution;
  dept: string;
  when: string;
  type: string;
  sentiment: string;
  csat: string;
  duration: number;
  origin: string;
  handler: string;
  key: string;
  started: string;
  loggedAt: string;
  transcript: TranscriptTurn[];
  comments: CallComment[];
};

export const RESOLUTION_LABEL: Record<CallResolution, string> = {
  transferred: "Transferred",
  resolved: "Resolved",
  missed: "Missed",
  abandoned: "Abandoned",
};

const RESOLUTIONS = Object.keys(RESOLUTION_LABEL) as CallResolution[];

const DEPARTMENTS = [
  { value: "Front Desk", label: "Front desk" },
  { value: "Housekeeping", label: "Housekeeping" },
  { value: "Maintenance", label: "Maintenance" },
  { value: "Food & Beverage", label: "Food & Beverage" },
  { value: "Sales", label: "Sales" },
  { value: "Management", label: "Management" },
];

const ZONE = "America/Los_Angeles";
const FEATURED = "2026-11-02T17:16:00-08:00";

const KIND: Record<string, string> = {
  "Front Desk": "General",
  Housekeeping: "Request",
  Maintenance: "Service",
  "Food & Beverage": "Dining",
  Sales: "Reservation",
  Management: "Complaint",
};

function clock(total: number) {
  const seconds = Math.max(0, Math.floor(total));
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

function durationLabel(seconds: number) {
  const whole = Math.max(0, Math.floor(seconds));
  return `${String(Math.floor(whole / 60)).padStart(2, "0")}:${String(whole % 60).padStart(2, "0")}`;
}

function formatHandled(iso: string, handler: string) {
  const date = new Date(iso);
  const day = date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: ZONE,
  });
  const time = date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZoneName: "short", timeZone: ZONE });
  return `Handled by ${handler} · ${day} · ${time}`;
}

function formatTurn(iso: string, offset: number) {
  return new Date(new Date(iso).getTime() + offset * 1000).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    timeZone: ZONE,
  });
}

function formatActivity(iso: string) {
  return new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZone: ZONE });
}

function deptLabel(value: string) {
  return DEPARTMENTS.find((item) => item.value === value)?.label ?? value;
}

function detailFor(summary: string, resolution: CallResolution, dept: string, minutes: number) {
  const seconds = 24 + (summary.length % 40);
  return {
    type: KIND[dept] || "General",
    sentiment: resolution === "resolved" ? "positive" : resolution === "transferred" ? "mixed" : "negative",
    csat: resolution === "resolved" ? "4/5" : resolution === "transferred" ? "3/5" : "1/5",
    duration: seconds,
    started: new Date(Date.now() - minutes * 60000).toISOString(),
    loggedAt: new Date(Date.now() - (minutes + 1) * 60000).toISOString(),
    key: summary.split(/[,.]/)[0],
    transcript: [
      { who: "Lance AI" as const, offset: 4, text: "Thank you for calling, how may I help you today?" },
      { who: "Guest" as const, offset: 12, text: summary },
      {
        who: "Lance AI" as const,
        offset: 22,
        text: resolution === "transferred" ? "I'll connect you now." : resolution === "resolved" ? "You're all set." : "I'm sorry we missed you.",
      },
    ],
  };
}

const SEED: Array<[string, string, CallResolution, string, string, number]> = [
  ["+1 (917) 822-3169", "The guest asked about same-day dry cleaning. The agent did not have that detail and transferred the call to the front desk.", "transferred", "Front Desk", "26 minutes ago", 26],
  ["+1 (310) 770-6689", "The guest called to confirm a late checkout.", "transferred", "Front Desk", "59 minutes ago", 59],
  ["+1 (866) 550-1427", "The guest was trying to reach the restaurant for a reservation.", "resolved", "Food & Beverage", "3 hours ago", 190],
  ["+1 (408) 555-0148", "The guest called about a missing room key and hung up.", "missed", "Front Desk", "4 hours ago", 240],
  ["+1 (206) 555-0172", "The guest wanted extra towels sent to the room.", "abandoned", "Housekeeping", "4 hours ago", 260],
];

export function initialCalls(): CallRecord[] {
  return SEED.map(([phone, summary, resolution, dept, when, minutes]) => {
    const featured = phone === "+1 (917) 822-3169";
    const detail = featured
      ? {
          type: "General",
          sentiment: "mixed",
          csat: "2/5",
          duration: 36,
          started: FEATURED,
          loggedAt: "2026-11-02T17:15:00-08:00",
          key: "same day dry cleaning",
          transcript: [
            { who: "Lance AI" as const, offset: 4, text: "Good afternoon, thank you for calling SpringHill Suites Belmont, this is Laura, how may I help you today?" },
            { who: "Guest" as const, offset: 10, text: "Laura, I'm seeing if maybe the hotel later on today. Do you guys have same day dry cleaning" },
            { tool: "search_faq", offset: 12 },
            { who: "Lance AI" as const, offset: 14, text: "Let me check that for you. I don't have that detail, but I can connect you with a guest representative to check. Would you like me to?" },
            { who: "Guest" as const, offset: 25, text: "Um, yeah, thank you" },
            { who: "Lance AI" as const, offset: 26, text: "Okay. Of course, let me connect you with the front desk." },
            { tool: "transfer_to_department", offset: 27 },
          ],
        }
      : detailFor(summary, resolution, dept, minutes);
    return {
      id: phone,
      phone,
      summary,
      resolution,
      dept,
      when,
      origin: "External",
      handler: "Lance AI",
      comments: [],
      ...detail,
    };
  });
}

type MenuState = { kind: "resolution" | "department" | "comment"; key: number; comment?: number; point?: { x: number; y: number } | null };

export function CallDetails({
  call,
  resolution,
  hidden,
  onClose,
  onResolution,
  onDepartment,
  onReply,
  onDeleteComment,
  onDelete,
  menuAt = null,
}: {
  call: CallRecord;
  resolution: CallResolution;
  hidden: boolean;
  onClose: () => void;
  onResolution: (next: CallResolution) => void;
  onDepartment: (dept: string) => void;
  onReply: (text: string) => void;
  onDeleteComment: (index: number) => void;
  onDelete: () => void;
  menuAt?: MenuPoint | null;
}) {
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [transcriptOpen, setTranscriptOpen] = useState(true);
  const [menu, setMenu] = useState<MenuState | null>(null);
  const [pendingComment, setPendingComment] = useState<number | null>(null);
  const anchorRef = useRef<HTMLElement | null>(null);
  const transferred = resolution === "transferred";
  const progress = call.duration > 0 ? Math.min(100, (elapsed / call.duration) * 100) : 0;

  useEffect(() => {
    setPlaying(false);
    setElapsed(0);
    setTranscriptOpen(true);
    setMenu(null);
  }, [call.id]);

  useEffect(() => {
    if (hidden) setPlaying(false);
  }, [hidden]);

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => {
      setElapsed((value) => {
        if (value + 1 >= call.duration) {
          setPlaying(false);
          return call.duration;
        }
        return value + 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [playing, call.duration, call.id]);

  useEffect(() => {
    if (!menu) return;
    const close = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (target.closest(".menu, [aria-haspopup='menu']")) return;
      setMenu(null);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenu(null);
    };
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", onKey);
    };
  }, [menu]);

  function openMenu(kind: MenuState["kind"], node: HTMLElement, comment?: number, point?: { x: number; y: number } | null) {
    if (!point && menu?.kind === kind && anchorRef.current === node) {
      setMenu(null);
      return;
    }
    anchorRef.current = node;
    setMenu({ kind, key: Date.now(), comment, point });
  }

  function seek(clientX: number, width: number, left: number) {
    if (width <= 0) return;
    const ratio = Math.min(1, Math.max(0, (clientX - left) / width));
    setElapsed(Math.round(ratio * call.duration));
  }

  const resolutionOpen = menu?.kind === "resolution";

  return (
    <DetailPanel
      id="call-side"
      label="Call details"
      name={call.phone}
      noun="call"
      hidden={hidden}
      menuAt={menuAt}
      onClose={onClose}
      onDeleted={onDelete}
    >
      <div className="call-side-head">
        <div className="todo-side-intro">
          <div className="todo-side-title-row">
            <h2>{call.phone}</h2>
            <ResolutionChip
              resolution={resolution}
              expanded={resolutionOpen && anchorRef.current?.dataset.slot === "title"}
              slot="title"
              onClick={(node) => openMenu("resolution", node)}
            />
          </div>
          <p className="call-handled">{formatHandled(call.started, call.handler)}</p>
        </div>
        <div className="todo-side-rule" />
      </div>
      <section className="call-block">
        <h3 className="sheet-label">Call recording</h3>
        <div className="call-player">
          <button
            className="call-play"
            type="button"
            aria-pressed={playing}
            aria-label={playing ? "Pause recording" : "Play recording"}
            onClick={() => {
              if (playing) {
                setPlaying(false);
                return;
              }
              setElapsed((value) => (value >= call.duration ? 0 : value));
              setPlaying(true);
            }}
          >
            <Icon name={playing ? "pause" : "play"} />
          </button>
          <span className="call-elapsed">{clock(elapsed)}</span>
          <div
            className="call-track"
            role="slider"
            tabIndex={0}
            aria-valuemin={0}
            aria-valuemax={call.duration}
            aria-valuenow={elapsed}
            aria-label="Recording position"
            onClick={(event) => {
              const box = event.currentTarget.getBoundingClientRect();
              seek(event.clientX, box.width, box.left);
            }}
            onKeyDown={(event) => {
              if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
              event.preventDefault();
              const step = event.key === "ArrowRight" ? 1 : -1;
              setElapsed((value) => Math.min(call.duration, Math.max(0, value + step)));
            }}
          >
            <span style={{ width: `${progress}%` }} />
          </div>
          <span className="call-duration">{clock(call.duration)}</span>
        </div>
      </section>
      <section className="call-block">
        <h3 className="sheet-label">Summary</h3>
        <p className="call-summary-full">{call.summary}</p>
      </section>
      <div className="todo-side-rule" />
      <section className="call-block">
        <h3 className="sheet-label">Key moment</h3>
        <p className="call-key">{call.key}</p>
      </section>
      <div className="todo-side-rule" />
      <section className="call-transcript">
        <button
          className="call-transcript-head"
          type="button"
          aria-expanded={transcriptOpen}
          aria-label={transcriptOpen ? "Collapse transcript" : "Expand transcript"}
          onClick={() => setTranscriptOpen((open) => !open)}
        >
          <span className="sheet-label">Transcript</span>
          <Glyph name="chevron" />
        </button>
        {transcriptOpen ? (
            <div className="call-thread">
              {call.transcript.map((turn, index) =>
                "tool" in turn ? (
                  <p className="call-tool" key={`tool-${turn.tool}-${index}`}>
                    Tool {turn.tool}
                  </p>
                ) : (
                  <div className="call-turn" data-who={turn.who === "Guest" ? "guest" : "agent"} key={`${turn.who}-${index}`}>
                    <span className="call-turn-meta">
                      {turn.who}
                      <time>{formatTurn(call.started, turn.offset)}</time>
                    </span>
                    <p>{turn.text}</p>
                  </div>
                ),
              )}
            </div>
        ) : null}
      </section>
      <div className="todo-side-rule" />
      <section className="call-block call-properties">
        <h3 className="sheet-label">Properties</h3>
        <div className="todo-side-meta">
          <div>
            <span className="sheet-label">Outcome</span>
            <ResolutionChip
              resolution={resolution}
              expanded={resolutionOpen && anchorRef.current?.dataset.slot === "outcome"}
              slot="outcome"
              onClick={(node) => openMenu("resolution", node)}
            />
          </div>
          <div>
            <span className="sheet-label">{transferred ? "Transferred to" : "Department"}</span>
            <span className="side-field side-type call-dept" data-type={call.dept}>
              <span>{deptLabel(call.dept)}</span>
            </span>
          </div>
          <div>
            <span className="sheet-label">Type</span>
            <span className="call-prop">{call.type}</span>
          </div>
          <div>
            <span className="sheet-label">Sentiment</span>
            <span className="call-prop">{call.sentiment}</span>
          </div>
          <div>
            <span className="sheet-label">CSAT</span>
            <span className="call-prop" data-figure>{call.csat}</span>
          </div>
          <div>
            <span className="sheet-label">Duration</span>
            <span className="call-prop" data-figure>{durationLabel(call.duration)}</span>
          </div>
          <div>
            <span className="sheet-label">Origin</span>
            <span className="call-prop">{call.origin}</span>
          </div>
        </div>
      </section>
      <div className="todo-side-rule" />
      <div className="todo-side-activity">
        <div className="activity-head">
          <span>Activity</span>
        </div>
        <div className="activity-list">
          {call.comments.map((comment, index) => (
            <article
              className="comment"
              data-comment={index}
              key={`${comment.at}-${index}`}
              onContextMenu={(event) => {
                const button = event.currentTarget.querySelector(".note-more");
                if (!(button instanceof HTMLElement)) return;
                event.preventDefault();
                event.stopPropagation();
                openMenu("comment", button, index, { x: event.clientX, y: event.clientY });
              }}
            >
              <div className="comment-inner">
                <span className="avatar mini">{comment.initials}</span>
                <span className="person-copy">
                  <span className="mini-line">
                    {comment.name} <time className="meta-k">{comment.at}</time>
                  </span>
                  <p>{comment.text}</p>
                </span>
                <button
                  className="note-more"
                  type="button"
                  aria-label="More"
                  aria-haspopup="menu"
                  aria-expanded={menu?.kind === "comment" && menu.comment === index}
                  onClick={(event) => openMenu("comment", event.currentTarget, index)}
                >
                  <Glyph name="dots" />
                </button>
              </div>
            </article>
          ))}
          <div className="side-log">
            <span className="mini-pill">
              <span className="avatar mini">M</span>
              Manual
            </span>
            <span className="side-log-text">logged this call</span>
            <time>{formatActivity(call.loggedAt)}</time>
          </div>
        </div>
        <ReplyForm className="side-reply" label="Post a reply" onReply={onReply} />
      </div>
      {menu ? (
        <OverlayMenu
          key={menu.key}
          open
          anchorRef={anchorRef}
          point={menu.point}
          label={menu.kind === "comment" ? "More" : menu.kind === "department" ? "Department" : "Resolution"}
        >
          {menu.kind === "resolution"
            ? RESOLUTIONS.map((key) => (
                <button
                  key={key}
                  className="menu-item"
                  type="button"
                  role="menuitemradio"
                  aria-checked={key === resolution}
                  onClick={() => {
                    setMenu(null);
                    onResolution(key);
                  }}
                >
                  <span className="call-resolution" data-resolution={key}>
                    {key === "missed" ? <Glyph name="warn" /> : null}
                    {RESOLUTION_LABEL[key]}
                  </span>
                  <Glyph name="check" className="check" />
                </button>
              ))
            : null}
          {menu.kind === "department"
            ? DEPARTMENTS.map((item) => (
                <button
                  key={item.value}
                  className="menu-item"
                  type="button"
                  role="menuitemradio"
                  aria-checked={item.value === call.dept}
                  onClick={() => {
                    setMenu(null);
                    onDepartment(item.value);
                  }}
                >
                  <span className="dept" data-dept={item.value}>{item.label}</span>
                  <Glyph name="check" className="check" />
                </button>
              ))
            : null}
          {menu.kind === "comment" ? (
            <button
              className="menu-item danger"
              type="button"
              role="menuitem"
              onClick={() => {
                const index = menu.comment;
                setMenu(null);
                if (index != null) setPendingComment(index);
              }}
            >
              <Icon name="trash" size={18} />
              Delete
            </button>
          ) : null}
        </OverlayMenu>
      ) : null}
      <ConfirmDialog
        open={pendingComment != null}
        name={pendingComment != null ? call.comments[pendingComment]?.text ?? "this reply" : ""}
        noun="comment"
        onCancel={() => setPendingComment(null)}
        onConfirm={() => {
          const index = pendingComment;
          if (index == null) return;
          const play = captureClose(document.querySelector(`[data-comment="${index}"]`));
          setPendingComment(null);
          flushSync(() => onDeleteComment(index));
          play();
        }}
      />
    </DetailPanel>
  );
}

function ResolutionChip({
  resolution,
  expanded,
  slot,
  onClick,
}: {
  resolution: CallResolution;
  expanded: boolean;
  slot: string;
  onClick: (node: HTMLButtonElement) => void;
}) {
  return (
    <button
      className="call-resolution"
      type="button"
      data-resolution={resolution}
      data-slot={slot}
      aria-haspopup="menu"
      aria-expanded={expanded}
      aria-label={`Resolution, ${RESOLUTION_LABEL[resolution]}`}
      onClick={(event) => onClick(event.currentTarget)}
    >
      {resolution === "missed" ? <Glyph name="warn" /> : null}
      {RESOLUTION_LABEL[resolution]}
      <Glyph name="chevron" size={10} className="sheet-edit" />
    </button>
  );
}
