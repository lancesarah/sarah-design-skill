"use client";

import { useLayoutEffect, useState, type ReactNode } from "react";
import { FontSwitch } from "../font-switch";
import { LanceSide, WorkspaceSide } from "./chrome";
import { NotificationsSide } from "./notifications";
import { usePageLimits } from "./page-limits";

export function AppShell({ children }: { children: ReactNode }) {
  const { sideCollapsed, lanceCollapsed, chooseSide, chooseLance } = usePageLimits();
  const [inboxOpen, setInboxOpen] = useState(false);

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
    document.body.classList.toggle("is-inbox-open", inboxOpen);
  }, [inboxOpen]);

  return (
    <>
      <WorkspaceSide
        collapsed={sideCollapsed}
        onCollapsedChange={chooseSide}
        inboxOpen={inboxOpen}
        onToggleInbox={() => setInboxOpen((open) => !open)}
      />
      <NotificationsSide open={inboxOpen} />
      {children}
      <LanceSide collapsed={lanceCollapsed} onCollapsedChange={chooseLance} />
      <FontSwitch />
    </>
  );
}
