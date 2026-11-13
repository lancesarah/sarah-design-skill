"use client";

import { Icon, PageHeader } from "@lance-live/sds";
import { useEffect, useRef } from "react";
import { continuesRun, useChat } from "./chat-data";
import { MessageField, messageThread } from "./messages";

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
          {lines.map((line, index) => {
            const prev = lines[index - 1];
            const continued = Boolean(prev && continuesRun(prev, line));
            return (
              <div className={["comment-row", continued ? "is-continued" : ""].filter(Boolean).join(" ")} key={line.id}>
                {continued ? (
                  <span className="comment-photo" aria-hidden="true" />
                ) : line.photo ? (
                  <img className="avatar mini comment-photo" src={line.photo} alt="" />
                ) : (
                  <span className="avatar mini comment-photo">{line.initials}</span>
                )}
                <span className="person-copy">
                  {continued ? null : (
                    <span className="comment-meta">
                      {line.name} <time dateTime={line.time}>{line.time}</time>
                    </span>
                  )}
                  <p>{line.body}</p>
                </span>
              </div>
            );
          })}
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
          <MessageField label="Write a message" value={draft} onValueChange={setDraft} onSubmit={send} />
        </span>
        <button className="well" type="submit" aria-label="Send">
          <Icon name="up" size={16} />
        </button>
      </form>
    </main>
  );
}
