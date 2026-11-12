"use client";

import { createContext, useContext } from "react";

/** Closes the nav, the inbox, and Lance so a page's own side panel has room. The returned function reopens what was open before. */
export type MakeRoom = () => () => void;

export const ShellPanelsContext = createContext<MakeRoom>(() => () => {});

export function useMakeRoom() {
  return useContext(ShellPanelsContext);
}
