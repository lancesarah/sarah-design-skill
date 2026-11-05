"use client";

import { useLayoutEffect, type ReactNode } from "react";
import { FontSwitch } from "../font-switch";
import { LanceSide, WorkspaceSide } from "./chrome";
import { usePageLimits } from "./page-limits";

export function AppShell({ children }: { children: ReactNode }) {
  const { sideCollapsed, lanceCollapsed, chooseSide, chooseLance } = usePageLimits();

  useLayoutEffect(() => {
    document.body.classList.add("app-shell");
    return () => {
      document.body.classList.remove("app-shell");
      document.body.classList.remove("is-side-collapsed");
      document.body.classList.remove("is-lance-collapsed");
    };
  }, []);

  return (
    <>
      <WorkspaceSide collapsed={sideCollapsed} onCollapsedChange={chooseSide} />
      {children}
      <LanceSide collapsed={lanceCollapsed} onCollapsedChange={chooseLance} />
      <FontSwitch />
    </>
  );
}
