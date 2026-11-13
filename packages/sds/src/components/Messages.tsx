"use client";

import { forwardRef, type ReactNode, type TransitionEvent } from "react";
import { Button } from "./Button";
import { Status } from "./Feedback";
import { Avatar } from "./People";
import { Icon } from "../icons";

export type MessageProps = {
  name: string;
  body: string;
  /** Left off when this line continues the one above it. */
  time?: string;
  initials?: string;
  photo?: string;
  /** The person signed in. The bubble sits on the right, in the one blue. */
  you?: boolean;
  /** The name over yours when it goes out for a team, like Front desk. Defaults to You. */
  byline?: string;
  /** Same person, inside two minutes. No second name, and 2px under the line above. */
  continued?: boolean;
  /** The last line of that run. One bottom corner is square, on that person's side. */
  latest?: boolean;
};

/** One line in a conversation. The name and the time sit above the bubble. */
export function Message({ name, body, time, initials, photo, you = false, byline = "You", continued = false, latest = false }: MessageProps) {
  const classes = ["sds", "thread-line", you ? "is-you" : "", continued ? "is-continued" : "", latest ? "is-latest" : ""].filter(Boolean).join(" ");
  return (
    <div className={classes}>
      {you || continued ? null : <Avatar initials={initials} photo={photo} />}
      <div className="thread-copy">
        {continued ? null : (
          <span className="who">
            {you ? byline : name}
            {time ? <time dateTime={time}>{time}</time> : null}
          </span>
        )}
        <div className="thread-bubble">
          <p>{body}</p>
        </div>
      </div>
    </div>
  );
}

export type MessageGroupItem = { body: string };

/** Messages from one person inside two minutes. They share one name, and only the last corner changes. */
export function MessageGroup({
  name,
  time,
  initials,
  photo,
  you = false,
  messages,
}: {
  name: string;
  time?: string;
  initials?: string;
  photo?: string;
  you?: boolean;
  messages: MessageGroupItem[];
}) {
  return (
    <div className="sds thread-log-body">
      {messages.map((message, index) => (
        <Message
          key={index}
          name={name}
          time={index === 0 ? time : undefined}
          initials={initials}
          photo={photo}
          you={you}
          body={message.body}
          continued={index > 0}
          latest={index > 0 && index === messages.length - 1}
        />
      ))}
    </div>
  );
}

/** The rule between days. The clock sits on this line. */
export function Day({ label }: { label: string }) {
  return <div className="sds thread-day">{label}</div>;
}

/** The other person is writing. Three dots, in the same bubble as a message. */
export function Typing({ initials, photo, name, label = "Typing" }: { initials?: string; photo?: string; name?: string; label?: string }) {
  return (
    <div className="sds thread-line" aria-label={label}>
      <Avatar initials={initials} photo={photo} name={name} />
      <div className="thread-copy">
        <div className="thread-bubble">
          <span className="typing-dots" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
        </div>
      </div>
    </div>
  );
}

/** A finished conversation. The reply field is gone. The next step is a new chat, or reopening this one. */
export function Resolved({
  note = "This conversation is resolved.",
  onNew,
  onReopen,
  actions,
}: {
  note?: string;
  onNew?: () => void;
  onReopen?: () => void;
  /** Replaces Start a new chat and Reopen to reply, for a thread that is answered somewhere else. */
  actions?: ReactNode;
}) {
  return (
    <div className="sds ticket-resolved">
      <p>{note}</p>
      <span className="ticket-resolved-actions">
        {actions ?? (
          <>
            <Button variant="tertiary" onClick={onNew}>
              <Icon name="plus-bold" size={14} />
              Start a new chat
            </Button>
            <Button variant="secondary" onClick={onReopen}>
              Reopen to reply
            </Button>
          </>
        )}
      </span>
    </div>
  );
}

export type TicketStep = { label: string; time?: string };

/** The ticket as a record inside its conversation: what it is, then the steps it has passed. */
export function Ticket({ number, title, kind, steps }: { number: string; title: string; kind: string; steps: TicketStep[] }) {
  return (
    <section className="sds ticket-card" aria-label={`Ticket ${number}`}>
      <div className="ticket-copy">
        <span className="ticket-card-title">{title}</span>
        <span className="ticket-meta">
          <span>#{number}</span>
          <span>{kind}</span>
        </span>
      </div>
      <ol className="ticket-steps">
        {steps.map((step) => (
          <li className={step.time ? "is-done" : ""} key={step.label}>
            <svg width="14" height="14" viewBox="0 0 18 18" aria-hidden="true">
              {step.time ? (
                <path fill="currentColor" fillRule="evenodd" d="M9 0a9 9 0 1 0 0 18A9 9 0 0 0 9 0Zm3.65 6.66-1.05-.86-4 4.9-1.75-1.76-.95.96 2.8 2.8 4.95-6.04Z" />
              ) : (
                <path d="M17 9a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z" fill="none" stroke="currentColor" strokeWidth="2" />
              )}
            </svg>
            <span>{step.label}</span>
            {step.time ? <time>{step.time}</time> : null}
          </li>
        ))}
      </ol>
    </section>
  );
}

/** A glance at an open ticket, under the header: the number, the title, and where it stands. */
export const TicketNote = forwardRef<
  HTMLDivElement,
  {
    number: string;
    title: string;
    status: "open" | "progress" | "complete";
    leaving?: boolean;
    className?: string;
    onDismiss?: () => void;
    onTransitionEnd?: (event: TransitionEvent<HTMLDivElement>) => void;
  }
>(function TicketNote({ number, title, status, leaving = false, className, onDismiss, onTransitionEnd }, ref) {
  return (
    <div
      ref={ref}
      className={["sds", "ticket-overview", leaving ? "is-leaving" : "", className].filter(Boolean).join(" ")}
      onTransitionEnd={onTransitionEnd}
    >
      <span className="ticket-overview-copy">
        <span className="ticket-overview-k">#{number}</span>
        <span className="ticket-overview-title">{title}</span>
      </span>
      <Status status={status} />
      {onDismiss ? (
        <button type="button" className="note-more ticket-overview-dismiss" aria-label="Dismiss" onClick={onDismiss}>
          <Icon name="close" size={14} />
        </button>
      ) : null}
    </div>
  );
});
