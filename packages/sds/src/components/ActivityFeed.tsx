"use client";

import { Composer } from "./People";

export type ActivityComment = {
  kind: "comment";
  name: string;
  initials: string;
  time: string;
  body: string;
};

export type ActivityStatus = {
  kind: "status";
  name: string;
  initials: string;
  text: string;
  time: string;
};

export type ActivityItem = ActivityComment | ActivityStatus;

export function ActivityFeed({
  items,
  className,
  replyLabel = "Post a reply",
}: {
  items: ActivityItem[];
  className?: string;
  replyLabel?: string;
}) {
  return (
    <section className={["sds", "activity-feed", className].filter(Boolean).join(" ")} aria-label="Activity">
      <div className="activity-head">
        <span>Activity</span>
      </div>
      <div className="activity-list">
        {items.map((item, index) =>
          item.kind === "comment" ? (
            <article className="comment" key={`${item.name}-${item.time}-${index}`}>
              <div className="comment-inner">
                <span className="avatar mini">{item.initials}</span>
                <span className="person-copy">
                  <span className="mini-line">
                    {item.name} <time className="meta-k">{item.time}</time>
                  </span>
                  <p>{item.body}</p>
                </span>
              </div>
            </article>
          ) : (
            <div className="side-log" key={`${item.name}-${item.time}-${index}`}>
              <span className="avatar mini">{item.initials}</span>
              <span className="side-log-text">
                <span className="who">{item.name}</span> {item.text}
              </span>
              <time>{item.time}</time>
            </div>
          ),
        )}
      </div>
      <Composer kind="message" fill placeholder={`${replyLabel}...`} />
    </section>
  );
}
