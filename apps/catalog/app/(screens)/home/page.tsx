"use client";

import { Avatar, Button, DepartmentChip, Icon, TextIcon, Widget, WidgetList, WidgetRow, type IconName } from "@lance-live/gallery-ui";
import Link from "next/link";
import { useLayoutEffect, useRef, useState, type CSSProperties, type MouseEvent, type ReactNode, type Ref } from "react";
import { PageLayout } from "../page-layout";
import { TodoEditor, type Todo } from "../todos/todo-editor";
import { DndWidget } from "./dnd-widget";
import { HousekeepingWidget } from "./housekeeping-widget";
import { KnowledgeWidget } from "./knowledge-widget";
import { TodosWidget } from "./todos-widget";

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

type HomeNote = { id: string; initials: string; name: string; time: string; title: string; preview: string };

const NOTES: HomeNote[] = [
  { id: "n1", initials: "CS", name: "Cy Smith", time: "9h", title: "11/10 NA shift", preview: "Guest Khari Emberly checked out two days early. I did not check them out in the system." },
  { id: "n2", initials: "AC", name: "Ana Cruz", time: "17h", title: "11/10 PM shift", preview: "Room moves completed: 428 to 423. Rooms out of order: 618, 722, 924." },
  { id: "n3", initials: "JR", name: "Jo Reyes", time: "1d", title: "AM shift", preview: "Smooth shift. Delta all assigned and checked in." },
];

type HomeCall = { id: string; phone: string; summary: string; outcome: string; time: string };

const CALLS: HomeCall[] = [
  { id: "c1", phone: "+1 (917) 822-3169", summary: "Asked about same-day spa bookings", outcome: "Needs attention", time: "12m" },
  { id: "c2", phone: "+1 (310) 770-6689", summary: "Confirmed a late arrival for Friday", outcome: "Transferred", time: "40m" },
  { id: "c3", phone: "+1 (866) 550-1427", summary: "Tried to reach the restaurant", outcome: "Missed", time: "1h" },
];

type HomeComplaint = { id: string; room: string; title: string; dept: string; time: string };

const COMPLAINTS: HomeComplaint[] = [
  { id: "p1", room: "917", title: "Smoking smell in the hallway", dept: "Management", time: "2h" },
  { id: "p2", room: "905", title: "Noise from the room next door", dept: "Front Desk", time: "5h" },
  { id: "p3", room: "412", title: "Shower drains slowly", dept: "Maintenance", time: "1d" },
];

function greeting(date: Date) {
  const hour = date.getHours();
  return hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
}

function Tile({ id, title, count, href, children }: { id: string; title: string; count: number; href: string; children: ReactNode }) {
  return (
    <section className="home-tile" aria-labelledby={id}>
      <div className="home-section-head">
        <h2 id={id}>
          {title} <span className="home-count">{count}</span>
        </h2>
        <Link className="sds text-icon sm" href={href}>
          All
        </Link>
      </div>
      <ul className="home-list">{children}</ul>
    </section>
  );
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

export default function HomePage() {
  const now = new Date();
  const [patterns, setPatterns] = useState(PATTERNS);
  const [index, setIndex] = useState(0);
  const [feedback, setFeedback] = useState<Record<string, "up" | "down" | undefined>>({});
  const [deal, setDeal] = useState<Deal | null>(null);
  const [acting, setActing] = useState<Pattern | null>(null);
  const front = useRef<HTMLElement>(null);
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
    <PageLayout className="home-page" icon="home" title="Home">
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

          <div className="home-tiles">
            <HousekeepingWidget />
            <TodosWidget />
            <Widget
              icon="doc"
              title="Internal notes"
              count={NOTES.length}
              action={
                <Link className="sds text-icon sm" href="/notes?new" aria-label="New note">
                  <Icon name="plus" size={14} />
                </Link>
              }
            >
              <WidgetList>
                {NOTES.map((note) => (
                  <WidgetRow key={note.id} as={Link} href="/notes" lead={<Avatar initials={note.initials} name={note.name} />} title={note.title} subtitle={note.preview} subtitleTone="muted" meta={note.time} />
                ))}
              </WidgetList>
            </Widget>
            <KnowledgeWidget />
            <DndWidget />

            <Tile id="home-calls" title="Calls" count={CALLS.length} href="/calls">
              {CALLS.map((call) => (
                <li key={call.id}>
                  <Link className="home-row home-line" href="/calls">
                    <span className="home-row-copy">
                      <span className="home-row-title">{call.phone}</span>
                      <span className="home-row-meta">
                        {call.outcome} · {call.summary}
                      </span>
                    </span>
                    <span className="home-time">{call.time}</span>
                  </Link>
                </li>
              ))}
            </Tile>

            <Tile id="home-complaints" title="Complaints" count={COMPLAINTS.length} href="/complaints">
              {COMPLAINTS.map((complaint) => (
                <li key={complaint.id}>
                  <Link className="home-row home-complaint" href="/complaints">
                    <span className="home-room">{complaint.room}</span>
                    <span className="home-row-copy">
                      <span className="home-row-title">{complaint.title}</span>
                      <DepartmentChip name={complaint.dept} plain />
                    </span>
                    <span className="home-time">{complaint.time}</span>
                  </Link>
                </li>
              ))}
            </Tile>
          </div>
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
