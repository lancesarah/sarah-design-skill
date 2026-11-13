"use client";

import { useSyncExternalStore } from "react";

type State = { active: boolean; open: number };

let state: State = { active: false, open: 0 };
const listeners = new Set<() => void>();

export function setComments(patch: Partial<State>) {
  state = { ...state, ...patch };
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

const SERVER: State = { active: false, open: 0 };

export function useComments() {
  return useSyncExternalStore(subscribe, () => state, () => SERVER);
}
