"use client";

import { useLayoutEffect, useState, type ReactNode } from "react";
import { FontSwitch } from "../font-switch";
import { LanceSide, WorkspaceSide } from "./chrome";
import { ChatProvider } from "./chat-data";
import { MessagesBoard, MessagesSide } from "./messages";
import { NotificationsSide } from "./notifications";
import { usePageLimits } from "./page-limits";
import { ShellPanelsContext } from "./shell-panels";

export function AppShell({ children }: { children: ReactNode }) {
  const { sideCollapsed, lanceCollapsed, chooseSide, chooseLance } = usePageLimits();
  const [inbox, setInbox] = useState<"notifications" | "messages" | null>(null);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [ticketId, setTicketId] = useState<string | null>(null);
  const [freshChat, setFreshChat] = useState(false);
  const [freshKey, setFreshKey] = useState(0);
  const [deletedId, setDeletedId] = useState<string | null>(null);
  const [detailsFor, setDetailsFor] = useState<string | null>(null);
  const [conversationActions, setConversationActions] = useState<{ resolve: () => void } | null>(null);

  useLayoutEffect(() => {
    document.body.classList.add("app-shell");
    return () => {
      document.body.classList.remove("app-shell");
      document.body.classList.remove("is-side-collapsed");
      document.body.classList.remove("is-lance-collapsed");
      document.body.classList.remove("is-inbox-open");
      document.body.classList.remove("is-messages-full");
    };
  }, []);

  useLayoutEffect(() => {
    document.body.classList.toggle("is-inbox-open", inbox !== null);
    document.body.classList.toggle("is-messages-full", inbox === "messages" && expanded);
    if (inbox !== "messages") {
      setThreadId(null);
      setExpanded(false);
      setTicketId(null);
      setFreshChat(false);
      setDeletedId(null);
      setDetailsFor(null);
    }
  }, [inbox, expanded]);

  const makeRoom = () => {
    const before = { side: sideCollapsed, lance: lanceCollapsed };
    setInbox(null);
    chooseSide(true);
    chooseLance(true);
    return () => {
      chooseSide(before.side);
      chooseLance(before.lance);
    };
  };

  return (
    <ShellPanelsContext.Provider value={makeRoom}>
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
        ticketId={ticketId}
        onTicketId={setTicketId}
        freshChat={freshChat}
        onFreshChat={setFreshChat}
        conversationActions={conversationActions}
        bindActions={setConversationActions}
        deletedId={deletedId}
        onDeletedId={setDeletedId}
        detailsFor={detailsFor}
        onDetails={setDetailsFor}
        onOpen={(id) => { setThreadId(id); setDetailsFor((current) => (current === id ? current : null)); }}
        onBack={() => { setThreadId(null); setTicketId(null); setFreshChat(false); setDeletedId(null); setDetailsFor(null); }}
        onExpand={() => setExpanded(true)}
        onCollapse={() => setExpanded(false)}
      />
      <NotificationsSide open={inbox === "notifications"} />
      {inbox === "messages" && expanded ? (
        <MessagesBoard openId={threadId} ticketId={ticketId} deletedId={deletedId} detailsFor={detailsFor} onDetails={setDetailsFor} fresh={freshChat} freshKey={freshKey} onReplace={() => setFreshKey((key) => key + 1)} onNew={() => { setThreadId("gavin"); setTicketId(null); setFreshChat(true); setDeletedId(null); setDetailsFor(null); }} bindActions={setConversationActions} />
      ) : children}
      </ChatProvider>
      <LanceSide collapsed={lanceCollapsed} onCollapsedChange={chooseLance} />
      <FontSwitch />
    </ShellPanelsContext.Provider>
  );
}
