"use client";

import { useLayoutEffect, useState, type ReactNode } from "react";
import { FontSwitch } from "../font-switch";
import { LanceSide, WorkspaceSide } from "./chrome";
import { ChatThread } from "./chat";
import { ChatProvider } from "./chat-data";
import { MessagesSide, messageThread } from "./messages";
import { NotificationsSide } from "./notifications";
import { usePageLimits } from "./page-limits";

export function AppShell({ children }: { children: ReactNode }) {
  const { sideCollapsed, lanceCollapsed, chooseSide, chooseLance } = usePageLimits();
  const [inbox, setInbox] = useState<"notifications" | "messages" | null>(null);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  useLayoutEffect(() => {
    document.body.classList.add("app-shell");
    return () => {
      document.body.classList.remove("app-shell");
      document.body.classList.remove("is-side-collapsed");
      document.body.classList.remove("is-lance-collapsed");
      document.body.classList.remove("is-inbox-open");
    };
  }, []);

  useLayoutEffect(() => {
    document.body.classList.toggle("is-inbox-open", inbox !== null);
    if (inbox !== "messages") {
      setThreadId(null);
      setExpanded(false);
    }
  }, [inbox]);

  return (
    <>
      <WorkspaceSide
        collapsed={sideCollapsed}
        onCollapsedChange={chooseSide}
        inbox={inbox}
        onToggleInbox={(which) => setInbox((open) => (open === which ? null : which))}
      />
      <ChatProvider>
      <MessagesSide
        open={inbox === "messages"}
        openId={threadId}
        expanded={expanded}
        onOpen={setThreadId}
        onBack={() => { setThreadId(null); setExpanded(false); }}
        onExpand={() => setExpanded(true)}
        onCollapse={() => setExpanded(false)}
      />
      <NotificationsSide open={inbox === "notifications"} />
      {inbox === "messages" && expanded && threadId && !messageThread(threadId)?.support ? <ChatThread id={threadId} /> : children}
      </ChatProvider>
      <LanceSide collapsed={lanceCollapsed} onCollapsedChange={chooseLance} />
      <FontSwitch />
    </>
  );
}
