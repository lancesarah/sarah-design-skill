"use client";

import { Icon, PageHeader } from "@lance-live/gallery-ui";
import { useEffect, useRef } from "react";
import { useChat } from "./chat-data";
import { messageThread } from "./messages";

export function ChatThread({ id }: { id: string }) {
  const thread = messageThread(id);
  const { lines, draft, setDraft, send } = useChat(id);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const log = logRef.current;
    if (log) log.scrollTop = log.scrollHeight;
  }, [id, lines.length]);

  if (!thread) return null;

  return (
    <main className="notes-page sds chat-thread" aria-label={thread.title}>
      <PageHeader mark="bubble" title={thread.title} actions={null} />
      <div className="chat-log" ref={logRef}>
        <div className="chat-log-body">
          {lines.map((line) => (
            <div className="comment-row" key={line.id}>
              {line.photo ? (
                <img className="avatar mini comment-photo" src={line.photo} alt="" />
              ) : (
                <span className="avatar mini comment-photo">{line.initials}</span>
              )}
              <span className="person-copy">
                <span className="comment-meta">
                  {line.name} <time>{line.time}</time>
                </span>
                <p>{line.body}</p>
              </span>
            </div>
          ))}
        </div>
      </div>
      <form
        className={["sds", "msg", "is-fill", draft.trim() ? "has-value" : ""].filter(Boolean).join(" ")}
        onSubmit={(event) => {
          event.preventDefault();
          send();
        }}
      >
        <span className="lead">
          <button className="well" type="button" aria-label="Add">
            <Icon name="plus" size={16} />
          </button>
          <input
            aria-label="Write a message"
            placeholder="Write a message..."
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
          />
        </span>
        <button className="well" type="submit" aria-label="Send">
          <Icon name="up" size={16} />
        </button>
      </form>
    </main>
  );
}
