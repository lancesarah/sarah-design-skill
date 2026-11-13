"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { setComments, useComments } from "./comments-store";

type Anchor = { selector: string; rx: number; ry: number; x: number; y: number };
type Message = { id: string; name: string; text: string; at: string };
type Thread = { id: string; anchor: Anchor; messages: Message[]; resolved: { name: string; at: string } | null };
type Spot = { x: number; y: number };
type Popover = { kind: "new"; anchor: Anchor } | { kind: "thread"; id: string };

const NAME_KEY = "comment-name";
const IGNORE = ".cmt-ui, .dev-switch, .measure-chrome, nextjs-portal, vercel-live-feedback";
const POP_W = 300;

function currentPage() {
  return `${location.pathname}${location.hash}`;
}

function selectorFor(target: Element) {
  const parts: string[] = [];
  let el: Element | null = target;
  while (el && el !== document.body && el !== document.documentElement) {
    // React's useId ids (`_R_…`, `:r1:`) change between builds, so they cannot hold a pin.
    if (el.id && /^[A-Za-z][\w-]*$/.test(el.id) && document.querySelectorAll(`#${el.id}`).length === 1) {
      parts.unshift(`#${el.id}`);
      return parts.join(" > ");
    }
    const tag = el.tagName.toLowerCase();
    const same = el.parentElement ? [...el.parentElement.children].filter((child) => child.tagName === el!.tagName) : [el];
    parts.unshift(`${tag}:nth-of-type(${same.indexOf(el) + 1})`);
    el = el.parentElement;
  }
  return `body > ${parts.join(" > ")}`;
}

function spotFor(anchor: Anchor): Spot | null {
  let el: Element | null = null;
  try {
    el = anchor.selector ? document.querySelector(anchor.selector) : null;
  } catch {
    el = null;
  }
  if (el) {
    const box = el.getBoundingClientRect();
    if (box.width || box.height) return { x: box.left + anchor.rx * box.width, y: box.top + anchor.ry * box.height };
  }
  return { x: anchor.x - window.scrollX, y: anchor.y - window.scrollY };
}

function ago(iso: string) {
  const seconds = (Date.now() - new Date(iso).getTime()) / 1000;
  if (seconds < 60) return "now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

const initial = (name: string) => name.trim().charAt(0).toUpperCase() || "?";

/** The comment button on the dev bar. */
export function CommentButton() {
  const { active, open } = useComments();
  return (
    <button type="button" aria-pressed={active} onClick={() => setComments({ active: !active })}>
      Comment{open ? <span className="cmt-count">{open}</span> : null}
    </button>
  );
}

/** Pins and threads for whoever has the link. Names are required; there is no login. */
export function CommentLayer() {
  const { active } = useComments();
  const pathname = usePathname();
  const [page, setPage] = useState("");
  const [threads, setThreads] = useState<Thread[]>([]);
  const [spots, setSpots] = useState<Record<string, Spot | null>>({});
  const [popover, setPopover] = useState<Popover | null>(null);
  const [showResolved, setShowResolved] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    try {
      setName(localStorage.getItem(NAME_KEY) ?? "");
    } catch {
      /* storage can be blocked; the name field stays empty */
    }
  }, []);

  useEffect(() => {
    const sync = () => setPage(currentPage());
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, [pathname]);

  const load = useCallback(async () => {
    if (!page) return;
    const response = await fetch(`/api/comments?page=${encodeURIComponent(page)}`, { cache: "no-store" }).catch(() => null);
    if (!response?.ok) return;
    const data = (await response.json()) as { threads: Thread[] };
    setThreads(data.threads);
  }, [page]);

  useEffect(() => {
    setPopover(null);
    setThreads([]);
    void load();
  }, [load]);

  useEffect(() => {
    if (!active) return;
    void load();
    const timer = window.setInterval(load, 20000);
    return () => window.clearInterval(timer);
  }, [active, load]);

  useEffect(() => {
    setComments({ open: threads.filter((thread) => !thread.resolved).length });
  }, [threads]);

  const visible = threads.filter((thread) => showResolved || !thread.resolved);

  useLayoutEffect(() => {
    if (!active) return;
    let frame = 0;
    const measure = () => {
      frame = 0;
      setSpots(Object.fromEntries(threads.map((thread) => [thread.id, spotFor(thread.anchor)])));
    };
    const queue = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("scroll", queue, true);
    window.addEventListener("resize", queue);
    const timer = window.setInterval(queue, 500);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", queue, true);
      window.removeEventListener("resize", queue);
      window.clearInterval(timer);
    };
  }, [active, threads]);

  useEffect(() => {
    if (!active) {
      setPopover(null);
      return;
    }
    const outside = (event: Event) => {
      const target = event.target;
      return target instanceof Element && !target.closest(IGNORE);
    };
    const swallow = (event: Event) => {
      if (!outside(event)) return;
      event.preventDefault();
      event.stopPropagation();
    };
    const place = (event: MouseEvent) => {
      if (!outside(event)) return;
      event.preventDefault();
      event.stopPropagation();
      const target = event.target as Element;
      const box = target.getBoundingClientRect();
      setError("");
      setPopover({
        kind: "new",
        anchor: {
          selector: selectorFor(target),
          rx: box.width ? (event.clientX - box.left) / box.width : 0,
          ry: box.height ? (event.clientY - box.top) / box.height : 0,
          x: event.clientX + window.scrollX,
          y: event.clientY + window.scrollY,
        },
      });
    };
    const key = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setPopover((current) => {
        if (!current) setComments({ active: false });
        return null;
      });
    };
    document.addEventListener("pointerdown", swallow, true);
    document.addEventListener("mousedown", swallow, true);
    document.addEventListener("click", place, true);
    document.addEventListener("keydown", key);
    document.documentElement.dataset.commenting = "";
    return () => {
      document.removeEventListener("pointerdown", swallow, true);
      document.removeEventListener("mousedown", swallow, true);
      document.removeEventListener("click", place, true);
      document.removeEventListener("keydown", key);
      delete document.documentElement.dataset.commenting;
    };
  }, [active]);

  async function send(payload: Record<string, unknown>) {
    setBusy(true);
    setError("");
    const response = await fetch("/api/comments", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ page, name: name.trim(), ...payload }),
    }).catch(() => null);
    setBusy(false);
    const data = response ? ((await response.json().catch(() => ({}))) as { threads?: Thread[]; error?: string }) : {};
    if (!response?.ok || !data.threads) {
      setError(data.error ?? "Could not save. Try again.");
      return null;
    }
    try {
      localStorage.setItem(NAME_KEY, name.trim());
    } catch {
      /* the name just will not be remembered */
    }
    setThreads(data.threads);
    return data.threads;
  }

  if (!active) return null;

  const popSpot = popover?.kind === "new" ? spotFor(popover.anchor) : popover ? spots[popover.id] : null;
  const openThread = popover?.kind === "thread" ? threads.find((thread) => thread.id === popover.id) : null;
  const resolvedCount = threads.filter((thread) => thread.resolved).length;

  return (
    <div className="cmt-ui">
      <div className="cmt-bar" role="status">
        <span>Click anywhere to comment</span>
        {resolvedCount ? (
          <button type="button" aria-pressed={showResolved} onClick={() => setShowResolved((value) => !value)}>
            Resolved {resolvedCount}
          </button>
        ) : null}
        <button type="button" onClick={() => setComments({ active: false })}>
          Done
        </button>
      </div>

      {visible.map((thread, index) => {
        const spot = spots[thread.id];
        if (!spot) return null;
        return (
          <button
            key={thread.id}
            type="button"
            className={["cmt-pin", thread.resolved ? "is-resolved" : "", popover?.kind === "thread" && popover.id === thread.id ? "is-open" : ""].filter(Boolean).join(" ")}
            style={{ left: spot.x, top: spot.y }}
            aria-label={`Comment ${index + 1} by ${thread.messages[0].name}`}
            onClick={() => {
              setError("");
              setPopover({ kind: "thread", id: thread.id });
            }}
          >
            {initial(thread.messages[0].name)}
          </button>
        );
      })}

      {popover?.kind === "new" && popSpot ? <span className="cmt-pin is-draft" style={{ left: popSpot.x, top: popSpot.y }} aria-hidden="true" /> : null}

      {popover && popSpot ? (
        <Card spot={popSpot} onClose={() => setPopover(null)}>
          {openThread ? (
            <>
              <div className="cmt-thread">
                {openThread.messages.map((message) => (
                  <div key={message.id} className="cmt-message">
                    <span className="cmt-avatar">{initial(message.name)}</span>
                    <div>
                      <p className="cmt-meta">
                        <strong>{message.name}</strong> <time>{ago(message.at)}</time>
                      </p>
                      <p className="cmt-text">{message.text}</p>
                    </div>
                  </div>
                ))}
                {openThread.resolved ? <p className="cmt-note">Resolved by {openThread.resolved.name}</p> : null}
              </div>
              <Composer
                name={name}
                setName={setName}
                placeholder="Reply"
                busy={busy}
                error={error}
                onSubmit={(text) => send({ action: "reply", thread: openThread.id, text })}
              >
                <button
                  type="button"
                  className="cmt-quiet"
                  disabled={busy || (!openThread.resolved && !name.trim())}
                  title={!openThread.resolved && !name.trim() ? "Add your name first" : undefined}
                  onClick={() => send({ action: openThread.resolved ? "reopen" : "resolve", thread: openThread.id })}
                >
                  {openThread.resolved ? "Reopen" : "Resolve"}
                </button>
                <button
                  type="button"
                  className="cmt-quiet is-delete"
                  disabled={busy}
                  onClick={async () => {
                    if (!window.confirm("Delete this comment thread for everyone?")) return;
                    if (await send({ action: "delete", thread: openThread.id })) setPopover(null);
                  }}
                >
                  Delete
                </button>
              </Composer>
            </>
          ) : popover.kind === "new" ? (
            <Composer
              name={name}
              setName={setName}
              placeholder="Add a comment"
              busy={busy}
              error={error}
              autoFocus
              onSubmit={async (text) => {
                const next = await send({ action: "create", anchor: popover.anchor, text });
                if (next) setPopover({ kind: "thread", id: next[next.length - 1].id });
                return next;
              }}
            />
          ) : null}
        </Card>
      ) : null}
    </div>
  );
}

function Card({ spot, onClose, children }: { spot: Spot; onClose: () => void; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);
  useLayoutEffect(() => {
    setHeight(ref.current?.offsetHeight ?? 0);
  });
  const left = Math.min(Math.max(8, spot.x + 18), window.innerWidth - POP_W - 8);
  const top = Math.min(Math.max(8, spot.y - 12), window.innerHeight - height - 8);
  return (
    <div ref={ref} className="cmt-card" style={{ left, top, width: POP_W }} role="dialog" aria-label="Comment">
      <button type="button" className="cmt-close" aria-label="Close" onClick={onClose}>
        ×
      </button>
      {children}
    </div>
  );
}

function Composer({
  name,
  setName,
  placeholder,
  busy,
  error,
  autoFocus,
  onSubmit,
  children,
}: {
  name: string;
  setName: (name: string) => void;
  placeholder: string;
  busy: boolean;
  error: string;
  autoFocus?: boolean;
  onSubmit: (text: string) => Promise<unknown>;
  children?: ReactNode;
}) {
  const [text, setText] = useState("");
  const [editingName, setEditingName] = useState(!name.trim());
  const ready = Boolean(name.trim() && text.trim()) && !busy;

  async function submit(event?: FormEvent) {
    event?.preventDefault();
    if (!ready) return;
    if (await onSubmit(text.trim())) {
      setText("");
      setEditingName(false);
    }
  }

  return (
    <form className="cmt-form" onSubmit={submit}>
      {editingName ? (
        <label className="cmt-name">
          <span>Your name</span>
          <input
            value={name}
            maxLength={60}
            required
            placeholder="Required"
            autoFocus={autoFocus}
            onChange={(event) => setName(event.target.value)}
          />
        </label>
      ) : (
        <p className="cmt-as">
          As <strong>{name}</strong>
          <button type="button" onClick={() => setEditingName(true)}>
            Change
          </button>
        </p>
      )}
      <textarea
        value={text}
        rows={3}
        maxLength={2000}
        placeholder={placeholder}
        autoFocus={autoFocus && Boolean(name.trim())}
        onChange={(event) => setText(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) void submit();
        }}
      />
      {error ? <p className="cmt-error">{error}</p> : null}
      <div className="cmt-actions">
        {children}
        <button type="submit" className="cmt-post" disabled={!ready} title={!name.trim() ? "Add your name first" : undefined}>
          {busy ? "Saving" : "Post"}
        </button>
      </div>
    </form>
  );
}
