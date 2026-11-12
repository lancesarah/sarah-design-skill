"use client";

import { Button, Icon, TextIcon, type IconName } from "@lance-live/gallery-ui";
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type MouseEvent, type PointerEvent, type ReactNode, type Ref } from "react";
import { PageLayout } from "../page-layout";
import { useMakeRoom } from "../shell-panels";
import { TodoEditor, type Todo } from "../todos/todo-editor";
import { HomeColumns, HomeWide } from "./columns";
import { HOME_WIDGETS } from "./widget-catalog";
import { WidgetGallery } from "./widget-gallery";
import { place, useWidgetDrag, visibleIds, type Layout } from "./use-widget-drag";

/** What the action's editor opens with. */
type PatternDraft = Pick<Todo, "title" | "note" | "place" | "item" | "type" | "urgency"> & { room?: string };

type Pattern = { id: string; icon: IconName; title: string; line: string; questions: string[]; action: "Create work order" | "Create to-do"; draft: PatternDraft };

const PATTERNS: Pattern[] = [
  {
    id: "spa",
    icon: "gauge",
    title: "Spa and lazy river keep drifting out of range",
    line: "Inspect the spa and lazy river water balance now. Readings keep moving out of range, and one alkalinity zero should be retested before any big correction.",
    questions: ["Which readings repeat most by asset?", "How often did spa values go low?"],
    action: "Create work order",
    draft: {
      title: "Rebalance the spa and lazy river",
      note: "Readings keep drifting out of range. Retest the alkalinity zero before any big correction.",
      place: "Common area",
      item: "Spa",
      type: "Maintenance",
      urgency: "high",
    },
  },
  {
    id: "late",
    icon: "clock",
    title: "Late checkouts are stacking up on Fridays",
    line: "Five of the last six Fridays had three or more late checkouts on the 9th floor, and housekeeping finished after 4.",
    questions: ["Which rooms ask most often?", "How late did housekeeping finish?"],
    action: "Create to-do",
    draft: {
      title: "Plan Friday late checkouts on 9",
      note: "Three or more late checkouts on the 9th floor most Fridays. Add a second attendant after 2.",
      place: "Common area",
      item: "Late checkouts",
      type: "Housekeeping",
      urgency: "standard",
    },
  },
  {
    id: "ice",
    icon: "alert",
    title: "The ice machine on 7 keeps coming back",
    line: "Four to-dos in 30d name the same machine. Each one was closed as a reset.",
    questions: ["When was it last serviced?", "Who closed the last four?"],
    action: "Create work order",
    draft: {
      title: "Service the ice machine on 7",
      note: "Four to-dos in 30d were closed as a reset. Find the cause instead of resetting it again.",
      place: "Common area",
      item: "Ice machine",
      type: "Maintenance",
      urgency: "high",
    },
  },
];

function greeting(date: Date) {
  const hour = date.getHours();
  return hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
}

/** How the cards trade places. Next sinks the front card into the slot behind. Previous settles the new one from above. */
type Deal = { from: Pattern; at: number; dir: "next" | "prev" | "dismiss"; key: number };

function LanceCard({
  pattern,
  at,
  total,
  voted,
  ghost = false,
  dir,
  sectionRef,
  onVote,
  onStep,
  onDismiss,
  onAct,
  onSettled,
}: {
  pattern: Pattern;
  at: number;
  total: number;
  voted?: "up" | "down";
  /** The card on its way out. Drawn once for the shuffle, then removed. */
  ghost?: boolean;
  dir?: Deal["dir"];
  sectionRef?: Ref<HTMLElement>;
  onVote: (vote: "up" | "down") => void;
  onStep: (by: number, event: MouseEvent<HTMLButtonElement>) => void;
  onDismiss: (event: MouseEvent<HTMLButtonElement>) => void;
  onAct: () => void;
  onSettled?: () => void;
}) {
  return (
    <section ref={sectionRef} className={ghost ? "home-lance is-ghost" : "home-lance"} aria-label={ghost ? undefined : "Lance"} aria-hidden={ghost || undefined} inert={ghost} data-dir={dir} onAnimationEnd={(event) => { if (event.target === event.currentTarget) onSettled?.(); }}>
      <div className="home-lance-head">
        <span className="home-lance-label">
          We found {total} {total === 1 ? "pattern" : "patterns"} worth acting on
        </span>
        <span className="home-feedback">
          {(["up", "down"] as const).map((vote) => (
            <button
              key={vote}
              className="home-chip"
              type="button"
              aria-pressed={vote === voted}
              aria-label={vote === "up" ? "Helpful" : "Not helpful"}
              onClick={() => onVote(vote)}
            >
              <Icon name={vote === "up" ? "thumb-up" : "thumb-down"} size={14} />
            </button>
          ))}
        </span>
      </div>
      <div className="home-lance-head is-actions">
        <span className="home-lance-tools">
          <TextIcon icon="chevron" size="sm" className="home-prev" aria-label="Previous" disabled={total < 2} onClick={(event) => onStep(-1, event)} />
          {total > 1 ? (
            <span
              className="home-counter"
              style={{ "--digits": String(total).length } as CSSProperties}
              aria-live="polite" aria-label={`Pattern ${at + 1} of ${total}`}>
              {at + 1} / {total}
            </span>
          ) : null}
          <TextIcon icon="chevron" size="sm" className="home-next" aria-label="Next" disabled={total < 2} onClick={(event) => onStep(1, event)} />
          <TextIcon
            icon="close"
            size="sm"
            aria-label="Dismiss"
            onClick={onDismiss}
          />
        </span>
      </div>
      <div className="home-lance-pattern">
        <div className="home-lance-marks">
          <span className="home-insight" aria-hidden="true">
            <Icon name={pattern.icon} size={20} />
          </span>
        </div>
        <div className="home-lance-copy">
          <h2>{pattern.title}</h2>
          <p>{pattern.line}</p>
        </div>
      </div>
      <div className="home-lance-actions">
        {pattern.questions.map((question) => (
          <button key={question} className="lance-suggest" type="button">
            <Icon name="bubble" size={14} />
            {question}
          </button>
        ))}
        <Button variant="secondary" className="home-lance-do" onClick={onAct}>
          <Icon name={pattern.action === "Create to-do" ? "todo" : "wrench"} size={14} />
          {pattern.action}
        </Button>
      </div>
    </section>
  );
}

/** The widgets someone took off Home, kept in this browser. A widget added later shows until it is removed. */
const HIDDEN_KEY = "home-hidden-widgets";
/** Where each widget sits, kept in this browser. A widget added to the catalog later takes its catalog place. */
const ORDER_KEY = "home-widget-order";
const CATALOG = HOME_WIDGETS.map((widget) => widget.id);
const BY_ID = new Map(HOME_WIDGETS.map((widget) => [widget.id, widget]));

function savedOrder(saved: string[]) {
  const order = saved.filter((id) => BY_ID.has(id));
  CATALOG.forEach((id, index) => {
    if (order.includes(id)) return;
    const before = CATALOG.slice(0, index).reverse().find((item) => order.includes(item));
    order.splice(before ? order.indexOf(before) + 1 : 0, 0, id);
  });
  return order;
}

/** In edit mode the widget shakes, stops taking clicks, and shows its remove mark in the corner. */
/** Each widget gets its own phase and speed from its place, so neighbors never shake in step. */
function shakeStyle(index: number) {
  return { "--shake-delay": `${-((index * 113) % 280)}ms`, "--shake-time": `${250 + ((index * 47) % 70)}ms` } as CSSProperties;
}

/** In edit mode a widget drags to a new place. With focus, the arrow keys move it one place. */
function EditableWidget({
  id,
  title,
  index,
  editing,
  lifted,
  onRemove,
  onDrag,
  onStep,
  children,
}: {
  id: string;
  title: string;
  index: number;
  editing: boolean;
  lifted: boolean;
  onRemove: () => void;
  onDrag: (event: PointerEvent<HTMLDivElement>) => void;
  onStep: (by: number) => void;
  children: ReactNode;
}) {
  return (
    <div
      className={lifted ? "home-edit-item is-lifted" : "home-edit-item"}
      style={shakeStyle(index)}
      data-widget-id={id}
      tabIndex={editing ? 0 : undefined}
      aria-label={editing ? `${title}. Drag, or use the arrow keys, to move it.` : undefined}
      onPointerDown={editing ? onDrag : undefined}
      onKeyDown={
        editing
          ? (event) => {
              if (event.target !== event.currentTarget) return;
              const by = event.key === "ArrowUp" || event.key === "ArrowLeft" ? -1 : event.key === "ArrowDown" || event.key === "ArrowRight" ? 1 : 0;
              if (!by) return;
              event.preventDefault();
              onStep(by);
            }
          : undefined
      }
    >
      <div className="home-edit-body" inert={editing}>
        {children}
      </div>
      {editing ? (
        <button type="button" className="home-edit-remove" aria-label={`Remove ${title}`} onClick={onRemove}>
          <Icon name="close" size={10} />
        </button>
      ) : null}
    </div>
  );
}

export default function HomePage() {
  const now = new Date();
  const [patterns, setPatterns] = useState(PATTERNS);
  const [index, setIndex] = useState(0);
  const [feedback, setFeedback] = useState<Record<string, "up" | "down" | undefined>>({});
  const [deal, setDeal] = useState<Deal | null>(null);
  const [acting, setActing] = useState<Pattern | null>(null);
  const front = useRef<HTMLElement>(null);
  const [editing, setEditing] = useState(false);
  const makeRoom = useMakeRoom();
  const makeRoomRef = useRef(makeRoom);
  makeRoomRef.current = makeRoom;
  useEffect(() => {
    if (!editing) return;
    return makeRoomRef.current();
  }, [editing]);
  const [layout, setLayout] = useState<Layout>(() => ({ order: CATALOG, hidden: new Set() }));
  useEffect(() => {
    const hidden = window.localStorage.getItem(HIDDEN_KEY);
    const order = window.localStorage.getItem(ORDER_KEY);
    setLayout({ order: savedOrder(order ? (JSON.parse(order) as string[]) : CATALOG), hidden: new Set(hidden ? (JSON.parse(hidden) as string[]) : []) });
  }, []);
  const saveLayout = (next: Layout) => {
    setLayout(next);
    window.localStorage.setItem(ORDER_KEY, JSON.stringify(next.order));
    window.localStorage.setItem(HIDDEN_KEY, JSON.stringify([...next.hidden]));
  };
  const drag = useWidgetDrag(layout, saveLayout);
  const shown = new Set(visibleIds(layout));
  const toggleWidget = (id: string) => {
    const hidden = new Set(layout.hidden);
    if (!hidden.delete(id)) hidden.add(id);
    saveLayout({ ...layout, hidden });
  };
  const [moved, setMoved] = useState<string | null>(null);
  const stepWidget = (id: string, by: number) => {
    const visible = visibleIds(layout);
    const target = visible[visible.indexOf(id) + by];
    if (!target) return;
    saveLayout(place(layout, id, target, by > 0));
    setMoved(id);
  };
  useEffect(() => {
    if (!moved) return;
    drag.boardRef.current?.querySelector<HTMLElement>(`[data-widget-id="${moved}"]`)?.focus();
    setMoved(null);
  }, [moved, drag.boardRef]);
  const at = Math.min(index, patterns.length - 1);
  const pattern = patterns[at];
  /** A keyboard press (`detail` 0) snaps. */
  const shuffle = (dir: Deal["dir"], event: MouseEvent<HTMLButtonElement>) =>
    setDeal(event.detail === 0 || !pattern ? null : { from: pattern, at, dir, key: Date.now() });
  const step = (by: number, event: MouseEvent<HTMLButtonElement>) => {
    shuffle(by > 0 ? "next" : "prev", event);
    setIndex((current) => (current + by + patterns.length) % patterns.length);
  };

  useLayoutEffect(() => {
    const card = front.current;
    if (!deal || !card) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const style = getComputedStyle(card);
    const ease = style.getPropertyValue("--ease-out").trim();
    /** The slot behind is inset 20px a side and sits 16px lower. */
    const slot = `translateY(16px) scale(${(card.offsetWidth - 40) / card.offsetWidth})`;
    const from = reduce
      ? { opacity: 0 }
      : deal.dir === "prev"
        ? { opacity: 0, transform: "translateY(-10px) scale(1.01)" }
        : { opacity: 1, transform: slot };
    const run = card.animate([from, { opacity: 1, transform: "none" }], { duration: reduce ? 160 : 480, easing: ease });
    return () => run.cancel();
  }, [deal]);
  return (
    <PageLayout className="home-page" icon="home" title="Home" header={false}>
      <div className="home-body">
        <div className="home-band" aria-hidden="true" />
        <div className="home-content">
          <section className="home-hello" aria-label="Today">
            <h1 suppressHydrationWarning>{greeting(now)}, Sarah</h1>
            <p suppressHydrationWarning>{now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</p>
          </section>

          {pattern ? (
            <div className={patterns.length > 1 ? "home-lance-stack has-more" : "home-lance-stack"}>
              <LanceCard
                sectionRef={front}
                pattern={pattern}
                at={at}
                total={patterns.length}
                voted={feedback[pattern.id]}
                onVote={(vote) => setFeedback((current) => ({ ...current, [pattern.id]: current[pattern.id] === vote ? undefined : vote }))}
                onStep={step}
                onDismiss={(event) => {
                  shuffle("dismiss", event);
                  setPatterns((list) => list.filter((item) => item.id !== pattern.id));
                  setIndex((current) => Math.max(0, Math.min(current, patterns.length - 2)));
                }}
                onAct={() => setActing(pattern)}
              />
              {deal ? (
                <LanceCard
                  key={deal.key}
                  ghost
                  dir={deal.dir}
                  pattern={deal.from}
                  at={deal.at}
                  total={patterns.length}
                  voted={feedback[deal.from.id]}
                  onVote={() => {}}
                  onStep={() => {}}
                  onDismiss={() => {}}
                  onAct={() => {}}
                  onSettled={() => setDeal((current) => (current?.key === deal.key ? null : current))}
                />
              ) : null}
            </div>
          ) : null}

          <section className={editing ? "home-widgets is-editing" : "home-widgets"} aria-labelledby="home-widgets-title">
            <div className="home-section-head">
              <h2 id="home-widgets-title">Widgets</h2>
              <Button variant="secondary" aria-pressed={editing} onClick={() => setEditing(!editing)}>
                <Icon name={editing ? "check" : "edit"} size={14} />
                {editing ? "Done" : "Edit"}
              </Button>
            </div>
            <HomeColumns boardRef={drag.boardRef}>
              {visibleIds(drag.view).map((id, index) => {
                const { title, wide, Component } = BY_ID.get(id)!;
                const item = (
                  <EditableWidget
                    key={id}
                    id={id}
                    title={title}
                    index={index}
                    editing={editing}
                    lifted={drag.dragging === id}
                    onRemove={() => toggleWidget(id)}
                    onDrag={(event) => drag.start(event, id, "page")}
                    onStep={(by) => stepWidget(id, by)}
                  >
                    <Component />
                  </EditableWidget>
                );
                return wide ? <HomeWide key={id}>{item}</HomeWide> : item;
              })}
            </HomeColumns>
          </section>
          {editing ? <WidgetGallery shown={shown} onToggle={toggleWidget} onDrag={(event, id) => drag.start(event, id, "gallery")} onDone={() => setEditing(false)} /> : null}
        </div>
      </div>
      {acting ? (
        <TodoEditor
          key={acting.id}
          creating
          noun={acting.action === "Create work order" ? "work order" : "to-do"}
          todo={{
            id: `home-${acting.id}`,
            room: "",
            ...acting.draft,
            status: "open",
            bucket: "open",
            assignee: "",
            initials: "",
            opened: "now",
            activity: [],
          }}
          onClose={() => setActing(null)}
          onSave={() => setActing(null)}
        />
      ) : null}
    </PageLayout>
  );
}
