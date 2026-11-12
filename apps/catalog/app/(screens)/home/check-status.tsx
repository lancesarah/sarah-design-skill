"use client";

/** A widget summary's one answer: a green check when it is done, a dashed ring while it waits, the warning when it is behind. */
export function CheckStatus({ state, title, sub }: { state: "done" | "pending" | "warn"; title: string; sub: string }) {
  return (
    <p className={state === "warn" ? "home-check is-warn" : "home-check"}>
      {state === "done" ? (
        <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
          <path fill="var(--status-complete)" fillRule="evenodd" d="M9 0a9 9 0 1 0 0 18A9 9 0 0 0 9 0Zm3.65 6.66-1.05-.86-4 4.9-1.75-1.76-.95.96 2.8 2.8 4.95-6.04Z" />
        </svg>
      ) : state === "pending" ? (
        <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
          <circle cx="9" cy="9" r="8" fill="none" stroke="var(--black-25)" strokeWidth="1.5" strokeDasharray="2.5 2.5" />
        </svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 14 14" aria-hidden="true">
          <path d="M7 5.4V8M7 1.8 1.4 11.2h11.2L7 1.8Z" fill="none" stroke="currentColor" strokeLinecap="square" />
          <rect x="6.7" y="9.2" width=".6" height=".6" fill="currentColor" />
        </svg>
      )}
      <span className="home-check-copy">
        <span>{title}</span>
        <span className="home-check-sub">{sub}</span>
      </span>
    </p>
  );
}
