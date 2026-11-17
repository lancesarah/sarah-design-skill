"use client";

import { useEffect, useLayoutEffect, useState, type ReactNode } from "react";
import { FontSwitch } from "../font-switch";
import { ToastProvider } from "./action-toast";
import { LanceSide, WorkspaceSide } from "./chrome";
import { ChatProvider } from "./chat-data";
import { MessagesBoard, MessagesSide, openDirectThread } from "./messages";
import { NotificationsSide } from "./notifications";
import { usePageLimits } from "./page-limits";
import { OpenDirectMessageContext, ShellPanelsContext } from "./shell-panels";
import { WorkspaceIntro, type WorkspaceIntroVariant } from "./workspace-intro";

let openedIntroOnPageLoad = false;

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
  const [intro, setIntro] = useState<WorkspaceIntroVariant | null>(null);

  useEffect(() => {
    const [navigation] = performance.getEntriesByType("navigation") as PerformanceNavigationTiming[];
    if (openedIntroOnPageLoad || navigation?.type === "back_forward") return;
    if (navigation && new URL(navigation.name).pathname !== window.location.pathname) return;
    // A regular internal link can load a new document without being a reload.
    if (navigation?.type !== "reload" && document.referrer.startsWith(`${window.location.origin}/`)) return;
    // A preview refresh can load a fresh document without reporting a "reload".
    openedIntroOnPageLoad = true;
    setIntro("showcase");
  }, []);

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
      <ToastProvider>
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
      ) : (
        <OpenDirectMessageContext.Provider value={(name, initials) => {
          setThreadId(openDirectThread(name, initials));
          setDetailsFor(null);
          setTicketId(null);
          setDeletedId(null);
          setFreshChat(false);
          setInbox("messages");
        }}>
          {children}
        </OpenDirectMessageContext.Provider>
      )}
      </ChatProvider>
      <LanceSide collapsed={lanceCollapsed} onCollapsedChange={chooseLance} />
      <FontSwitch>
        <button type="button" className="workspace-intro-trigger" aria-haspopup="dialog" onClick={() => setIntro("compact")}>Intro 1</button>
        <button type="button" className="workspace-intro-trigger" aria-haspopup="dialog" onClick={() => setIntro("showcase")}>Intro 2</button>
      </FontSwitch>
      {intro ? <WorkspaceIntro variant={intro} onDismiss={() => setIntro(null)} /> : null}
      </ToastProvider>
    </ShellPanelsContext.Provider>
  );
}
