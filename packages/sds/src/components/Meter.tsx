"use client";

import type { CSSProperties } from "react";

/** A striped bar for how far along something is: the done part fills in blue over light grey ticks. */
export function Meter({
  value,
  max,
  end = 0,
  label,
  className,
}: {
  value: number;
  max: number;
  /** A part set aside at the right end, in a darker grey, such as rooms on DND. */
  end?: number;
  /** What the bar says, read aloud, such as "41 out of 80". */
  label: string;
  className?: string;
}) {
  const share = (part: number) => `${max > 0 ? Math.min(100, Math.max(0, (part / max) * 100)) : 0}%`;
  return (
    <div
      className={["sds", "meter", className].filter(Boolean).join(" ")}
      role="img"
      aria-label={label}
      style={end > 0 ? ({ "--meter-end": share(end) } as CSSProperties) : undefined}
    >
      <div className="meter-fill" style={{ width: share(value) }} />
      {end > 0 ? <div className="meter-end" aria-hidden="true" /> : null}
    </div>
  );
}
