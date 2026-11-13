"use client";

import { Toast } from "@lance-live/sds";
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

export type Notice = { message: string; action?: string | null; onAction?: () => void };
type Shown = Notice & { id: number; stamp: number };

const NotifyContext = createContext<(notice: Notice | string) => void>(() => {});

/** One toast slot, top right. The same notice again while it shows keeps it up without replaying it. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [shown, setShown] = useState<Shown | null>(null);

  const notify = useCallback((next: Notice | string) => {
    const notice = typeof next === "string" ? { message: next } : next;
    const stamp = Date.now();
    setShown((current) =>
      current && current.message === notice.message && (current.action ?? null) === (notice.action ?? null)
        ? { ...current, onAction: notice.onAction, stamp }
        : { ...notice, id: stamp, stamp },
    );
  }, []);

  useEffect(() => {
    if (!shown) return;
    const timer = window.setTimeout(() => setShown(null), 4000);
    return () => window.clearTimeout(timer);
  }, [shown]);

  return (
    <NotifyContext.Provider value={notify}>
      {children}
      {shown
        ? createPortal(
            <div className="page-toast" role="status">
              <Toast
                key={shown.id}
                message={shown.message}
                action={shown.action ?? null}
                onAction={() => {
                  shown.onAction?.();
                  setShown(null);
                }}
              />
            </div>,
            document.body,
          )
        : null}
    </NotifyContext.Provider>
  );
}

export function useNotify() {
  return useContext(NotifyContext);
}

/** Undo for a removed row: puts it back where it was. */
export function putBack<T extends { id: string }>(list: T[], item: T, index: number) {
  if (list.some((entry) => entry.id === item.id)) return list;
  return [...list.slice(0, index), item, ...list.slice(index)];
}
